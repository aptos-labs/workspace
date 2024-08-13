import findup from "find-up";
import path from "path";
import fsExtra from "fs-extra";

export function findClosestWorkspacePackageJson(file: string): string | null {
  return findup.sync("package.json", { cwd: path.dirname(file) });
}

export function getWorkspacePackageJsonPath(): string {
  return findClosestWorkspacePackageJson(__filename)!;
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
