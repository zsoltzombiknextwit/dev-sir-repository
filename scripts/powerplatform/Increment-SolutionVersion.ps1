<#
.SYNOPSIS
    Increments the patch segment of a Dataverse solution version and applies it via pac CLI.

.PARAMETER SolutionName
    The API name of the solution to update.

.PARAMETER CurrentVersion
    The current version string in x.x.x.x format (obtained from Get-SolutionVersion.ps1).

.OUTPUTS
    Writes to $env:GITHUB_OUTPUT:
        new_version              e.g. 1.0.0.6
        new_version_underscore   e.g. 1_0_0_6

.EXAMPLE
    .\Increment-SolutionVersion.ps1 -SolutionName "ContosoCore" -CurrentVersion "1.0.0.5"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SolutionName,

    [Parameter(Mandatory = $true)]
    [string]$CurrentVersion
)

$ErrorActionPreference = 'Stop'

$pac = if ($env:POWERPLATFORMTOOLS_PACPATH) { $env:POWERPLATFORMTOOLS_PACPATH } else { "pac" }

$versionParts = $CurrentVersion -split '\.'
if ($versionParts.Count -ne 4) {
    Write-Error "CurrentVersion '$CurrentVersion' is not in expected x.x.x.x format."
    exit 1
}

$newVersion = "{0}.{1}.{2}.{3}" -f $versionParts[0], $versionParts[1], $versionParts[2], ([int]$versionParts[3] + 1)
Write-Host "Incrementing version: $CurrentVersion -> $newVersion"

& $pac solution online-version --solution-name $SolutionName --solution-version $newVersion

if ($LASTEXITCODE -ne 0) {
    Write-Error "pac solution online-version failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Solution version updated to $newVersion"

$newVersionUnderscore = $newVersion -replace '\.', '_'

"new_version=$newVersion"                   | Out-File -FilePath $env:GITHUB_OUTPUT -Append
"new_version_underscore=$newVersionUnderscore" | Out-File -FilePath $env:GITHUB_OUTPUT -Append

Write-Host "Outputs written to GITHUB_OUTPUT."
