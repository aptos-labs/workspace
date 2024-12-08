import { expect } from "chai";
import {
  getTestSigners,
  publishMovePackage,
  workspace,
} from "@aptos-labs/workspace";

let objectAddress;

describe("my first test", () => {
  before(async function () {
    const [signer1] = await getTestSigners();
    // publish the package, getting back the package pbject address
    const { packageObjectAddress } = await publishMovePackage({
      publisher: signer1,
      namedAddresses: {
        module_addr: signer1.accountAddress,
      },
      addressName: "module_addr", // Enter your address name here
      packageName: "", // Enter your package name here
    });
    // set the object address to the package object address
    objectAddress = packageObjectAddress;
  });

  it("it publishes the contract under the correct address", async () => {
    const accountModule = await workspace.getAccountModules({
      accountAddress: objectAddress,
    });
    expect(accountModule).to.have.length.at.least(1);
  });
});
