const { LocalNode } = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

module.exports = async function setup() {
  const localNode = new LocalNode();
  globalThis.__LOCAL_NODE__ = localNode;
  await localNode.run();
};
