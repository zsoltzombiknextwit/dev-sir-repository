# Video Transcript: Getting Started with the Dev Template Repository

> **Duration:** ~15-20 minutes  
> **Target Audience:** Developers and solution architects onboarding to Power Platform ALM projects  
> **Last updated:** February 2026

---

## Video Introduction (0:00 - 0:45)

**[ON SCREEN: Title card with repository name and logo]**

Hey everyone! Welcome to this getting started guide for the Nextwit Dev Template Repository. If you're a developer working with Power Platform solutions and you want to implement a solid ALM strategy with GitHub Actions, you're in the right place.

In this video, I'll walk you through everything you need to know to get started: how to create your repository from this template, configure your secrets, understand the automated workflows, and start working with Power Platform solutions in a version-controlled environment.

By the end of this video, you'll be able to export solutions from Power Platform, commit them to GitHub, and deploy them back to different environments—all automated with CI/CD workflows.

Let's get started!

---

## Prerequisites (0:45 - 2:00)

**[ON SCREEN: Prerequisites checklist]**

Before we dive in, let's make sure you have everything you need. Don't worry—most of these tools you probably already have installed.

First, you'll need **Git** version 2.40 or higher. This is essential for version control.

You'll need a **GitHub account** with access to your organization. If you're creating a new repository, make sure you have the right permissions.

For Power Platform work, you'll want the **Power Platform CLI**, also known as `pac`. This should be version 1.30 or higher. I'll show you how to check this in a moment.

And of course, **VS Code** is our recommended editor. It's not required, but it makes life much easier with the right extensions installed.

**[ON SCREEN: VS Code extensions list]**

Speaking of extensions, here are the ones I recommend:
- GitHub Actions extension for workflow syntax highlighting
- Power Platform Tools for solution development
- GitLens for enhanced Git integration
- EditorConfig for consistent formatting
- And Conventional Commits to help with standardized commit messages

You can install all of these from the VS Code marketplace.

---

## Creating Your Repository (2:00 - 4:15)

**[ON SCREEN: GitHub repository page]**

Alright, let's create your repository from this template. Head over to GitHub and navigate to the dev-template-repository.

**[ON SCREEN: Clicking "Use this template" button]**

You'll see a green button that says "Use this template"—click that, then select "Create a new repository."

Now, fill in your repository details:
- Give it a meaningful name—something that represents your project
- Add a description so your team knows what this is for
- Choose whether it should be public or private—most of you will probably want private for enterprise projects

Click "Create repository" and GitHub will copy all the template files into your new repository.

**[ON SCREEN: Terminal showing git clone command]**

Now let's clone it locally. Open your terminal and run:

