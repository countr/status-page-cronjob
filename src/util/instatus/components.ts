import type Env from "../../environment";
import type { InstatusComponent, InstatusComponentBulkUpdate, InstatusComponentUpdate } from "./types";
import fetchInstatusEndpoint from "./baseFetcher";

export async function getInstatusComponents(env: Env): Promise<InstatusComponent[]> {
  const components: InstatusComponent[] = [];
  let page = 1;
  // eslint-disable-next-line no-useless-assignment -- this isn't useless
  let fetchedComponents: InstatusComponent[] = [];
  do {
    fetchedComponents = await fetchInstatusEndpoint<InstatusComponent[]>(1, "GET", `/components?page=${page}&per_page=100`, env);
    components.push(...fetchedComponents);
    page += 1;
  } while (fetchedComponents.length === 100);
  return components;
}

export function createInstatusComponent(component: InstatusComponentUpdate, env: Env): Promise<InstatusComponent> {
  return fetchInstatusEndpoint(1, "POST", "/components", env, component);
}

export function deleteInstatusComponent(componentId: string, env: Env): Promise<void> {
  return fetchInstatusEndpoint(1, "DELETE", `/components/${componentId}`, env).then(() => void 0);
}

export function updateInstatusComponent(componentId: string, component: InstatusComponentUpdate, env: Env): Promise<InstatusComponent> {
  return fetchInstatusEndpoint(1, "PUT", `/components/${componentId}`, env, component);
}

export function bulkUpdateInstatusComponents(components: InstatusComponentBulkUpdate[], env: Env): Promise<void> {
  return fetchInstatusEndpoint(1, "PUT", "/components", env, { updates: components }).then(() => void 0);
}
