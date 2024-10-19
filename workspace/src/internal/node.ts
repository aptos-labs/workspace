import { spawn } from "child_process";
import kill from "tree-kill";
import * as readline from "readline";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { NodeInfo } from "./utils/types";

async function sleep(timeMs: number): Promise<null> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });
}

function generateRandomId(length: number): string {
  const charset = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
}

export class TestNode {
  private static readonly TIMEOUT_SECONDS = 60;

  private constructor(private info: NodeInfo | null) {}

  public static async spawn(): Promise<TestNode> {
    const id = generateRandomId(4);

    const cliCommand = "aptos-workspace-server";
    const cliArgs: string[] = [];

    const childProcess = spawn(cliCommand, cliArgs);

    const rl = readline.createInterface({
      input: childProcess.stderr,
      output: process.stdout,
      terminal: false,
    });

    let rest_api_port: number | undefined;
    let faucet_port: number | undefined;
    let indexer_port: number | undefined;

    const portPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        rl.removeAllListeners("line");
        reject(new Error("Timeout waiting for ports"));
      }, this.TIMEOUT_SECONDS * 1000); // 30 seconds timeout

      rl.on("line", (line: string) => {
        console.log(`[NODE ${id}] ${line}`);

        const pattern =
          /Node API is ready. Endpoint:.+:(\d+)|Faucet is ready. Endpoint:.+:(\d+)|Indexer API is ready. Endpoint:.+:(\d+)/g;

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

          if (rest_api_port && faucet_port && indexer_port != undefined) {
            clearTimeout(timeout); // Clear timeout when ports are found
            rl.removeAllListeners("line");
            resolve(); // Resolve the promise when both ports are found
            break;
          }
        }
      });
    });

    childProcess.stdout?.on("data", (data: any) => {
      const str = data.toString();
    });

    try {
      await portPromise; // Wait for the promise to resolve or reject

      // The indexer API is not ready even though it claims it is.
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

    return new Aptos(
      new AptosConfig({
        network: Network.CUSTOM,
        fullnode: `http://localhost:${this.info.rest_api_port}/v1`,
        faucet: `http://localhost:${this.info.faucet_port}`,
        indexer: `http://localhost:${this.info.rest_api_port}/v1/graphql`,
      })
    );
  }

  public async stop() {
    await new Promise((resolve, reject) => {
      if (!this.info?.process?.pid) return;
      kill(this.info.process.pid, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}
