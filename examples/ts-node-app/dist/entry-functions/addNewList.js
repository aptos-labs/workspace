"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNewListTransaction = void 0;
const addNewListTransaction = (moduleAddress) => {
    return {
        data: {
            function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::create_list`,
            functionArguments: [],
        },
    };
};
exports.addNewListTransaction = addNewListTransaction;
//# sourceMappingURL=addNewList.js.map