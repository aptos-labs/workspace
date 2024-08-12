import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const addNewListTransaction = (moduleAddress?: string): InputTransactionData => {
  console.log("process.env.VITE_MODULE_ADDRESS", process.env.VITE_MODULE_ADDRESS);
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.VITE_MODULE_ADDRESS}::todolist::create_list`,
      functionArguments: [],
    },
  };
};
