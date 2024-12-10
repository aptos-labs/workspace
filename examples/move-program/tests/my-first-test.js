const expect = require("chai").expect;
const {
  getTestSigners,
  publishMovePackage,
  workspace,
} = require("@aptos-labs/workspace");

let objectAddress;

describe("my first test", () => {
  before(async function () {
    const [signer1] = await getTestSigners();
    const packageObjectAddress = await publishMovePackage({
      publisher: signer1,
      namedAddresses: {
        message_board_addr: signer1.accountAddress,
      },
      addressName: "message_board_addr",
      packageName: "MessageBoard",
    });
    objectAddress = packageObjectAddress;
  });

  it("it publishes the contract under the correct address", async () => {
    const accountModule = await workspace.getAccountModules({
      accountAddress: objectAddress,
    });
    expect(accountModule).to.have.length.at.least(1);
  });

  it("it posts a message", async () => {
    const [signer1] = await getTestSigners();

    const transaction = await workspace.transaction.build.simple({
      sender: signer1.accountAddress,
      data: {
        function: `${objectAddress}::message_board::post_message`,
        functionArguments: ["Hello, Aptos!"],
      },
    });

    const response = await workspace.signAndSubmitTransaction({
      signer: signer1,
      transaction,
    });

    const committedTransaction = await workspace.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransaction.success).to.be.true;
  });

  it("it gets the message content", async () => {
    const payload = {
      function: `${objectAddress}::message_board::get_message_content`,
    };

    const [messageContent] = await workspace.view({ payload });

    expect(messageContent).to.equal("Hello, Aptos!");
  });
});
