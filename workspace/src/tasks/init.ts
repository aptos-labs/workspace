import { generateSampleProject } from "../internal/utils/generateSampleProject";

export type PromptResult = {
  language: "ts" | "js";
};

export const init = async (result: PromptResult) => {
  await installDependencies([
    "--save-dev",
    ...getDevDependenciesToInstall(result),
  ]);

  await generateSampleProject(result.language);

  console.log(
    "Workspace has initialized. Run `npx aptos-workspace test` to run tests"
  );
};

const getDevDependenciesToInstall = (result: PromptResult) => {
  const devDependencies = ["chai@4"];

  if (result.language === "ts") {
    devDependencies.push("@types/chai@4", "@types/mocha");
  }
  console.log("devDependencies", devDependencies);
  return devDependencies;
};

const installDependencies = async (
  dependencies: string[]
): Promise<boolean> => {
  const { spawn } = await import("child_process");

  const childProcess = spawn("npm", ["install", ...dependencies], {
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
