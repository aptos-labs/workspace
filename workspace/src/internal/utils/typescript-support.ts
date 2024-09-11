import { TSCONFIG_TESTING_JSON } from "./consts";
import { TYPESCRIPT_NOT_INSTALLED, TS_NODE_NOT_INSTALLED } from "./errors";
import { getUserConfigPath } from "./userConfig";

export const loadTsNode = () => {
  try {
    require.resolve("typescript");
  } catch {
    throw new Error(TYPESCRIPT_NOT_INSTALLED);
  }

  try {
    require.resolve("ts-node");
  } catch {
    throw new Error(TS_NODE_NOT_INSTALLED);
  }

  const userProjectPath = process.cwd();
  process.env.TS_NODE_PROJECT = userProjectPath;
  // set env variable so workspace use the correct tsconfig file
  process.env.TS_NODE_PROJECT = TSCONFIG_TESTING_JSON;

  // register ts-node to transpile TS files into JS files
  require("ts-node/register/transpile-only");
  // register tsconfig-paths so nodejs would understand the "path" if set in the tsconfig file
  require("tsconfig-paths/register");
};

export const isTSProject = () => {
  const workspaceConfigFile = getUserConfigPath();
  return isTypescriptFile(workspaceConfigFile);
};

export function isTypescriptFile(path: string): boolean {
  return /\.(ts|cts|mts)$/i.test(path);
}

export function isJavascriptFile(path: string): boolean {
  return /\.(js|cjs|mjs)$/i.test(path);
}
