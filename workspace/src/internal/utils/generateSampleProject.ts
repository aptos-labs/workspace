import path from "path";
import { SAMPLE_PROJECT_FOLDER } from "./consts";
import {
  getUserProjectPackageJson,
  getWorkspacePackageRoot,
} from "./packageInfo";
import { copyDirectory } from "./helpers";

// get the user project path
const userProjectPath = process.cwd();
// get Wrokspace folder
const packageRoot = getWorkspacePackageRoot();
// holds the Workspace sample project path
let sampleProjectPath = "";

/**
 * Generates the sample project files for the user
 */
export const generateSampleProject = async (language: "js" | "ts") => {
  if (language === "js") {
    sampleProjectPath = await getJSSampleProjectPath();
  } else if (language === "ts") {
    sampleProjectPath = await getTSSampleProjectPath();
  } else {
    throw new Error(`Unsupported language ${language}`);
  }

  await copyDirectory(sampleProjectPath, userProjectPath);
};

// Get the JS sample project path in Workspace
const getJSSampleProjectPath = async () => {
  // check if user has `type:module` set up in their package.json file
  const projectPackageJson = await getUserProjectPackageJson();
  const isTypeModule = projectPackageJson.type === "module";
  const sampleTestJsFolder = isTypeModule ? "js-esm" : "js";

  // copy past Workspace sample project folder
  const sampleProjectPath = path.join(
    packageRoot,
    `${SAMPLE_PROJECT_FOLDER}/${sampleTestJsFolder}`
  );
  return sampleProjectPath;
};

// Get the TS sample project path in Workspace
const getTSSampleProjectPath = async () => {
  // copy past Workspace sample project folder
  const sampleProjectPath = path.join(
    packageRoot,
    `${SAMPLE_PROJECT_FOLDER}/ts`
  );

  return sampleProjectPath;
};
