import type Status from "./status";

export interface CountrApiResponse {
  shards: Record<string, CountrApiShardData>;
  clusters: Record<string, CountrApiClusterData>;
}

export interface CountrApiShardData {
  guilds: number;
  users: number;
  ping: number;
  stats: Status;
  readyTimestamp: number;
  updateTimestamp: number;
}

export interface CountrApiClusterData {
  clusterShards: number[];
  clusterMemory: number;
  startTimestamp: number;
  pingTimestamp: number;
}
