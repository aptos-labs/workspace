/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["./scripts/"],
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  globalSetup: "./tests/preTest.js",
  globalTeardown: "./tests/postTest.js",
};
