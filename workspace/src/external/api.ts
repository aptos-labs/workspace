import {
  Account,
  AccountAddressInput,
  Aptos,
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";
import { publishPackageTask } from "../tasks/publish";
import { compilePackageTask } from "../tasks/compile";
import { describe as MochaDescribe } from "mocha";

const aptosConfig = new AptosConfig({ network: Network.LOCAL });
const aptos = new Aptos(aptosConfig);

/**
 * API endpoint to create a test account
 */
export const generateTestAccount = async () => {
  const account = Account.generate();
  await aptos.fundAccount({
    accountAddress: account.accountAddress,
    amount: 1_000_000_000,
  });
  return account;
};

/**
 * API endpoint to publish a move package, this process compiles and publishes the contract
 */
export const publishPackage = async (args: {
  publisher: Account;
  namedAddresses: Record<string, AccountAddressInput>;
}) => {
  const { publisher, namedAddresses } = args;
  await compilePackageTask(namedAddresses);
  await publishPackageTask({ aptos, publisher });
};

/**
 * A `describe` block runner to be used in tests with an injected `aptos` client
 *
 * @param description The decribe block description
 * @param block A callback function to run
 */
export const describe = (
  description: string,
  block: (aptos: Aptos) => void
) => {
  // Call the original mocha describe with the modified block
  MochaDescribe(description, () => {
    // Execute the original test block
    block(aptos);
  });
};
