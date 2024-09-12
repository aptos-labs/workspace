import { PromptResult } from "../internal/cli";
import { generateSampleProject } from "../internal/utils/generateSampleProject";

export const init = async (result: PromptResult) => {
  await generateSampleProject(result.language);

  console.log(
    "Workspace has initialized. Run `npx aptos-workspace test` to run tests"
  );
};
