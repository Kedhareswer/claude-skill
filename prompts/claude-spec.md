---
name: claude-spec
description: Generate decision-complete implementation specs with Claude Code.
argument-hint: [feature or change]
allowed-tools:
  - Bash
---
<objective>
Send specification work to Claude Code when the user wants a decision-complete implementation spec.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} spec "$ARGUMENTS"
```
Additional guidance:
- Treat `$ARGUMENTS` as the feature, change, or problem that needs a spec.
- Use this command when the user needs interfaces, behavior, constraints, tests, and acceptance criteria nailed down.
- Return Claude's spec output directly.

Relay the helper output directly to the user.
</process>
