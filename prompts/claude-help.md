---
name: claude-help
description: Show the installed Claude-for-Codex command pack and usage examples.
argument-hint: [command]
allowed-tools:
  - Bash
---
<objective>
Show the Claude-for-Codex command pack and help the user choose the right Claude workflow.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} help
```
Additional guidance:
- If the user supplied an argument, treat it as the command they want help for.
- Run the installed helper and return its output directly.
- Do not add extra project analysis or unrelated suggestions.

Relay the helper output directly to the user.
</process>
