import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

export const addNewListTransaction = (
  moduleAddress?: string
): InputTransactionData => {
  return {
    data: {
      function: `${
        moduleAddress ? moduleAddress : process.env.VITE_MODULE_ADDRESS
      }::todolist::create_list`,
      functionArguments: [],
    },
  };
};
