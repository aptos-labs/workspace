import {
  Ed25519Account,
  AccountAddress,
  AccountAddressInput,
} from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigVerbose } from "../internal/utils/userConfig";
import { workspace } from "../external/workspaceGlobal";
import { findMovePackageFolderPath } from "../internal/utils/findMovePackageFolderPath";

/**
 * Publish a package to the Aptos blockchain
 * @returns The address of the published package
 */
export const publishMovePackageTask = async (args: {
  publisher: Ed25519Account;
  namedAddresses: Record<string, AccountAddressInput>;
  addressName: string;
  packageName: string;
}): Promise<string> => {
  const { publisher, namedAddresses, addressName, packageName } = args;

  // transform AccountAddressInput to AccountAddress type
  const transformedAddresses: Record<string, AccountAddress> = {};

  for (const key in namedAddresses) {
    if (namedAddresses.hasOwnProperty(key)) {
      transformedAddresses[key] = AccountAddress.from(namedAddresses[key]);
    }
  }

  const packagePath = await findMovePackageFolderPath(packageName);

  const configVerbose = getUserConfigVerbose();

  const response = await new Move().createObjectAndPublishPackage({
    packageDirectoryPath: packagePath,
    addressName,
    namedAddresses: transformedAddresses,
    extraArguments: [
      "--assume-yes",
      `--private-key=${publisher.privateKey}`,
      `--url=${workspace.config.fullnode}`,
    ],
    showStdout: configVerbose ?? false,
  });
  return response.objectAddress;
};
