import { ChildProcessWithoutNullStreams } from "child_process";

export type NodeInfo = {
  process: ChildProcessWithoutNullStreams;
  rest_api_port: number;
  faucet_port: number;
  indexer_port: number;
};