```bash
git clone https://github.com/YOUR_ORG/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

Great! Now open this folder in VS Code.

**[ON SCREEN: VS Code with repository opened]**

Perfect. Now you have a local copy and you're ready to customize it.

---

## Understanding the Repository Structure (4:15 - 6:30)

**[ON SCREEN: Exploring folder structure in VS Code]**

Let's take a moment to understand what you've just cloned.

At the root, you'll see a few key folders:

**The `.github` folder** is where all the magic happens. In here, you have:
- **workflows** folder containing the two main GitHub Actions workflows. We'll dive deep into these in a moment.
- **ISSUE_TEMPLATE** folder with pre-configured templates for bug reports, feature requests, and questions.

**The `documentation` folder** contains comprehensive guides—including the one this video is based on!

**The `solutions` folder** is where your Power Platform solutions will live as unpacked source code. Right now, it has three example solutions: MySolution1, MySolution2, and MySolution3. You'll replace these with your actual solutions.

**[ON SCREEN: Opening a solution folder]**

Inside each solution folder, you'll see the unpacked solution structure: Entities, Other, and potentially CanvasApps if your solution contains canvas apps. These are all in XML and JSON format, which means they're perfect for version control and code reviews.

**The `scripts` folder** contains PowerShell helper scripts that the workflows use. You probably won't need to touch these unless you're customizing the automation.

---

## Initial Setup Checklist (6:30 - 8:00)

**[ON SCREEN: Showing README.md file]**

Now, let's personalize this repository. Here's your initial setup checklist:

First, **update the README file**. Replace the template name and description with your project's details. Update the badges at the top to match your repository, and change the author information at the bottom.

**[ON SCREEN: Showing LICENSE file]**

Next, **update the LICENSE file**. Change the copyright year and author name to reflect your organization.

**[ON SCREEN: Settings → Branches in GitHub]**

Then, **configure branch protection** for your `main` branch. This is crucial! Go to Settings → Branches → Add branch protection rule. Enable:
- Require pull request before merging
- Require at least one review
- Require status checks to pass before merging

This ensures nothing goes directly into main without review—a best practice for any production codebase.

**[ON SCREEN: Settings → Actions → General]**

One more important setting: go to Settings → Actions → General, scroll down to "Workflow permissions," and select **"Read and write permissions."** This allows the workflows to create branches and pull requests automatically.

---

## Configuring GitHub Secrets (8:00 - 11:00)

**[ON SCREEN: Azure Portal]**

Now for the most important part: configuring authentication. The workflows need to connect to Power Platform, and we'll do that using a service principal—essentially an application identity that can authenticate without a user.

**[ON SCREEN: Microsoft Entra ID → App registrations]**

Let me show you how to set this up. In the Azure Portal, go to Microsoft Entra ID—that's what Azure AD is called now—then go to App registrations.

Click "New registration." Give it a name like "github-powerplatform-spn." Select "Accounts in this organizational directory only" and click Register.

**[ON SCREEN: Copying Application ID and Tenant ID]**

Perfect! Now you'll see the Overview page. Copy two values:
- The **Application (client) ID**
- The **Directory (tenant) ID**

Keep these handy—you'll add them to GitHub in just a moment.

**[ON SCREEN: Certificates & secrets → New client secret]**

Now, go to "Certificates & secrets" and click "New client secret." Give it a description like "GitHub Actions" and set an expiration. I recommend 12 months for security, but check your organization's policies.

Click Add, and **immediately copy the secret value**. This is your only chance to see it! If you lose it, you'll need to create a new one.

**[ON SCREEN: Power Platform Admin Center]**

Now let's grant this app access to Power Platform. Go to admin.powerplatform.microsoft.com.

**[ON SCREEN: Settings → Application users → New app user]**

Navigate to your environment, go to Settings → Application users, and click "New app user."

Click "Add an app," search for the app registration you just created, and select it. Choose your business unit and assign the System Administrator role—or a custom role with solution import rights if your organization requires it.

Click Create. You'll need to repeat this for every environment you want to deploy to.

**[ON SCREEN: GitHub repository → Settings → Secrets and variables → Actions]**

Now let's add these to GitHub. Go to your repository on GitHub, click Settings → Secrets and variables → Actions.

Click "New repository secret" and add four secrets:

1. **POWERPLATFORM_APP_ID** — paste the Application ID you copied
2. **POWERPLATFORM_CLIENT_SECRET** — paste the client secret value
3. **POWERPLATFORM_TENANT_ID** — paste the Directory ID
4. **POWERPLATFORM_ENVIRONMENT_URL** — this is your Power Platform environment URL, something like `https://orgabc123.crm.dynamics.com`

Great! Your workflows can now authenticate to Power Platform.

---

## Understanding the Workflows (11:00 - 14:30)

**[ON SCREEN: .github/workflows folder]**

Now let's talk about the two main workflows that make this template so powerful.

**[ON SCREEN: powerplatform-to-github.yml file]**

The first is **"Power Platform to GitHub."** This workflow exports a solution from Power Platform and commits it to your repository.

Here's when you'd use this:
- You've made changes in the Power Platform maker portal and want to capture them in source control
- Another developer made changes in a shared dev environment
- You want to create a baseline snapshot of a solution

