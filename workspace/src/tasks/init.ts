import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import {
  SAMPLE_PROJECT_FOLDER,
  SAMPLE_TEST_FILE,
  TESTS_FOLDER,
  TSCONFIG_TESTING_JSON,
} from "../internal/utils/consts";
import { getWorkspacePackageRoot } from "../internal/utils/packageInfo";

export const init = async () => {
  const userProjectPath = process.cwd();
  const packageRoot = getWorkspacePackageRoot();

  const sampleProjectPath = path.join(packageRoot, SAMPLE_PROJECT_FOLDER);

  const workspaceTsconfigFile = path.join(
    userProjectPath,
    TSCONFIG_TESTING_JSON
  );

  if (!existsSync(workspaceTsconfigFile)) {
    const internalTsconfigFile = path.join(
      sampleProjectPath,
      TSCONFIG_TESTING_JSON
    );
    const file = await fs.readFile(internalTsconfigFile);
    await fs.writeFile(path.join(userProjectPath, TSCONFIG_TESTING_JSON), file);
  }

  const projectTestsFolder = path.join(userProjectPath, TESTS_FOLDER);

  if (!existsSync(projectTestsFolder)) {
    // create "tests" folder in user project
    await fs.mkdir(projectTestsFolder, { recursive: true });
    // read workspace "my-first-test" file
    const internalTsconfigFile = path.join(sampleProjectPath, SAMPLE_TEST_FILE);
    const file = await fs.readFile(internalTsconfigFile);
    // copy my-first-test workspace file to user project
    await fs.writeFile(path.join(projectTestsFolder, SAMPLE_TEST_FILE), file);
  }

  console.log(
    "Workspace has initialized. Run `npx workspace test` to run tests"
  );
};
