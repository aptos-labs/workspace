import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const aptosConfig = new AptosConfig({ network: Network.LOCAL });
export const aptos = new Aptos(aptosConfig);

export const getAptosClient = () => {
  return aptos;
};
