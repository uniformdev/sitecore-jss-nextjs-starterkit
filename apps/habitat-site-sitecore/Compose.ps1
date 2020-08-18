param(
    [Parameter(Mandatory=$false)]
    $License,
    [Parameter(Mandatory=$false)]
    [Switch]
    $Detach,
    [Parameter(Mandatory=$false)]
    [Switch]
    $Clean,
    [Parameter(Mandatory=$false)]
    [Switch]
    $NoStart,
    [Parameter(Mandatory=$false)]
    [Switch]
    $NoWait
)

$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';

function Set-LicenseEnv { 
    param(
        [Parameter(Mandatory = $true)]
        [ValidateScript( { Test-Path $_ -PathType "Leaf" })]
        [string]$Path
    )

    $licenseFileStream = [System.IO.File]::OpenRead($Path);
    $licenseString = $null

    try
    {
        $memory = [System.IO.MemoryStream]::new()

        $gzip = [System.IO.Compression.GZipStream]::new($memory, [System.IO.Compression.CompressionLevel]::Optimal, $false);
        $licenseFileStream.CopyTo($gzip);
        $gzip.Close();

        # base64 encode the gzipped content
        $licenseString = [System.Convert]::ToBase64String($memory.ToArray())
    }
    finally
    {
        # cleanup
        if ($null -ne $gzip)
        {
            $gzip.Dispose()
            $gzip = $null
        }

        if ($null -ne $memory)
        {
            $memory.Dispose()
            $memory = $null
        }

        $licenseFileStream = $null
    }

    # sanity check
    if ($licenseString.Length -le 100)
    {
        throw "Unknown error, the gzipped and base64 encoded string '$licenseString' is too short."
    }

    # persist in current session
    $env:SITECORE_LICENSE = $licenseString
}

