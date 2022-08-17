import { addInstatusMetricDatapoint, createInstatusMetric } from "../util/instatus/metrics";
import type { CountrApiResponse } from "../util/countr/types";
import type { InstatusMetric } from "../util/instatus/types";

export const userMetricName = "Countr Users";
export const guildMetricName = "Countr Guilds";
export const pingMetricName = "Countr Ping";
export const premiumPingMetricName = "Countr Premium Ping";

export default function handleMetrics(countrData: CountrApiResponse | null, countrPremiumData: CountrApiResponse | false | null, metrics: InstatusMetric[]): Array<() => Promise<void>> {
  const updates: Array<() => Promise<void>> = [];

  const userMetric = metrics.find(metric => metric.name === userMetricName) ?? void updates.push(() => createInstatusMetric({ name: "Countr Users", active: true, suffix: "" }).then(() => void 0));
  const guildMetric = metrics.find(metric => metric.name === guildMetricName) ?? void updates.push(() => createInstatusMetric({ name: "Countr Guilds", active: true, suffix: "" }).then(() => void 0));
  const pingMetric = metrics.find(metric => metric.name === pingMetricName) ?? void updates.push(() => createInstatusMetric({ name: "Countr Ping", active: true, suffix: "ms" }).then(() => void 0));
  const premiumPingMetric = countrPremiumData !== false && (metrics.find(metric => metric.name === premiumPingMetricName) || void updates.push(() => createInstatusMetric({ name: "Countr Premium Ping", active: true, suffix: "ms" }).then(() => void 0)));

  if (!userMetric || !guildMetric || !pingMetric || !premiumPingMetric && premiumPingMetric !== false) return updates;

  const timestamp = Date.now();

  for (const [metric, value] of [
    [userMetric, getUserCount(countrData?.shards ?? null) + getUserCount(countrPremiumData ? countrPremiumData.shards : null)],
    [guildMetric, getGuildCount(countrData?.shards ?? null) + getGuildCount(countrPremiumData ? countrPremiumData.shards : null)],
    [pingMetric, getAveragePing(countrData?.shards ?? null)],
    [premiumPingMetric, getAveragePing(countrPremiumData ? countrPremiumData.shards : null)],
  ] as Array<[InstatusMetric | false, number | null]>) {
    if (metric && value !== null) updates.push(() => addInstatusMetricDatapoint(metric.id, { timestamp, value }).then(() => void 0));
  }

  return updates;
}

function getUserCount(shards: CountrApiResponse["shards"] | null): number {
  if (!shards) return 0;
  return Object.values(shards).reduce((a, b) => a + b.users, 0);
}

function getGuildCount(shards: CountrApiResponse["shards"] | null): number {
  if (!shards) return 0;
  return Object.values(shards).reduce((a, b) => a + b.guilds, 0);
}

function getAveragePing(shards: CountrApiResponse["shards"] | null): number | null {
  if (!shards) return null;

  const pings = Object.values(shards).map(shard => shard.ping);
  return pings.reduce((a, b) => a + b, 0) / pings.length;
}
