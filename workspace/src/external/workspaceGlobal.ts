import { Aptos } from "@aptos-labs/ts-sdk";
import { TestNode } from "../internal/node";

// Declare the global object type
export interface WorkspaceGlobal extends NodeJS.Global {
  aptos: Aptos;
  testNode: TestNode;
}

// Declare the extended global variable
declare var global: WorkspaceGlobal;

/**
 * A global object to access the current client thread.
 * Each test runs a `root hook` thread that spins up a new Aptos client.
 * See `rootHook.ts` for more details.
 */
export var workspace: WorkspaceGlobal = global;
