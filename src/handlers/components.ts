import Status from "../util/countr/status";
import type { CountrApiResponse, CountrApiShardData } from "../util/countr/types";
import { createInstatusComponent, updateInstatusComponent } from "../util/instatus/components";
import type { InstatusComponent, InstatusComponentStatus, InstatusComponentUpdate } from "../util/instatus/types";

export default function handleComponents(countrData: CountrApiResponse | null, components: InstatusComponent[], premium = false): Array<() => Promise<void>> {
  const shards = countrData?.shards ?? {};

  const updates: Array<() => Promise<void>> = [];

  // filter components after "(Premium) Shard NUMBER" and go through these
  for (const component of components.filter(({ name }) => (premium ? /^Premium Shard (\d+)$/u : /^Shard (\d+)$/u).exec(name))) {
    // get shard number from end of component.name
    const number = (/\d+$/u).exec(component.name)?.[0] ?? "";
    const shard = shards[number] ?? null;

    const update = formUpdate(shard, component);
    if (update) updates.push(() => updateInstatusComponent(component.id, update).then(() => void 0));
  }

  // create new components
  for (const [shardId, shard] of Object.entries(shards)) {
    const component = components.find(({ name }) => name === `${premium ? "Premium " : ""}Shard ${shardId}`);
    if (!component) {
      updates.push(() => createInstatusComponent({
        name: `${premium ? "Premium " : ""}Shard ${shardId}`,
        grouped: true,
        group: components.find(({ name }) => name === (premium ? "Countr Premium" : "Countr"))!.id,
        ...formUpdate(shard),
      // eslint-disable-next-line no-console
      }).then(() => console.log(`Created component for ${premium ? "Countr Premium" : "Countr"} shard ${shardId}`)));
    }
  }

  return updates;
}

function formUpdate(shard: CountrApiResponse["shards"][string] | null, existingComponent: Partial<InstatusComponent> = {}): InstatusComponentUpdate | null {
  const update: InstatusComponentUpdate = {};

  const [status, description = ""] = getUpdates(shard);
  if (status !== existingComponent.status) update.status = status;
  if (description !== (existingComponent.description ?? "")) update.description = description;

  return Object.keys(update).length ? update : null;
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
function getUpdates(shard: CountrApiShardData | null): [InstatusComponentStatus, string?] {
  const status = shard?.status ?? Status.Disconnected;
  const ping = Math.ceil(shard?.ping ?? 0);

  if (status === Status.Ready) {
    if (ping < 250) return ["OPERATIONAL"];
    if (ping < 1000) return ["OPERATIONAL", `High ping of ${ping}ms`];
    return ["DEGRADEDPERFORMANCE", `High ping of ${ping}ms`];
  }
  if (status === Status.Connecting) return ["PARTIALOUTAGE", "Connecting"];
  if (status === Status.Reconnecting) return ["DEGRADEDPERFORMANCE", "Reconnecting"];
  if (status === Status.Idle) return ["PARTIALOUTAGE", "Connection is idle"];
  if (status === Status.Nearly) return ["DEGRADEDPERFORMANCE", "Connecting"];
  if (status === Status.Disconnected) return ["MAJOROUTAGE", "Disconnected"];
  if (status === Status.WaitingForGuilds) return ["PARTIALOUTAGE", "Waiting for guilds"];
  if (status === Status.Identifying) return ["PARTIALOUTAGE", "Identifying"];
  if (status === Status.Resuming) return ["DEGRADEDPERFORMANCE", "Resuming connection"];
  return ["UNDERMAINTENANCE", "Unknown status"];
}
/* eslint-enable @typescript-eslint/no-unnecessary-condition */
