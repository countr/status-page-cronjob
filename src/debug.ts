import { scheduleDelayMs } from "./schedule";
import { getInstatusMetrics } from "./util/instatus/metrics";

export default async function sendDebugResponse(): Promise<Response> {
  const metrics = await getInstatusMetrics().catch(() => null);
  if (!metrics) return new Response("Failed to fetch instatus metrics", { status: 500 });

  const lastMetricTimestamp = metrics
    .reduce<number[]>((a, b) => [...a, ...b.data.map(datapoint => datapoint.timestamp)], [])
    .sort((a, b) => b - a)
    .find(Boolean);
  if (!lastMetricTimestamp) return new Response("Failed to find last metric datapoint", { status: 500 });

  const now = Date.now();
  const diff = now - lastMetricTimestamp;

  if (diff > scheduleDelayMs + 300_000) return new Response(`Last metric datapoint is ${diff}ms old (poor)`, { status: 500 });

  return new Response(`Last metric datapoint is ${diff}ms old (healthy)`, { status: 200 });
}
