import { spawnSync } from "node:child_process";

const requestedPython = process.env.PYTHON?.trim();
const candidates = requestedPython
  ? [{ command: requestedPython, prefix: [] }]
  : process.platform === "win32"
    ? [
        { command: "py", prefix: ["-3"] },
        { command: "python", prefix: [] },
        { command: "python3", prefix: [] },
      ]
    : [
        { command: "python3", prefix: [] },
        { command: "python", prefix: [] },
      ];

const pytestArguments = process.argv.slice(2);
const python3Probe = [
  "-c",
  "import sys; raise SystemExit(0 if sys.version_info.major == 3 else 1)",
];

const selected = candidates.find(({ command, prefix }) => {
  const probe = spawnSync(command, [...prefix, ...python3Probe], {
    stdio: "ignore",
    shell: false,
  });

  return !probe.error && probe.status === 0;
});

if (!selected) {
  console.error(
    "Unable to find a Python 3 interpreter. Install Python 3 or set the PYTHON environment variable to its executable path.",
  );
  process.exit(1);
}

const result = spawnSync(
  selected.command,
  [...selected.prefix, "-m", "pytest", ...pytestArguments],
  {
    stdio: "inherit",
    env: process.env,
    shell: false,
  },
);

if (result.error) {
  console.error(`Unable to start pytest with ${selected.command}: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
