import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const completeTaskTransaction = (taskId: string, moduleAddress?: string): InputTransactionData => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : import.meta.env.VITE_MODULE_ADDRESS}::todolist::complete_task`,
      functionArguments: [taskId],
    },
  };
};
