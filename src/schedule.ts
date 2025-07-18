import type Env from "./environment";
import handleComponents from "./handlers/components";
import handleMetrics from "./handlers/metrics";
import getCountrData from "./util/countr/index";
import { getInstatusComponents } from "./util/instatus/components";
import { getInstatusMetrics } from "./util/instatus/metrics";

export const scheduleDelayMs = 1 * 60 * 1000;
export const outgoingRequestsPerSchedule = 40;

export default async function runSchedule(env: Env): Promise<void> {
  const [countrStats, countrPremiumStats, instatusComponents, instatusMetrics] = await Promise.all([
    getCountrData(env),
    env.COUNTR_PREMIUM_API_ENDPOINT ? getCountrData(env, true) : false as const,
    getInstatusComponents(env).catch(() => null),
    getInstatusMetrics(env).catch(() => null),
  ]);

  if (!countrStats || countrPremiumStats === null || !instatusComponents || !instatusMetrics) {
    // eslint-disable-next-line no-console
    console.log(`Fetching failed for ${
      Object.entries({ countrStats, countrPremiumStats, instatusComponents, instatusMetrics })
        .filter(([, value]) => !value)
        .map(([key]) => key)
        .join(", ")
    }`);
  }

  if (!instatusComponents || !instatusMetrics) throw new Error("Failed to fetch instatus components or metrics");

  const requests = [
    ...countrPremiumStats ? handleComponents(countrPremiumStats, instatusComponents, env, true) : [],
    ...handleComponents(countrStats, instatusComponents, env),
    ...handleMetrics(countrStats, countrPremiumStats, instatusMetrics, env),
  ];

  for (const request of requests.slice(0, outgoingRequestsPerSchedule)) await request();
}
