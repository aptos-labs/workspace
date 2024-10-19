import { Aptos } from "@aptos-labs/ts-sdk";
import { TestNode } from "../internal/node";

// Declare the extended global variable
export interface WorkspaceGlobal extends NodeJS.Global {
  aptos: Aptos;
  testNode: TestNode;
}

// Declare the extended global variable
declare var global: WorkspaceGlobal;

export var workspace: WorkspaceGlobal = global;
