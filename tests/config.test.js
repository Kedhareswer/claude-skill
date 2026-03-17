import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";

import { loadBridgeConfig } from "../src/config.js";

test("loadBridgeConfig returns safe defaults when no config file exists", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "claude-bridge-config-"));

  const config = await loadBridgeConfig({ cwd: tempDir, homeDir: tempDir });

  assert.equal(config.defaults.model, null);
  assert.equal(config.defaults.effort, "medium");
  assert.equal(config.defaults.outputFormat, "text");
  assert.equal(config.commands.plan.permissionMode, "plan");
  assert.equal(config.commands.exec.permissionMode, "auto");
  assert.deepEqual(config.commands.review.allowedTools, ["Read", "Grep", "Glob", "Bash"]);
});

test("loadBridgeConfig merges project config over defaults", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "claude-bridge-project-"));
  const configPath = path.join(tempDir, "claude-bridge.config.json");
  await writeFile(
    configPath,
    JSON.stringify({
      defaults: {
        model: "claude-sonnet-4-6",
        effort: "high"
      },
      commands: {
        exec: {
          permissionMode: "acceptEdits",
          allowedTools: ["Read", "Edit", "Bash"]
        }
      }
    }),
    "utf8"
  );

  const config = await loadBridgeConfig({ cwd: tempDir, homeDir: tempDir });

  assert.equal(config.defaults.model, "claude-sonnet-4-6");
  assert.equal(config.defaults.effort, "high");
  assert.equal(config.commands.exec.permissionMode, "acceptEdits");
  assert.deepEqual(config.commands.exec.allowedTools, ["Read", "Edit", "Bash"]);
  assert.equal(config.commands.plan.permissionMode, "plan");
});

test("loadBridgeConfig prefers closest project config while preserving parent fallbacks", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "claude-bridge-nested-"));
  const projectRoot = path.join(tempDir, "project");
  const nestedDir = path.join(projectRoot, "apps", "web");
  await mkdir(nestedDir, { recursive: true });

  await writeFile(
    path.join(projectRoot, "claude-bridge.config.json"),
    JSON.stringify({
      defaults: {
        model: "claude-opus-4-1"
      },
      commands: {
        plan: {
          effort: "high"
        }
      }
    }),
    "utf8"
  );

  await writeFile(
    path.join(nestedDir, "claude-bridge.config.json"),
    JSON.stringify({
      commands: {
        debug: {
          effort: "max"
        }
      }
    }),
    "utf8"
  );

  const config = await loadBridgeConfig({ cwd: nestedDir, homeDir: tempDir });

  assert.equal(config.defaults.model, "claude-opus-4-1");
  assert.equal(config.commands.plan.effort, "high");
  assert.equal(config.commands.debug.effort, "max");
});
