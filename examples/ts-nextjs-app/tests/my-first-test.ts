import { expect } from "chai";
import {
  getTestSigners,
  publishMovePackage,
  workspace,
} from "@aptos-labs/workspace";

let objectAddress: string;

describe("my first test", () => {
  before(async function () {
    const [signer1] = await getTestSigners();
    // publish the package, getting back the package pbject address
    const { packageObjectAddress } = await publishMovePackage({
      publisher: signer1,
      namedAddresses: {
        module_addr: signer1.accountAddress,
      },
    });
    // set the object address to the package object address
    objectAddress = packageObjectAddress;
  });

  it("it publishes the contract under the correct address", async () => {
    // get the object account modules
    const accountModule = await workspace.getAccountModules({
      accountAddress: objectAddress,
    });
    // expect the account modules to have at least one module
    expect(accountModule).to.have.length.at.least(1);
  });
});
