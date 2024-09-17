import { AccountAddressInput, AccountAddress } from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigContractDir } from "../internal/utils/userConfig";

export const compilePackageTask = async (
  namedAddresses: Record<string, AccountAddressInput>
) => {
  // transform AccountAddressInput to AccountAddress type
  const transformedAddresses: Record<string, AccountAddress> = {};

  for (const key in namedAddresses) {
    if (namedAddresses.hasOwnProperty(key)) {
      transformedAddresses[key] = AccountAddress.from(namedAddresses[key]);
    }
  }
  // get the configured contract dir
  const contractDir = getUserConfigContractDir();

  await new Move().buildPublishPayload({
    outputFile: `${contractDir}/test-package.json`,
    packageDirectoryPath: contractDir,
    namedAddresses: transformedAddresses,
    extraArguments: ["--assume-yes", "--skip-fetch-latest-git-deps"],
  });
};
