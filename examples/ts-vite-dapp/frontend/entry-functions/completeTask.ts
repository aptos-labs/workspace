import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const completeTaskTransaction = (taskId: string, moduleAddress?: string): InputTransactionData => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.VITE_MODULE_ADDRESS}::todolist::complete_task`,
      functionArguments: [taskId],
    },
  };
};
