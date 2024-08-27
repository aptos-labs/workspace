import { program } from "commander";
import { test, init } from "../tasks";

program
  .command("init")
  .description("Initialize a workspace testing program")
  .action(async () => {
    await init();
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
