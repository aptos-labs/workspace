import { expect } from "chai";
import {
  generateTestAccount,
  getTestSigners,
  publishPackage,
  workspace,
} from "@aptos-labs/workspace";
import { createSurfClient } from "@thalalabs/surf";
import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { TODOLIST_ABI } from "../abis/todolist_abi";

let todoListCreator: Ed25519Account;
let objectAddress: string;
let surfClient: any;

describe("todoListWithSurf", () => {
  before(async function () {
    const [signer1] = await getTestSigners();
    const { packageObjectAddress } = await publishPackage({
      publisher: signer1,
      namedAddresses: {
        module_addr: signer1.accountAddress,
      },
    });
    objectAddress = packageObjectAddress;
    surfClient = createSurfClient(workspace.aptos).useABI(
      TODOLIST_ABI,
      objectAddress
    );
  });

  it("it creates a new list", async () => {
    todoListCreator = await generateTestAccount();
    const committedTransactionResponse = await surfClient.entry.create_list({
      account: todoListCreator,
      functionArguments: [],
      typeArguments: [],
    });

    expect(committedTransactionResponse.success).true;

    const todoListResource = await workspace.aptos.getAccountResource({
      accountAddress: todoListCreator.accountAddress,
      resourceType: `${objectAddress}::todolist::TodoList`,
    });

    expect(todoListResource).to.not.undefined;
  });

  it("it creates a new task", async () => {
    const committedTransactionResponse = await surfClient.entry.create_task({
      account: todoListCreator,
      functionArguments: ["test task"],
      typeArguments: [],
    });

    expect(committedTransactionResponse.success).true;
  });

  it("it marks task as completed", async () => {
    const committedTransactionResponse = await surfClient.entry.complete_task({
      account: todoListCreator,
      functionArguments: ["1"],
      typeArguments: [],
    });

    expect(committedTransactionResponse.success).true;
  });
});
