param(
    [Parameter(Mandatory=$false)]
    [Switch]
    $Clean
)

$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';

Write-Host "Killing existing composed containers"
docker-compose --file "$PSScriptRoot\docker-compose.yml" kill;

Write-Host "Removing existing composed containers"
if ($Clean) {
    docker-compose --file "$PSScriptRoot\docker-compose.yml" down -v;

    Write-Host "Removing removed container's ./files"
    if (Test-Path "$PSScriptRoot\.docker") {
        Remove-Item "$PSScriptRoot\.docker" -Force -Recurse
    }
} else {
    docker-compose --file "$PSScriptRoot\docker-compose.yml" down;
}