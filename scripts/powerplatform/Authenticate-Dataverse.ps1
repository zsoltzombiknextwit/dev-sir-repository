<#
.SYNOPSIS
    Authenticates the Power Platform CLI (pac) to a Dataverse environment using a service principal.

.PARAMETER DataverseEnv
    The URL of the Dataverse / Power Platform environment.

.PARAMETER AppId
    The Azure App Registration (client) ID.

.PARAMETER ClientSecret
    The Azure App Registration client secret.

.PARAMETER TenantId
    The Azure AD tenant ID.

.EXAMPLE
    .\Authenticate-Dataverse.ps1 `
        -DataverseEnv "https://org.crm4.dynamics.com" `
        -AppId $env:POWERPLATFORM_APP_ID `
        -ClientSecret $env:POWERPLATFORM_CLIENT_SECRET `
        -TenantId $env:POWERPLATFORM_TENANT_ID
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$DataverseEnv,

    [Parameter(Mandatory = $true)]
    [string]$AppId,

    [Parameter(Mandatory = $true)]
    [string]$ClientSecret,

    [Parameter(Mandatory = $true)]
    [string]$TenantId
)

$ErrorActionPreference = 'Stop'

$pac = if ($env:POWERPLATFORMTOOLS_PACPATH) { $env:POWERPLATFORMTOOLS_PACPATH } else { "pac" }

Write-Host "Authenticating to Dataverse environment: $DataverseEnv"

& $pac auth create `
    --environment $DataverseEnv `
    --applicationId $AppId `
    --clientSecret $ClientSecret `
    --tenant $TenantId

if ($LASTEXITCODE -ne 0) {
    Write-Error "pac auth create failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "Authentication successful."
