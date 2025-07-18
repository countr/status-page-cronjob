import type Env from "./environment";
import { scheduleDelayMs } from "./schedule";
import { getInstatusMetrics } from "./util/instatus/metrics";

export default async function sendDebugResponse(env: Env): Promise<Response> {
  const metrics = await getInstatusMetrics(env).catch(() => null);
  if (!metrics) return new Response("Failed to fetch instatus metrics", { status: 500 });

  const lastMetricTimestamp = Math.max(-1, ...metrics.flatMap(metric => metric.data.map(datapoint => datapoint.timestamp)));
  if (lastMetricTimestamp === -1) return new Response("Failed to find last metric datapoint", { status: 500 });

  const now = Date.now();
  const diff = now - lastMetricTimestamp;

  if (diff > scheduleDelayMs + 15 * 60 * 1000) return new Response(`Last metric datapoint is ${diff}ms old (poor)`, { status: 500 });

  return new Response(`Last metric datapoint is ${diff}ms old (healthy)`, { status: 200 });
}
