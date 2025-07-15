import type { CountrApiResponse, CountrApiShardData } from "../util/countr/types";
import type { InstatusMetric } from "../util/instatus/types";
import { addInstatusMetricDatapoint, createInstatusMetric } from "../util/instatus/metrics";

export const userMetricName = "Countr Users";
export const guildMetricName = "Countr Guilds";


export default function handleMetrics(
  countrData: CountrApiResponse | null,
  countrPremiumData: CountrApiResponse | false | null,
  metrics: InstatusMetric[],
): Array<() => Promise<void>> {
  const updates: Array<() => Promise<void>> = [];
  const timestamp = Date.now();

  // only update existing metrics for users and guilds
  const userMetric = metrics.find(metric => metric.name === userMetricName);
  const guildMetric = metrics.find(metric => metric.name === guildMetricName);

  // to balance out the load being pushed to Instatus, we only update the metrics if the last datapoint is older than 1 hour
  // it also only updates one of the metrics instead of both, which is intentional to reduce the load
  if (userMetric && Math.max(...userMetric.data.map(datapoint => datapoint.timestamp)) > timestamp - 1000 * 60 * 60) {
    const value = getUserCount(countrData?.shards ?? null) + getUserCount(countrPremiumData ? countrPremiumData.shards : null);
    if (value > 0) updates.push(() => addInstatusMetricDatapoint(userMetric.id, { timestamp, value }).then(() => void 0));
  } else if (guildMetric && Math.max(...guildMetric.data.map(datapoint => datapoint.timestamp)) > timestamp - 1000 * 60 * 60) {
    const value = getGuildCount(countrData?.shards ?? null) + getGuildCount(countrPremiumData ? countrPremiumData.shards : null);
    if (value > 0) updates.push(() => addInstatusMetricDatapoint(guildMetric.id, { timestamp, value }).then(() => void 0));
  }

  // premium metrics get updated first, so that they are always up-to-date
  if (countrPremiumData) {
    for (const [clusterId, cluster] of Object.entries(countrPremiumData.clusters)) {
      const update = updateClusterMetrics(clusterId, cluster, countrPremiumData.shards, metrics, timestamp, true);
      if (update) updates.push(update);
    }
  }

  // non-premium metrics are updated going round-robin
  if (countrData) {
    for (const [clusterId, cluster] of Object.entries(countrData.clusters)
      // filter out those clusters that have a metric with a recent datapoint
      .filter(([cId]) => {
        const clusterMetric = metrics.find(metric => metric.name === `Ping for Cluster ${cId}`);
        return clusterMetric && Math.max(...clusterMetric.data.map(datapoint => datapoint.timestamp)) < timestamp - 1000 * 4.25 * 60;
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
      const update = updateClusterMetrics(clusterId, cluster, countrData.shards, metrics, timestamp);
      if (update) updates.push(update);
    }
  }

  return updates;
}

function updateClusterMetrics(clusterId: string, cluster: CountrApiResponse["clusters"][string], shards: CountrApiResponse["shards"], metrics: InstatusMetric[], timestamp: number, premium = false): (() => Promise<void>) | null {
  const metricName = `Ping for ${premium ? "Premium " : ""}Cluster ${clusterId}`;
  const pingMetric = metrics.find(metric => metric.name === metricName);
  const clusterShards = cluster.clusterShards.map(shard => shards[shard]).filter(Boolean) as CountrApiShardData[];
  const value = getAveragePing(clusterShards);
  if (pingMetric) {
    if (value > 0) return () => addInstatusMetricDatapoint(pingMetric.id, { timestamp, value }).then(() => void 0);
  } else {
    return () => createInstatusMetric({
      active: true,
      name: metricName,
      suffix: "ms",
      ...value > 0 ? { data: [{ timestamp, value }] } : {},
    }).then(() => void 0);
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

function getAveragePing(shards: CountrApiShardData[]): number {
  const pings = Object.values(shards)
    .map(shard => shard.ping)
    .filter(Boolean);
  return Math.ceil(pings.reduce((a, b) => a + b, 0) / pings.length);
}
