import { addInstatusMetricDatapoint, createInstatusMetric } from "../util/instatus/metrics";
import type { CountrApiResponse } from "../util/countr/types";
import type { InstatusMetric } from "../util/instatus/types";

export const userMetricName = "Countr Users";
export const guildMetricName = "Countr Guilds";
export const pingMetricName = "Countr Ping";
export const premiumPingMetricName = "Countr Premium Ping";

export default async function handleMetrics(countrData: CountrApiResponse | null, countrPremiumData: CountrApiResponse | false | null, metrics: InstatusMetric[]): Promise<void> {
  const userMetric = metrics.find(metric => metric.name === userMetricName) ?? await createInstatusMetric({ name: "Countr Users", active: true, suffix: "" });
  const guildMetric = metrics.find(metric => metric.name === guildMetricName) ?? await createInstatusMetric({ name: "Countr Guilds", active: true, suffix: "" });
  const pingMetric = metrics.find(metric => metric.name === pingMetricName) ?? await createInstatusMetric({ name: "Countr Ping", active: true, suffix: "ms" });
  const premiumPingMetric = countrPremiumData !== false && (metrics.find(metric => metric.name === premiumPingMetricName) || await createInstatusMetric({ name: "Countr Premium Ping", active: true, suffix: "ms" }));

  const timestamp = Date.now();

  for (const [metric, value] of [
    [userMetric, (countrData?.users ?? 0) + (countrPremiumData ? countrPremiumData.users : 0)],
    [guildMetric, (countrData?.guilds ?? 0) + (countrPremiumData ? countrPremiumData.guilds : 0)],
    [pingMetric, get95thPercentilePing(countrData?.shards ?? null)],
    [premiumPingMetric, getAveragePing(countrPremiumData ? countrPremiumData.shards : null)],
  ] as Array<[InstatusMetric | false, number | null]>) {
    if (metric && value !== null) await addInstatusMetricDatapoint(metric.id, { timestamp, value });
  }
}

function getAveragePing(shards: CountrApiResponse["shards"] | null): number | null {
  if (!shards) return null;
  return Object.values(shards).reduce((a, b) => a + b.ping, 0) / Object.keys(shards).length;
}

function get95thPercentilePing(shards: CountrApiResponse["shards"] | null): number | null {
  if (!shards) return null;

  const pings = Object.values(shards).map(shard => shard.ping);
  pings.sort((a, b) => a - b);

  return pings[Math.floor(pings.length * 0.95)] ?? null;
}
