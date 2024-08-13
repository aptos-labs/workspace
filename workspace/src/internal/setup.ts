before(async function () {
  const { LocalNode } = await import(
    "@aptos-labs/ts-sdk/dist/common/cli/index.js"
  );
  const localNode = new LocalNode();
  await localNode.run();
  (globalThis as any).__LOCAL_NODE__ = localNode;
});

after(async function () {
  if ((globalThis as any).__LOCAL_NODE__?.process) {
    await (globalThis as any).__LOCAL_NODE__.stop();
  }
});
