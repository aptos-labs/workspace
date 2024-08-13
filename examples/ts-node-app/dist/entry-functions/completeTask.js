"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTaskTransaction = void 0;
const completeTaskTransaction = (taskId, moduleAddress) => {
    return {
        data: {
            function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::complete_task`,
            functionArguments: [taskId],
        },
    };
};
exports.completeTaskTransaction = completeTaskTransaction;
//# sourceMappingURL=completeTask.js.map