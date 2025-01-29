import { ChildProcessByStdio, ChildProcessWithoutNullStreams } from "child_process";
import { Readable } from "stream";

export type NodeInfo = {
  process: ChildProcessByStdio<null, Readable, null>;
  rest_api_port: number;
  faucet_port: number;
  indexer_port: number;
};
