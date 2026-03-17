import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

function quoteArgument(value) {
  if (value === "") {
    return '""';
  }

  if (/^[A-Za-z0-9_./:=,-]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function getCommandDefaults(config, command) {
  return config.commands?.[command] ?? {};
}

export function buildClaudeInvocation({
  command,
  prompt,
  claudePath,
  options = {},
  config
}) {
  const defaults = config.defaults ?? {};
  const commandDefaults = getCommandDefaults(config, command);
  const outputFormat = options.outputFormat ?? defaults.outputFormat ?? "text";
  const permissionMode = options.permissionMode ?? commandDefaults.permissionMode;
  const allowedTools = options.allowedTools ?? commandDefaults.allowedTools;
  const model = options.model ?? defaults.model ?? null;
  const effort =
    options.effort ?? commandDefaults.effort ?? defaults.effort ?? "medium";

  const args = ["--print"];

  if (outputFormat !== "text") {
    args.push("--output-format", outputFormat);
  }

  if (permissionMode) {
    args.push("--permission-mode", permissionMode);
  }

  if (allowedTools?.length) {
    args.push("--allowedTools", allowedTools.join(","));
  }

  if (model) {
    args.push("--model", model);
  }

  if (effort) {
    args.push("--effort", effort);
  }

  if (command === "resume") {
    if (options.session) {
      args.push("--resume", options.session);
    } else {
      args.push("--continue");
    }
  }

  const finalPrompt = (prompt ?? "").trim();
  if (finalPrompt) {
    args.push(finalPrompt);
  }

  return {
    executable: claudePath,
    args
  };
}

export function formatDryRun({ executable, args }) {
  return [executable, ...args.map(quoteArgument)].join(" ");
}

export function resolveExecutable(binaryName, env = process.env) {
  if (process.platform === "win32") {
    const whereResult = spawnSync("where.exe", [binaryName], {
      encoding: "utf8",
      stdio: "pipe",
      shell: false
    });

    if (whereResult.status === 0) {
      const candidate = whereResult.stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find(Boolean);
      if (candidate) {
        return candidate;
      }
    }
  }

  const pathKey = process.platform === "win32" ? "Path" : "PATH";
  const pathValue = env[pathKey] ?? env.PATH ?? "";
  const separator = process.platform === "win32" ? ";" : ":";
  const extensions = process.platform === "win32"
    ? ["", ".exe", ".cmd", ".bat"]
    : [""];

  for (const entry of pathValue.split(separator).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(entry, `${binaryName}${extension}`);
      const result = spawnSync(candidate, ["--version"], {
        stdio: "ignore",
        shell: false
      });
      if (!result.error) {
        return candidate;
      }
    }
  }

  return null;
}

function classifyClaudeFailure(stderrText) {
  const normalized = stderrText.toLowerCase();

  if (
    normalized.includes("login") ||
    normalized.includes("auth") ||
    normalized.includes("token") ||
    normalized.includes("subscription")
  ) {
    return "Claude CLI appears to be unauthenticated. Run `claude auth` or `claude setup-token`, then retry.";
  }

  return "Claude CLI exited with an error.";
}

export function runClaudeInvocation(invocation) {
  const result = spawnSync(invocation.executable, invocation.args, {
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.error) {
    const message = result.error.code === "ENOENT"
      ? "Claude CLI was not found on PATH."
      : result.error.message;
    throw new Error(message);
  }

  if (result.status !== 0) {
    const stderrText = [result.stderr, result.stdout].filter(Boolean).join("\n");
    throw new Error(`${classifyClaudeFailure(stderrText)}\n\n${stderrText.trim()}`);
  }

  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? 0
  };
}

export function getPlatformLauncherPath(homeDir = os.homedir()) {
  return process.platform === "win32"
    ? path.join(homeDir, ".codex", "bin", "claude-bridge.cmd")
    : path.join(homeDir, ".codex", "bin", "claude-bridge");
}
