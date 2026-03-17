---
name: claude-review
description: Run findings-first code reviews with Claude Code.
argument-hint: [target or concern]
allowed-tools:
  - Bash
---
<objective>
Send review work to Claude Code when the user wants a findings-first code review or risk scan.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} review "$ARGUMENTS"
```
Additional guidance:
- Treat `$ARGUMENTS` as the review target, diff, file path, or concern.
- Use this command for bug risk, regression review, architecture review, and code quality review.
- Return the review directly, preserving findings ordering and severity.

Relay the helper output directly to the user.
</process>
