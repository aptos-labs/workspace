import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { RootHookObject } from "mocha";
import { generateTestAccount, publishPackage, workspaceGlobal } from "../api";

/**
 * Hooks to run before and after EACH test suite
 */
export const mochaHooks: RootHookObject = {
  // code to run before each test suite
  beforeAll: function (done) {
    createGlobalAptosClientInstance();
    // generate an account and publish the move package
    (async () => {
      await createGlobalPublisherAccount();
    })().then(done);
  },
  afterAll: async function () {
    // code to run after each test suite
  },
};

/**
 * Creates a global Aptos client instance and inject it into the global
 * object, so later devs can use it in their test suites
 */
const createGlobalAptosClientInstance = () => {
  // initialize Aptos client instance configured to the LOCAL network
  const aptosConfig = new AptosConfig({ network: Network.LOCAL });
  const aptos = new Aptos(aptosConfig);
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
  const publisherAccount = await generateTestAccount();
  await publishPackage({
    publisher: publisherAccount,
    namedAddresses: {
      module_addr: publisherAccount.accountAddress.toString(),
    },
  });
  // inject publisherAccount instance to the global object
  workspaceGlobal.publisherAccount = publisherAccount;
};
