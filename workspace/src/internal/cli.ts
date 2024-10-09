import { program } from "commander";
import prompts from "prompts";
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
import {
  test,
  init,
  compilePackageTaskFromCli,
  parseCompilePackageTaskFromCliInput,
} from "../tasks";
import { generateTestAccount } from "../external";
import { publishPackageTask, publishPackageTaskForAbi } from "../tasks/publish";
import { getUserConfigContractDir } from "./utils/userConfig";

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
      {
        type: (prev, values) => {
          if (values.language.value === "ts") {
            return "select";
          }
          return null;
        },
        name: "useSurf",
        message:
          "Would you like to use Surf, the TypeScript type safety tool maintained by Thala Labs? learn more at https://aptos.dev/en/build/sdks/ts-sdk/type-safe-contract",
        choices: [
          {
            title: "Do not use Surf and handle types manually",
            value: false,
          },
          {
            title:
              "Use Surf to auto generate TypeScript Types for your Move contracts",
            value: true,
          },
        ],
        initial: 0,
      },
    ]);
    await init(result);
  });

program
  .command("generate-abi")
  .description("Publish contract to chain")
  .option(
    "--names <NAMES>",
    "The addresses names you use for the move binary, Example: alice,bob"
  )
  .action(async (options) => {
    await compilePackageTaskFromCli({ namedAddresses: options.namedAddresses });
    const sponsorAccount = await generateTestAccount();
    await new cli.LocalNode().run();
    await new cli.Move().init({
      network: "local",
      extraArguments: [`--private-key=${sponsorAccount.privateKey}`],
    });

    // get the configured contract dir
    const contractDir = getUserConfigContractDir();
    const parsedNamedAddresses = parseCompilePackageTaskFromCliInput(
      options.namedAddresses
    );
    await new cli.Move().publish({
      packageDirectoryPath: contractDir,
      namedAddresses: parsedNamedAddresses,
    });
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
