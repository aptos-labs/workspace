import {
  Account,
  AccountAddressInput,
  Aptos,
  AptosConfig,
  Network,
  AccountAddress,
  ModuleId,
} from "@aptos-labs/ts-sdk";
import path, { resolve } from "path";
import fs from "fs";
import { Move } from "@aptos-labs/ts-sdk/dist/common/cli/index.js";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import kill from "tree-kill";
import * as readline from 'readline';
import { rejects } from "assert";

const aptosConfig = new AptosConfig({ network: Network.LOCAL });
const aptos = new Aptos(aptosConfig);

export const generateTestAccount = async () => {
  const account = Account.generate();

  await aptos.fundAccount({
    accountAddress: account.accountAddress,
    amount: 1_000_000_000,
  });

  return account;
};

export const publishPackage = async (args: {
  publisher: Account;
  namedAddresses: Record<string, AccountAddressInput>;
}) => {
  const { publisher, namedAddresses } = args;
  await compilePackage("move", "move/test-package.json", namedAddresses);

  console.log("package compiled");

  const { metadataBytes, byteCode } = await getPackageBytesToPublish();

  // Publish move package to chain
  const transaction = await aptos.publishPackageTransaction({
    account: publisher.accountAddress,
    metadataBytes,
    moduleBytecode: byteCode,
  });

  const pendingTransaction = await aptos.signAndSubmitTransaction({
    signer: publisher,
    transaction,
  });

  await aptos.waitForTransaction({ transactionHash: pendingTransaction.hash });
};

async function compilePackage(
  packageDir: string,
  outputFile: string,
  namedAddresses: Record<string, AccountAddressInput>
) {
  // transform AccountAddressInput to AccountAddress type
  const transformedAddresses: Record<string, AccountAddress> = {};

  for (const key in namedAddresses) {
    if (namedAddresses.hasOwnProperty(key)) {
      transformedAddresses[key] = AccountAddress.from(namedAddresses[key]);
    }
  }

  await new Move().buildPublishPayload({
    outputFile: outputFile,
    packageDirectoryPath: packageDir,
    namedAddresses: transformedAddresses,
    extraArguments: ["--assume-yes"],
  });
}

async function sleep(timeMs: number): Promise<null> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
}

type NodeInfo = {
  process: ChildProcessWithoutNullStreams,
  rest_api_port: number,
  faucet_port: number,
  indexer_port: number,
}

export class TestNode {
  static readonly TIMEOUT_SECONDS = 60;

  private constructor(private info: NodeInfo | null) { }

  public static async spawn(): Promise<TestNode> {
    const cliCommand = "aptos";
    const cliArgs = ["node", "run-local-testnet", "--force-restart", "--assume-yes", "--with-indexer-api"];

    const childProcess = spawn(cliCommand, cliArgs);

    const rl = readline.createInterface({
      input: childProcess.stderr,
      output: process.stdout,
      terminal: false,
    })

    let rest_api_port: number | undefined;
    let faucet_port: number | undefined;
    let indexer_port: number | undefined;

    const portPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        rl.removeAllListeners("line");
        reject(new Error("Timeout waiting for ports"));
      }, this.TIMEOUT_SECONDS * 1000); // 30 seconds timeout

      rl.on("line", (line: string) => {
        console.log(">>>> ", line);

        const pattern = /Node API is ready. Endpoint:.+:(\d+)|Faucet is ready. Endpoint:.+:(\d+)|Indexer API is ready. Endpoint:.+:(\d+)/g;

        let match;
        while ((match = pattern.exec(line)) !== null) {
          if (match[1]) {
            rest_api_port = Number(match[1]);
          }
          if (match[2]) {
            faucet_port = Number(match[2]);
          }
          if (match[3]) {
            indexer_port = Number(match[3]);
          }

          if (rest_api_port && faucet_port && indexer_port) {
            clearTimeout(timeout); // Clear timeout when ports are found
            rl.removeAllListeners("line");
            resolve(); // Resolve the promise when both ports are found
            break;
          }
        }
      });
    })

    childProcess.stdout?.on("data", (data: any) => {
      const str = data.toString();
      // Print local node output log
      //console.log(str);
    });

    try {
      await portPromise; // Wait for the promise to resolve or reject

      // The indexer API is not ready enough though it claims it is.
      await sleep(1000);

      const node = new TestNode({
        process: childProcess,
        rest_api_port: rest_api_port!,
        faucet_port: faucet_port!,
        indexer_port: indexer_port!,
      });

      childProcess.on("close", (code) => {
        node.info = null;
      });

      return node;
    } catch (error: any) {
      throw new Error(`Failed to spawn test node: ${error.message}`);
    }
  }

  public client(): Aptos {
    if (!this.info) {
      throw new Error("The node has stopped");
    }

    return new Aptos(new AptosConfig({
      network: Network.CUSTOM,
      fullnode: `http://localhost:${this.info.rest_api_port}/v1`,
      faucet: `http://localhost:${this.info.faucet_port}`,
      indexer: `http://localhost:${this.info.indexer_port}/v1/graphql`,
    }));
  }

  public stop() {
    if (this.info) {
      if (this.info.process?.pid) {
        kill(this.info.process.pid);
      }
    }
  }
}

async function run_integration_test(test: (aptos: Aptos) => Promise<void>) {
  const node = await TestNode.spawn();

  const aptos = new Aptos(new AptosConfig({ network: Network.LOCAL }));
  await test(aptos);

  node.stop();
}

/**
 * A convenience function to get the compiled package metadataBytes and byteCode
 * @param packageDir
 * @param outputFile
 * @param namedAddresses
 */
async function getPackageBytesToPublish() {
  // current working directory - the root folder of this repo
  const cwd = process.cwd();
  // target directory - current working directory + filePath (filePath json file is generated with the prevoius, compilePackage, cli command)
  const modulePath = path.join(cwd, "move/test-package.json");

  const jsonData = JSON.parse(fs.readFileSync(modulePath, "utf8"));

  const metadataBytes = jsonData.args[0].value;
  const byteCode = jsonData.args[1].value;

  return { metadataBytes, byteCode };
}
