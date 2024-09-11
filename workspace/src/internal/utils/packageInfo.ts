import findup from "find-up";
import path from "path";
import fsExtra from "fs-extra";

/**
 * Returns Workspace package.json path
 */
export function getWorkspacePackageJsonPath(): string {
  return findup.sync("package.json", { cwd: path.dirname(__filename) })!;
  //return findClosestWorkspacePackageJson(__filename)!;
}

/**
 * Returns Workspace's package root path
 */
export function getWorkspacePackageRoot(): string {
  const packageJsonPath = getWorkspacePackageJsonPath();

  return path.dirname(packageJsonPath);
}
/**
 * Return the contents of the package.json in the user's project
 */
export function getUserProjectPackageJson(): Promise<any> {
  const packageJsonPath = findup.sync("package.json");

  if (packageJsonPath === null) {
    throw new Error(
      "Expected a package.json file in the current directory or in an ancestor directory"
    );
  }

  return fsExtra.readJson(packageJsonPath);
}
