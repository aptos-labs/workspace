import findup from "find-up";
import { WORKSPACE_CONFIG_FILE_NOT_FOUND } from "../../internal/utils/errors";
import { isTSProject, loadTsNode } from "./typescript-support";

const JS_CONFIG_FILENAME = "workspace.config.js";
const CJS_CONFIG_FILENAME = "workspace.config.cjs";
const TS_CONFIG_FILENAME = "workspace.config.ts";

/**
 * Returns the user workspace.config.* file path
 */
export function getUserConfigPath() {
  const tsConfigPath = findup.sync(TS_CONFIG_FILENAME);
  if (tsConfigPath !== null) {
    return tsConfigPath;
  }

  const cjsConfigPath = findup.sync(CJS_CONFIG_FILENAME);
  if (cjsConfigPath !== null) {
    return cjsConfigPath;
  }

  const pathToConfigFile = findup.sync(JS_CONFIG_FILENAME);
  if (pathToConfigFile === null) {
    throw new Error(WORKSPACE_CONFIG_FILE_NOT_FOUND);
  }

  return pathToConfigFile;
}

/**
 * Returns the user `contractDir` property value from the workspace.config.* file
 */
export const getUserConfigContractDir = () => {
  const userWorkspaceConfigPath = getUserConfigPath();
  // check if user's project is a ts project, if so load ts-node
  if (isTSProject()) {
    loadTsNode();
  }
  const imported = require(userWorkspaceConfigPath);
  const configContent =
    imported.default !== undefined ? imported.default : imported;
  return configContent.contractDir;
};
