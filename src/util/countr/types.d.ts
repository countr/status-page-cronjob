import type Status from "./status";

export interface CountrApiResponse {
  clusters: Record<string, CountrApiClusterData>;
  shards: Record<string, CountrApiShardData>;
}

export interface CountrApiShardData {
  guilds: number;
  ping: number;
  readyTimestamp: number;
  status: Status;
  updateTimestamp: number;
  users: number;
}

export interface CountrApiClusterData {
  clusterMemory: number;
  clusterShards: number[];
  pingTimestamp: number;
  startTimestamp: number;
}