**[ON SCREEN: GitHub Actions UI → Run workflow]**

Let me show you how to run it. Go to the Actions tab in your GitHub repository, select "Power Platform to GitHub" from the sidebar, and click "Run workflow."

You'll see several inputs:

**`solution_name`** — This is a dropdown with your solution names. Notice it shows MySolution1, MySolution2, and MySolution3. You'll customize this list to match your actual solutions. We'll talk about that in a moment.

**`increment_version`** — Choose whether to automatically bump the solution version before exporting. This is useful if you want to track versions systematically.

**`publish_customizations`** — Whether to publish all customizations before export. Usually, you want this ON to ensure you're capturing the latest changes.

**`run_powerapps_checker`** — This runs Microsoft's solution checker to identify problems. It's great for quality control but adds time to your workflow.

**[ON SCREEN: Workflow execution logs]**

When you click "Run workflow," here's what happens:
1. Authenticates to Power Platform using your service principal
2. Gets the current solution version
3. Optionally increments the version
4. Publishes customizations if you selected that
5. Exports the solution as a ZIP file
6. Unpacks it to individual XML and JSON files
7. Optionally runs PowerApps Checker
8. Commits and pushes the changes to a new branch

**[ON SCREEN: Pull request created by workflow]**

The workflow automatically creates a pull request so you can review the changes before merging to main. This is crucial—you can see exactly what changed in Power Platform and have a team member review it.

**[ON SCREEN: github-to-powerplatform.yml file]**

The second workflow is **"GitHub to Power Platform."** This does the opposite—it takes your solution source code and deploys it to a Power Platform environment.

You'd use this when:
- You want to promote changes from main to a test or production environment
- You're setting up a new environment
- You've merged a PR and want to deploy the changes

**[ON SCREEN: GitHub Actions UI → GitHub to Power Platform]**

Running it is similar. Go to Actions, select "GitHub to Power Platform," and run the workflow. You pick the solution name and specify the target environment URL.

The workflow will pack your solution, create a managed ZIP file, and import it into the target environment with all customizations published.

---

## Customizing Solution Names (14:30 - 15:45)

**[ON SCREEN: powerplatform-to-github.yml in VS Code]**

Let's talk about customizing those solution names. Open `.github/workflows/powerplatform-to-github.yml`.

**[ON SCREEN: Scrolling to solution_name options]**

Look for the `solution_name` input around line 18. You'll see:

```yaml
options:
  - MySolution1
  - MySolution2
  - MySolution3
```

Replace these with your actual solution API names. These are the unique names from Power Platform, not the display names.

**[ON SCREEN: Power Platform maker portal → Solutions]**

To find your solution API names, go to make.powerapps.com, select your environment, go to Solutions, and look at the "Name" column—not "Display name." For example, if you see "Contoso Core" as the display name, the API name might be "ContosoCore."

**[ON SCREEN: Terminal showing pac solution list]**

Or you can use the PAC CLI:

```bash
pac auth create --url https://your-env.crm.dynamics.com
pac solution list
```

The first column shows the API names.

**[ON SCREEN: Editing the YAML file]**

Update your workflow file with these names, commit and push the change, and now your dropdown will show the correct solutions.

---

## Branching Strategy & Commit Conventions (15:45 - 17:00)

**[ON SCREEN: Git branch diagram]**

Quick note on branching: this template follows trunk-based development. Your `main` branch is production-ready and protected.

Create feature branches for new work:
- `feature/add-canvas-app`
- `fix/duplicate-record-bug`
- `hotfix/critical-security-patch`

Always work on a branch, never directly on main. Create a pull request to merge changes.

**[ON SCREEN: Showing commit message examples]**

For commit messages, we follow Conventional Commits. Your commits should look like:

```
feat(solutions): add customer portal solution
fix(workflow): correct solution pack path
docs(readme): update setup instructions
```

The format is: `type(scope): short description`

