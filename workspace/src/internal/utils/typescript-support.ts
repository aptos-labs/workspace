import { TYPESCRIPT_NOT_INSTALLED, TS_NODE_NOT_INSTALLED } from "./errors";

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

  // register ts-node to transpile TS files into JS files
  require("ts-node/register");
  // register tsconfig-paths so nodejs would understand the "path" if set in the tsconfig file
  require("tsconfig-paths/register");
};
