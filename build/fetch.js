import { getInstatusMetrics } from "./util/instatus/metrics";
import { pingMetricName } from "./handlers/metrics";
import { scheduleDelayMs } from "./schedule";
export default async function debug() {
    const metrics = await getInstatusMetrics().catch(() => null);
    if (!metrics)
        return new Response("Failed to fetch instatus metrics", { status: 500 });
    const pingMetric = metrics.find(metric => metric.name === pingMetricName);
    if (!pingMetric)
        return new Response("Failed to find ping metric", { status: 500 });
    const timestamp = pingMetric.lastDataAt;
    if (!timestamp)
        return new Response("Failed to find ping metric last data timestamp", { status: 500 });
    const now = Date.now();
    const diff = now - timestamp;
    if (diff > scheduleDelayMs * 2)
        return new Response(`Ping metric last data timestamp is ${diff}ms old (poor)`, { status: 500 });
    return new Response(`Ping metric last data timestamp is ${diff}ms old (healthy)`, { status: 200 });
}
