import { expect } from "chai";
import { getTestSigners, publishMovePackage, workspace } from "@aptos-labs/workspace";
import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { addNewListTransaction } from "@/entry-functions/addNewList";
import { addNewTaskTransaction } from "@/entry-functions/addNewTask";
import { completeTaskTransaction } from "@/entry-functions/completeTask";

let todoListCreator: Ed25519Account;
let objectAddress: string;

describe("todoList", () => {
  before(async function () {
    const [signer1] = await getTestSigners();
    const { packageObjectAddress } = await publishMovePackage({
      publisher: signer1,
      namedAddresses: {
        module_addr: signer1.accountAddress,
      },
      addressName: "module_addr",
    });
    objectAddress = packageObjectAddress;
  });

  it("it publishes the contract under the correct address", async () => {
    const accountModule = await workspace.getAccountModule({
      accountAddress: objectAddress,
      moduleName: "todolist",
    });
    expect(accountModule).to.not.undefined;
  });

  it("it creates a new list", async () => {
    [todoListCreator] = await getTestSigners();
    const addNewListTxn = await addNewListTransaction(objectAddress);

    const transaction = await workspace.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspace.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await workspace.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;

    const todoListResource = await workspace.getAccountResource({
      accountAddress: todoListCreator.accountAddress,
      resourceType: `${objectAddress}::todolist::TodoList`,
    });

    expect(todoListResource).to.not.undefined;
  });

  it("it creates a new task", async () => {
    const addNewListTxn = await addNewTaskTransaction("test task", objectAddress);

    const transaction = await workspace.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspace.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await workspace.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });

  it("it marks task as completed", async () => {
    const addNewListTxn = await completeTaskTransaction("1", objectAddress);

    const transaction = await workspace.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspace.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await workspace.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });
});
