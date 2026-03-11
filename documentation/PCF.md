# PCF Controls

## Architecture Overview

All PCF projects live under the `pcf/` folder at the root of the repository.

```
pcf/
  CommentFeedLibrary/       ← shared code library (business logic, hooks, shared React components, Fluent UI v9 setup)
  CommentFeedStandard/      ← virtual field control  — imports from CommentFeedLibrary
  CommentFeedDataSet/       ← virtual dataset control — imports from CommentFeedLibrary
```

**Shared library** (`CommentFeedLibrary`) is a PCF code component library
(`pac pcf init --kind library`). It owns:
- Fluent UI v9 (`@fluentui/react-components`) — declared once, shared across both controls
- Common React hooks (e.g. data fetching, formatting)
- Shared UI components (comment card, avatar, timestamp, etc.)
- API / Dataverse helper utilities

Both controls depend on `CommentFeedLibrary` via `package.json` and are deployed
together in the same Power Platform solution.

---

## Controls

| # | Project | Kind | Template | Framework | Virtual | App Support |
|---|---|---|---|---|---|---|
| – | `CommentFeedLibrary` | `library` | – | `react` | – | Shared dependency |
| 1 | `CommentFeedStandard` | `control` | `field` (lookup) | `react` | `true` | Model-Driven ✅  Canvas ✅ |
| 2 | `CommentFeedDataSet` | `control` | `dataset` | `react` | `true` | Model-Driven ✅  Canvas ⚠️ |

> **Canvas App caveat for `CommentFeedDataSet`:** Dataset PCF controls in Canvas Apps
> receive a read-only record set — paging, sorting, and view selection APIs are
> not available. Filtering must be handled by the app maker externally.

---

## Fluent UI v9 Note

The Power Platform virtual framework bundles React and Fluent UI **v8** — Fluent UI
**v9** (`@fluentui/react-components`) is **not** included in the platform's shared
bundle. It is therefore declared as a dependency of `CommentFeedLibrary` and bundled
once into the library output. Both controls import Fluent UI components exclusively
through `CommentFeedLibrary` to avoid duplicate bundling.

### Pinned dependency versions

All three projects (`CommentFeedLibrary`, `CommentFeedStandard`, `CommentFeedDataSet`)
must use these exact versions in their `package.json`:

```json
"@fluentui/react-components": "9.46.2",
"react": "16.14.0",
"react-dom": "16.14.0"
```

> **Why React 16?** The virtual PCF framework is built on React 16. Using a higher
> version risks runtime conflicts with the platform's own React instance.

---

## PAC CLI Scaffold Commands

```powershell
# 1. Shared library
pac pcf init --namespace "nextwit.CRM.Pcf" --name CommentFeedLibrary --kind library --framework react --run-npm-install

# 2. Standard (field / lookup) control
pac pcf init --namespace "nextwit.CRM.Pcf" --name CommentFeedStandard --template field --framework react --run-npm-install

# 3. Dataset control
pac pcf init --namespace "nextwit.CRM.Pcf" --name CommentFeedDataSet --template dataset --framework react --run-npm-install
```

After scaffolding, add `"virtual": "true"` to the `<control>` element in each
control's `ControlManifest.Input.xml`, and add `CommentFeedLibrary` as a dependency
in each control's `package.json`.
