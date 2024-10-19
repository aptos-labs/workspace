import {
  Ed25519Account,
  AccountAddress,
  AccountAddressInput,
} from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigContractDir } from "../internal/utils/userConfig";
import { workspace } from "../external/workspaceGlobal";

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
      `--url=${workspace.aptos.config.fullnode}`,
    ],
  });
  return response.objectAddress;
};
