import {
  Account,
  AccountAddressInput,
  Aptos,
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";
import { publishPackageTask } from "../tasks/publish";
import { compilePackageTask } from "../tasks/compile";

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
