import test from "node:test";
import assert from "node:assert/strict";

import { buildClaudeInvocation, formatDryRun } from "../src/claude.js";

test("buildClaudeInvocation maps plan to safe planning defaults", () => {
  const invocation = buildClaudeInvocation({
    command: "plan",
    prompt: "Plan a migration for the auth service",
    claudePath: "claude",
    config: {
      defaults: {
        model: null,
        effort: "medium",
        outputFormat: "text"
      },
      commands: {
        plan: {
          permissionMode: "plan",
          allowedTools: ["Read", "Grep", "Glob", "Bash"]
        }
      }
    }
  });

  assert.equal(invocation.executable, "claude");
  assert.deepEqual(invocation.args, [
    "--print",
    "--permission-mode",
    "plan",
    "--allowedTools",
    "Read,Grep,Glob,Bash",
    "--effort",
    "medium",
    "Plan a migration for the auth service"
  ]);
});

test("buildClaudeInvocation applies overrides for exec commands", () => {
  const invocation = buildClaudeInvocation({
    command: "exec",
    prompt: "Implement the pagination fix",
    claudePath: "claude",
    options: {
      model: "claude-sonnet-4-6",
      effort: "high",
      permissionMode: "acceptEdits",
      allowedTools: ["Read", "Edit", "Bash"],
      outputFormat: "json"
    },
    config: {
      defaults: {
        model: null,
        effort: "medium",
        outputFormat: "text"
      },
      commands: {
        exec: {
          permissionMode: "auto",
          allowedTools: ["default"]
        }
      }
    }
  });

  assert.deepEqual(invocation.args, [
    "--print",
    "--output-format",
    "json",
    "--permission-mode",
    "acceptEdits",
    "--allowedTools",
    "Read,Edit,Bash",
    "--model",
    "claude-sonnet-4-6",
    "--effort",
    "high",
    "Implement the pagination fix"
  ]);
});

test("buildClaudeInvocation maps resume without a session id to continue mode", () => {
  const invocation = buildClaudeInvocation({
    command: "resume",
    prompt: "Continue with the API refactor",
    claudePath: "claude",
    config: {
      defaults: {
        model: null,
        effort: "medium",
        outputFormat: "text"
      },
      commands: {
        resume: {
          permissionMode: "plan",
          allowedTools: ["Read", "Grep", "Glob", "Bash"]
        }
      }
    }
  });

  assert.deepEqual(invocation.args, [
    "--print",
    "--permission-mode",
    "plan",
    "--allowedTools",
    "Read,Grep,Glob,Bash",
    "--effort",
    "medium",
    "--continue",
    "Continue with the API refactor"
  ]);
});

test("buildClaudeInvocation maps resume with a session id to explicit resume mode", () => {
  const invocation = buildClaudeInvocation({
    command: "resume",
    prompt: "Pick up from the failing tests",
    claudePath: "claude",
    options: {
      session: "session-123"
    },
    config: {
      defaults: {
        model: null,
        effort: "medium",
        outputFormat: "text"
      },
      commands: {
        resume: {
          permissionMode: "plan",
          allowedTools: ["Read", "Grep", "Glob", "Bash"]
        }
      }
    }
  });

  assert.deepEqual(invocation.args, [
    "--print",
    "--permission-mode",
    "plan",
    "--allowedTools",
    "Read,Grep,Glob,Bash",
    "--effort",
    "medium",
    "--resume",
    "session-123",
    "Pick up from the failing tests"
  ]);
});

test("formatDryRun renders a command preview with correct quoting", () => {
  const preview = formatDryRun({
    executable: "claude",
    args: ["--print", "--model", "claude-sonnet-4-6", "Plan the \"next\" task"]
  });

  assert.equal(
    preview,
    'claude --print --model claude-sonnet-4-6 "Plan the \\"next\\" task"'
  );
});
