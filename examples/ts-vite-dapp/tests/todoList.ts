import { expect } from "chai";
import { getSigners, publishPackage, workspace } from "@aptos-labs/workspace";
import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { addNewListTransaction } from "@/entry-functions/addNewList";
import { addNewTaskTransaction } from "@/entry-functions/addNewTask";
import { completeTaskTransaction } from "@/entry-functions/completeTask";

let todoListCreator: Ed25519Account;
let objectAddress: string;

describe("todoList", () => {
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
    const accountModule = await workspace.aptos.getAccountModule({
      accountAddress: objectAddress,
      moduleName: "todolist",
    });
    expect(accountModule).to.not.undefined;
  });

  it("it creates a new list", async () => {
    [todoListCreator] = await getSigners();
    const addNewListTxn = await addNewListTransaction(objectAddress);

    const transaction = await workspace.aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspace.aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await workspace.aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;

    const todoListResource = await workspace.aptos.getAccountResource({
      accountAddress: todoListCreator.accountAddress,
      resourceType: `${objectAddress}::todolist::TodoList`,
    });

    expect(todoListResource).to.not.undefined;
  });

  it("it creates a new task", async () => {
    const addNewListTxn = await addNewTaskTransaction("test task", objectAddress);

    const transaction = await workspace.aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspace.aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await workspace.aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });

  it("it marks task as completed", async () => {
    const addNewListTxn = await completeTaskTransaction("1", objectAddress);

    const transaction = await workspace.aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await workspace.aptos.signAndSubmitTransaction({
      signer: todoListCreator,
      transaction,
    });

    const committedTransactionResponse = await workspace.aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).true;
  });
});
