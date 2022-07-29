import type { InstatusComponent, InstatusComponentBulkUpdate, InstatusComponentUpdate } from "./types";
import fetchInstatusEndpoint from "./baseFetcher";

export function getInstatusComponents(): Promise<InstatusComponent[]> {
  return fetchInstatusEndpoint("GET", "/components");
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
