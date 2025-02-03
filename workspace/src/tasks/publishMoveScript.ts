import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigVerbose } from "../internal/utils/userConfig";
import { workspace } from "../external/workspaceGlobal";

/**
 * Publish a package to the Aptos blockchain
 * @param args.publisher - The Ed25519Account of the package publisher
 * @param args.compiledScriptPath - The path to the compiled Move script
 *
 * @returns The address of the published package
 */
export const publishCompiledMoveScriptTask = async (args: {
  publisher: Ed25519Account;
  compiledScriptPath: string;
}): Promise<string> => {
  const { publisher, compiledScriptPath } = args;

  const configVerbose = getUserConfigVerbose();

  const response = await new Move().runScript({
    compiledScriptPath,
    extraArguments: [
      "--assume-yes",
      `--private-key=${publisher.privateKey}`,
      `--url=${workspace.config.fullnode}`,
    ],
    showStdout: true // configVerbose ?? false,
  });
  return response.output;
};
