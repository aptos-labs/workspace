import { InputTransactionData } from "./addNewList";

export const completeTaskTransaction = (
  taskId: string,
  moduleAddress?: string
): InputTransactionData => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::complete_task`,
      functionArguments: [taskId],
    },
  };
};
