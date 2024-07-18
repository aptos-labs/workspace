import { expect, test, describe, beforeAll } from "vitest";
import { AptosConfig, Network, Aptos, Ed25519Account } from "@aptos-labs/ts-sdk";
import { addNewListTransaction } from "../frontend/entry-functions/addNewList";
import { addNewTaskTransaction } from "../frontend/entry-functions/addNewTask";
import { completeTaskTransaction } from "../frontend/entry-functions/completeTask";
// workspace APIs
import { generateTestAccount, publishPackage } from "../../workspace";

const aptosConfig = new AptosConfig({ network: Network.LOCAL });
const aptos = new Aptos(aptosConfig);

let publisherAccount: Ed25519Account;
let todoListCreator: Ed25519Account;

describe("todoList", () => {
  beforeAll(async () => {
    publisherAccount = await generateTestAccount();
    await publishPackage({
      publisher: publisherAccount,
      namedAddresses: {
        module_addr: publisherAccount.accountAddress.toString(),
      },
    });
  }, 20000);

  test("it publishes the contract under the correct address", async () => {
    const accountModule = await aptos.getAccountModule({
      accountAddress: publisherAccount.accountAddress,
      moduleName: "todolist",
    });
    expect(accountModule).toBeDefined();
  });

  test("it creates a new list", async () => {
    todoListCreator = await generateTestAccount();
    const addNewListTxn = await addNewListTransaction(publisherAccount.accountAddress.toString());

    const transaction = await aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await aptos.signAndSubmitTransaction({ signer: todoListCreator, transaction });

    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).toBeTruthy();

    const todoListResource = await aptos.getAccountResource({
      accountAddress: todoListCreator.accountAddress,
      resourceType: `${publisherAccount.accountAddress.toString()}::todolist::TodoList`,
    });

    expect(todoListResource).toBeDefined();
  });

  test("it creates a new task", async () => {
    const addNewListTxn = await addNewTaskTransaction("test task", publisherAccount.accountAddress.toString());

    const transaction = await aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await aptos.signAndSubmitTransaction({ signer: todoListCreator, transaction });

    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).toBeTruthy();
  });

  test("it marks task as completed", async () => {
    const addNewListTxn = await completeTaskTransaction("1", publisherAccount.accountAddress.toString());

    const transaction = await aptos.transaction.build.simple({
      sender: todoListCreator.accountAddress,
      data: addNewListTxn.data,
    });

    const response = await aptos.signAndSubmitTransaction({ signer: todoListCreator, transaction });

    const committedTransactionResponse = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    expect(committedTransactionResponse.success).toBeTruthy();
  });
});
