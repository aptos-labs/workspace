export async function setup() {
  //const { LocalNode } = await import("@aptos-labs/ts-sdk/dist/common/cli/index.js");
  //const { TestNode, TestNode: TestNodeEx } = await import("../../workspace");
  //const localNode = new TestNode();
  //await localNode.run();
  //const localNode = await TestNodeEx.spawn();
  //(globalThis as any).__LOCAL_NODE__ = localNode;
}

export async function teardown() {
  //await (globalThis as any).__LOCAL_NODE__.stop();
}
