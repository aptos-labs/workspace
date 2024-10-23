const expect = require("chai").expect;
const { publishPackage, workspace } = require("@aptos-labs/workspace");

let objectAddress;

describe("my first test", () => {
  before(async function () {
    const [signer1] = await getSigners();
    const { packageObjectAddress } = await publishPackage({
      publisher: signer1,
      addressName: "module_addr",
      namedAddresses: {
        module_addr: signer1.accountAddress,
      },
    });
    objectAddress = packageObjectAddress;
  });

  it("it publishes the contract under the correct address", async () => {
    const accountModule = await workspace.aptos.getAccountModules({
      accountAddress: objectAddress,
    });
    expect(accountModule).to.have.length.at.least(1);
  });
});
