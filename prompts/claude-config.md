---
name: claude-config
description: Inspect Claude bridge defaults, install paths, and local readiness.
allowed-tools:
  - Bash
---
<objective>
Inspect the local Claude bridge state, defaults, binary discovery, and install paths.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} config
```
Additional guidance:
- Run the helper and return its configuration output directly.
- Use this command to diagnose installation and environment issues.
- Do not add extra interpretation unless the helper output clearly indicates a failure.

Relay the helper output directly to the user.
</process>
