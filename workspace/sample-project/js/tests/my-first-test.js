const expect = require("chai").expect;
const {
  generateTestAccount,
  publishPackage,
} = require("@aptos-labs/workspace");
const { AptosConfig, Network, Aptos } = require("@aptos-labs/ts-sdk");

const aptosConfig = new AptosConfig({ network: Network.LOCAL });
const aptos = new Aptos(aptosConfig);

let publisherAccount;

describe("my first test", () => {
  before(function (done) {
    (async () => {
      publisherAccount = await generateTestAccount();
      await publishPackage({
        publisher: publisherAccount,
        namedAddresses: {
          module_addr: publisherAccount.accountAddress.toString(),
        },
      });
    })().then(done);
  });

  it("it publishes the contract under the correct address", async () => {
    const accountModule = await aptos.getAccountModules({
      accountAddress: publisherAccount.accountAddress,
    });
    expect(accountModule).to.have.length.at.least(1);
  });
});
