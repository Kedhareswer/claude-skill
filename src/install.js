#!/usr/bin/env node
import os from "node:os";
import path from "node:path";
import { mkdir, readdir, writeFile, copyFile } from "node:fs/promises";
import { chmodSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { getInstallLayout } from "./install-layout.js";
import { listPromptDefinitions, renderPromptFile } from "./prompts.js";
import { resolveExecutable } from "./claude.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function verifyPrerequisites() {
  const codexPath = resolveExecutable("codex");
  const claudePath = resolveExecutable("claude");

  if (!codexPath) {
    throw new Error("Codex CLI was not found on PATH. Install Codex before running the installer.");
  }

  if (!claudePath) {
    throw new Error("Claude CLI was not found on PATH. Install Claude Code before running the installer.");
  }

  return { codexPath, claudePath };
}

async function copySourceFiles(targetDir) {
  const sourceDir = path.join(PROJECT_ROOT, "src");
  const entries = await readdir(sourceDir, { withFileTypes: true });
  await ensureDir(targetDir);

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    await copyFile(sourcePath, targetPath);
  }
}

async function writeLaunchers(layout) {
  await ensureDir(layout.binDir);

  const windowsContent = `@echo off\r\nnode "${layout.entryFile}" %*\r\n`;
  const unixContent = `#!/usr/bin/env sh\nnode "${layout.entryFile}" "$@"\n`;

  await writeFile(layout.windowsLauncher, windowsContent, "utf8");
  await writeFile(layout.unixLauncher, unixContent, "utf8");
  chmodSync(layout.unixLauncher, 0o755);

  if (process.platform === "win32") {
    await ensureDir(layout.windowsUserBinDir);
    await writeFile(layout.windowsPathLauncher, windowsContent, "utf8");
    await writeFile(
      layout.windowsPathLauncherPs1,
      `node "${layout.entryFile}" $args\n`,
      "utf8"
    );
  }
}

async function writeInstalledPrompts(layout) {
  await ensureDir(layout.promptsDir);

  const launcherCommand = process.platform === "win32"
    ? layout.windowsLauncher.replace(/\\/g, "/")
    : layout.unixLauncher;

  for (const definition of listPromptDefinitions()) {
    const rendered = renderPromptFile(definition.name, { launcherCommand });
    const filePath = path.join(layout.promptsDir, `${definition.name}.md`);
    await writeFile(filePath, rendered, "utf8");
  }
}

async function writeRepoTemplates(layout) {
  await ensureDir(layout.sourcePromptsDir);

  for (const definition of listPromptDefinitions()) {
    const rendered = renderPromptFile(definition.name, {
      launcherCommand: "{{launcherCommand}}"
    });
    const filePath = path.join(layout.sourcePromptsDir, `${definition.name}.md`);
    await writeFile(filePath, rendered, "utf8");
  }
}

async function writeInstallManifest(layout) {
  const manifest = {
    installedAt: new Date().toISOString(),
    projectRoot: PROJECT_ROOT,
    entryFile: layout.entryFile,
    promptsDir: layout.promptsDir
  };

  await writeFile(
    path.join(layout.bridgeDir, "install-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
}

export async function installBridge({ homeDir = os.homedir() } = {}) {
  const prerequisites = await verifyPrerequisites();
  const layout = getInstallLayout({ homeDir, projectRoot: PROJECT_ROOT });

  await ensureDir(layout.codexDir);
  await copySourceFiles(layout.bridgeDir);
  await writeLaunchers(layout);
  await writeInstalledPrompts(layout);
  await writeRepoTemplates(layout);
  await writeInstallManifest(layout);

  return {
    layout,
    prerequisites
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
const currentFilePath = fileURLToPath(import.meta.url);

if (invokedPath && invokedPath === currentFilePath) {
  installBridge()
    .then(({ layout, prerequisites }) => {
      const message = [
        "Claude bridge installed.",
        `Codex: ${prerequisites.codexPath}`,
        `Claude: ${prerequisites.claudePath}`,
        `Prompts: ${layout.promptsDir}`,
        `Bridge entry: ${layout.entryFile}`,
        "",
        "Verification:",
        "  claude-bridge config",
        "  /claude-help",
        "  /claude-plan add a phased rollout for auth"
      ];

      console.log(message.join("\n"));
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
