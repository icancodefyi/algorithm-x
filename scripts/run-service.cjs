/**
 * Cross-platform launcher for Python uvicorn services.
 * Resolves services/.venv Python executable for the current OS.
 *
 * Usage: node ../../scripts/run-service.cjs --port 8000 [--no-reload]
 * Called from each service's package.json dev/start scripts.
 */
const { spawnSync } = require("child_process");
const path = require("path");
const os = require("os");

// Resolve venv python: script lives in scripts/, services live one level up from scripts/
const root = path.join(__dirname, "..");
const isWin = os.platform() === "win32";
const python = isWin
  ? path.join(root, "services", ".venv", "Scripts", "python.exe")
  : path.join(root, "services", ".venv", "bin", "python");

// Parse CLI args
const args = process.argv.slice(2);
const portIdx = args.indexOf("--port");
const port = portIdx !== -1 ? args[portIdx + 1] : "8000";
const reload = !args.includes("--no-reload");

const uvicornArgs = [
  "-m", "uvicorn", "main:app",
  "--host", "0.0.0.0",
  "--port", port,
];
if (reload) uvicornArgs.push("--reload");

const result = spawnSync(python, uvicornArgs, { stdio: "inherit" });
process.exit(result.status ?? 1);
