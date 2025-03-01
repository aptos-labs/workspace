import { program } from "commander";
import prompts from "prompts";

import { test, init, genAbi } from "../tasks";
import { moveUnitTestTask } from "../tasks/unit-test";

program
  .command("init")
  .option("-ts, --typescript", "start a typescript project")
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
  .command("move-unit-test")
  .description("Run Move unit tests")
  .requiredOption(
    "--package-name <NAME>",
    "The name of the Move package with a Move.toml file you want to test, Example: MessageBoard"
  )
  .action(async (options) => {
    await moveUnitTestTask(options);
  });

program
  .command("gen-abi")
  .description("Generate the module ABI")
  .requiredOption(
    "--names <NAMES>",
    "The names you use in the named-addresses for the move binary, Example: alice,bob"
  )
  .requiredOption(
    "--name <NAME>",
    "The name from the named-addresses to use to publish the package under, Example: alice"
  )
  .requiredOption(
    "--package-name <NAME>",
    "The name of the Move package with a Move.toml file you want to generate the ABI for, Example: MessageBoard"
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
  .description("Run integration tests")
  .option(
    "-t, --timeout <treshold>",
    "Specify test timeout threshold (in milliseconds) "
  )
  .option(
    "-g, --grep <file>",
    "Only run tests matching the given string or regexp"
  )
  .option(
    "-j, --jobs <number>",
    "Specify the number of jobs to run in parallel"
  )
  .action(async (options) => {
    await test(options);
  });

program.parse();
