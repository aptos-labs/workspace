import { expect } from "chai";
import { generateTestAccount, workspaceGlobal } from "@aptos-labs/workspace";
import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { addNewListTransaction } from "../entry-functions/addNewList";
import { addNewTaskTransaction } from "../entry-functions/addNewTask";
import { completeTaskTransaction } from "../entry-functions/completeTask";

let todoListCreator: Ed25519Account;

describe("todoList2", () => {
  it("it publishes the contract under the correct address", async () => {
    const accountModule = await workspaceGlobal.aptos.getAccountModule({
      accountAddress: workspaceGlobal.publisherAccount.accountAddress,
      moduleName: "todolist",
    });
    expect(accountModule).to.not.undefined;
  });

  it("it creates a new list", async () => {
    todoListCreator = await generateTestAccount(workspaceGlobal.aptos);
    const addNewListTxn = await addNewListTransaction(
      workspaceGlobal.publisherAccount.accountAddress.toString()
    );

    const transaction = await workspaceGlobal.aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspaceGlobal.aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await (
      global as any
    ).aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;

    const todoListResource = await workspaceGlobal.aptos.getAccountResource({
      accountAddress: todoListCreator.accountAddress,
      resourceType: `${workspaceGlobal.publisherAccount.accountAddress.toString()}::todolist::TodoList`,
    });

    expect(todoListResource).to.not.undefined;
  });

  it("it creates a new task", async () => {
    const addNewListTxn = await addNewTaskTransaction(
      "test task",
      workspaceGlobal.publisherAccount.accountAddress.toString()
    );

    const transaction = await workspaceGlobal.aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspaceGlobal.aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await (
      global as any
    ).aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });

  it("it marks task as completed", async () => {
    const addNewListTxn = await completeTaskTransaction(
      "1",
      workspaceGlobal.publisherAccount.accountAddress.toString()
    );

    const transaction = await workspaceGlobal.aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspaceGlobal.aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await (
      global as any
    ).aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });
});
