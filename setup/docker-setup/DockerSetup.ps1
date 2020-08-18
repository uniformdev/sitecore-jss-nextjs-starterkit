$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';

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

## CONST
$imageName = "mcr.microsoft.com/dotnet/framework/aspnet:4.8-windowsservercore-ltsc2019"

Write-Host "Starting npx serve as a http server to test"
Stop-Job -Name "docker-setup-npx-serve" -ErrorAction Ignore
Start-Job -Name "docker-setup-npx-serve" -ScriptBlock { npx serve }

try {
    # verify npx serve works
    Invoke-WebRequest "http://localhost:5000" -UseBasicParsing -TimeoutSec 2
    
    Write-Host "Pre-start down test container"
    docker-compose --file "$PSScriptRoot\docker-compose.yml" kill;
    docker-compose --file "$PSScriptRoot\docker-compose.yml" down;
    
    Write-Host "Starting test container"
    docker-compose --file "$PSScriptRoot\docker-compose.yml" up --detach;
    
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE;
    }

    (docker container ls) | Where-Object { $_.Length -gt $imageName.Length } | ForEach-Object { 
        $cid = $_.Substring(0, 12)
        $name = $_.Substring(12).Trim()
        if ($name.StartsWith($imageName)) {
            Write-Host "Testing container $cid"
            Get-NetIPAddress -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress | ForEach-Object { 
                $ip = $_
                Write-Host "Testing host ip $ip"
                $Command = "`"try { (New-Object System.Net.WebClient).DownloadString('http://$($ip):5000') } catch { echo `$_.Exception.Message }`""
                $response = docker exec $cid powershell -Command $Command; 
                if ($response -like '*<title>Files within*') { 
                    Write-Host "HOST_IP has been automatically detected as $ip" -ForegroundColor Green
                    $env:HOST_IP=$ip
                    
                    Write-Warning "HOST_IP environment variable is now set for this session, to speed up this process consider saving this env variable to a permanent store: HOST_IP = $env:HOST_IP"
                                
                    exit 0;
                } else {
                    Write-Host "> docker exec $cid powershell -Command $Command"

                    $text = [string]::Join("`r`n", $response)
                    Write-Host "Test failed, received output:"
                    Write-Host $text
                }
            }
        }
    }
    
    
    Write-Error "Failed to determine HOST_IP, docker container cannot reach host machine via 5000 port"
    
    exit -1;
} finally {
    Stop-Job -Name "docker-setup-npx-serve"
    docker-compose --file "$PSScriptRoot\docker-compose.yml" kill;
    docker-compose --file "$PSScriptRoot\docker-compose.yml" down;
}