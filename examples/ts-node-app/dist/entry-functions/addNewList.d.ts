import { AccountAddressInput, InputGenerateTransactionPayloadData, InputGenerateTransactionOptions } from "@aptos-labs/ts-sdk";
export type InputTransactionData = {
    sender?: AccountAddressInput;
    data: InputGenerateTransactionPayloadData;
    options?: InputGenerateTransactionOptions;
};
export declare const addNewListTransaction: (moduleAddress?: string) => InputTransactionData;
//# sourceMappingURL=addNewList.d.ts.map