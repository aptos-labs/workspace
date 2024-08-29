import {
  Account,
  AccountAddressInput,
  Aptos,
  AptosConfig,
  Network,
  AccountAddress,
  Ed25519Account,
} from "@aptos-labs/ts-sdk";
import path from "path";
import fs from "fs";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";

export interface WorkspaceGlobal extends NodeJS.Global {
  aptos: Aptos;
  publisherAccount: Ed25519Account;
}

// Declare the extended global variable
declare var global: WorkspaceGlobal;

export var workspaceGlobal: WorkspaceGlobal = global;

export const generateTestAccount = async (aptos: Aptos) => {
  const account = Account.generate();
  await aptos.fundAccount({
    accountAddress: account.accountAddress,
    amount: 1_000_000_000,
    options: { waitForIndexer: false },
  });
  return account;
};

export const publishPackage = async (aptos: Aptos, args: {
  publisher: Account;
  namedAddresses: Record<string, AccountAddressInput>;
}) => {
  const { publisher, namedAddresses } = args;
  await compilePackage("move", "move/test-package.json", namedAddresses);

  const { metadataBytes, byteCode } = await getPackageBytesToPublish();

  // Publish move package to chain
  const transaction = await aptos.publishPackageTransaction({
    account: publisher.accountAddress,
    metadataBytes,
    moduleBytecode: byteCode,
  });

  const pendingTransaction = await aptos.signAndSubmitTransaction({
    signer: publisher,
    transaction,
  });

  await aptos.waitForTransaction({ transactionHash: pendingTransaction.hash });
};

async function compilePackage(
  packageDir: string,
  outputFile: string,
  namedAddresses: Record<string, AccountAddressInput>
) {
  // transform AccountAddressInput to AccountAddress type
  const transformedAddresses: Record<string, AccountAddress> = {};

  for (const key in namedAddresses) {
    if (namedAddresses.hasOwnProperty(key)) {
      transformedAddresses[key] = AccountAddress.from(namedAddresses[key]);
    }
  }

  await new Move().buildPublishPayload({
    outputFile: outputFile,
    packageDirectoryPath: packageDir,
    namedAddresses: transformedAddresses,
    extraArguments: ["--assume-yes", "--skip-fetch-latest-git-deps"],
  });
}

/**
 * A convenience function to get the compiled package metadataBytes and byteCode
 * @param packageDir
 * @param outputFile
 * @param namedAddresses
 */
async function getPackageBytesToPublish() {
  // current working directory - the root folder of this repo
  const cwd = process.cwd();
  // target directory - current working directory + filePath (filePath json file is generated with the prevoius, compilePackage, cli command)
  const modulePath = path.join(cwd, "move/test-package.json");

  const jsonData = JSON.parse(fs.readFileSync(modulePath, "utf8"));

  const metadataBytes = jsonData.args[0].value;
  const byteCode = jsonData.args[1].value;

  return { metadataBytes, byteCode };
}
