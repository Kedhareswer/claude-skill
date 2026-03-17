# claude-skill

**Let Codex control your Claude.**

A Codex-native prompt pack and helper CLI that turns Claude Code into a tool Codex can drive on demand.

Instead of leaving Codex, rewriting context, or bouncing between terminals, you give Codex a Claude command:

```text
you -> Codex -> Claude Code -> plan, review, debug, execute
```

Codex stays in control. Claude does the deep thinking when you need it.

## The idea

`codex-skill` lets Claude control Codex.

This project does the reverse.

It installs native Codex prompt commands like:

- `/claude-plan`
- `/claude-spec`
- `/claude-review`
- `/claude-debug`
- `/claude-exec`
- `/claude-resume`
- `/claude-config`

Those commands route through a small local bridge that invokes Claude Code with the right mode, defaults, and safety posture.

## Why this exists

Codex is excellent at:

- direct repo work
- fast execution
- local iteration
- staying close to the shell

Claude Code is excellent at:

- planning
- decision-complete specs
- findings-first reviews
- structured debugging
- higher-level orchestration

This bridge combines them without forcing you to manually copy prompts between tools.

## What gets installed

- Codex prompt files into `~/.codex/prompts`
- the helper bridge into `~/.codex/claude-bridge`
- launchers into `~/.codex/bin`
- on Windows, a PATH-visible `claude-bridge` launcher into `%APPDATA%/npm`

## Commands

### `/claude-plan`
Use when you want architecture, decomposition, sequencing, or a phased implementation plan.

### `/claude-spec`
Use when you want a decision-complete implementation spec with behavior, interfaces, constraints, and acceptance criteria.

### `/claude-review`
Use when you want a findings-first review with severity and risk called out clearly.

### `/claude-debug`
Use when you want structured debugging and root-cause analysis instead of random patching.

### `/claude-exec`
Use when you explicitly want Claude to do the work, not just think about it.

### `/claude-resume`
Use when you want to continue an existing Claude thread instead of starting over.

### `/claude-config`
Use when you want to inspect install state, defaults, and binary discovery.

### `/claude-help`
Use when you want the full command pack and usage summary.

## How it works

The project has three layers:

1. Codex prompt files
   These are the native command definitions Codex reads from `~/.codex/prompts`.

2. A helper CLI
   This is a Node-based local bridge that resolves `claude`, loads config, builds the right command, and runs it.

3. An installer
   This copies the prompt pack and helper into the right Codex locations and can be safely re-run.

## Install

Prerequisites:

```bash
codex --version
claude --version
```

Install from this repo:

```bash
npm run install:local
```

After install, verify:

```bash
claude-bridge config
```

Then inside Codex:

```text
/claude-help
/claude-plan design a phased migration for the auth module
```

## Usage

Inside Codex:

```text
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
claude-bridge config
claude-bridge plan --dry-run "Create a rollout plan for billing refactor"
claude-bridge exec --model claude-sonnet-4-6 --effort high "Implement the retry logic"
claude-bridge resume session-123 "Continue from the failing tests"
```

## Local configuration

Optional project config file:

```text
claude-bridge.config.json
```

Example:

```json
{
  "defaults": {
    "model": "claude-sonnet-4-6",
    "effort": "medium",
    "outputFormat": "text"
  },
  "commands": {
    "spec": {
      "effort": "high"
    },
    "exec": {
      "permissionMode": "acceptEdits",
      "allowedTools": ["Read", "Edit", "Bash"]
    }
  }
}
```

Config lookup walks upward from the current working directory and merges nested configs over the defaults.

## Safety defaults

- `plan`, `spec`, `review`, `debug`
  use safe planning-oriented defaults

- `exec`
  is the explicit work-performing path

- `resume`
  continues Claude context instead of starting from zero

The bridge is designed so execution is intentional and planning stays separate from implementation.

## Development

Run tests:

```bash
npm test
```

Run the smoke test:

```bash
npm run smoke
```

Reinstall after changing prompts or helper behavior:

```bash
npm run install:local
```
