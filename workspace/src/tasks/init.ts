import { generateSampleProject } from "../internal/utils/generateSampleProject";

export type PromptResult = {
  language: "ts" | "js";
};

export const init = async (result: PromptResult) => {
  await generateSampleProject(result.language);

  console.log(
    "Workspace has initialized. Run `npx aptos-workspace test` to run tests"
  );
};