function Invoke-CheckPrerequisites {
    if ([string]::IsNullOrWhiteSpace($env:SITECORE_LICENSE_FILE_PATH)) {
        $env:SITECORE_LICENSE_FILE_PATH = 'C:\license\license.xml'
        if (-not (Test-Path $env:SITECORE_LICENSE_FILE_PATH)) {
            Write-Error "No SITECORE_LICENSE_FILE_PATH environment variable specified, and there's no file at default location: $env:SITECORE_LICENSE_FILE_PATH"
    
            exit -1        
        }
    
        Write-Warning "No SITECORE_LICENSE_FILE_PATH environment variable specified, default value will be used instead: $env:SITECORE_LICENSE_FILE_PATH"
    }
    
    $env:SITECORE_LICENSE_DIR_PATH = [System.IO.Path]::GetDirectoryName($env:SITECORE_LICENSE_FILE_PATH);
    $filesCount = (Get-ChildItem $env:SITECORE_LICENSE_DIR_PATH).Count
    if ($filesCount -gt 1) {
        Write-Error "The directory that contains license ($env:SITECORE_LICENSE_DIR_PATH) contains more than single file that is not recommended: $filesCount"
    
        exit -1;
    }
    
    if ([string]::IsNullOrWhiteSpace($env:REGISTRY)) {
        $env:REGISTRY = "altola.azurecr.io/"
        Write-Warning "No REGISTRY environment variable specified, default value will be used instead: $env:REGISTRY"
    }
    
        if (-not ($env:REGISTRY.EndsWith('/'))) {
            Write-Error "REGISTRY does not end with /"
    
            exit -1;
        }
    
    if ([string]::IsNullOrWhiteSpace($env:WINDOWSSERVERCORE_VERSION)) {
        $env:WINDOWSSERVERCORE_VERSION = "ltsc2019"
        Write-Warning "No WINDOWSSERVERCORE_VERSION environment variable specified, default value will be used instead: $env:WINDOWSSERVERCORE_VERSION"
    }
    
    if ([string]::IsNullOrWhiteSpace($env:NANOSERVER_VERSION)) {
        $env:NANOSERVER_VERSION = "1809"
        Write-Warning "No NANOSERVER_VERSION environment variable specified, default value will be used instead: $env:NANOSERVER_VERSION"
    }
    
    if ([string]::IsNullOrWhiteSpace($env:SITECORE_VERSION)) {
        $env:SITECORE_VERSION = "9.3.0"
        Write-Warning "No SITECORE_VERSION environment variable specified, default value will be used instead: $env:SITECORE_VERSION"
    }
    
    if ([string]::IsNullOrWhiteSpace($env:HOST_IP)) {
        Write-Warning "No HOST_IP environment variable specified, running script to detect it automatically."

        Push-Location "$PSScriptRoot\..\..\setup\docker-setup"
        try {
            & .\DockerSetup.ps1
        } finally {
            Pop-Location
        }

        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE;
        }
    }

    $KeepAliveTimeoutSec = 60
    $SleepTimeoutSec = 5
    $OriginalTimeoutSec = $KeepAliveTimeoutSec
    
    while ($KeepAliveTimeoutSec -gt 0) {
        try {
            $info = (docker system info);
    
            $errors = $info `
                | Where-Object { $_.Contains("ERROR: Error response from daemon") } `
                | Measure-Object `
                | Select-Object -ExpandProperty Count
                
            if ($errors -eq 0) {
                Write-Host "Docker is running"
                return;
            }
    
            throw "$info";
        } catch { 
    
            Write-Warning "Docker is down. It will be checked again in $($SleepTimeoutSec)s, $($KeepAliveTimeoutSec)s before timeout";
    
            [System.Threading.Thread]::Sleep($SleepTimeoutSec * 1000);
    
            $KeepAliveTimeoutSec = $KeepAliveTimeoutSec - $SleepTimeoutSec;
        }
    }
    
    Write-Error "Docker failed to start within expected $($OriginalTimeoutSec)s"
    
    docker system info
    
    exit -1
}

Invoke-CheckPrerequisites

if ([string]::IsNullOrWhiteSpace($License)) {
    if ([string]::IsNullOrWhiteSpace($env:SITECORE_LICENSE_FILE_PATH)) {
        Write-Error "Neither -License param nor SITECORE_LICENSE_FILE_PATH env variable is specified"

        exit -1;
    }

    $License = $env:SITECORE_LICENSE_FILE_PATH
}

Set-LicenseEnv -Path $License

if ($Clean) {
    & $PSScriptRoot\Stop.ps1 -Clean
} else {
    & $PSScriptRoot\Stop.ps1
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE;
}

Write-Host "Ensuring external volumes"
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\.docker\files"
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\.docker\logs"
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\.docker\sql"
New-Item -ItemType Directory -Force -Path "$PSScriptRoot\.docker\packages"

Write-Host "Composing containers"
docker-compose --file "$PSScriptRoot\docker-compose.yml" build --parallel;

Write-Host "Starting containers"
if ($NoStart) {
    exit 0;
}

if ($Detach) {
    docker-compose --file "$PSScriptRoot\docker-compose.yml" up --detach;

    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE;
    }

    if ($NoWait) {
        return;
    }

    $KeepAliveTimeoutSec = 180

    $KeepAliveUrl= "http://localhost:44000/sitecore/service/keepalive.aspx"

    ## Enable TLS 1.2 to allow HTTPS communication
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    $OriginalTimeoutSec = $KeepAliveTimeoutSec
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew();
    while ($KeepAliveTimeoutSec -gt 0) {
        try {
            Write-Host "Requesting $KeepAliveUrl page"
            $code = (Invoke-WebRequest $KeepAliveUrl -TimeoutSec $KeepAliveTimeoutSec -UseBasicParsing).StatusCode
            if ($code -ne 200) {
                Write-Error "Response status code is $code";                
            } else {
                Write-Host "The service is up"
                break;
            }
        } catch {
            Write-Warning "Request has failed: $_. It will be retried in 5s, $([Convert]::ToInt32($OriginalTimeoutSec - $stopwatch.Elapsed.TotalSeconds))s before timeout"
            [System.Threading.Thread]::Sleep(5000);
            $KeepAliveTimeoutSec = $OriginalTimeoutSec - $stopwatch.Elapsed.TotalSeconds
        }
    }
} else {
    docker-compose --file "$PSScriptRoot\docker-compose.yml" up; 
    
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE;
    }
}
