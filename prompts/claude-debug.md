---
name: claude-debug
description: Run systematic debugging with Claude Code.
argument-hint: [issue description]
allowed-tools:
  - Bash
---
<objective>
Send debugging work to Claude Code when the user wants root-cause analysis, failure triage, or a structured investigation.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} debug "$ARGUMENTS"
```
Additional guidance:
- Treat `$ARGUMENTS` as the issue description, symptom, or failing behavior.
- Use this command for systematic debugging rather than immediate patching.
- Return Claude's debugging output directly so the next investigation step stays explicit.

Relay the helper output directly to the user.
</process>
