# Developer Guide — Getting Started with This Template

> **Audience:** Developers and solution architects onboarding to a new project based on this repository template.  
> **Last updated:** February 2026

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create Your Repository from This Template](#2-create-your-repository-from-this-template)
3. [Repository Structure Explained](#3-repository-structure-explained)
4. [Initial Setup Checklist](#4-initial-setup-checklist)
5. [Configure GitHub Secrets](#5-configure-github-secrets)
6. [Power Platform Integration](#6-power-platform-integration)
   - [Register an Azure App](#61-register-an-azure-app-service-principal)
   - [Grant Power Platform Access](#62-grant-the-app-access-to-power-platform)
   - [Export a Solution (Power Platform → GitHub)](#63-export-a-solution-power-platform--github)
   - [Deploy a Solution (GitHub → Power Platform)](#64-deploy-a-solution-github--power-platform)
7. [Branching Strategy](#7-branching-strategy)
8. [Commit Message Convention](#8-commit-message-convention)
9. [Working with Issue Templates](#9-working-with-issue-templates)
10. [Customization Reference](#10-customization-reference)
    - [Adding or Removing Solution Names](#101-adding-or-removing-solution-names)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

Before you begin, ensure you have the following:

| Requirement | Minimum Version | Notes |
|---|---|---|
| Git | 2.40+ | [Download](https://git-scm.com/) |
| GitHub account | — | With access to the `nextwit` org or fork rights |
| Node.js | 20 LTS | Only if working on JS/TS projects |
| Power Platform CLI (`pac`) | 1.30+ | Only for Power Platform projects. [Install guide](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) |
| Azure CLI | 2.55+ | Only required for Azure-based deployments |
| VS Code | Latest | Recommended editor |

### Recommended VS Code Extensions

Install these extensions for the best developer experience in this repo:

- **GitHub Actions** (`github.vscode-github-actions`) — syntax highlighting and validation for workflow files
- **Power Platform Tools** (`microsoft.powerplatform-vscode`) — PCF and solution development
- **GitLens** (`eamodio.gitlens`) — enhanced Git history and code authorship
- **EditorConfig** (`editorconfig.editorconfig`) — enforces consistent formatting
- **Conventional Commits** (`vivaxy.vscode-conventional-commits`) — guided commit message authoring

---

## 2. Create Your Repository from This Template

### Option A — GitHub Template (Recommended)

1. Navigate to [github.com/nextwit/dev-template-repository](https://github.com/nextwit/dev-template-repository).
2. Click the green **"Use this template"** button → **Create a new repository**.
3. Fill in your repository name, description, and visibility.
4. Click **Create repository**.
5. Clone your new repository locally:

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### Option B — Manual Clone and Reinitialize

Use this if you cannot use the GitHub template feature directly:

```bash
git clone https://github.com/nextwit/dev-template-repository.git my-new-project
cd my-new-project

# Strip the template's git history and start fresh
Remove-Item -Recurse -Force .git          # PowerShell
# rm -rf .git                             # bash/macOS/Linux

git init
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO_NAME.git
git add .
git commit -m "chore: initial project setup from template"
git push -u origin main
```

---

## 3. Repository Structure Explained

```
YOUR_REPO_NAME/
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md           # Structured bug report form
│   │   ├── feature_request.md      # Feature request form
│   │   ├── question.md             # Support / question form
│   │   └── config.yml              # Disables blank issues; links to Discussions
│   └── workflows/
│       ├── github-to-powerplatform.yml   # Deploy solution to Power Platform
│       └── powerplatform-to-github.yml   # Export solution from Power Platform
│
├── documentation/
│   └── GETTING_STARTED.md          # This file
│
├── solutions/                      # Power Platform solution source (unpacked)
│   └── [SolutionName]/             # One folder per solution
│
├── out/                            # Build artifacts (git-ignored)
│   ├── solutions/                  # Packed .zip files for deployment
│   └── exported/                   # Raw .zip exports from Power Platform
│
└── README.md                       # Project overview and quick reference
```

> **Note:** The `src/`, `tests/`, `scripts/`, and `docs/` folders referenced in `README.md` represent the recommended structure for your project code. Create them as needed when you start building.

---

## 4. Initial Setup Checklist

After creating your repository from the template, complete the following steps:

- [ ] **Update `README.md`** — Replace the template name, description, badges, and author section with your project's details.
- [ ] **Update `LICENSE`** — Change the copyright year and author name.
- [ ] **Create a `solutions/` folder** — Add your Power Platform solution source, or rename/delete this folder if not using Power Platform.
- [ ] **Add `.gitignore`** — Add language/framework-specific ignore rules for your project.
- [ ] **Configure branch protection** — See [Step 7](#7-branching-strategy) for recommended rules.
- [ ] **Add GitHub Secrets** — See [Step 5](#5-configure-github-secrets).
- [ ] **Enable GitHub Discussions** — Recommended for community Q&A (referenced in `config.yml`).
- [ ] **Update `documentation/GETTING_STARTED.md`** — Refine this file to reflect your project's specific setup.

---

## 5. Configure GitHub Secrets

The CI/CD workflows authenticate to Power Platform via a service principal. Add the following secrets to your repository:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | Example Value |
|---|---|---|
| `POWERPLATFORM_ENVIRONMENT_URL` | Default Power Platform environment URL | `https://orgabc123.crm.dynamics.com` |
| `POWERPLATFORM_APP_ID` | Azure App Registration (client) ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `POWERPLATFORM_CLIENT_SECRET` | Azure App Registration client secret value | `abc123~...` |
| `POWERPLATFORM_TENANT_ID` | Azure AD / Entra ID tenant ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |

> **Security tip:** Rotate client secrets regularly and use the minimum required permissions. Never hardcode secrets in workflow files or source code.

---

## 6. Power Platform Integration

This template ships with two GitHub Actions workflows that automate ALM (Application Lifecycle Management) for Power Platform solutions.

### 6.1 Register an Azure App (Service Principal)

The workflows use a service principal to authenticate to Power Platform without requiring interactive login.

1. Go to [portal.azure.com](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → **New registration**.
2. Name: `github-powerplatform-spn` (or similar).
3. Select **Accounts in this organizational directory only**.
4. Click **Register**.
5. Copy the **Application (client) ID** and **Directory (tenant) ID** — you'll need these for GitHub Secrets.
6. Go to **Certificates & secrets** → **New client secret**.
7. Set an expiry, click **Add**, and immediately copy the **secret value**.

### 6.2 Grant the App Access to Power Platform

1. Go to [admin.powerplatform.microsoft.com](https://admin.powerplatform.microsoft.com).
2. Navigate to **Settings** → **Application users** → **New app user**.
3. Click **Add an app**, search for the app registration you created, and select it.
4. Choose your target **Business unit**.
5. Assign the **System Administrator** security role (or a custom role with solution import rights).
6. Click **Create**.

Repeat this for every environment you intend to deploy to.

### 6.3 Export a Solution (Power Platform → GitHub)

Use this workflow when you've made changes in a Power Platform environment and want to commit them to source control.

**When to use:**
- After customizing a solution in the maker portal
- To capture a baseline snapshot of an environment
- Before merging changes from another developer's branch

**How to run:**

1. Go to your repository on GitHub → **Actions** tab.
2. Select **"Power Platform to GitHub"** from the left sidebar.
3. Click **"Run workflow"**.
4. Fill in the inputs:

| Input | Description |
|---|---|
| `solution_name` | Exact API name of the solution in Power Platform (e.g. `ContosoCore`) |
| `source_environment` | Full environment URL (leave blank to use the `POWERPLATFORM_ENVIRONMENT_URL` secret) |
| `solution_type` | `Unmanaged` (recommended for source control), `Managed`, or `Both` |

5. Click **"Run workflow"**.

**What happens:**
- The workflow exports the `.zip` from Power Platform.
- It unpacks the solution into `solutions/<SolutionName>/` as individual XML/JSON files.
- A Pull Request is opened automatically on a branch named `export/<SolutionName>`.
- Review the PR diff and merge to `main` to commit the changes.

### 6.4 Deploy a Solution (GitHub → Power Platform)

Use this workflow to deploy the current solution source in `main` to a Power Platform environment.

**When to use:**
- Promoting changes from `main` to a dev, test, or production environment
- Deploying after a PR merge
- Setting up a new environment from source

**How to run:**

1. Go to **Actions** → **"GitHub to Power Platform"**.
2. Click **"Run workflow"**.
3. Fill in the inputs:

| Input | Description |
|---|---|
| `solution_name` | Name of the solution folder under `solutions/` (e.g. `ContosoCore`) |
| `target_environment` | Full environment URL to deploy to |

4. Click **"Run workflow"**.

**What happens:**
- The workflow packs the solution source from `solutions/<SolutionName>/` into a `.zip`.
- The packed artifact is uploaded under the **Actions** run for audit purposes.
- The solution is imported into the target environment with overwrite and publish enabled.

---

## 7. Branching Strategy

This template follows a **trunk-based development** model:

```
main ──────────────────────────────────────────► (production)
  │
  ├── feature/add-canvas-app ──► PR ──► merge ──► main
  │
  ├── fix/duplicate-record-bug ──► PR ──► merge ──► main
  │
  └── export/ContosoCore ──► (auto-created by workflow) ──► PR ──► merge ──► main
```

| Branch pattern | Purpose | Lifetime |
|---|---|---|
| `main` | Production-ready, protected | Permanent |
| `feature/<description>` | New features | Until merged |
| `fix/<description>` | Bug fixes | Until merged |
| `hotfix/<description>` | Critical production patches | Until merged |
| `release/<version>` | Release candidate preparation | Until tagged |
| `export/<solution-name>` | Auto-created by export workflow | Until merged |

### Recommended Branch Protection for `main`

**Settings → Branches → Add branch protection rule** → Branch name pattern: `main`

- [x] Require a pull request before merging
- [x] Require at least 1 approving review
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings

---

## 8. Commit Message Convention

This template follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Format

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semi-colons, no logic change |
| `refactor` | Code restructuring without feature or fix |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, tooling |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |
| `revert` | Reverts a previous commit |

### Examples

```bash
feat(solutions): add ContosoCore solution scaffold
fix(workflow): correct solution pack path in github-to-powerplatform
docs(getting-started): add Power Platform setup section
chore(deps): update powerplatform-actions to v1.3
ci(export): set solution type to Unmanaged by default
```

---

## 9. Working with Issue Templates

Three issue templates are pre-configured in `.github/ISSUE_TEMPLATE/`:

| Template | Label | Use when |
|---|---|---|
| **Bug Report** | `bug` | Something is broken or behaving unexpectedly |
| **Feature Request** | `enhancement` | Proposing a new feature or improvement |
| **Question / Support** | `question` | Asking for help or clarification |

Blank issues are disabled by default. Users are directed to GitHub Discussions for general questions.

To **add a new template**, create a new `.md` file in `.github/ISSUE_TEMPLATE/` following the existing format, or convert to YAML-based forms for structured input (see [GitHub docs](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)).

---

## 10. Customization Reference

Quick reference for the most common customizations after forking this template:

| What | Where | Notes |
|---|---|---|
| Project name & description | `README.md` | Update title, badges, overview section |
| Author info | `README.md` (bottom) | Name, blog, LinkedIn, GitHub |
| License year/author | `LICENSE` | Find & replace the year and name |
| Available solution names | `.github/workflows/powerplatform-to-github.yml` → `solution_name` options | See [Section 10.1](#101-adding-or-removing-solution-names) |
| Default environment URL | `POWERPLATFORM_ENVIRONMENT_URL` variable | Set per GitHub Environment in Settings |
| Branch protection rules | GitHub Settings → Branches | See [Section 7](#7-branching-strategy) |
| Issue template labels | `.github/ISSUE_TEMPLATE/*.md` → `labels:` | Must match existing repo labels |
| Discussions URL in config | `.github/ISSUE_TEMPLATE/config.yml` | Update org/repo name in the URL |
| Add new workflows | `.github/workflows/` | Use `workflow_dispatch` for manual triggers |

---

### 10.1 Adding or Removing Solution Names

The **Power Platform to GitHub** workflow presents `solution_name` as a dropdown so users can only pick a known, valid solution. The list is maintained directly in the workflow file.

**File:** [.github/workflows/powerplatform-to-github.yml](.github/workflows/powerplatform-to-github.yml)

```yaml
      solution_name:
        description: 'Dataverse solution name to export and unpack'
        required: true
        type: choice
        options:
          - MySolution1   # ← replace with your real solution API names
          - MySolution2
          - MySolution3
```

#### Rules

- Values must match the **API name** (unique name) of the solution in Dataverse — not the display name.
- API names are **case-sensitive**.
- The **first entry** in the list becomes the default selection.
- There is no limit on the number of options, but keep the list focused on solutions actively maintained in this repository.

#### How to find a solution's API name

1. Go to [make.powerapps.com](https://make.powerapps.com) or [Power Platform Admin Center](https://admin.powerplatform.microsoft.com).
2. Select your environment → **Solutions**.
3. The **Name** column (not *Display name*) shows the API name — e.g. `ContosoCore`.

Alternatively, using the pac CLI:

```powershell
pac solution list
```

The first column of the output is the unique API name.

#### Example — adding a new solution

```yaml
        options:
          - ContosoCore
          - ContosoShared
          - ContosoPortal      # newly added
```

#### Example — removing a retired solution

Simply delete the line. The change takes effect on the next workflow run with no other modifications required.

---

## 11. Troubleshooting

### Workflow fails with "unauthorized" or 401 error

- Verify all four secrets (`POWERPLATFORM_APP_ID`, `POWERPLATFORM_CLIENT_SECRET`, `POWERPLATFORM_TENANT_ID`, `POWERPLATFORM_ENVIRONMENT_URL`) are correctly set in **Settings → Secrets**.
- Confirm the app registration exists in the same tenant as the Power Platform environment.
- Ensure the application user has been created in the target environment (see [Section 6.2](#62-grant-the-app-access-to-power-platform)).
- Check that the client secret has not expired.

### Solution pack step fails — "folder not found"

- Confirm the solution folder exists at `solutions/<SolutionName>/` in the `main` branch.
- Check that the `solution_name` input matches the folder name exactly (case-sensitive).

### Export workflow creates a PR but files are empty / unchanged

- The solution may not have any customizations since the last export.
- Verify the correct `source_environment` URL is used.
- Check that the solution name in the input matches the **API name** (not the display name) in Power Platform.

### `create-pull-request` step is skipped

- GitHub Actions must have **read and write permissions** to create branches and PRs.  
  Go to **Settings → Actions → General → Workflow permissions** → select **Read and write permissions**.

### `pac` CLI commands fail locally

```bash
# Authenticate to Power Platform
pac auth create --url https://YOUR_ORG.crm.dynamics.com

# List available solutions
pac solution list

# Export a solution manually
pac solution export --name MySolution --path ./out/exported --managed false
```

---

> For questions not covered here, open a [GitHub Discussion](https://github.com/nextwit/dev-template-repository/discussions) or file a [Question issue](https://github.com/nextwit/dev-template-repository/issues/new?template=question.md).
