import {
  Account,
  AccountAddressInput,
  Aptos,
  Ed25519Account,
} from "@aptos-labs/ts-sdk";
import { publishPackageTask } from "../tasks/publish";
import { workspace } from "./workspaceGlobal";

/**
 * API endpoint to create a test Ed25519Account account
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
 * API endpoint to create and get Ed25519Account signers
 * @param amount - [optional] The number of signers to create. Set to 1 by default
 * @returns An array of signers
 */
export async function getTestSigners(
  amount: number = 1
): Promise<Ed25519Account[]> {
  const signersPromises: Promise<Ed25519Account>[] = [];
  for (let i = 0; i < amount; i++) {
    signersPromises.push(generateTestAccount());
  }
  return await Promise.all(signersPromises);
}

/**
 * Publish a package to the Aptos blockchain.
 * This method publishes the modules in a Move
 * package to the Aptos blockchain, under an object.
 *
 * @param args.publisher - The publisher of the package
 * @param args.namedAddresses - The named addresses for the Move binary, {namedAddresses: {alice:"0x123",bob:"0x456"}}
 * @param args.addressName - optional. The named address for compiling and using in the contract, {addressName: "alice"}
 * By default it takes the first name in the `namedAddresses` object.
 * @returns The address of the published package
 */
export const publishPackage = async (args: {
  publisher: Ed25519Account;
  namedAddresses: Record<string, AccountAddressInput>;
  addressName?: string;
}): Promise<{ packageObjectAddress: string }> => {
  const { namedAddresses, addressName, publisher } = args;
  const packageObjectAddress = await publishPackageTask({
    publisher,
    namedAddresses,
    addressName: addressName ?? Object.keys(namedAddresses)[0],
  });
  return { packageObjectAddress };
};
