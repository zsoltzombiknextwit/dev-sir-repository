<#
.SYNOPSIS
    Retrieves the current version of a Dataverse solution and writes it to GITHUB_OUTPUT.

.PARAMETER SolutionName
    The API name of the solution whose version to retrieve.

.OUTPUTS
    Writes to $env:GITHUB_OUTPUT:
        current_version          e.g. 1.0.0.5
        current_version_underscore  e.g. 1_0_0_5

.EXAMPLE
    .\Get-SolutionVersion.ps1 -SolutionName "ContosoCore"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SolutionName
)

$ErrorActionPreference = 'Stop'

$pac = if ($env:POWERPLATFORMTOOLS_PACPATH) { $env:POWERPLATFORMTOOLS_PACPATH } else { "pac" }

$rawOutput = & $pac solution list
Write-Host "=== RAW pac solution list output ==="
$rawOutput | ForEach-Object { Write-Host "  [$_]" }
Write-Host "=== END RAW OUTPUT ==="

$solutionLine = $rawOutput | Where-Object { $_ -imatch [regex]::Escape($SolutionName) } | Select-Object -First 1
if (-not $solutionLine) {
    Write-Error "Solution '$SolutionName' not found in pac solution list output. See raw output above."
    exit 1
}
Write-Host "Matched line: [$solutionLine]"

$versionMatch = [regex]::Match($solutionLine, '\d+\.\d+\.\d+\.\d+')
if (-not $versionMatch.Success) {
    Write-Error "Could not extract version from line: '$solutionLine'"
    exit 1
}

$currentVersion = $versionMatch.Value
Write-Host "Current version: $currentVersion"

$currentVersionUnderscore = $currentVersion -replace '\.', '_'

"current_version=$currentVersion"             | Out-File -FilePath $env:GITHUB_OUTPUT -Append
"current_version_underscore=$currentVersionUnderscore" | Out-File -FilePath $env:GITHUB_OUTPUT -Append

Write-Host "Outputs written to GITHUB_OUTPUT."
