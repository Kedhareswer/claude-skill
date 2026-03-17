# claude-skill

**Stay in Codex. Summon Claude when you need it.**

You're deep in a Codex session. The code is moving fast. Then you hit something that needs real thinking — architecture, spec, root-cause analysis. The old move? Switch terminals, re-explain everything, lose your flow.

This project does the reverse of [codex-skill](https://github.com/Kedhareswer/codex-skill). That one lets Claude call Codex. This one lets Codex call Claude — with a single slash command, right where you already are.

```text
Codex → /claude-plan → Claude Code → plan back in Codex
```

Codex stays in charge. Claude does the deep thinking. You never leave the terminal.

---

## Before / After

![before-after](./before-after.gif)

---

## What it does

Installs native Codex slash commands:

| Command | What it does |
|---|---|
| `/claude-plan` | Architecture, decomposition, phased implementation plan |
| `/claude-spec` | Decision-complete spec with interfaces, constraints, acceptance criteria |
| `/claude-review` | Findings-first review — severity and risk called out clearly |
| `/claude-debug` | Structured root-cause analysis instead of random patching |
| `/claude-exec` | Hands off to Claude to actually do the work |
| `/claude-resume` | Continues an existing Claude thread instead of starting over |
| `/claude-config` | Shows install state, defaults, and binary discovery |
| `/claude-help` | Full command pack and usage summary |

---

## Demo

![demo](./demo.gif)

---

## Why this exists

Codex is excellent at: direct repo work, fast execution, staying close to the shell, local iteration without ceremony.

Claude Code is excellent at: architecture and phased planning, decision-complete specs, findings-first code review, structured debugging, higher-level orchestration.

Neither tool alone covers everything. This bridge routes the right work to the right tool — without you manually copying prompts between windows.

Want the other direction? **[codex-skill](https://github.com/Kedhareswer/codex-skill)** lets Claude invoke Codex.

---

## Install

Prerequisites: `codex --version` and `claude --version` both work.

```bash
git clone https://github.com/Kedhareswer/claude-skill.git
cd claude-skill
npm run install:local
```

Verify:

```bash
claude-bridge config
```

Then inside a Codex session:

```
/claude-help
/claude-plan design a phased migration for the auth module
```

---

## Usage

Inside Codex:

```
/claude-plan design a phased migration for the auth module
/claude-spec define the implementation spec for role-based access control
/claude-review review src/api/auth.ts for regressions
/claude-debug login fails after refresh token rotation
/claude-exec implement the pagination fix in src/server/users.ts
/claude-resume continue the last debugging session for token expiry
/claude-config
```

Direct helper usage:

```bash
claude-bridge plan "Create a rollout plan for billing refactor"
claude-bridge exec --model claude-sonnet-4-6 --effort high "Implement the retry logic"
claude-bridge resume session-123 "Continue from the failing tests"
```

---

## How it works

Three layers:

1. **Codex prompt files** — native command definitions Codex reads from `~/.codex/prompts`
2. **Helper CLI** (`claude-bridge`) — resolves the `claude` binary, loads config, builds the right command, runs it
3. **Installer** — copies prompt pack and helper to the right Codex locations, safely re-runnable

---

## Local configuration

Optional `claude-bridge.config.json` at project root:

```json
{
  "defaults": {
    "model": "claude-sonnet-4-6",
    "effort": "medium"
  },
  "commands": {
    "spec": { "effort": "high" },
    "exec": {
      "permissionMode": "acceptEdits",
      "allowedTools": ["Read", "Edit", "Bash"]
    }
  }
}
```

Config walks up from your cwd and merges over defaults.

---

## Safety defaults

- `plan`, `spec`, `review`, `debug` — safe read/plan modes, no writes
- `exec` — explicit work-performing path, you opt in
- `resume` — continues Claude context rather than restarting cold

---

## Development

```bash
npm test
npm run smoke
npm run install:local
```

---

If this saves you the terminal-switching pain — [give it a star](https://github.com/Kedhareswer/claude-skill) and share it with whoever else runs Codex. PRs and issues welcome.
