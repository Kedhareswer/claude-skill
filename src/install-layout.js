import os from "node:os";
import path from "node:path";

export function getInstallLayout({
  homeDir = os.homedir(),
  projectRoot = process.cwd()
} = {}) {
  const codexDir = path.join(homeDir, ".codex");
  const bridgeDir = path.join(codexDir, "claude-bridge");
  const binDir = path.join(codexDir, "bin");
  const windowsUserBinDir = path.join(homeDir, "AppData", "Roaming", "npm");

  return {
    codexDir,
    promptsDir: path.join(codexDir, "prompts"),
    bridgeDir,
    binDir,
    entryFile: path.join(bridgeDir, "cli.js"),
    windowsLauncher: path.join(binDir, "claude-bridge.cmd"),
    unixLauncher: path.join(binDir, "claude-bridge"),
    windowsUserBinDir,
    windowsPathLauncher: path.join(windowsUserBinDir, "claude-bridge.cmd"),
    windowsPathLauncherPs1: path.join(windowsUserBinDir, "claude-bridge.ps1"),
    sourcePromptsDir: path.join(projectRoot, "prompts")
  };
}
