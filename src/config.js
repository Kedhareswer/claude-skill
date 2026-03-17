import path from "node:path";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const COMMAND_NAMES = ["plan", "spec", "review", "debug", "exec", "resume"];

const DEFAULT_CONFIG = {
  defaults: {
    model: null,
    effort: "medium",
    outputFormat: "text"
  },
  commands: {
    plan: {
      permissionMode: "plan",
      allowedTools: ["Read", "Grep", "Glob", "Bash"],
      effort: null
    },
    spec: {
      permissionMode: "plan",
      allowedTools: ["Read", "Grep", "Glob", "Bash"],
      effort: "high"
    },
    review: {
      permissionMode: "plan",
      allowedTools: ["Read", "Grep", "Glob", "Bash"],
      effort: "high"
    },
    debug: {
      permissionMode: "plan",
      allowedTools: ["Read", "Grep", "Glob", "Bash"],
      effort: "high"
    },
    exec: {
      permissionMode: "auto",
      allowedTools: ["default"],
      effort: null
    },
    resume: {
      permissionMode: "plan",
      allowedTools: ["Read", "Grep", "Glob", "Bash"],
      effort: null
    }
  }
};

function cloneConfig(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override;
  }

  const merged = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      merged[key] = [...value];
      continue;
    }

    if (isPlainObject(value) && isPlainObject(base[key])) {
      merged[key] = mergeDeep(base[key], value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function findConfigFiles(startDir) {
  const files = [];
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, "claude-bridge.config.json");
    if (await fileExists(candidate)) {
      files.unshift(candidate);
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return files;
    }
    current = parent;
  }
}

function normalizeConfig(config) {
  const merged = mergeDeep(cloneConfig(DEFAULT_CONFIG), config);

  for (const commandName of COMMAND_NAMES) {
    merged.commands[commandName] ??= {};
    merged.commands[commandName].allowedTools ??=
      cloneConfig(DEFAULT_CONFIG.commands[commandName].allowedTools);
    merged.commands[commandName].permissionMode ??=
      DEFAULT_CONFIG.commands[commandName].permissionMode;
    merged.commands[commandName].effort ??=
      DEFAULT_CONFIG.commands[commandName].effort;
  }

  return merged;
}

export async function loadBridgeConfig({ cwd = process.cwd() } = {}) {
  const configFiles = await findConfigFiles(cwd);
  let merged = cloneConfig(DEFAULT_CONFIG);

  for (const configFile of configFiles) {
    const parsed = await readJson(configFile);
    merged = mergeDeep(merged, parsed);
  }

  return normalizeConfig(merged);
}

export function getDefaultConfig() {
  return cloneConfig(DEFAULT_CONFIG);
}
