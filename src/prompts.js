const PROMPT_DEFINITIONS = [
  {
    name: "claude-help",
    description: "Show the installed Claude-for-Codex command pack and usage examples.",
    command: "help",
    argumentHint: "[command]",
    objective: "Show the Claude-for-Codex command pack and help the user choose the right Claude workflow.",
    guidance: [
      "If the user supplied an argument, treat it as the command they want help for.",
      "Run the installed helper and return its output directly.",
      "Do not add extra project analysis or unrelated suggestions."
    ]
  },
  {
    name: "claude-plan",
    description: "Create architecture and phased implementation plans with Claude Code.",
    command: "plan",
    argumentHint: "[goal or scope]",
    objective: "Send planning work to Claude Code when the user wants architecture, sequencing, scope control, or a phased implementation plan.",
    guidance: [
      "Treat `$ARGUMENTS` as the planning brief.",
      "Use this command for roadmaps, architecture direction, decomposition, and implementation sequencing.",
      "Return Claude's plan output directly so the user can act on it without reinterpretation."
    ]
  },
  {
    name: "claude-spec",
    description: "Generate decision-complete implementation specs with Claude Code.",
    command: "spec",
    argumentHint: "[feature or change]",
    objective: "Send specification work to Claude Code when the user wants a decision-complete implementation spec.",
    guidance: [
      "Treat `$ARGUMENTS` as the feature, change, or problem that needs a spec.",
      "Use this command when the user needs interfaces, behavior, constraints, tests, and acceptance criteria nailed down.",
      "Return Claude's spec output directly."
    ]
  },
  {
    name: "claude-review",
    description: "Run findings-first code reviews with Claude Code.",
    command: "review",
    argumentHint: "[target or concern]",
    objective: "Send review work to Claude Code when the user wants a findings-first code review or risk scan.",
    guidance: [
      "Treat `$ARGUMENTS` as the review target, diff, file path, or concern.",
      "Use this command for bug risk, regression review, architecture review, and code quality review.",
      "Return the review directly, preserving findings ordering and severity."
    ]
  },
  {
    name: "claude-debug",
    description: "Run systematic debugging with Claude Code.",
    command: "debug",
    argumentHint: "[issue description]",
    objective: "Send debugging work to Claude Code when the user wants root-cause analysis, failure triage, or a structured investigation.",
    guidance: [
      "Treat `$ARGUMENTS` as the issue description, symptom, or failing behavior.",
      "Use this command for systematic debugging rather than immediate patching.",
      "Return Claude's debugging output directly so the next investigation step stays explicit."
    ]
  },
  {
    name: "claude-exec",
    description: "Have Claude Code execute scoped implementation work.",
    command: "exec",
    argumentHint: "[task]",
    objective: "Send scoped implementation work to Claude Code when the user explicitly wants Claude to do the work.",
    guidance: [
      "Treat `$ARGUMENTS` as the task to execute.",
      "Use this only for explicit implementation or execution requests, not for planning or review.",
      "Return the execution result directly. Do not silently reinterpret the task as planning."
    ]
  },
  {
    name: "claude-resume",
    description: "Resume the most relevant Claude Code session or continue the latest one.",
    command: "resume",
    argumentHint: "[session-id] [follow-up prompt]",
    objective: "Resume or continue Claude Code work when the user wants to pick up an earlier thread.",
    guidance: [
      "Treat `$ARGUMENTS` as either a session id plus follow-up, or just a follow-up prompt.",
      "Use this command to continue prior Claude context instead of starting from scratch.",
      "Return the resumed Claude output directly."
    ]
  },
  {
    name: "claude-config",
    description: "Inspect Claude bridge defaults, install paths, and local readiness.",
    command: "config",
    argumentHint: "",
    objective: "Inspect the local Claude bridge state, defaults, binary discovery, and install paths.",
    guidance: [
      "Run the helper and return its configuration output directly.",
      "Use this command to diagnose installation and environment issues.",
      "Do not add extra interpretation unless the helper output clearly indicates a failure."
    ]
  }
];

export function listPromptDefinitions() {
  return PROMPT_DEFINITIONS.map((definition) => ({ ...definition }));
}

export function renderPromptFile(name, { launcherCommand }) {
  const definition = PROMPT_DEFINITIONS.find((item) => item.name === name);
  if (!definition) {
    throw new Error(`Unknown prompt definition: ${name}`);
  }

  const argumentHintLine = definition.argumentHint
    ? `argument-hint: ${definition.argumentHint}\n`
    : "";
  const commandLine = definition.command === "config" || definition.command === "help"
    ? `${launcherCommand} ${definition.command}`
    : `${launcherCommand} ${definition.command} "$ARGUMENTS"`;
  const guidanceBlock = definition.guidance
    .map((line) => `- ${line}`)
    .join("\n");

  return `---
name: ${definition.name}
description: ${definition.description}
${argumentHintLine}allowed-tools:
  - Bash
---
<objective>
${definition.objective}
</objective>

<process>
Run the installed Claude bridge helper using Bash.
Execute exactly this command:
\`\`\`bash
${commandLine}
\`\`\`
Additional guidance:
${guidanceBlock}

Relay the helper output directly to the user.
</process>
`;
}
