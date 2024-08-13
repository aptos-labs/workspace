import {
  AccountAddressInput,
  InputGenerateTransactionPayloadData,
  InputGenerateTransactionOptions,
} from "@aptos-labs/ts-sdk";

export type InputTransactionData = {
  sender?: AccountAddressInput;
  data: InputGenerateTransactionPayloadData;
  options?: InputGenerateTransactionOptions;
};

export const addNewListTransaction = (
  moduleAddress?: string
): InputTransactionData => {
  return {
    data: {
      function: `${moduleAddress ? moduleAddress : process.env.MODULE_ADDRESS}::todolist::create_list`,
      functionArguments: [],
    },
  };
};