Common types are `feat` for features, `fix` for bug fixes, `docs` for documentation, and `chore` for maintenance tasks.

If you installed the Conventional Commits extension in VS Code, it'll help you write these correctly.

---

## Your First Workflow Run (17:00 - 18:30)

**[ON SCREEN: GitHub Actions tab]**

Let's do a quick demo. I'm going to export one of my solutions.

**[ON SCREEN: Clicking Run workflow]**

I'll go to Actions, select "Power Platform to GitHub," click "Run workflow," select my solution name, enable version increment and publish customizations, and click the green button.

**[ON SCREEN: Watching workflow execute]**

Now watch as it runs through each step. You'll see:
- Checkout code
- Install Power Platform CLI
- Authenticate
- Get and increment version
- Export the solution
- Unpack to source format

**[ON SCREEN: Showing the pull request]**

And there it is—a pull request was automatically created! I can see all the changes that were made in Power Platform. This is incredibly powerful for code reviews and audit trails.

I could review these changes, request changes if needed, and when I'm satisfied, merge to main.

**[ON SCREEN: After merge, showing main branch]**

Once merged, these changes are now part of our main branch and can be deployed to other environments using the GitHub to Power Platform workflow.

---

## Troubleshooting Tips (18:30 - 19:30)

**[ON SCREEN: Common errors list]**

Before we wrap up, let me share a few common issues and how to fix them:

**If you get an "unauthorized" or 401 error:**
- Double-check all four secrets are set correctly
- Verify the app registration exists in the right tenant
- Make sure the application user was created in Power Platform
- Check if the client secret expired

**If the solution pack step fails with "folder not found":**
- Confirm the solution folder exists at `solutions/<SolutionName>/`
- Check that the name matches exactly—it's case-sensitive

**If the workflow doesn't create a pull request:**
- Go to Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

**[ON SCREEN: Documentation folder]**

For more troubleshooting, check out the GETTING_STARTED.md file in the documentation folder. It has a comprehensive troubleshooting section.

---

## Wrap Up & Next Steps (19:30 - 20:00)

**[ON SCREEN: Summary checklist]**

Alright, let's recap what we've covered:

✅ Creating your repository from the template  
✅ Understanding the folder structure  
✅ Setting up Azure app registration and secrets  
✅ Running the Power Platform to GitHub workflow  
✅ Understanding the GitHub to Power Platform workflow  
✅ Customizing solution names  
✅ Following branching and commit conventions  

You now have a production-ready ALM setup for Power Platform development!

**[ON SCREEN: Links and resources]**

Here are your next steps:
1. Update the README and LICENSE with your project details
2. Configure branch protection on main
3. Export your first solution
4. Set up your team members with repository access

If you have questions, open a GitHub Discussion or file an issue using the question template.

Thanks for watching, and happy developing!

**[ON SCREEN: End card with repository link]**

---

## Video Production Notes

### Visual Elements to Include:
- Screen recordings of GitHub UI
- Live demos of workflow execution
- Code editor (VS Code) showing YAML files
- Azure Portal screenshots
- Power Platform maker portal
- Terminal commands being executed
- Animated diagrams for branching strategy

### Editing Tips:
- Use zoom-in effects when highlighting specific UI elements
- Add callout boxes for important values (IDs, secrets, etc.)
- Include "Important!" or "Pro Tip!" overlays for key points
- Speed up terminal output and long-running workflow steps
- Add background music at low volume (avoid during detailed explanations)
- Use transitions between major sections

### Accessibility:
- Add closed captions for all spoken content
- Use high-contrast colors for text overlays
- Ensure all text is readable at 1080p resolution
- Provide chapter markers matching the sections above

### Recommended Video Length:
- Aim for 15-18 minutes for the full version
- Consider creating a "Quick Start" version (5-7 minutes) covering only sections 2, 5, and 11
- Create separate deep-dive videos for workflows and customization

---

*End of Transcript*
