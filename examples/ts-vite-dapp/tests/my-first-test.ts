import { expect } from "chai";
import { generateTestAccount, publishPackage, describe } from "@aptos-labs/workspace";

let objectAddress: string;

describe("my first test", (aptos) => {
  before(async function () {
    const publisherAccount = await generateTestAccount();
    // publish the package, getting back the package pbject address
    const { packageObjectAddress } = await publishPackage({
      publisher: publisherAccount,
      addressName: "module_addr",
      namedAddresses: {
        module_addr: publisherAccount.accountAddress,
      },
    });
    // set the object address to the package object address
    objectAddress = packageObjectAddress;
  });

  it("it publishes the contract under the correct address", async () => {
    const accountModule = await aptos.getAccountModules({
      accountAddress: objectAddress,
    });
    expect(accountModule).to.have.length.at.least(1);
  });
});
