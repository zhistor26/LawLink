import { spawn } from "node:child_process";

const [distDir, command, ...args] = process.argv.slice(2);

if (!distDir || !command) {
  console.error("Usage: node scripts/with-next-dist.mjs <distDir> <command> [...args]");
  process.exit(1);
}

const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !/[()=]/.test(key))
);

const childCommand = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : command;
const childArgs =
  process.platform === "win32"
    ? ["/d", "/s", "/c", [command, ...args].join(" ")]
    : args;

const child = spawn(childCommand, childArgs, {
  env: { ...env, NEXT_DIST_DIR: distDir },
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Command terminated by signal ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 1);
});
