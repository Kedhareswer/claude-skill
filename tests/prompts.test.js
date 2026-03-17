import test from "node:test";
import assert from "node:assert/strict";

import { renderPromptFile, listPromptDefinitions } from "../src/prompts.js";

test("listPromptDefinitions exposes the full starter pack", () => {
  const promptNames = listPromptDefinitions().map((item) => item.name);

  assert.deepEqual(promptNames, [
    "claude-help",
    "claude-plan",
    "claude-spec",
    "claude-review",
    "claude-debug",
    "claude-exec",
    "claude-resume",
    "claude-config"
  ]);
});

test("renderPromptFile produces Codex prompt frontmatter and helper instructions", () => {
  const rendered = renderPromptFile("claude-plan", {
    launcherCommand: "C:/Users/tester/.codex/bin/claude-bridge.cmd"
  });

  assert.match(rendered, /^---\s*\nname: claude-plan/m);
  assert.match(rendered, /description: Create architecture and phased implementation plans with Claude Code\./);
  assert.match(rendered, /allowed-tools:\s*\n  - Bash/);
  assert.match(rendered, /Send planning work to Claude Code when the user wants architecture, sequencing, scope control, or a phased implementation plan\./);
  assert.match(rendered, /Run the installed Claude bridge helper using Bash/);
  assert.match(rendered, /Additional guidance:/);
  assert.match(rendered, /Treat `?\$ARGUMENTS`? as the planning brief\./);
  assert.match(rendered, /C:\/Users\/tester\/\.codex\/bin\/claude-bridge\.cmd plan "\$ARGUMENTS"/);
});

test("renderPromptFile gives review prompts findings-first guidance", () => {
  const rendered = renderPromptFile("claude-review", {
    launcherCommand: "C:/Users/tester/.codex/bin/claude-bridge.cmd"
  });

  assert.match(rendered, /Send review work to Claude Code when the user wants a findings-first code review or risk scan\./);
  assert.match(rendered, /Return the review directly, preserving findings ordering and severity\./);
});

test("renderPromptFile keeps exec prompts explicit about execution intent", () => {
  const rendered = renderPromptFile("claude-exec", {
    launcherCommand: "C:/Users/tester/.codex/bin/claude-bridge.cmd"
  });

  assert.match(rendered, /Send scoped implementation work to Claude Code when the user explicitly wants Claude to do the work\./);
  assert.match(rendered, /Do not silently reinterpret the task as planning\./);
});
