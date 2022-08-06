import type { InstatusComponent, InstatusComponentBulkUpdate, InstatusComponentStatus, InstatusComponentUpdate } from "../util/instatus/types";
import type { CountrApiResponse } from "../util/countr/types";
import Status from "../util/countr/status";
import { createInstatusComponent } from "../util/instatus/components";

export default async function handleComponents(countrData: CountrApiResponse | null, components: InstatusComponent[], premium = false): Promise<void> {
  const shards = countrData?.shards ?? {};

  const updates: InstatusComponentBulkUpdate[] = [];

  // filter components after "(Premium) Shard NUMBER" and go through these
  for (const component of components.filter(({ name }) => (premium ? /^Premium Shard (\d+)$/u : /^Shard (\d+)$/u).exec(name))) {
    // get shard number from end of component.name
    const number = (/\d+$/u).exec(component.name)?.[0] ?? "";
    const shard = shards[number] ?? null;

    const update = formUpdate(shard, component);
    if (update) updates.push({ id: component.id, ...update });
  }

  // bulk update components
  // if (updates.length) await bulkUpdateInstatusComponents(updates);
  // i've contacted ali (instatus) about this issue, currently it's not working

  // create new components
  for (const [shardId, shard] of Object.entries(shards)) {
    const component = components.find(({ name }) => name === `${premium ? "Premium " : ""}Shard ${shardId}`);
    if (!component) {
      await createInstatusComponent({
        name: `${premium ? "Premium " : ""}Shard ${shardId}`,
        grouped: true,
        group: premium ? "Countr Premium" : "Countr",
        ...formUpdate(shard),
      });
    }
  }
}

function formUpdate(shard: CountrApiResponse["shards"][string] | null, existingComponent: Partial<InstatusComponent> = {}): InstatusComponentUpdate | null {
  const update: InstatusComponentUpdate = {};

  if (shard?.status === Status.Ready) {
    const description = `${shard.guilds} guilds, ${shard.users} users, ${shard.ping}ms ping`;
    if (existingComponent.description !== description) update.description = description;
    if (existingComponent.status !== "OPERATIONAL") update.status = "OPERATIONAL";
  } else {
    if (existingComponent.description !== "") update.description = "";
    const status = getStatus(shard?.status ?? Status.Disconnected);
    if (existingComponent.status !== status) update.status = status;
  }

  return Object.keys(update).length ? update : null;
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition */
function getStatus(status: Status): InstatusComponentStatus {
  if (status === Status.Ready) return "DEGRADEDPERFORMANCE";
  if (status === Status.Connecting) return "PARTIALOUTAGE";
  if (status === Status.Reconnecting) return "DEGRADEDPERFORMANCE";
  if (status === Status.Idle) return "PARTIALOUTAGE";
  if (status === Status.Nearly) return "DEGRADEDPERFORMANCE";
  if (status === Status.Disconnected) return "MAJOROUTAGE";
  if (status === Status.WaitingForGuilds) return "PARTIALOUTAGE";
  if (status === Status.Identifying) return "PARTIALOUTAGE";
  if (status === Status.Resuming) return "DEGRADEDPERFORMANCE";
  return "UNDERMAINTENANCE";
}
/* eslint-enable @typescript-eslint/no-unnecessary-condition */
