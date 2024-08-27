import { defineConfig } from "tsup";
import type { Options } from "tsup";

const DEFAULT_CONFIG: Options = {
  bundle: true,
  clean: true, // clean up the dist folder
  dts: true, // generate dts files
  minify: true,
  entry: ["src/**/*.ts"], // include all files under src
  skipNodeModulesBundle: true,
  sourcemap: true,
  splitting: true,
  target: "es2020",
  platform: "node",
  banner: {
    js: "#!/usr/bin/env node", // add shebang to support node env
  },
  format: "cjs",
  outDir: "dist",
};

export default defineConfig(DEFAULT_CONFIG);
