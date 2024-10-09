import { AccountAddressInput, AccountAddress } from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigContractDir } from "../internal/utils/userConfig";

export const compilePackageTask = async (args: {
  namedAddresses: Record<string, AccountAddressInput>;
}) => {
  const { namedAddresses } = args;
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

export const compilePackageTaskFromCli = async (args: {
  namedAddresses: string;
}) => {
  const { namedAddresses } = args;

  const parsedNamedAddresses =
    parseCompilePackageTaskFromCliInput(namedAddresses);

  //transform AccountAddressInput to AccountAddress type
  const transformedAddresses: Record<string, AccountAddress> = {};

  for (const key in parsedNamedAddresses) {
    if (parsedNamedAddresses.hasOwnProperty(key)) {
      transformedAddresses[key] = AccountAddress.from(
        parsedNamedAddresses[key]
      );
    }
  }

  // get the configured contract dir
  const contractDir = getUserConfigContractDir();

  await new Move().buildPublishPayload({
    outputFile: `${contractDir}/test-package.json`,
    packageDirectoryPath: contractDir,
    namedAddresses: transformedAddresses,
    extraArguments: ["--assume-yes"],
  });
};

export function parseCompilePackageTaskFromCliInput(
  input: string
): Record<string, string> {
  const result: Record<string, string> = {};

  // Split the input by commas to get individual key-value pairs
  const pairs = input.split(",");

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=");

    if (key && value) {
      result[key] = value;
    }
  });

  return result;
}
