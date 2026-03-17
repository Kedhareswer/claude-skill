---
name: claude-resume
description: Resume the most relevant Claude Code session or continue the latest one.
argument-hint: [session-id] [follow-up prompt]
allowed-tools:
  - Bash
---
<objective>
Resume or continue Claude Code work when the user wants to pick up an earlier thread.
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
```bash
{{launcherCommand}} resume "$ARGUMENTS"
```
Additional guidance:
- Treat `$ARGUMENTS` as either a session id plus follow-up, or just a follow-up prompt.
- Use this command to continue prior Claude context instead of starting from scratch.
- Return the resumed Claude output directly.

Relay the helper output directly to the user.
</process>
