import fetchInstatusEndpoint from "./baseFetcher";
export function getInstatusMetrics() {
    return fetchInstatusEndpoint("GET", "/metrics");
}
export function createInstatusMetric(metric) {
    return fetchInstatusEndpoint("POST", "/metrics", metric);
}
export function deleteInstatusMetric(metricId) {
    return fetchInstatusEndpoint("DELETE", `/metrics/${metricId}`).then(() => void 0);
}
export function addInstatusMetricDatapoint(metricId, datapoint) {
    return fetchInstatusEndpoint("POST", `/metrics/${metricId}/data`, { data: [datapoint] }).then(() => void 0);
}
