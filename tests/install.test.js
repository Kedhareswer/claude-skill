import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { getInstallLayout } from "../src/install-layout.js";

test("getInstallLayout resolves deterministic install locations", () => {
  const layout = getInstallLayout({
    homeDir: "C:/Users/tester",
    projectRoot: "C:/work/claude-skill"
  });

  assert.equal(layout.codexDir, path.normalize("C:/Users/tester/.codex"));
  assert.equal(layout.promptsDir, path.normalize("C:/Users/tester/.codex/prompts"));
  assert.equal(layout.bridgeDir, path.normalize("C:/Users/tester/.codex/claude-bridge"));
  assert.equal(layout.entryFile, path.normalize("C:/Users/tester/.codex/claude-bridge/cli.js"));
  assert.equal(layout.windowsLauncher, path.normalize("C:/Users/tester/.codex/bin/claude-bridge.cmd"));
  assert.equal(layout.unixLauncher, path.normalize("C:/Users/tester/.codex/bin/claude-bridge"));
  assert.equal(layout.windowsPathLauncher, path.normalize("C:/Users/tester/AppData/Roaming/npm/claude-bridge.cmd"));
  assert.equal(layout.windowsPathLauncherPs1, path.normalize("C:/Users/tester/AppData/Roaming/npm/claude-bridge.ps1"));
  assert.equal(layout.sourcePromptsDir, path.normalize("C:/work/claude-skill/prompts"));
});
