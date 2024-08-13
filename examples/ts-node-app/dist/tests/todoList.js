"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const workspace_1 = require("@aptos-labs/workspace");
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
const addNewList_1 = require("../entry-functions/addNewList");
const addNewTask_1 = require("../entry-functions/addNewTask");
const completeTask_1 = require("../entry-functions/completeTask");
const aptosConfig = new ts_sdk_1.AptosConfig({ network: ts_sdk_1.Network.LOCAL });
const aptos = new ts_sdk_1.Aptos(aptosConfig);
let publisherAccount;
let todoListCreator;
describe("todoList", () => {
    before(function (done) {
        (async () => {
            console.log("here");
            publisherAccount = await (0, workspace_1.generateTestAccount)();
            console.log("here2");
            await (0, workspace_1.publishPackage)({
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
        (0, chai_1.expect)(accountModule).to.not.undefined;
    });
    it("it creates a new list", async () => {
        todoListCreator = await (0, workspace_1.generateTestAccount)();
        const addNewListTxn = await (0, addNewList_1.addNewListTransaction)(publisherAccount.accountAddress.toString());
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
        (0, chai_1.expect)(committedTransactionResponse.success).true;
        const todoListResource = await aptos.getAccountResource({
            accountAddress: todoListCreator.accountAddress,
            resourceType: `${publisherAccount.accountAddress.toString()}::todolist::TodoList`,
        });
        (0, chai_1.expect)(todoListResource).to.not.undefined;
    });
    it("it creates a new task", async () => {
        const addNewListTxn = await (0, addNewTask_1.addNewTaskTransaction)("test task", publisherAccount.accountAddress.toString());
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
        (0, chai_1.expect)(committedTransactionResponse.success).true;
    });
    it("it marks task as completed", async () => {
        const addNewListTxn = await (0, completeTask_1.completeTaskTransaction)("1", publisherAccount.accountAddress.toString());
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
        (0, chai_1.expect)(committedTransactionResponse.success).true;
    });
});
//# sourceMappingURL=todoList.js.map