const expect = require("chai").expect;
const {
  generateTestAccount,
  publishPackage,
  workspace,
} = require("@aptos-labs/workspace");

let objectAddress;

describe("my first test", () => {
  before(async function () {
    const publisherAccount = await generateTestAccount();
    const { packageObjectAddress } = await publishPackage({
      publisher: publisherAccount,
      addressName: "module_addr",
      namedAddresses: {
        module_addr: publisherAccount.accountAddress,
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
