import fs from "fs";
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

import { publishMovePackageTask } from "./publishMovePackage";
import { generateTestAccount } from "../external";

export const genAbi = async (options: { names: string }) => {
  const localNode = new cli.LocalNode();
  // spin up a localnet
  await localNode.run();
  // create a random account
  const publisher = await generateTestAccount();
  // build the named addresses object with the random account address
  const parsedNamedAddresses = buildAddressObject(
    options.names,
    publisher.accountAddress.toString()
  );
  // publish the package to chain
  const packageObjectAddress = await publishMovePackageTask({
    publisher,
    namedAddresses: parsedNamedAddresses,
    addressName: Object.keys(parsedNamedAddresses)[0],
  });
  // fetch the abi from the node and generate in a local file
  await fetchAbiFromNode(packageObjectAddress);
  // stop the localnet
  await localNode.stop();
};

export const fetchAbiFromNode = async (objectAddress: string) => {
  const aptosConfig = new AptosConfig({ network: Network.LOCAL });
  const aptos = new Aptos(aptosConfig);
  const modules = await aptos.getAccountModules({
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
