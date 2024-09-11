const expect = require("chai").expect;
const {
  generateTestAccount,
  publishPackage,
} = require("@aptos-labs/workspace");
const { AptosConfig, Network, Aptos } = require("@aptos-labs/ts-sdk");
const { addNewListTransaction } = require("../entry-functions/addNewList");
const { addNewTaskTransaction } = require("../entry-functions/addNewTask");
const { completeTaskTransaction } = require("../entry-functions/completeTask");

const aptosConfig = new AptosConfig({ network: Network.LOCAL });
const aptos = new Aptos(aptosConfig);

let publisherAccount;
let todoListCreator;

describe("todoList", () => {
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
    const accountModule = await aptos.getAccountModule({
      accountAddress: publisherAccount.accountAddress,
      moduleName: "todolist",
    });
    expect(accountModule).to.not.undefined;
  });

  it("it creates a new list", async () => {
    todoListCreator = await generateTestAccount();
    const addNewListTxn = await addNewListTransaction(
      publisherAccount.accountAddress.toString()
    );

    const transaction = await aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;

    const todoListResource = await aptos.getAccountResource({
      accountAddress: todoListCreator.accountAddress,
      resourceType: `${publisherAccount.accountAddress.toString()}::todolist::TodoList`,
    });

    expect(todoListResource).to.not.undefined;
  });

  it("it creates a new task", async () => {
    const addNewListTxn = await addNewTaskTransaction(
      "test task",
      publisherAccount.accountAddress.toString()
    );

    const transaction = await aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });

  it("it marks task as completed", async () => {
    const addNewListTxn = await completeTaskTransaction(
      "1",
      publisherAccount.accountAddress.toString()
    );

    const transaction = await aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });
});
