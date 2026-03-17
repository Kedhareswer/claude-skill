#!/usr/bin/env node
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { access } from "node:fs/promises";
import { constants } from "node:fs";

import { loadBridgeConfig } from "./config.js";
import {
  buildClaudeInvocation,
  formatDryRun,
  getPlatformLauncherPath,
  resolveExecutable,
  runClaudeInvocation
} from "./claude.js";
import { getInstallLayout } from "./install-layout.js";
import { listPromptDefinitions } from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const BRIDGE_COMMANDS = new Set([
  "help",
  "plan",
  "spec",
  "review",
  "debug",
  "exec",
  "resume",
  "config"
]);

function printHelp() {
  const lines = [
    "Claude bridge commands:",
    "  claude-bridge help",
    "  claude-bridge plan <prompt>",
    "  claude-bridge spec <prompt>",
    "  claude-bridge review <target-or-prompt>",
    "  claude-bridge debug <issue>",
    "  claude-bridge exec <task>",
    "  claude-bridge resume [session] [prompt]",
    "  claude-bridge config",
    "",
    "Options:",
    "  --model <name>",
    "  --effort <low|medium|high|max>",
    "  --permission-mode <mode>",
    "  --allowed-tools <csv>",
    "  --output-format <text|json>",
    "  --json",
    "  --session <id>",
    "  --continue",
    "  --dry-run"
  ];

  console.log(lines.join("\n"));
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift() ?? "help";
  const options = {
    remaining: []
  };

  while (args.length > 0) {
    const token = args.shift();
    if (!token) {
      continue;
    }

    if (!token.startsWith("--")) {
      options.remaining.push(token, ...args);
      break;
    }

    switch (token) {
      case "--model":
        options.model = args.shift() ?? null;
        break;
      case "--effort":
        options.effort = args.shift() ?? null;
        break;
      case "--permission-mode":
        options.permissionMode = args.shift() ?? null;
        break;
      case "--allowed-tools":
        options.allowedTools = (args.shift() ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        break;
      case "--output-format":
        options.outputFormat = args.shift() ?? "text";
        break;
      case "--json":
        options.outputFormat = "json";
        break;
      case "--session":
        options.session = args.shift() ?? null;
        break;
      case "--continue":
        options.forceContinue = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      default:
        throw new Error(`Unknown option: ${token}`);
    }
  }

  return { command, options };
}

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function buildConfigReport(config) {
  const claudePath = resolveExecutable("claude");
  const codexPath = resolveExecutable("codex");
  const layout = getInstallLayout({ homeDir: os.homedir(), projectRoot: PROJECT_ROOT });

  return {
    defaults: config.defaults,
    commands: config.commands,
    install: {
      launcher: getPlatformLauncherPath(),
      promptsDir: layout.promptsDir,
      bridgeEntry: layout.entryFile,
      installed: await exists(layout.entryFile)
    },
    binaries: {
      claude: claudePath,
      codex: codexPath
    }
  };
}

function printConfigReport(report) {
  console.log(JSON.stringify(report, null, 2));
}

function resolvePrompt(command, remaining, options) {
  if (command !== "resume") {
    return remaining.join(" ").trim();
  }

  if (options.session) {
    return remaining.join(" ").trim();
  }

  if (options.forceContinue) {
    return remaining.join(" ").trim();
  }

  if (remaining.length > 1) {
    options.session = remaining.shift();
  }

  return remaining.join(" ").trim();
}

async function run() {
  const { command, options } = parseArgs(process.argv.slice(2));

  if (!BRIDGE_COMMANDS.has(command)) {
    throw new Error(`Unknown bridge command: ${command}`);
  }

  if (command === "help") {
    printHelp();
    return;
  }

  const config = await loadBridgeConfig({ cwd: process.cwd() });

  if (command === "config") {
    const report = await buildConfigReport(config);
    printConfigReport(report);
    return;
  }

  const claudePath = resolveExecutable("claude");
  if (!claudePath) {
    throw new Error("Claude CLI was not found on PATH. Install Claude Code before using the bridge.");
  }

  const prompt = resolvePrompt(command, options.remaining, options);
  const invocation = buildClaudeInvocation({
    command,
    prompt,
    claudePath,
    options,
    config
  });

  if (options.dryRun) {
    console.log(formatDryRun(invocation));
    return;
  }

  const result = runClaudeInvocation(invocation);
  process.stdout.write(result.stdout);
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
