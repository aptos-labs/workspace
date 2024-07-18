import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const addNewTaskTransaction = (task: string, moduleAddress?: string): InputTransactionData => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : import.meta.env.VITE_MODULE_ADDRESS}::todolist::create_task`,
      functionArguments: [task],
    },
  };
};
