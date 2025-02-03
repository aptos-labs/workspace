import fsExtra from "fs-extra";
import { generateSampleProject } from "../internal/utils/generateSampleProject";

export type PromptResult = {
  language: "ts" | "js";
};

export const init = async (result: PromptResult) => {
  await generateSampleProject(result.language);

  const installCmd = await getDevDependenciesToInstallCommand(result);

  if (installCmd.length > 0) {
    await installDependencies(installCmd[0], installCmd.slice(1));
  }

  console.log(
    "Workspace has initialized. Run `npx aptos-workspace test` to run tests"
  );
};

const REQUIRED_PEER_DEPENDENCIES = { "@aptos-labs/ts-sdk": "^1.33.0" };
const REQUIRED_DEV_DEPENDENCIES = { chai: "^4.5.0" };

const getDevDependenciesToInstallCommand = async (
  result: PromptResult
): Promise<string[]> => {
  if (result.language === "ts") {
    REQUIRED_DEV_DEPENDENCIES["@types/chai"] = "4";
    REQUIRED_DEV_DEPENDENCIES["@types/mocha"] = "^10.0.7";
    REQUIRED_DEV_DEPENDENCIES["typescript"] = "^5.7.3";
    REQUIRED_DEV_DEPENDENCIES["ts-node"] = "^10.9.2";
  }

  // Filter out already installed peer dependencies
  const peerDependenciesToInstall = Object.entries(
    REQUIRED_PEER_DEPENDENCIES
  ).filter(([dep]) => !isInstalled(dep));

  // Filter out already installed dev dependencies
  const devDependenciesToInstall = Object.entries(
    REQUIRED_DEV_DEPENDENCIES
  ).filter(([dep]) => !isInstalled(dep));

  // If no dependencies to install, return empty array
  if (
    devDependenciesToInstall.length === 0 &&
    peerDependenciesToInstall.length === 0
  ) {
    return [];
  }

  // yarn does not auto install peer dependencies
  if (await isYarnProject()) {
    return [
      "yarn",
      "add",
      "--dev",
      ...devDependenciesToInstall.map(([dep, version]) => `${dep}@${version}`),
      ...peerDependenciesToInstall.map(([dep, version]) => `${dep}@${version}`),
    ];
  }

  // pnpm does not auto install peer dependencies
  if (await isPnpmProject()) {
    return [
      "pnpm",
      "add",
      "-D",
      ...devDependenciesToInstall.map(([dep, version]) => `${dep}@${version}`),
      ...peerDependenciesToInstall.map(([dep, version]) => `${dep}@${version}`),
    ];
  }

  // npm auto installs peer dependencies starting from version 7
  const npmDependenciesToInstall = [
    ...devDependenciesToInstall.map(([dep, version]) => `${dep}@${version}`),
  ];

  if (!(await doesNpmAutoInstallPeerDependencies())) {
    npmDependenciesToInstall.push(
      ...peerDependenciesToInstall.map(([dep, version]) => `${dep}@${version}`)
    );
  }
  // If no dependencies to install, return empty array
  if (npmDependenciesToInstall.length === 0) {
    return [];
  }
  return ["npm", "install", "--save-dev", ...npmDependenciesToInstall];
};

function isInstalled(dep: string): boolean {
  const packageJson = fsExtra.readJSONSync("package.json");

  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.optionalDependencies,
  };

  return dep in allDependencies;
}

async function isYarnProject(): Promise<boolean> {
  return fsExtra.pathExists("yarn.lock");
}

async function isPnpmProject(): Promise<boolean> {
  return fsExtra.pathExists("pnpm-lock.yaml");
}

// npm auto installs peer dependencies starting from version 7
async function doesNpmAutoInstallPeerDependencies() {
  const { execSync } = require("child_process");
  try {
    const version: string = execSync("npm --version").toString();
    return parseInt(version.split(".")[0], 10) >= 7;
  } catch (_) {
    return false;
  }
}

const installDependencies = async (
  packageManager: string,
  args: string[]
): Promise<boolean> => {
  const { spawn } = await import("child_process");

  console.log(`Installing required dependencies ${args.join(" ")}`);
  const childProcess = spawn(packageManager, args, {
    stdio: "inherit",
    shell: true,
  });

  return new Promise((resolve, reject) => {
    childProcess.once("close", (status) => {
      childProcess.removeAllListeners("error");

      if (status === 0) {
        resolve(true);
        return;
      }

      reject(false);
    });

    childProcess.once("error", (_status) => {
      childProcess.removeAllListeners("close");
      reject(false);
    });
  });
};
