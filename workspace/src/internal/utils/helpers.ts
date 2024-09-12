import fs from "fs/promises";
import path from "path";

/**
 * Recursively copy content from one directory to another.
 *
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
export const copyDirectory = async (src: string, dest: string) => {
  try {
    // Get all items (files and directories) in the source directory
    const items = await fs.readdir(src, { withFileTypes: true });

    for (const item of items) {
      const srcPath = path.join(src, item.name);
      const destPath = path.join(dest, item.name);

      if (item.isDirectory()) {
        // If the item is a directory, create the directory in the destination
        await fs.mkdir(destPath, { recursive: true });
        // Recursively copy the directory contents
        await copyDirectory(srcPath, destPath);
      } else {
        // If the item is a file, copy the file
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(`Error copying directory: ${error}`);
  }
};
