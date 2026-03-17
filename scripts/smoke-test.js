#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: "pipe"
  });

  if (result.status !== 0) {
    throw new Error([result.stdout, result.stderr].filter(Boolean).join("\n"));
  }

  return result.stdout.trim();
}

const configOutput = run("node", ["./src/cli.js", "config"]);
const dryRunOutput = run("node", [
  "./src/cli.js",
  "plan",
  "--dry-run",
  "Create a rollout plan for the billing migration"
]);

console.log("config");
console.log(configOutput);
console.log("");
console.log("dry-run");
console.log(dryRunOutput);
