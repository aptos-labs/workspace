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
  .action(async () => {
    await test();
  });

program.parse();
