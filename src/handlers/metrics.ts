import type Env from "../environment";
import type { CountrApiResponse, CountrApiShardData } from "../util/countr/types";
import type { InstatusMetric } from "../util/instatus/types";
import { addInstatusMetricDatapoint, createInstatusMetric } from "../util/instatus/metrics";

export const userMetricName = "Countr Users";
export const guildMetricName = "Countr Guilds";


export default function handleMetrics(
  countrData: CountrApiResponse | null,
  countrPremiumData: CountrApiResponse | false | null,
  metrics: InstatusMetric[],
  env: Env,
): Array<() => Promise<void>> {
  const updates: Array<() => Promise<void>> = [];
  const timestamp = Date.now();
  const metricsByName = new Map(metrics.map(metric => [normalizeName(metric.name), metric]));
  const allowMetricCreation = shouldAllowResourceCreation(env.INSTATUS_ALLOW_METRIC_CREATION);

  // only update existing metrics for users and guilds
  const userMetric = metricsByName.get(userMetricName);
  const guildMetric = metricsByName.get(guildMetricName);

  // to balance out the load being pushed to Instatus, we only update the metrics if the last datapoint is older than 1 hour
  // it also only updates one of the metrics instead of both, which is intentional to reduce the load
  if (userMetric && isLastDatapointOlderThan(userMetric.data, timestamp, 60 * 60 * 1000)) {
    const value = getUserCount(countrData?.shards ?? null) + getUserCount(countrPremiumData ? countrPremiumData.shards : null);
    if (value > 0) updates.push(() => addInstatusMetricDatapoint(userMetric.id, { timestamp, value }, env).then(() => void 0));
  } else if (guildMetric && isLastDatapointOlderThan(guildMetric.data, timestamp, 60 * 60 * 1000)) {
    const value = getGuildCount(countrData?.shards ?? null) + getGuildCount(countrPremiumData ? countrPremiumData.shards : null);
    if (value > 0) updates.push(() => addInstatusMetricDatapoint(guildMetric.id, { timestamp, value }, env).then(() => void 0));
  }

  // premium metrics get updated first, so that they are always up-to-date
  if (countrPremiumData) {
    for (const [clusterId, cluster] of Object.entries(countrPremiumData.clusters)) {
      const update = updateClusterMetrics(clusterId, cluster, countrPremiumData.shards, metricsByName, timestamp, env, allowMetricCreation, true);
      if (update) updates.push(update);
    }
  }

  // non-premium metrics are updated going round-robin
  if (countrData) {
    for (const [clusterId, cluster] of Object.entries(countrData.clusters)
      // filter out those clusters that have a metric with a recent datapoint
      .filter(([cId]) => {
        const clusterMetric = metricsByName.get(`Ping for Cluster ${cId}`);
        return typeof clusterMetric !== "undefined" && isLastDatapointOlderThan(clusterMetric.data, timestamp, 4.25 * 60 * 1000);
      })
      // the code below could be used to sort the clusters into ascending order by the last datapoint timestamp
      // however, the Instatus API does not guarantee live metrics data through their API, so we will instead
      // randomize the list and randomly pick out clusters to update. this flaw also affects the accuracy of the
      // filtering above, but it's not really a big deal
      // .sort((a, b) => {
      //   const aMetric = metrics.find(metric => metric.name === `Ping for Cluster ${a[0]}`);
      //   const bMetric = metrics.find(metric => metric.name === `Ping for Cluster ${b[0]}`);
      //   const aLastData = aMetric ? Math.max(...aMetric.data.map(datapoint => datapoint.timestamp)) : -1;
      //   const bLastData = bMetric ? Math.max(...bMetric.data.map(datapoint => datapoint.timestamp)) : -1;
      //   return aLastData - bLastData;
      // })
      .sort(() => Math.random() - 0.5)
      // limit to 3 clusters to avoid too many requests
      .slice(0, 3)
    ) {
      const update = updateClusterMetrics(clusterId, cluster, countrData.shards, metricsByName, timestamp, env, allowMetricCreation);
      if (update) updates.push(update);
    }
  }

  return updates;
}

function updateClusterMetrics(
  clusterId: string,
  cluster: CountrApiResponse["clusters"][string],
  shards: CountrApiResponse["shards"],
  metricsByName: Map<string, InstatusMetric>,
  timestamp: number,
  env: Env,
  allowMetricCreation: boolean,
  premium = false,
): (() => Promise<void>) | null {
  const metricName = `Ping for ${premium ? "Premium " : ""}Cluster ${clusterId}`;
  const pingMetric = metricsByName.get(metricName);
  const clusterShards = cluster.clusterShards.map(shard => shards[shard]).filter(Boolean) as CountrApiShardData[];
  const value = getPing(clusterShards);
  if (pingMetric) {
    if (value > 0) return () => addInstatusMetricDatapoint(pingMetric.id, { timestamp, value }, env).then(() => void 0);
  } else if (allowMetricCreation) {
    return () => createInstatusMetric({
      active: true,
      name: metricName,
      suffix: "ms",
      ...value > 0 ? { data: [{ timestamp, value }] } : {},
    }, env).then(() => void 0);
  }
  return null;
}

function getUserCount(shards: CountrApiResponse["shards"] | null): number {
  if (!shards) return 0;
  return Object.values(shards).reduce((a, b) => a + b.users, 0);
}

function getGuildCount(shards: CountrApiResponse["shards"] | null): number {
  if (!shards) return 0;
  return Object.values(shards).reduce((a, b) => a + b.guilds, 0);
}

function getPing(shards: CountrApiShardData[]): number {
  const pings = Object.values(shards)
    .map(shard => shard.ping)
    .filter(ping => Number.isFinite(ping) && ping > 0);
  if (pings.length === 0) return 0;
  return Math.max(...pings);
}

function normalizeName(name: InstatusMetric["name"]): string {
  return typeof name === "string" ? name : name.default;
}

function getLastDatapointTimestamp(datapoints: InstatusMetric["data"]): null | number {
  if (datapoints.length === 0) return null;
  return Math.max(...datapoints.map(datapoint => datapoint.timestamp));
}

function isLastDatapointOlderThan(datapoints: InstatusMetric["data"], timestamp: number, ageMs: number): boolean {
  const lastDatapoint = getLastDatapointTimestamp(datapoints);
  return lastDatapoint === null || lastDatapoint < timestamp - ageMs;
}

function shouldAllowResourceCreation(value: unknown): boolean {
  return typeof value === "string" && (value === "1" || value === "true");
}
