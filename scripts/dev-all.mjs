import { spawn } from "node:child_process";
import process from "node:process";

const commands = [
  {
    name: "backend",
    command: "npm",
    args: ["run", "dev", "--workspace", "backend"]
  },
  {
    name: "frontend",
    command: "npm",
    args: ["run", "dev", "--workspace", "frontend"]
  },
  {
    name: "voice",
    command: "make",
    args: ["voice-run"]
  }
];

const children = [];
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(exitCode);
  }, 1500).unref();
}

for (const entry of commands) {
  const child = spawn(entry.command, entry.args, {
    stdio: "inherit",
    shell: false
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (code !== 0) {
      console.error(`[${entry.name}] exited with code ${code ?? "unknown"}${signal ? ` (${signal})` : ""}`);
      shutdown(code ?? 1);
      return;
    }

    console.log(`[${entry.name}] finished`);
    shutdown(0);
  });
}

process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));
