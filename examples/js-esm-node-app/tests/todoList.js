import { expect } from "chai";
import {
  generateTestAccount,
  publishPackage,
  describe,
} from "@aptos-labs/workspace";
import { addNewListTransaction } from "../entry-functions/addNewList.js";
import { addNewTaskTransaction } from "../entry-functions/addNewTask.js";
import { completeTaskTransaction } from "../entry-functions/completeTask.js";

let objectAddress;
let todoListCreator;

describe("todoList", (aptos) => {
  before(async function () {
    const publisherAccount = await generateTestAccount();
    const { packageObjectAddress } = await publishPackage({
      publisher: publisherAccount,
      addressName: "module_addr",
      namedAddresses: {
        module_addr: publisherAccount.accountAddress,
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
    todoListCreator = await generateTestAccount();
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
