<#
.SYNOPSIS
    Stages solution source files (excluding zip files), commits, and pushes to the remote branch.

.PARAMETER SolutionsFolder
    The root solutions folder to stage (e.g. "solutions").

.PARAMETER SolutionName
    The API name of the solution, used in the commit message.

.PARAMETER UserEmail
    Git author email for the commit. Defaults to "action@github.com".

.PARAMETER UserName
    Git author name for the commit. Defaults to "GitHub Action".

.EXAMPLE
    .\Commit-And-Push.ps1 -SolutionsFolder "solutions" -SolutionName "ContosoCore"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SolutionsFolder,

    [Parameter(Mandatory = $true)]
    [string]$SolutionName,

    [string]$UserEmail = "action@github.com",
    [string]$UserName  = "GitHub Action"
)

$ErrorActionPreference = 'Stop'

Write-Host "Configuring git identity..."
git config --local user.email $UserEmail
git config --local user.name  $UserName

Write-Host "Staging solution files (excluding zip files)..."
git add $SolutionsFolder

# Unstage any zip files that may have been staged
$zipFiles = git ls-files --cached "$SolutionsFolder/**/*.zip" 2>$null
if ($zipFiles) {
    Write-Host "Unstaging zip files..."
    $zipFiles | ForEach-Object { git reset HEAD $_ }
}

$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit."
    exit 0
}

Write-Host "Committing changes..."
git commit -m "Export and unpack $SolutionName solution"

Write-Host "Pushing changes..."
git push

if ($LASTEXITCODE -ne 0) {
    Write-Error "git push failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Changes pushed successfully."
