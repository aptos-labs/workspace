import { expect } from "chai";
import {
  generateTestAccount,
  publishPackage,
  workspace,
} from "@aptos-labs/workspace";

let objectAddress: string;

describe("my first test", () => {
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
    // get the object account modules
    const accountModule = await workspace.aptos.getAccountModules({
      accountAddress: objectAddress,
    });
    // expect the account modules to have at least one module
    expect(accountModule).to.have.length.at.least(1);
  });
});
