"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewTaskTransaction = void 0;
const addNewTaskTransaction = (task, moduleAddress) => {
    return {
        data: {
            function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::create_task`,
            functionArguments: [task],
        },
    };
};
exports.addNewTaskTransaction = addNewTaskTransaction;
//# sourceMappingURL=addNewTask.js.map