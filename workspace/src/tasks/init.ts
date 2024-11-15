import fsExtra from "fs-extra";
import { generateSampleProject } from "../internal/utils/generateSampleProject";

export type PromptResult = {
  language: "ts" | "js";
};

export const init = async (result: PromptResult) => {
  await generateSampleProject(result.language);

  console.log("Installing required dependencies");
  const installCmd = await getDevDependenciesToInstallCommand(result);
  await installDependencies(installCmd[0], installCmd.slice(1));

  console.log(
    "Workspace has initialized. Run `npx aptos-workspace test` to run tests"
  );
};

const getDevDependenciesToInstallCommand = async (
  result: PromptResult
): Promise<string[]> => {
  const devDependencies = ["chai@4"];

  if (result.language === "ts") {
    devDependencies.push("@types/chai@4", "@types/mocha");
  }

  if (await isYarnProject()) {
    return ["yarn", "add", "--dev", ...devDependencies];
  }

  if (await isPnpmProject()) {
    return ["pnpm", "add", "-D", ...devDependencies];
  }

  return ["npm", "install", "--save-dev", ...devDependencies];
};

async function isYarnProject(): Promise<boolean> {
  return fsExtra.pathExists("yarn.lock");
}

async function isPnpmProject(): Promise<boolean> {
  return fsExtra.pathExists("pnpm-lock.yaml");
}

const installDependencies = async (
  packageManager: string,
  args: string[]
): Promise<boolean> => {
  const { spawn } = await import("child_process");

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
