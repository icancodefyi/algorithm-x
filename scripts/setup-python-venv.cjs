/**
 * Creates services/.venv and installs all service requirements.
 * Usage from repo root: pnpm install:py
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const servicesDir = path.join(root, "services");
const venvDir = path.join(servicesDir, ".venv");

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function tryCreateVenv() {
  const attempts =
    process.platform === "win32"
      ? [
          ["py", ["-3", "-m", "venv", venvDir]],
          ["python", ["-m", "venv", venvDir]],
        ]
      : [
          ["python3", ["-m", "venv", venvDir]],
          ["python", ["-m", "venv", venvDir]],
        ];
  for (const [cmd, args] of attempts) {
    const r = spawnSync(cmd, args, { stdio: "inherit", cwd: root });
    if (r.status === 0) return;
  }
  console.error("Could not create venv. Install Python 3.11+ (on Windows, `py` launcher helps).");
  process.exit(1);
}

if (!fs.existsSync(venvDir)) {
  console.log("Creating virtualenv at services/.venv …");
  tryCreateVenv();
}

const pip =
  process.platform === "win32"
    ? path.join(venvDir, "Scripts", "pip.exe")
    : path.join(venvDir, "bin", "pip");

if (!fs.existsSync(pip)) {
  console.error("pip not found in venv.");
  process.exit(1);
}

const reqs = ["analysis", "intelligence", "takedown"].map((s) =>
  path.join(servicesDir, s, "requirements.txt"),
);

console.log("Installing Python dependencies …");
for (const req of reqs) {
  run(pip, ["install", "-r", req]);
}

console.log("\nDone. Activate the venv, then from repo root run: pnpm dev");
console.log(
  process.platform === "win32"
    ? "  services\\.venv\\Scripts\\activate"
    : "  source services/.venv/bin/activate",
);
