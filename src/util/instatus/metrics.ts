import type { InstatusMetric, InstatusMetricDatapoint, InstatusMetricUpdate } from "./types";
import fetchInstatusEndpoint from "./baseFetcher";

export function getInstatusMetrics(): Promise<InstatusMetric[]> {
  return fetchInstatusEndpoint(1, "GET", "/metrics");
}

export function createInstatusMetric(metric: InstatusMetricUpdate): Promise<InstatusMetric> {
  return fetchInstatusEndpoint(1, "POST", "/metrics", metric);
}

export function deleteInstatusMetric(metricId: string): Promise<void> {
  return fetchInstatusEndpoint(1, "DELETE", `/metrics/${metricId}`).then(() => void 0);
}

export function addInstatusMetricDatapoint(metricId: string, datapoint: InstatusMetricDatapoint): Promise<void> {
  return fetchInstatusEndpoint(1, "POST", `/metrics/${metricId}/data`, { data: [datapoint] }).then(() => void 0);
}
