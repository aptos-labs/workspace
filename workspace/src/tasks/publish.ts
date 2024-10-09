import path from "path";
import fs from "fs";
import { Account } from "@aptos-labs/ts-sdk";
import { getUserConfigContractDir } from "../internal/utils/userConfig";
import { getAptosClient } from "../utils/consts";
import { getContractInterface } from "../internal/utils/getAbi";

export const publishPackageTask = async (args: { publisher: Account }) => {
  const aptos = getAptosClient();
  const { publisher } = args;
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

export const publishPackageTaskForAbi = async (args: { sponsor: Account }) => {
  const aptos = getAptosClient();
  const { sponsor } = args;
  const { metadataBytes, byteCode } = await getPackageBytesToPublish();
  await aptos.fundAccount({
    accountAddress: sponsor.accountAddress,
    amount: 1_000_000_000,
  });

  // Publish move package to chain
  const transaction = await aptos.publishPackageTransaction({
    account: sponsor.accountAddress,
    metadataBytes,
    moduleBytecode: byteCode,
  });

  const pendingTransaction = await aptos.signAndSubmitTransaction({
    signer: sponsor,
    transaction,
  });

  await aptos.waitForTransaction({ transactionHash: pendingTransaction.hash });

  // Example usage
  const bytecodeModulesPath = findBytecodeModulesFolder(baseFolderPath);

  if (bytecodeModulesPath) {
    const mvFiles = getMVFiles(bytecodeModulesPath);
    console.log("MV Files:", mvFiles);
  } else {
    console.error("No bytecode_modules folder found.");
  }
  // const abiString = await getContractInterface(
  //   publisher.accountAddress.toString()
  // );

  // const userProjectPath = process.cwd();
  // fs.writeFileSync(`${userProjectPath}/abis/todolist_abi.ts`, abiString);
};

// Define the base folder where the user-specific folders are located
const contractDir = getUserConfigContractDir();
const baseFolderPath = path.join(process.cwd(), `${contractDir}/build`);

// Function to search for the `bytecode_modules` folder in user-defined subfolders
function findBytecodeModulesFolder(baseDirectory: string): string | null {
  const subfolders = fs.readdirSync(baseDirectory);

  // Iterate through each subfolder
  for (const subfolder of subfolders) {
    const potentialPath = path.join(
      baseDirectory,
      subfolder,
      "bytecode_modules"
    );

    // Check if this path contains the `bytecode_modules` folder
    if (
      fs.existsSync(potentialPath) &&
      fs.lstatSync(potentialPath).isDirectory()
    ) {
      return potentialPath; // Return the first found valid folder path
    }
  }

  return null; // Return null if no valid folder is found
}

// Function to get all .mv files from the `bytecode_modules` folder
function getMVFiles(directory: string): string[] {
  const files = fs.readdirSync(directory);
  return files.filter((file) => path.extname(file) === ".mv");
}
