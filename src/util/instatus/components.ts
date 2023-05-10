import fetchInstatusEndpoint from "./baseFetcher";
import type { InstatusComponent, InstatusComponentBulkUpdate, InstatusComponentUpdate } from "./types";

export async function getInstatusComponents(): Promise<InstatusComponent[]> {
  const components: InstatusComponent[] = [];
  let page = 1;
  let fetchedComponents: InstatusComponent[] = [];
  do {
    fetchedComponents = await fetchInstatusEndpoint<InstatusComponent[]>("GET", `/components?page=${page}&per_page=100}`);
    components.push(...fetchedComponents);
    page += 1;
  } while (fetchedComponents.length === 100);
  return components;
}

export function createInstatusComponent(component: InstatusComponentUpdate): Promise<InstatusComponent> {
  return fetchInstatusEndpoint("POST", "/components", component);
}

export function deleteInstatusComponent(componentId: string): Promise<void> {
  return fetchInstatusEndpoint("DELETE", `/components/${componentId}`).then(() => void 0);
}

export function updateInstatusComponent(componentId: string, component: InstatusComponentUpdate): Promise<InstatusComponent> {
  return fetchInstatusEndpoint("PUT", `/components/${componentId}`, component);
}

export function bulkUpdateInstatusComponents(components: InstatusComponentBulkUpdate[]): Promise<void> {
  return fetchInstatusEndpoint("PUT", "/components", { updates: components }).then(() => void 0);
}
