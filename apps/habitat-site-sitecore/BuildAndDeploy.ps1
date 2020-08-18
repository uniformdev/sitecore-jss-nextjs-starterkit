param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('', 'Debug', 'Release')]
    $Configuration,

    [Parameter(Mandatory=$False)]
    $WebsiteRootPath,

    [switch]
    $Docker,

    [switch]
    $SkipConnector,

    [switch]
    $Force
)

Import-Module $PSScriptRoot\..\..\scripts\Build.psm1 -Force

# habitatSiteSourceFolder is not used, but reqired for scripts to work as they require this param
Invoke-BuildAndDeploy -Root $PSScriptRoot -WebsiteRootPath $WebsiteRootPath -Docker:$Docker -Force:$Force -ScVariableName "habitatSiteSourceFolder" -SrcSourceFolderPathInDocker "C:\inetpub\wwwroot\App_Data\Habitat" -Configuration $Configuration

if (-not $SkipConnector) {
    Write-Host "[EXTRA] Deploying connector to the same location" -ForegroundColor Cyan
         
    if ($Docker) {
        $WebsiteRootPath = "$PSScriptRoot\.docker\files"
        & $PSScriptRoot\..\..\connectors\Uniform.Sitecore\BuildAndDeploy.ps1 -WebsiteRootPath $WebsiteRootPath -Force
        Invoke-SourcePath -WebsiteRootPath $WebsiteRootPath -SrcSourceFolderPath "C:\inetpub\wwwroot\App_Data\Uniform" -ScVariableName "uniformContentSitecoreSourceFolder"
    } else {
        & $PSScriptRoot\..\..\connectors\Uniform.Sitecore\BuildAndDeploy.ps1 -WebsiteRootPath $WebsiteRootPath -Force:$Force
    }

    Write-Host "[EXTRA] The connector has been deployed successfully as well" -ForegroundColor Cyan
}