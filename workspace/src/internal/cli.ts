import { program } from "commander";
import prompts from "prompts";
import { test, init } from "../tasks";

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
