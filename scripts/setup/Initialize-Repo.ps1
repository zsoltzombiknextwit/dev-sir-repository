<#
.SYNOPSIS
    Bootstraps a new repository created from this template by creating GitHub
    Environments (DEV, MAINDEV) and provisioning all required secrets and
    variables via the GitHub CLI.

.DESCRIPTION
    Run this script once after creating a new repository from the template.
    It requires the GitHub CLI (gh) to be installed and authenticated.

    The following resources are created in the target repository:
      Environments : DEV, MAINDEV
      Variables    : POWERPLATFORM_APP_ID, POWERPLATFORM_TENANT_ID,
                     POWERPLATFORM_ENVIRONMENT_URL  (per environment)
      Secrets      : POWERPLATFORM_CLIENT_SECRET    (per environment)

    The App ID, Tenant ID, and Client Secret are the same service-principal
    credentials shared across both environments. The Environment URL differs
    per environment.

.PARAMETER RepoOwner
    GitHub organisation or user that owns the repository (e.g. "nextwit").

.PARAMETER RepoName
    Repository name (e.g. "my-powerplatform-repo").

.PARAMETER AppId
    Azure AD application (client) ID of the service principal used by pac CLI.

.PARAMETER TenantId
    Azure AD tenant ID.

.PARAMETER ClientSecret
    Client secret for the service principal. Treated as a secret — not echoed.

.PARAMETER DevEnvironmentUrl
    Power Platform environment URL for the DEV environment
    (e.g. "https://myorg-dev.crm4.dynamics.com").

.PARAMETER MainDevEnvironmentUrl
    Power Platform environment URL for the MAINDEV environment
    (e.g. "https://myorg-maindev.crm4.dynamics.com").

.PARAMETER MainDevReviewers
    Optional. Comma-separated GitHub usernames to add as required reviewers on
    the MAINDEV environment (e.g. "alice,bob"). When provided, deployments to
    MAINDEV will require approval from at least one reviewer.

.EXAMPLE
    .\Initialize-Repo.ps1 `
        -RepoOwner            "nextwit" `
        -RepoName             "my-powerplatform-repo" `
        -AppId                "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" `
        -TenantId             "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy" `
        -ClientSecret         "your-client-secret" `
        -DevEnvironmentUrl    "https://myorg-dev.crm4.dynamics.com" `
        -MainDevEnvironmentUrl "https://myorg-maindev.crm4.dynamics.com"

.EXAMPLE
    # With MAINDEV required reviewers:
    .\Initialize-Repo.ps1 `
        -RepoOwner            "nextwit" `
        -RepoName             "my-powerplatform-repo" `
        -AppId                "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" `
        -TenantId             "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy" `
        -ClientSecret         "your-client-secret" `
        -DevEnvironmentUrl    "https://myorg-dev.crm4.dynamics.com" `
        -MainDevEnvironmentUrl "https://myorg-maindev.crm4.dynamics.com" `
        -MainDevReviewers      "alice,bob"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$RepoOwner,

    [Parameter(Mandatory = $true)]
    [string]$RepoName,

    [Parameter(Mandatory = $true)]
    [string]$AppId,

    [Parameter(Mandatory = $true)]
    [string]$TenantId,

    [Parameter(Mandatory = $true)]
    [string]$ClientSecret,

    [Parameter(Mandatory = $true)]
    [string]$DevEnvironmentUrl,

    [Parameter(Mandatory = $true)]
    [string]$MainDevEnvironmentUrl,

    [string]$MainDevReviewers = ""
)

$ErrorActionPreference = 'Stop'
$repo = "$RepoOwner/$RepoName"

# ── Helper functions ─────────────────────────────────────────────────────────

function Assert-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is not installed. Install it from https://cli.github.com and run 'gh auth login'."
    }
    gh auth status 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI is not authenticated. Run 'gh auth login' first."
    }
    Write-Host "GitHub CLI is installed and authenticated." -ForegroundColor Green
}

function New-GhEnvironment {
    param (
        [string]$Repo,
        [string]$Environment,
        [string[]]$Reviewers = @()
    )

    Write-Host ""
    Write-Host "Creating environment: $Environment" -ForegroundColor Cyan

    $reviewerJson = "[]"
    if ($Reviewers.Count -gt 0) {
        # Resolve usernames to user IDs
        $reviewerObjects = $Reviewers | ForEach-Object {
            $user = $_.Trim()
            $id   = gh api "users/$user" --jq '.id' 2>$null
            if (-not $id) { Write-Warning "Could not resolve GitHub user: $user — skipping." ; return }
            [PSCustomObject]@{ type = "User"; id = [int]$id }
        } | Where-Object { $_ }

        if ($reviewerObjects) {
            $reviewerJson = @($reviewerObjects) | ConvertTo-Json -Compress
        }
    }

    $body = @{
        reviewers             = @()
        deployment_branch_policy = $null
    } | ConvertTo-Json -Compress

    if ($Reviewers.Count -gt 0 -and $reviewerJson -ne "[]") {
        $body = "{`"reviewers`":$reviewerJson,`"deployment_branch_policy`":null}"
    }

    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tempFile, $body, [System.Text.UTF8Encoding]::new($false))
        gh api --method PUT "repos/$Repo/environments/$Environment" `
            --input $tempFile | Out-Null
    }
    finally {
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    }

    if ($LASTEXITCODE -ne 0) {
        # Fallback: create without body (gh REST)
        gh api --method PUT "repos/$Repo/environments/$Environment" | Out-Null
    }

    Write-Host "  Environment '$Environment' ready." -ForegroundColor Green
}

function Set-GhEnvVariable {
    param (
        [string]$Repo,
        [string]$Environment,
        [string]$Name,
        [string]$Value
    )
    gh variable set $Name `
        --repo        $Repo `
        --env         $Environment `
        --body        $Value
    if ($LASTEXITCODE -ne 0) { throw "Failed to set variable '$Name' on '$Environment'." }
    Write-Host "  Variable set : $Name" -ForegroundColor Gray
}

