---
name: claude-plan
description: Create architecture and phased implementation plans with Claude Code.
argument-hint: [goal or scope]
allowed-tools:
  - Bash
---
<objective>
Send planning work to Claude Code when the user wants architecture, sequencing, scope control, or a phased implementation plan.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} plan "$ARGUMENTS"
```
Additional guidance:
- Treat `$ARGUMENTS` as the planning brief.
- Use this command for roadmaps, architecture direction, decomposition, and implementation sequencing.
- Return Claude's plan output directly so the user can act on it without reinterpretation.

Relay the helper output directly to the user.
</process>
