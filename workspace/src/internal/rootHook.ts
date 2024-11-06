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
 * Spins up a new Aptos node and assigns it to the global `workspace` object.
 */
const createGlobalAptosClientInstance = async () => {
  workspace.testNode = await TestNode.spawn();
  // inject aptos instance to the global `workspace` object.

  // Set up inheritance so workspace has all Aptos methods
  Object.setPrototypeOf(workspace, workspace.testNode.client());
};
