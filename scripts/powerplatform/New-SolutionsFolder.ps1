<#
.SYNOPSIS
    Creates the solutions folder structure for a given solution if it does not already exist.

.PARAMETER SolutionsFolder
    The root solutions folder (e.g. "solutions").

.PARAMETER SolutionName
    The API name of the solution (used as the subfolder name).

.EXAMPLE
    .\New-SolutionsFolder.ps1 -SolutionsFolder "solutions" -SolutionName "ContosoCore"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SolutionsFolder,

    [Parameter(Mandatory = $true)]
    [string]$SolutionName
)

$ErrorActionPreference = 'Stop'

$path = ".\$SolutionsFolder\$SolutionName"

if (Test-Path $path) {
    Write-Host "Folder already exists: $path"
} else {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
    Write-Host "Created folder structure: $path"
}
