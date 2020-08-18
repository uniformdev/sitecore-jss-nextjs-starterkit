param(
    [Parameter(Mandatory=$false)]
    [Switch]
    $Clean
)

$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';

Write-Host "Stopping existing composed containers"
if ($Clean) {
    docker-compose --file "$PSScriptRoot\docker-compose.yml" stop;

    Write-Host "Removing removed container's ./files"
    if (Test-Path "$PSScriptRoot\.docker") {
        Remove-Item "$PSScriptRoot\.docker" -Force -Recurse
    }
} else {
    docker-compose --file "$PSScriptRoot\docker-compose.yml" stop;
}