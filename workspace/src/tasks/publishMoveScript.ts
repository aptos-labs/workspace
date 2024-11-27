import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { getUserConfigVerbose } from "../internal/utils/userConfig";
import { workspace } from "../external/workspaceGlobal";

/**
 * Publish a package to the Aptos blockchain
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
    showStdout: configVerbose ?? false,
  });
  return response.output;
};
