import fs from "fs";

import { publishMovePackageTask } from "./publishMovePackage";
import { generateTestAccount, workspace } from "../external";
import { createGlobalAptosClientInstance } from "../internal/rootHook";

export type GenAbiOptions = {
  names: string;
  name: string;
  packagePath?: string;
};

export const genAbi = async (options: GenAbiOptions) => {
  const { names, name, packagePath } = options;
  console.log(`Generating ABI... hold on`);
  // spin up a localnet
  await createGlobalAptosClientInstance();
  // create a random account
  const publisher = await generateTestAccount();
  // build the named addresses object with the random account address
  const parsedNamedAddresses = buildAddressObject(
    names,
    publisher.accountAddress.toString()
  );
  // publish the package to chain
  const packageObjectAddress = await publishMovePackageTask({
    publisher,
    namedAddresses: parsedNamedAddresses,
    addressName: name,
    packageFolderName: packagePath,
  });
  // fetch the abi from the node and generate in a local file
  await fetchAbiFromNode(packageObjectAddress);
  // stop the localnet
  await workspace.testNode.stop();
  console.log(`ABI generated successfully in the abis/ folder`);
};

export const fetchAbiFromNode = async (objectAddress: string) => {
  const modules = await workspace.getAccountModules({
    accountAddress: objectAddress,
  });
  modules.forEach((module) => {
    const abi = module.abi;
    if (!abi) {
      return;
    }
    const abiString = `export const ${abi.name.toUpperCase()}_ABI = ${JSON.stringify(abi)} as const;`;
    fs.mkdirSync("abis", { recursive: true });
    fs.writeFileSync(`abis/${abi.name}_abi.ts`, abiString);
  });
};

function buildAddressObject(
  input: string,
  address: string
): Record<string, string> {
  // Split the input string by commas to get the names
  const names = input.split(",");

  // Build the object by mapping each name to the given address
  const result: Record<string, string> = {};
  names.forEach((name) => {
    result[name] = address;
  });

  return result;
}
