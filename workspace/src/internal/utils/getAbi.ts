import fs from "fs";

export async function getContractInterface(
  moduleAddress: string
): Promise<string> {
  //

  const url = `http://localhost:8080/v1/accounts/${moduleAddress}/module/todolist`;
  const response = await fetch(url);
  const data = await response.json();
  const abi = data.abi;
  const abiString = `export const ${"todolist".toUpperCase()}_ABI = ${JSON.stringify(abi)} as const;`;
  return abiString;
}
