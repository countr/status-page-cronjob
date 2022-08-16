import getCountrData from "./util/countr";
import { getInstatusComponents } from "./util/instatus/components";
import { getInstatusMetrics } from "./util/instatus/metrics";
import handleComponents from "./handlers/components";
import handleMetrics from "./handlers/metrics";

export const scheduleDelayMs = 1000 * 60 * 2;
export const outgoingRequestsPerSchedule = 40;

export default async function runSchedule(): Promise<void> {
  const [countrStats, countrPremiumStats, instatusComponents, instatusMetrics] = await Promise.all([
    getCountrData(),
    COUNTR_PREMIUM_API_ENDPOINT ? getCountrData(true) : false as const,
    getInstatusComponents().catch(() => null),
    getInstatusMetrics().catch(() => null),
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
    ...handleMetrics(countrStats, countrPremiumStats, instatusMetrics),
    ...countrPremiumStats ? handleComponents(countrPremiumStats, instatusComponents, true) : [],
    ...handleComponents(countrStats, instatusComponents),
  ];

  for (const request of requests.slice(0, outgoingRequestsPerSchedule)) await request();
}
