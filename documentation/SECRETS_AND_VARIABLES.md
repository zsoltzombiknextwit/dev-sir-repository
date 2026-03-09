# Repository Secrets & Variables

This document lists every GitHub **secret** and **variable** required by the workflows in this repository, where to find the values, and step-by-step instructions for adding them.

---

## Table of Contents

1. [Quick Reference](#1-quick-reference)
2. [How to Add Secrets & Variables in GitHub](#2-how-to-add-secrets--variables-in-github)
3. [Secret Details](#3-secret-details)
   - [POWERPLATFORM_APP_ID](#powerplatform_app_id)
   - [POWERPLATFORM_CLIENT_SECRET](#powerplatform_client_secret)
   - [POWERPLATFORM_TENANT_ID](#powerplatform_tenant_id)
   - [POWERPLATFORM_ENVIRONMENT_URL](#powerplatform_environment_url)
4. [Where Each Secret Is Used](#4-where-each-secret-is-used)
5. [Obtaining the Values](#5-obtaining-the-values)
   - [From Azure Portal](#51-from-azure-portal)
   - [From Power Platform Admin Center](#52-from-power-platform-admin-center)
6. [Rotating Secrets](#6-rotating-secrets)
7. [GitHub Environments](#7-github-environments)

---

## 1. Quick Reference

Secrets and variables are scoped to the **`DEV`** and **`MAINDEV`** GitHub Environments — not the repository level. Configure each item under **Settings → Environments → [environment name]**.

### Secrets (per environment)

| Secret Name | Required | Used By | Description |
|---|---|---|---|
| `POWERPLATFORM_CLIENT_SECRET` | ✅ Yes | Both workflows | Azure App Registration client secret value |

### Variables (per environment)

| Variable Name | Required | Used By | Description |
|---|---|---|---|
| `POWERPLATFORM_APP_ID` | ✅ Yes | Both workflows | Azure App Registration (client) ID |
| `POWERPLATFORM_TENANT_ID` | ✅ Yes | Both workflows | Azure AD / Entra ID tenant ID |
| `POWERPLATFORM_ENVIRONMENT_URL` | ✅ Yes | Both workflows | Power Platform environment URL for this GitHub environment |

---

## 2. How to Add Secrets & Variables in GitHub

### Adding a Repository Secret

1. Go to your repository on GitHub.
2. Click **Settings** (top navigation).
3. In the left sidebar, click **Secrets and variables** → **Actions**.
4. Click **New repository secret**.
5. Enter the **Name** exactly as shown in the table above (case-sensitive).
6. Paste the **Value**.
7. Click **Add secret**.

Repository secret to create: **`POWERPLATFORM_CLIENT_SECRET`**

### Adding a Repository Variable

1. Follow steps 1–3 above.
2. Click the **Variables** tab.
3. Click **New repository variable**.
4. Enter the **Name** and **Value**.
5. Click **Add variable**.

Repository variables to create: **`POWERPLATFORM_APP_ID`**, **`POWERPLATFORM_TENANT_ID`**, **`POWERPLATFORM_ENVIRONMENT_URL`**

> **Tip:** Secrets are encrypted and never displayed after saving. Variables are visible in plaintext and intended for non-sensitive configuration values.

---

## 3. Secret Details

### `POWERPLATFORM_APP_ID`

| Property | Value |
|---|---|
| Type | Variable |
| Format | UUID — `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| Sensitive | No — a client ID is a non-sensitive identifier |
| Workflows | `github-to-powerplatform.yml`, `powerplatform-to-github.yml` |

**What it is:**
The **Application (client) ID** of the Azure App Registration used as a service principal to authenticate to Power Platform non-interactively.

**Where to find it:**
[Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → select your app → **Overview** → copy **Application (client) ID**.

---

### `POWERPLATFORM_CLIENT_SECRET`

| Property | Value |
|---|---|
| Type | Secret |
| Format | String (alphanumeric + special characters) |
| Sensitive | Yes — never share or log this value |
| Workflows | `github-to-powerplatform.yml`, `powerplatform-to-github.yml` |

**What it is:**
The **client secret value** generated for the Azure App Registration. This is the password equivalent for the service principal.

**Where to find it:**
[Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → select your app → **Certificates & secrets** → **Client secrets** → copy the **Value** column.

> **Important:** The value is only shown once at creation time. If you did not save it, you must create a new secret.

**Expiry:** Client secrets have an expiry date (max 24 months). Set a reminder to rotate before expiry — see [Section 6](#6-rotating-secrets).

---

### `POWERPLATFORM_TENANT_ID`

| Property | Value |
|---|---|
| Type | Variable |
| Format | UUID — `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| Sensitive | No — tenant ID is visible in OAuth endpoints and token responses |
| Workflows | `github-to-powerplatform.yml`, `powerplatform-to-github.yml` |

**What it is:**
The **Directory (tenant) ID** of your Azure AD / Microsoft Entra ID tenant. This tells the authentication flow which tenant to authenticate against.

**Where to find it:**
[Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **Overview** → copy **Tenant ID**.

---

### `POWERPLATFORM_ENVIRONMENT_URL`

| Property | Value |
|---|---|
| Type | Variable |
| Format | URL — `https://<orgid>.crm.dynamics.com` |
| Sensitive | No — a URL is not a credential |
| Workflows | `github-to-powerplatform.yml`, `powerplatform-to-github.yml` |

**What it is:**
The base URL of the **default** Power Platform environment. Both workflows accept an environment URL as a manual input at runtime; this secret acts as the fallback when no URL is provided.

Typical URL formats by region:

| Region | URL format |
|---|---|
| North America | `https://orgXXXXXX.crm.dynamics.com` |
| Europe | `https://orgXXXXXX.crm4.dynamics.com` |
| Asia Pacific | `https://orgXXXXXX.crm5.dynamics.com` |
| UK | `https://orgXXXXXX.crm11.dynamics.com` |
| Australia | `https://orgXXXXXX.crm6.dynamics.com` |

**Where to find it:**
[Power Platform Admin Center](https://admin.powerplatform.microsoft.com) → **Environments** → select your environment → **Settings** → copy the **Environment URL**.

---

## 4. Where Each Secret & Variable Is Used

| Workflow file | Name | Type | Purpose |
|---|---|---|---|
| `github-to-powerplatform.yml` | `POWERPLATFORM_APP_ID` | Variable | App identity for Power Platform authentication |
| `github-to-powerplatform.yml` | `POWERPLATFORM_CLIENT_SECRET` | Secret | Credential for Power Platform authentication |
| `github-to-powerplatform.yml` | `POWERPLATFORM_TENANT_ID` | Variable | Identifies the tenant for authentication |
| `github-to-powerplatform.yml` | `POWERPLATFORM_ENVIRONMENT_URL` | Variable | Fallback target environment when not provided as workflow input |
| `powerplatform-to-github.yml` | `POWERPLATFORM_APP_ID` | Variable | App identity for Power Platform authentication |
| `powerplatform-to-github.yml` | `POWERPLATFORM_CLIENT_SECRET` | Secret | Credential for Power Platform authentication |
| `powerplatform-to-github.yml` | `POWERPLATFORM_TENANT_ID` | Variable | Identifies the tenant for authentication |
| `powerplatform-to-github.yml` | `POWERPLATFORM_ENVIRONMENT_URL` | Variable | Fallback source environment when not provided as workflow input |

---

## 5. Obtaining the Values

### 5.1 From Azure Portal

#### Step 1 — Create an App Registration (if not already done)

1. Sign in to [portal.azure.com](https://portal.azure.com).
2. Navigate to **Microsoft Entra ID** → **App registrations** → **New registration**.
3. Set a name (e.g. `github-powerplatform-spn`) and click **Register**.

#### Step 2 — Collect `POWERPLATFORM_APP_ID` and `POWERPLATFORM_TENANT_ID`

On the app's **Overview** page, copy:
- **Application (client) ID** → `POWERPLATFORM_APP_ID`
- **Directory (tenant) ID** → `POWERPLATFORM_TENANT_ID`

#### Step 3 — Create and collect `POWERPLATFORM_CLIENT_SECRET`

1. Go to **Certificates & secrets** → **Client secrets** → **New client secret**.
2. Add a description and set an expiry (recommended: 12 months).
3. Click **Add**.
4. Immediately copy the **Value** column → `POWERPLATFORM_CLIENT_SECRET`.

### 5.2 From Power Platform Admin Center

#### Collect `POWERPLATFORM_ENVIRONMENT_URL`

1. Sign in to [admin.powerplatform.microsoft.com](https://admin.powerplatform.microsoft.com).
2. Click **Environments** in the left sidebar.
3. Select the target environment.
4. Copy the **Environment URL** field → `POWERPLATFORM_ENVIRONMENT_URL`.

#### Register the App as an Application User

The service principal must be explicitly granted access to each environment it interacts with:

1. In the environment detail view, click **Settings** → **Users + permissions** → **Application users**.
2. Click **+ New app user**.
3. Click **+ Add an app**, find your app registration by name or client ID, and select it.
4. Choose a **Business unit** (usually the root BU).
5. Assign the **System Administrator** security role (or a custom role with at minimum: Solution Import, Publish App roles).
6. Click **Create**.

Repeat for every environment the workflows target.

---

## 6. Rotating Secrets

Client secrets expire. When a secret is near expiry or has been compromised:

1. Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → select app → **Certificates & secrets**.
2. Create a **new** client secret (do not delete the old one yet).
3. Copy the new secret value.
4. Update `POWERPLATFORM_CLIENT_SECRET` in GitHub:
   - **Settings** → **Secrets and variables** → **Actions** → click the pencil icon next to `POWERPLATFORM_CLIENT_SECRET` → paste the new value → **Update secret**.
5. Trigger a test workflow run to confirm authentication succeeds.
6. Delete the old secret from Azure Portal.

> **Best practice:** Set a calendar reminder 30 days before the client secret expiry date.

---

## 7. GitHub Environments

This repository uses two GitHub Environments to scope secrets and variables per deployment target. Both workflows expose a `github_environment` input (dropdown: **DEV** / **MAINDEV**) that selects which environment's credentials and URLs are used at runtime.

### Environment Overview

| Environment | Purpose | Audience |
|---|---|---|
| `DEV` | Individual developer sandbox — personal iteration and testing | Individual developers |
| `MAINDEV` | Shared main development environment — integration and team testing | Whole development team |

### Creating the Environments

1. Go to **Settings** → **Environments** → **New environment**.
2. Create an environment named **`DEV`**.
3. Repeat and create an environment named **`MAINDEV`**.

### Per-Environment Secrets & Variables

Add the following to **each** environment individually (values will differ per environment):

**Secret** (under the environment's Secrets section):

| Name | Description |
|---|---|
| `POWERPLATFORM_CLIENT_SECRET` | Client secret for the Azure App Registration |

**Variables** (under the environment's Variables section):

| Name | Description | Example (DEV) | Example (MAINDEV) |
|---|---|---|---|
| `POWERPLATFORM_APP_ID` | Azure App Registration client ID | `xxxxxxxx-...` | `xxxxxxxx-...` |
| `POWERPLATFORM_TENANT_ID` | Azure AD tenant ID | `xxxxxxxx-...` | `xxxxxxxx-...` |
| `POWERPLATFORM_ENVIRONMENT_URL` | Power Platform environment URL | `https://orgDEV.crm.dynamics.com` | `https://orgMAINDEV.crm.dynamics.com` |

> **Note:** `POWERPLATFORM_APP_ID` and `POWERPLATFORM_TENANT_ID` are typically the same across environments (same Azure tenant and app registration). Only `POWERPLATFORM_ENVIRONMENT_URL` and `POWERPLATFORM_CLIENT_SECRET` are usually different per environment.

### Optional: Add Deployment Protection Rules

To require manual approval before deployments reach **MAINDEV**:

1. Go to **Settings** → **Environments** → click **MAINDEV**.
2. Under **Deployment protection rules**, enable **Required reviewers**.
3. Add the team members or yourself as required reviewers.

This ensures no solution is deployed to the shared MAINDEV environment without explicit approval.
