import type Env from "../../environment";
import type { InstatusMetric, InstatusMetricDatapoint, InstatusMetricUpdate } from "./types";
import fetchInstatusEndpoint from "./baseFetcher";

export async function getInstatusMetrics(env: Env): Promise<InstatusMetric[]> {
  const metrics: InstatusMetric[] = [];
  let page = 1;
  // eslint-disable-next-line no-useless-assignment -- this variable is used in the loop condition
  let fetchedMetrics: InstatusMetric[] = [];
  do {
    fetchedMetrics = await fetchInstatusEndpoint<InstatusMetric[]>(1, "GET", `/metrics?page=${page}&per_page=100`, env);
    metrics.push(...fetchedMetrics);
    page += 1;
  } while (fetchedMetrics.length === 100);

  return metrics;
}

export function createInstatusMetric(metric: InstatusMetricUpdate, env: Env): Promise<InstatusMetric> {
  return fetchInstatusEndpoint(1, "POST", "/metrics", env, metric);
}

export function deleteInstatusMetric(metricId: string, env: Env): Promise<void> {
  return fetchInstatusEndpoint(1, "DELETE", `/metrics/${metricId}`, env).then(() => void 0);
}

export function addInstatusMetricDatapoint(metricId: string, datapoint: InstatusMetricDatapoint, env: Env): Promise<void> {
  return fetchInstatusEndpoint(1, "POST", `/metrics/${metricId}/data`, env, { data: [datapoint] }).then(() => void 0);
}
