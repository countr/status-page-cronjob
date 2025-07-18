import type Env from "../../environment";
import type { InstatusMetric, InstatusMetricDatapoint, InstatusMetricUpdate } from "./types";
import fetchInstatusEndpoint from "./baseFetcher";

export function getInstatusMetrics(env: Env): Promise<InstatusMetric[]> {
  return fetchInstatusEndpoint(1, "GET", "/metrics", env);
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
