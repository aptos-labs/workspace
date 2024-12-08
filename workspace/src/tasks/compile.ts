import { AccountAddressInput, AccountAddress } from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import {
  getUserConfigContractDir,
  getUserConfigVerbose,
} from "../internal/utils/userConfig";
import { findMovePackageFolderPath } from "../internal/utils/findMovePackageFolderPath";

export const compilePackageTask = async (args: {
  namedAddresses: Record<string, AccountAddressInput>;
  packageName: string;
}) => {
  const { namedAddresses, packageName } = args;

  // transform AccountAddressInput to AccountAddress type
  const transformedAddresses: Record<string, AccountAddress> = {};

  for (const key in namedAddresses) {
    if (namedAddresses.hasOwnProperty(key)) {
      transformedAddresses[key] = AccountAddress.from(namedAddresses[key]);
    }
  }

  const packagePath = await findMovePackageFolderPath(packageName);

  const contractDir = getUserConfigContractDir();
  const configVerbose = getUserConfigVerbose();

  await new Move().buildPublishPayload({
    outputFile: `${contractDir}/${packageName}.json`,
    packageDirectoryPath: packagePath,
    namedAddresses: transformedAddresses,
    extraArguments: ["--assume-yes", "--skip-fetch-latest-git-deps"],
    showStdout: configVerbose ?? false,
  });
};
