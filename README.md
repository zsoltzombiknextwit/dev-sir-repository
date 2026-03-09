# 🚀 dev-template-repository

> A production-ready developer template repository with best-practice folder structures, CI/CD workflows, branching strategies, and configuration standards. Jumpstart any project with consistent scaffolding for Power Platform, Azure, and modern full-stack solutions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Maintained](https://img.shields.io/badge/Maintained-yes-green.svg)](https://github.com/nextwit/dev-template-repository)

---

## 📋 Table of Contents

- [Overview](#overview)
- [What's Included](#whats-included)
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [Branching Strategy](#branching-strategy)
- [CI/CD Workflows](#cicd-workflows)
- [Configuration Standards](#configuration-standards)
- [How to Use This Template](#how-to-use-this-template)
- [Customization Guide](#customization-guide)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 Overview

This repository serves as a **GitHub Template Repository** — a standardized starting point for building enterprise-grade applications with consistent structure, tooling, and governance practices.

It is designed for developers and solution architects working with:

- **Microsoft Power Platform** (PCF Controls, Power Automate, Dataverse)
- **Azure Services** (Azure Functions, Container Apps, AI Services)
- **Full-stack web applications**
- **Any modern software project** requiring a clean, governed scaffold

Use this template to eliminate repetitive setup work and start every project aligned with best practices from day one.

---

## 📦 What's Included

| Feature | Description |
|---|---|
| ⚙️ GitHub Actions | Power Platform ALM workflows: export from and deploy to Dataverse |
| 🌍 GitHub Environments | DEV and MAINDEV environment scoping for secrets and variables |
| 🔒 Branch protection | Pre-configured branching strategy documentation |
| 📝 Issue templates | Bug report, feature request, and question templates |
| 🛠️ PowerShell scripts | Reusable pac CLI scripts for authentication, versioning, and git operations |
| 📄 License | MIT License pre-configured |
| 📚 Developer documentation | Getting started guide and secrets & variables reference |

---

## 🚀 Getting Started

### Option 1: Use as a GitHub Template (Recommended)

1. Click the green **"Use this template"** button at the top of this repository.
2. Name your new repository and choose visibility.
3. Clone your new repo locally:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

4. Follow the [Customization Guide](#customization-guide) to tailor it to your project.

### Option 2: Clone Directly

```bash
git clone https://github.com/nextwit/dev-template-repository.git my-new-project
cd my-new-project

# Remove existing git history and start fresh
rm -rf .git
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git add .
git commit -m "chore: initial project setup from template"
git push -u origin main
```

---

## 📂 Repository Structure

```
dev-template-repository/
│
├── .github/                              # GitHub-specific configuration
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md                 # Bug report template
│   │   ├── feature_request.md            # Feature request template
│   │   ├── question.md                   # Question / support template
│   │   └── config.yml                    # Disables blank issues; links to Discussions
│   └── workflows/
│       ├── github-to-powerplatform.yml   # Deploy solution to Power Platform (manual)
│       └── powerplatform-to-github.yml   # Export & unpack solution from Power Platform (manual)
│
├── documentation/                        # Developer documentation
│   ├── GETTING_STARTED.md               # End-to-end developer onboarding guide
│   └── SECRETS_AND_VARIABLES.md         # GitHub secrets & variables reference
│
├── scripts/                              # Automation scripts
│   └── powerplatform/                    # Power Platform PAC CLI scripts
│       ├── Authenticate-Dataverse.ps1    # Authenticate pac to Dataverse
│       ├── Get-SolutionVersion.ps1       # Retrieve current solution version
│       ├── Increment-SolutionVersion.ps1 # Bump solution patch version in Dataverse
│       ├── New-SolutionsFolder.ps1       # Create solution folder structure
│       └── Commit-And-Push.ps1           # Stage, commit, and push solution source
│
├── solutions/                            # Power Platform solution source (unpacked)
│   └── [SolutionName]/                   # One subfolder per solution (created at runtime)
│
├── LICENSE                               # MIT License
└── README.md                             # This file
```

---

## 🌿 Branching Strategy

This template follows a **trunk-based development** model with feature branches:

| Branch | Purpose | Protection |
|---|---|---|
| `main` | Production-ready code | ✅ Protected — requires PR + review |
| `develop` | Integration branch for features | ✅ Protected — requires PR |
| `feature/[name]` | New features and enhancements | ❌ Short-lived |
| `fix/[name]` | Bug fixes | ❌ Short-lived |
| `hotfix/[name]` | Critical production patches | ❌ Short-lived |
| `release/[version]` | Release preparation | ❌ Short-lived |

### Commit Message Convention

This template follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <short description>

Examples:
feat(auth): add OAuth2 token refresh
fix(api): handle null response from Dataverse
docs(readme): update branching strategy section
chore(deps): bump node version to 20
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

---

## ⚙️ CI/CD Workflows

Both workflows are triggered **manually** via `workflow_dispatch` from the **Actions** tab.

### GitHub to Power Platform (`github-to-powerplatform.yml`)

Deploys a packed solution from source control to a target Power Platform environment.

- 🔽 Select GitHub environment (`DEV` or `MAINDEV`) and solution name
- 📦 Packs solution source from `solutions/<name>/`
- ☁️ Imports solution into the target Dataverse environment
- ✅ Uploads packed `.zip` as a workflow artifact

### Power Platform to GitHub (`powerplatform-to-github.yml`)

Exports and unpacks a solution from the DEV Dataverse environment into source control.

- 🔽 Select solution name, optionally increment version and/or publish customizations
- 🔐 Authenticates to Dataverse using the DEV environment service principal
- 📋 Retrieves current solution version via `pac solution list`
- 🔢 Optionally bumps the patch version in Dataverse before export
- 📤 Publishes all customizations if selected
- 📦 Exports unmanaged solution to a versioned `.zip`
- 📂 Unpacks solution source (including canvas apps) into `solutions/<name>/`
- 💾 Commits and pushes unpacked source directly to `main`

### Required GitHub Environments & Credentials

See [documentation/SECRETS_AND_VARIABLES.md](documentation/SECRETS_AND_VARIABLES.md) for the full reference.

| Environment | Variable | Secret |
|---|---|---|
| `DEV` | `POWERPLATFORM_APP_ID`, `POWERPLATFORM_TENANT_ID`, `POWERPLATFORM_ENVIRONMENT_URL` | `POWERPLATFORM_CLIENT_SECRET` |
| `MAINDEV` | `POWERPLATFORM_APP_ID`, `POWERPLATFORM_TENANT_ID`, `POWERPLATFORM_ENVIRONMENT_URL` | `POWERPLATFORM_CLIENT_SECRET` |

---

## 🔧 Configuration Standards

### Secrets & Credentials

- Never commit secrets, credentials, or environment URLs to the repository.
- All sensitive values are managed via **GitHub Environment secrets and variables**.
- See [documentation/SECRETS_AND_VARIABLES.md](documentation/SECRETS_AND_VARIABLES.md) for the full reference.

### Power Platform Scripts

- All PowerShell automation is located in `scripts/powerplatform/`.
- Scripts use `[CmdletBinding()]`, typed parameters, and `$ErrorActionPreference = 'Stop'`.
- Scripts write step outputs to `$env:GITHUB_OUTPUT` for inter-step data passing.

### Solution Source Control

- Solutions are stored **unpacked** in `solutions/<SolutionName>/` for human-readable diffs.
- Packed `.zip` files are never committed — they are excluded via `.gitignore` (add `solutions/**/*.zip`).
- Canvas app sources are unpacked with `process-canvas-apps: true`.

---

## 🛠️ How to Use This Template

### Step 1 — Create from template

Click **"Use this template"** on GitHub and create your new repository.

### Step 2 — Update project identity

Replace all placeholder values with your project details:

```bash
# Files to update:
# - README.md                           → project name, description, badges, links
# - LICENSE                             → year and author name
# - .github/workflows/*.yml             → solution names, environment targets
# - documentation/GETTING_STARTED.md   → project-specific setup steps
# - documentation/SECRETS_AND_VARIABLES.md → environment and secret details
```

### Step 3 — Configure branch protection

In your new repo: **Settings → Branches → Add rule** for `main` and `develop`:

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Require conversation resolution before merging
- ✅ Restrict force pushes

### Step 4 — Set up GitHub Environments and secrets

Create `DEV` and `MAINDEV` environments and add the required variables and secret. See [documentation/SECRETS_AND_VARIABLES.md](documentation/SECRETS_AND_VARIABLES.md) for the full guide.

### Step 5 — Start building

You're ready. Remove any template-specific files not relevant to your project and begin development.

---

## ✏️ Customization Guide

| What to customize | Where |
|---|---|
| Project name & description | `README.md` |
| License year / author | `LICENSE` |
| Solution name options | `.github/workflows/powerplatform-to-github.yml` → `solution_name` options |
| Workflow environment targets | `.github/workflows/*.yml` → `environment:` |
| Issue templates | `.github/ISSUE_TEMPLATE/` |
| GitHub Environments & credentials | Settings → Environments → DEV / MAINDEV |
| Developer documentation | `documentation/GETTING_STARTED.md` |

---

## 🤝 Contributing

Contributions, improvements, and suggestions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-improvement`
3. Commit your changes following [Conventional Commits](#commit-message-convention)
4. Push to your fork and open a Pull Request

---

## 🛡️ Security

Do not open public issues for security vulnerabilities. Please use [GitHub Security Advisories](https://github.com/nextwit/dev-template-repository/security/advisories) for responsible disclosure.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Zsolt Zombik** — Senior Power Platform Expert | AI & Dev Blogger  
🌐 [aidevme.com](https://aidevme.com) | 💼 [LinkedIn](https://www.linkedin.com/in/zsoltzombik/) | 🐙 [GitHub](https://github.com/nextwit)

---

> 💡 *Built with ❤️ to help developers ship faster without sacrificing quality.*