function Set-GhEnvSecret {
    param (
        [string]$Repo,
        [string]$Environment,
        [string]$Name,
        [string]$Value
    )
    $Value | gh secret set $Name `
        --repo $Repo `
        --env  $Environment
    if ($LASTEXITCODE -ne 0) { throw "Failed to set secret '$Name' on '$Environment'." }
    Write-Host "  Secret set   : $Name" -ForegroundColor Gray
}

# ── Main ─────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "=================================================="
Write-Host "  Repository Bootstrap: $repo"
Write-Host "=================================================="

Assert-GhCli

# ── DEV environment ───────────────────────────────────────────────────────────
New-GhEnvironment -Repo $repo -Environment "DEV"

Set-GhEnvVariable -Repo $repo -Environment "DEV" -Name "POWERPLATFORM_APP_ID"           -Value $AppId
Set-GhEnvVariable -Repo $repo -Environment "DEV" -Name "POWERPLATFORM_TENANT_ID"        -Value $TenantId
Set-GhEnvVariable -Repo $repo -Environment "DEV" -Name "POWERPLATFORM_ENVIRONMENT_URL"  -Value $DevEnvironmentUrl
Set-GhEnvSecret   -Repo $repo -Environment "DEV" -Name "POWERPLATFORM_CLIENT_SECRET"    -Value $ClientSecret

Write-Host "  DEV environment configured." -ForegroundColor Green

# ── MAINDEV environment ───────────────────────────────────────────────────────
$reviewerList = @()
if ($MainDevReviewers) {
    $reviewerList = $MainDevReviewers -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

New-GhEnvironment -Repo $repo -Environment "MAINDEV" -Reviewers $reviewerList

Set-GhEnvVariable -Repo $repo -Environment "MAINDEV" -Name "POWERPLATFORM_APP_ID"           -Value $AppId
Set-GhEnvVariable -Repo $repo -Environment "MAINDEV" -Name "POWERPLATFORM_TENANT_ID"        -Value $TenantId
Set-GhEnvVariable -Repo $repo -Environment "MAINDEV" -Name "POWERPLATFORM_ENVIRONMENT_URL"  -Value $MainDevEnvironmentUrl
Set-GhEnvSecret   -Repo $repo -Environment "MAINDEV" -Name "POWERPLATFORM_CLIENT_SECRET"    -Value $ClientSecret

Write-Host "  MAINDEV environment configured." -ForegroundColor Green

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=================================================="
Write-Host "  Bootstrap complete!" -ForegroundColor Green
Write-Host "=================================================="
Write-Host ""
Write-Host "Environments created : DEV, MAINDEV"
Write-Host "Variables set        : POWERPLATFORM_APP_ID, POWERPLATFORM_TENANT_ID, POWERPLATFORM_ENVIRONMENT_URL"
Write-Host "Secrets set          : POWERPLATFORM_CLIENT_SECRET"
if ($reviewerList.Count -gt 0) {
    Write-Host "MAINDEV reviewers    : $($reviewerList -join ', ')"
}
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Verify at https://github.com/$repo/settings/environments"
Write-Host "  2. Customize solution names in .github/workflows/powerplatform-to-github.yml"
Write-Host "  3. Run your first workflow from the Actions tab"
Write-Host ""
