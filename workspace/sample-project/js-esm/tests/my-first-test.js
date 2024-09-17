import { expect } from "chai";
import {
  generateTestAccount,
  publishPackage,
  describe,
} from "@aptos-labs/workspace";

let publisherAccount;

describe("my first test", (aptos) => {
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
