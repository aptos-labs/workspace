import { InputTransactionData } from "./addNewList";

export const addNewTaskTransaction = (
  task: string,
  moduleAddress?: string
): InputTransactionData => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::create_task`,
      functionArguments: [task],
    },
  };
};
