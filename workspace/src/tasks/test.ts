import path from "path";
import fsPromises from "fs/promises";
import { MochaOptions } from "mocha";
import { TSCONFIG_TESTING_JSON } from "../internal/utils/consts";
import { loadTsNode } from "../internal/utils/typescript-support";
import { getUserProjectPackageJson } from "../internal/utils/packageInfo";
import {
  getUserProjectTestsFolder,
  isUserProjectTsConfigFileExists,
  isUserProjectTestsFolderExists,
} from "../internal/utils/source-files";

export const test = async () => {
  const userProjectPath = process.cwd();

  isUserProjectTsConfigFileExists(userProjectPath);

  isUserProjectTestsFolderExists(userProjectPath);

  // set env variable so workspace use the correct tsconfig file
  process.env.TS_NODE_PROJECT = TSCONFIG_TESTING_JSON;

  // Load TS support
  await loadTsNode();

  const { default: Mocha } = await import("mocha");

  const mochaConfig: MochaOptions = {
    timeout: 30000, // to support local testnet run, TODO improve performance
  };
  const mocha = new Mocha(mochaConfig);
  // add the internal workspace setup.js file to mocha to run
  // processes before and after tests.
  const setupPath = path.join(__dirname, "internal/setup.js");
  mocha.addFile(setupPath);

  // add all user's porject test files to mocha
  const dir = await fsPromises.readdir(
    getUserProjectTestsFolder(userProjectPath)
  );
  const allTestFiles = dir.map((file) =>
    path.resolve(getUserProjectTestsFolder(userProjectPath), file)
  );
  allTestFiles.forEach((file) => mocha.addFile(file));

  // if the project is of type "module" or if there's some ESM test file,
  // we call loadFilesAsync to enable Mocha's ESM support
  const projectPackageJson = await getUserProjectPackageJson();
  const isTypeModule = projectPackageJson.type === "module";
  const hasEsmTest = allTestFiles.some((file) => file.endsWith(".mjs"));
  let testsAlreadyRun = false;
  if (isTypeModule || hasEsmTest) {
    // Because of the way the ESM cache works, loadFilesAsync doesn't work
    // correctly if used twice within the same process, so we throw an error
    // in that case
    if (testsAlreadyRun) {
      throw new Error("testsAlreadyRun");
    }
    testsAlreadyRun = true;

    // This instructs Mocha to use the more verbose file loading infrastructure
    // which supports both ESM and CJS
    await mocha.loadFilesAsync();
  }

  // run mocha
  await new Promise<number>((resolve) => {
    mocha.run(resolve);
  });

  // dispose mocha instance
  mocha.dispose();
};
