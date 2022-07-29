import type Status from "./status";

export interface CountrApiResponseData {
  shards: Record<string, {
    status: Status;
    guilds: number;
    cachedUsers: number;
    users: number;
    ping: number;
    loading: boolean;
  }>;
  guilds: number;
  cachedUsers: number;
  users: number;
  lastUpdate: number;
}

export type CountrApiResponse = CountrApiResponseData | Record<string, never>;
