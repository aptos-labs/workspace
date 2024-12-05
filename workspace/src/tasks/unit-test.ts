import path from "path";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import fs from "fs";
import toml from "toml";
import {
  getUserConfigContractDir,
  getUserConfigVerbose,
} from "../internal/utils/userConfig";

export type MoveUnitTestOptions = {
  packagePath?: string;
};

export const moveUnitTestTask = async (options: MoveUnitTestOptions) => {
  const { packagePath } = options;

  // get the configured contract dir
  const contractDir = getUserConfigContractDir();

  const contractPackagePath = packagePath
    ? path.join(contractDir, packagePath)
    : contractDir;

  // read the Move.toml file
  var str = fs.readFileSync(contractPackagePath + "/Move.toml", "utf-8");
  // parse the Move.toml file and extract the named addresses
  const namedAddresses = toml.parse(str).addresses;

  // generate random addresses for the named addresses
  Object.keys(namedAddresses).forEach((key) => {
    let hex = Math.floor(Math.random() * 0xfff + 0x100).toString(16);
    namedAddresses[key] = `0x${hex}`; // You can assign any value you want here
  });

  await new Move().test({
    packageDirectoryPath: contractPackagePath,
    namedAddresses,
    showStdout: true,
  });
};
