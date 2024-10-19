import {
  Account,
  AccountAddressInput,
  Aptos,
  Ed25519Account,
} from "@aptos-labs/ts-sdk";
import { publishPackageTask } from "../tasks/publish";
import { workspace } from "./workspaceGlobal";

/**
 * API endpoint to create a test account
 */
export async function generateTestAccount() {
  const account = Account.generate();
  await workspace.aptos.fundAccount({
    accountAddress: account.accountAddress,
    amount: 1_000_000_000,
    options: { waitForIndexer: false },
  });
  return account;
}

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
