import * as path from "path";
import * as fs from "fs/promises";
import toml from "toml";
import { getUserConfigContractDir } from "./userConfig";

/**
 * Find the folder path of a Move package by its name
 * @param folderPath - The path to the folder containing the Move package
 * @param packageName - The name of the Move package
 * @returns The path to the folder containing the Move package, or null if not found
 */
export async function findMovePackageFolderPath(
  packageName: string
): Promise<string> {
  // get the configured contract dir
  const contractDir = getUserConfigContractDir();
  const packagePath = await findMovePackageFolderPathRecursive(
    contractDir,
    packageName
  );
  if (!packagePath) {
    throw new Error(`Move.toml file not found for the package ${packageName}`);
  }
  return packagePath;
}

async function findMovePackageFolderPathRecursive(
  folderPath: string,
  packageName: string
): Promise<string | null> {
  try {
    // Get a list of all items in the current folder
    const items = await fs.readdir(folderPath);

    // TODO: skip "build" folder
    for (const item of items) {
      const itemPath = path.join(folderPath, item);

      // Check if the current item is a file
      const stats = await fs.stat(itemPath);

      // check if the current item is a file and the file is Move.toml
      if (stats.isFile() && item === "Move.toml") {
        // Read and parse the Move.toml file
        const fileContent = await fs.readFile(itemPath, "utf8");
        const parsedToml = toml.parse(fileContent);
        // check if the package name in the Move.toml file is the same as the package name passed in
        if (parsedToml.package.name === packageName) {
          return folderPath; // Return the folder path containing Move.toml
        }
      }

      // If it's a directory, search recursively
      if (stats.isDirectory()) {
        const result = await findMovePackageFolderPathRecursive(
          itemPath,
          packageName
        );
        if (result) {
          return result; // Return immediately if found in a subdirectory
        }
      }
    }
  } catch (error) {
    console.error(`Error accessing folder ${folderPath}:`, error);
  }

  return null; // Return null if no Move.toml file is found
}
