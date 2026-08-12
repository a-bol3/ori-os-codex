import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const shouldRemoveNodeModules = args.has("--node-modules");

const cleanupTargets = [
  path.join(root, "apps", "web", ".next"),
  path.join(root, "apps", "api", "dist"),
  path.join(root, ".turbo"),
];

if (shouldRemoveNodeModules) {
  cleanupTargets.push(path.join(root, "node_modules"));
}

function removeIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) {
    console.log(`skip ${path.relative(root, targetPath)}`);
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  console.log(`removed ${path.relative(root, targetPath)}`);
}

function killPorts(ports) {
  if (process.platform === "win32") {
    for (const port of ports) {
      try {
        const output = execSync(`netstat -ano | findstr :${port}`, {
          stdio: ["ignore", "pipe", "ignore"],
        }).toString();
        const processIds = [...output.matchAll(/\s+(\d+)\s*$/gm)].map((match) => match[1]);

        for (const processId of new Set(processIds)) {
          execSync(`taskkill /PID ${processId} /F`, { stdio: "ignore" });
          console.log(`killed pid ${processId} on port ${port}`);
        }
      } catch {
        console.log(`no listener on port ${port}`);
      }
    }

    return;
  }

  for (const port of ports) {
    try {
      execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: "ignore" });
      console.log(`cleared port ${port}`);
    } catch {
      console.log(`no listener on port ${port}`);
    }
  }
}

killPorts([3000, 4000]);
cleanupTargets.forEach(removeIfExists);
