import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { RootHookObject } from "mocha";
import { generateTestAccount, publishPackage, workspaceGlobal } from "../api";
import { TestNode } from "../node";

/**
 * Hooks to run before and after EACH test suite
 */
export const mochaHooks: RootHookObject = {
  // code to run before each test suite
  beforeAll: async function () {
    await createGlobalAptosClientInstance();
    await createGlobalPublisherAccount();
  },
  afterAll: async function () {
    // code to run after each test suite
  },
};

/**
 * Creates a global Aptos client instance and inject it into the global
 * object, so later devs can use it in their test suites
 */
const createGlobalAptosClientInstance = async () => {
  const node = await TestNode.spawn();
  const aptos = node.client();

  // inject aptos instance to the global object
  workspaceGlobal.aptos = aptos;
};

/**
 * Creates a global package publisher account and inject it into the global
 * object, so later devs can use it in their test suites.
 *
 * Also, published the move package to chain
 */
const createGlobalPublisherAccount = async () => {
  const publisherAccount = await generateTestAccount(workspaceGlobal.aptos);
  await publishPackage(workspaceGlobal.aptos, {
    publisher: publisherAccount,
    namedAddresses: {
      module_addr: publisherAccount.accountAddress.toString(),
    },
  });
  // inject publisherAccount instance to the global object
  workspaceGlobal.publisherAccount = publisherAccount;
};
