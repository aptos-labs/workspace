const expect = require("chai").expect;
const { publishPackage, describe } = require("@aptos-labs/workspace");
const { addNewListTransaction } = require("../entry-functions/addNewList");
const { addNewTaskTransaction } = require("../entry-functions/addNewTask");
const { completeTaskTransaction } = require("../entry-functions/completeTask");

let objectAddress;
let todoListCreator;

describe("todoList", (aptos) => {
  before(async function () {
    const [signer1] = await getSigners();
    const { packageObjectAddress } = await publishPackage({
      publisher: signer1,
      addressName: "module_addr",
      namedAddresses: {
        module_addr: signer1.accountAddress,
      },
    });
    objectAddress = packageObjectAddress;
  });

  it("it publishes the contract under the correct address", async () => {
    const accountModule = await aptos.getAccountModule({
      accountAddress: objectAddress,
      moduleName: "todolist",
    });
    expect(accountModule).to.not.undefined;
  });

  it("it creates a new list", async () => {
    [todoListCreator] = await getSigners();
    const addNewListTxn = await addNewListTransaction(objectAddress);

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
      resourceType: `${objectAddress}::todolist::TodoList`,
    });

    expect(todoListResource).to.not.undefined;
  });

  it("it creates a new task", async () => {
    const addNewListTxn = await addNewTaskTransaction(
      "test task",
      objectAddress
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
    const addNewListTxn = await completeTaskTransaction("1", objectAddress);

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
