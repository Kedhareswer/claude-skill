---
name: claude-exec
description: Have Claude Code execute scoped implementation work.
argument-hint: [task]
allowed-tools:
  - Bash
---
<objective>
Send scoped implementation work to Claude Code when the user explicitly wants Claude to do the work.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} exec "$ARGUMENTS"
```
Additional guidance:
- Treat `$ARGUMENTS` as the task to execute.
- Use this only for explicit implementation or execution requests, not for planning or review.
- Return the execution result directly. Do not silently reinterpret the task as planning.

Relay the helper output directly to the user.
</process>
