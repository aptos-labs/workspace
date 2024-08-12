import { existsSync } from "fs";
import path from "path";
import { TESTS_FOLDER, TSCONFIG_TESTING_JSON } from "./consts";
import {
  TEST_FOLDER_NOT_FOUND,
  TSCONFIG_TESTING_JSON_FILE_NOT_FOUND,
} from "./errors";

/**
 * Check user's project has tsconfig.testing.json file
 */
export const isUserProjectTsConfigFileExists = (projectPath: string) => {
  const workspaceTsconfigFile = path.join(projectPath, TSCONFIG_TESTING_JSON);

  if (!existsSync(workspaceTsconfigFile)) {
    throw new Error(TSCONFIG_TESTING_JSON_FILE_NOT_FOUND);
  }
};

/**
 * Check user's project has tests folder
 */
export const isUserProjectTestsFolderExists = (projectPath: string) => {
  const projectTestsFolder = getUserProjectTestsFolder(projectPath);

  if (!existsSync(projectTestsFolder)) {
    throw new Error(TEST_FOLDER_NOT_FOUND);
  }
};

/**
 * Return the user's project tests folder path
 */
export const getUserProjectTestsFolder = (projectPath: string): string => {
  return path.join(projectPath, TESTS_FOLDER);
};
