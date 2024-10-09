import { program } from "commander";
import prompts from "prompts";

import { test, init } from "../tasks";
import { genAbi } from "../tasks/gen-abi";

export type PromptResult = {
  language: "ts" | "js";
};

program
  .command("init")
  .option("-ts, --typescript [value]", "start a typescript project")
  .option("-js, --javascript", "start a javascript project")
  .description("Initialize a workspace testing program")
  .action(async () => {
    const result = await prompts([
      {
        type: "select",
        name: "language",
        message: "What are you using?",
        choices: [
          { title: "JavaScript", value: "js" },
          { title: "TypeScript", value: "ts" },
        ],
        initial: 0,
      },
    ]);
    await init(result);
  });

program
  .command("gen-abi")
  .description("Generate the module ABI")
  .option(
    "--names <NAMES>",
    "The names you use in the named-addresses for the move binary, Example: alice,bob"
  )
  .action(async (options) => {
    /**
     * NOTE: The only feasible way to generate the ABI is to publish the package to chain
     * and fetch the ABI from the node.
     *
     * This is because the Aptos compiler does not support generating the ABI in a JSON format
     * from a local Move binary.
     *
     * There is a work effort to add that support to the compiler, once it exists, this
     * command will be changed.
     */
    await genAbi(options);
  });

program
  .command("test")
  .description("Run unit tests")
  .option(
    "-t, --timeout <treshold>",
    "Specify test timeout threshold (in milliseconds) "
  )
  .option(
    "-g, --grep <file>",
    "Only run tests matching the given string or regexp"
  )
  .action(async (options) => {
    await test(options);
  });

program.parse();

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
