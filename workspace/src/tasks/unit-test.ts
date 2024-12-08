import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import fs from "fs";
import toml from "toml";
import { findMovePackageFolderPath } from "../internal/utils/findMovePackageFolderPath";

export type MoveUnitTestOptions = {
  packageName: string;
};

export const moveUnitTestTask = async (options: MoveUnitTestOptions) => {
  const { packageName } = options;

  const contractPackagePath = await findMovePackageFolderPath(packageName);

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
