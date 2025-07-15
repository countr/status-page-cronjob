import type { InstatusComponent, InstatusComponentBulkUpdate, InstatusComponentUpdate } from "./types";
import fetchInstatusEndpoint from "./baseFetcher";

export async function getInstatusComponents(): Promise<InstatusComponent[]> {
  const components: InstatusComponent[] = [];
  let page = 1;
  // eslint-disable-next-line no-useless-assignment -- this isn't useless
  let fetchedComponents: InstatusComponent[] = [];
  do {
    fetchedComponents = await fetchInstatusEndpoint<InstatusComponent[]>(1, "GET", `/components?page=${page}&per_page=100`);
    components.push(...fetchedComponents);
    page += 1;
  } while (fetchedComponents.length === 100);
  return components;
}

export function createInstatusComponent(component: InstatusComponentUpdate): Promise<InstatusComponent> {
  return fetchInstatusEndpoint(1, "POST", "/components", component);
}

export function deleteInstatusComponent(componentId: string): Promise<void> {
  return fetchInstatusEndpoint(1, "DELETE", `/components/${componentId}`).then(() => void 0);
}

export function updateInstatusComponent(componentId: string, component: InstatusComponentUpdate): Promise<InstatusComponent> {
  return fetchInstatusEndpoint(1, "PUT", `/components/${componentId}`, component);
}

export function bulkUpdateInstatusComponents(components: InstatusComponentBulkUpdate[]): Promise<void> {
  return fetchInstatusEndpoint(1, "PUT", "/components", { updates: components }).then(() => void 0);
}
