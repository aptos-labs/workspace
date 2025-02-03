import { expect } from "chai";
import {
  publishMovePackage,
  getTestSigners,
  workspace,
} from "@aptos-labs/workspace";

let packageObjectAddress: string;

describe("my first test", () => {
  let signer;

  it("publish the contract", async () => {
    const [signer1] = await getTestSigners();
    signer = signer1;

    // publish the package, getting back the package object address
    packageObjectAddress = await publishMovePackage({
      publisher: signer,
      namedAddresses: {
        module_addr: signer.accountAddress,
      },
      addressName: "hello_blockchain",
      packageName: "HelloBlockchain",
    });

    // get the object account modules
    const accountModules = await workspace.getAccountModules({
      accountAddress: packageObjectAddress,
    });
    // expect the account modules to have at least one module
    expect(accountModules).to.have.length.at.least(1);
  });

  it("set message", async () => {
    // execute entry function `message::set_message(signer, "foobar")`
    const transaction = await workspace.transaction.build.simple({
      sender: signer.accountAddress,
      data: {
        function: `${packageObjectAddress}::message::set_message`,
        functionArguments: ["foobar"],
      }
    });

    const response = await workspace.signAndSubmitTransaction({
      signer: signer,
      transaction
    });

    // wait for the transaction to complete
    const committedTransactionResponse = await workspace.waitForTransaction({
      transactionHash: response.hash,
    });
    // the transaction should succeed
    expect(committedTransactionResponse.success).true;
  })

  it("get message", async () => {
    // execute view function `message::get_message()`
    const [value] = await workspace.view({
      payload: {
        function: `${packageObjectAddress}::message::get_message`,
        typeArguments: [],
        functionArguments: [signer.accountAddress]
      }
    });
    // the view function should return the original message
    expect(value?.toString()).equals("foobar");
  })
});
