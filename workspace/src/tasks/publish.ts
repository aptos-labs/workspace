import path from "path";
import fs from "fs";
import {
  Ed25519Account,
  AccountAddress,
  AccountAddressInput,
  NetworkToNodeAPI,
  Network,
} from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigContractDir } from "../internal/utils/userConfig";

/**
 * Publish a package to the Aptos blockchain
 * @returns The address of the published package
 */
export const publishPackageTask = async (args: {
  publisher: Ed25519Account;
  namedAddresses: Record<string, AccountAddressInput>;
  addressName: string;
}): Promise<string> => {
  const { publisher, namedAddresses, addressName } = args;

  // transform AccountAddressInput to AccountAddress type
  const transformedAddresses: Record<string, AccountAddress> = {};

  for (const key in namedAddresses) {
    if (namedAddresses.hasOwnProperty(key)) {
      transformedAddresses[key] = AccountAddress.from(namedAddresses[key]);
    }
  }

  // get the configured contract dir
  const contractDir = getUserConfigContractDir();

  const response = await new Move().createObjectAndPublishPackage({
    packageDirectoryPath: contractDir,
    addressName,
    namedAddresses: transformedAddresses,
    extraArguments: [
      "--assume-yes",
      `--private-key=${publisher.privateKey}`,
      `--url=${NetworkToNodeAPI[Network.LOCAL]}`,
    ],
  });
  return response.objectAddress;
};

/**
 * A convenience function to get the compiled package metadataBytes and byteCode
 * @param packageDir
 * @param outputFile
 */
async function getPackageBytesToPublish() {
  // current working directory - the root folder of this repo
  const cwd = process.cwd();
  // target directory - current working directory + filePath (filePath json file is generated with the prevoius, compilePackage, cli command)
  const contractDir = getUserConfigContractDir();
  const modulePath = path.join(cwd, `${contractDir}/test-package.json`);

  const jsonData = JSON.parse(fs.readFileSync(modulePath, "utf8"));

  const metadataBytes = jsonData.args[0].value;
  const byteCode = jsonData.args[1].value;

  return { metadataBytes, byteCode };
}
