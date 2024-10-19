import { RootHookObject } from "mocha";
import { TestNode } from "./node";
import { workspace } from "../external/workspaceGlobal";

/**
 * Hooks to run before and after EACH test suite
 */
export const mochaHooks: RootHookObject = {
  beforeAll: async function () {
    await createGlobalAptosClientInstance();
  },
  afterAll: async function () {
    if (workspace.testNode) {
      await workspace.testNode.stop();
    }
  },
};

/**
 * Creates a global Aptos client instance and inject it into the global
 * object, so later devs can use it in their test suites
 */
const createGlobalAptosClientInstance = async () => {
  workspace.testNode = await TestNode.spawn();
  // inject aptos instance to the global object
  workspace.aptos = workspace.testNode.client();
};
