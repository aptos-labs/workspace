import path from "path";
import fs from "fs";
import { Aptos, Account } from "@aptos-labs/ts-sdk";
import { getUserConfigContractDir } from "../internal/utils/userConfig";

export const publishPackageTask = async (args: {
  aptos: Aptos;
  publisher: Account;
}) => {
  const { aptos, publisher } = args;

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

/**
 * A convenience function to get the compiled package metadataBytes and byteCode
 * @param packageDir
 * @param outputFile
 */
async function getPackageBytesToPublish() {
  // current working directory - the root folder of this repo
  const cwd = process.cwd();
  // target directory - current working directory + filePath (filePath json file is generated with the prevoius, compilePackage, cli command)
  const contractDir = getUserConfigContractDir();
  const modulePath = path.join(cwd, `${contractDir}/test-package.json`);

  const jsonData = JSON.parse(fs.readFileSync(modulePath, "utf8"));

  const metadataBytes = jsonData.args[0].value;
  const byteCode = jsonData.args[1].value;

  return { metadataBytes, byteCode };
}
