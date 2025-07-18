import type Env from "../environment";
import type { CountrApiClusterData, CountrApiResponse } from "../util/countr/types";
import type { InstatusComponent, InstatusComponentStatus, InstatusComponentUpdate } from "../util/instatus/types";
import Status from "../util/countr/status";
import { createInstatusComponent, updateInstatusComponent } from "../util/instatus/components";

export default function handleComponents(countrData: CountrApiResponse | null, components: InstatusComponent[], env: Env, premium = false): Array<() => Promise<void>> {
  const clusters = countrData?.clusters ?? {};
  const shards = countrData?.shards ?? {};

  const updates: Array<() => Promise<void>> = [];

  // filter components after "(Premium) Cluster NUMBER" and go through these
  for (const component of components.filter(({ name }) => (premium ? /^Premium Cluster (\d+)$/u : /^Cluster (\d+)$/u).exec(name))) {
    // get cluster number from the end of component.name
    const clusterId = (/\d+$/u).exec(component.name)?.[0] ?? "";
    const cluster = clusters[clusterId] ?? null;

    const update = formUpdate(cluster, shards, component);
    if (update) updates.push(() => updateInstatusComponent(component.id, update, env).then(() => void 0));
  }

  // create or update cluster components
  for (const [clusterId, cluster] of Object.entries(clusters)) {
    const clusterName = `${premium ? "Premium " : ""}Cluster ${clusterId}`;
    const component = components.find(({ name }) => name === clusterName);
    if (component) {
      const update = formUpdate(cluster, shards, component);
      if (update) updates.push(() => updateInstatusComponent(component.id, update, env).then(() => void 0));
    } else {
      // create new cluster component
      const groupName = premium ? "Countr Premium" : "Countr";
      const group = components.find(({ name }) => name === groupName);
      if (group) {
        updates.push(() => createInstatusComponent({
          name: clusterName,
          grouped: true,
          group: group.id,
          ...formUpdate(cluster, shards),
        }, env).then(() => void 0));
      }
    }
  }

  return updates;
}

function formUpdate(cluster: CountrApiResponse["clusters"][string] | null, shards: CountrApiResponse["shards"], existingComponent: Partial<InstatusComponent> = {}): InstatusComponentUpdate | null {
  const update: InstatusComponentUpdate = {};

  const [status, description = ""] = getUpdates(cluster, shards);
  if (status !== existingComponent.status) update.status = status;
  if (description !== (existingComponent.description ?? "")) update.description = description;

  return Object.keys(update).length ? update : null;
}


// eslint-disable-next-line complexity
function getUpdates(cluster: CountrApiClusterData | null, shards: CountrApiResponse["shards"]): [InstatusComponentStatus, string?] {
  if (!cluster) return ["MAJOROUTAGE", "Cluster is unavailable"];
  let status: InstatusComponentStatus = "OPERATIONAL";

  const shardPings = cluster.clusterShards.map(shardId => shards[shardId]?.ping ?? null).filter(ping => ping !== null);
  const averagePing = shardPings.length > 0 ? Math.round(shardPings.reduce((a, b) => a + b, 0) / shardPings.length) : null;
  if (averagePing === null) return ["MAJOROUTAGE", "Cluster is misconfigured"];
  if (averagePing > 250) return ["DEGRADEDPERFORMANCE", `Average ping: ${averagePing}ms (elevated)`];

  const shardsWithDeviatingStatuses = cluster.clusterShards.filter(shardId => {
    const shard = shards[shardId];
    return !shard || ![
      Status.Idle,
      Status.Nearly,
      Status.Ready,
      Status.Reconnecting,
      Status.Resuming,
    ].includes(shard.status);
  });

  if (shardsWithDeviatingStatuses.length > 0) {
    const sortedByStatus: Partial<Record<Status, number[]>> = {};
    for (const shardId of shardsWithDeviatingStatuses) {
      const shard = shards[shardId];
      sortedByStatus[shard?.status ?? Status.Disconnected] ??= [];
      sortedByStatus[shard?.status ?? Status.Disconnected]!.push(shardId);
    }

    const totalShards = cluster.clusterShards.length;
    const disconnectedShards = sortedByStatus[Status.Disconnected]?.length ?? 0;
    const connectingShards = shardsWithDeviatingStatuses.length - disconnectedShards;

    if (connectingShards / totalShards > 0.25 || disconnectedShards > 0) status = "PARTIALOUTAGE";
    if (disconnectedShards / totalShards > 0.25) status = "MAJOROUTAGE";

    const description = [
      disconnectedShards > 0 ? `${disconnectedShards}/${totalShards} shards offline` : "",
      connectingShards > 0 ? `${connectingShards}/${totalShards} shards recovering` : "",
      totalShards > disconnectedShards + connectingShards ? `${totalShards - disconnectedShards - connectingShards}/${totalShards} shards operational` : "",
    ].filter(Boolean).join(", ");
    return [status, description];
  }

  if (cluster.clusterShards.length === 1) return ["OPERATIONAL", "Single-sharded, operational"];
  return ["OPERATIONAL", `Shards ${Math.min(...cluster.clusterShards)}-${Math.max(...cluster.clusterShards)}, all operational`];
}
