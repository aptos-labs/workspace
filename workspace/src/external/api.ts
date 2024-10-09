import {
  Account,
  AccountAddressInput,
  Aptos,
  AptosConfig,
  Ed25519Account,
  Network,
} from "@aptos-labs/ts-sdk";
import { publishPackageTask } from "../tasks/publish";
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
 * Publish a package to the Aptos blockchain
 *
 * @param args.publisher - The publisher of the package
 * @param args.namedAddresses - The named addresses for the Move binary, {namedAddresses: {alice:"0x123",bob:"0x456"}}
 * @param args.addressName - The named address for compiling and using in the contract, {addressName: "alice"}
 * @returns The address of the published package
 */
export const publishPackage = async (args: {
  publisher: Ed25519Account;
  namedAddresses: Record<string, AccountAddressInput>;
  addressName: string;
}): Promise<{ packageObjectAddress: string }> => {
  const { namedAddresses, addressName, publisher } = args;
  const packageObjectAddress = await publishPackageTask({
    publisher,
    namedAddresses,
    addressName,
  });
  return { packageObjectAddress };
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
