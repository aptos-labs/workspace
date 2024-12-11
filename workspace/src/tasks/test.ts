import path from "path";
import fsPromises from "fs/promises";
import { getUserProjectPackageJson } from "../internal/utils/packageInfo";
import {
  getUserProjectTestsFolder,
  isUserProjectTsConfigFileExists,
  isUserProjectTestsFolderExists,
} from "../internal/utils/source-files";
import { MochaOptions } from "mocha";
import { isTSProject } from "../internal/utils/typescript-support";

export type TestOptionsArguments = {
  timeout: string;
  grep: string;
  jobs: number;
};

export const test = async (options: TestOptionsArguments) => {
  const userProjectPath = process.cwd();

  isUserProjectTestsFolderExists(userProjectPath);

  const { default: Mocha } = await import("mocha");

  const mochaConfig: MochaOptions = {
    timeout: options.timeout ?? 20000, // to support local testnet run, TODO improve performance
    require: [path.join(__dirname, "internal/rootHook.js")],
    parallel: true,
    grep: "",
  };

  if (isTSProject()) {
    isUserProjectTsConfigFileExists(userProjectPath);
    const mochaRequire = mochaConfig.require ?? [];
    mochaRequire.push(path.join(__dirname, "internal/register.js"));
    mochaConfig.require = mochaRequire;
  }

  if (options.grep !== undefined) {
    mochaConfig.grep = options.grep;
  }

  if (options.jobs !== undefined) {
    mochaConfig.jobs = options.jobs;
  }

  const mocha = new Mocha(mochaConfig);

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

  console.log("Spinning up the server to run tests, hold on...");
  // run mocha
  await new Promise<number>((resolve) => {
    mocha.run(resolve);
  });

  // dispose mocha instance
  mocha.dispose();
};
