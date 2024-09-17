import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigContractDir } from "../internal/utils/userConfig";
import { AccountAddress, AccountAddressInput } from "@aptos-labs/ts-sdk";

export const moveUnitTestTask = async (
  namedAddresses: Record<string, AccountAddressInput> // TODO read it from workspace config file
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

  await new Move().test({
    packageDirectoryPath: contractDir,
    namedAddresses: transformedAddresses,
  });
};
