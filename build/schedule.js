import getCountrData from "./util/countr";
import { getInstatusComponents } from "./util/instatus/components";
import { getInstatusMetrics } from "./util/instatus/metrics";
import handleComponents from "./handlers/components";
import handleMetrics from "./handlers/metrics";
export const scheduleDelayMs = 1000 * 60 * 2;
export default async function runSchedule() {
    const [countrStats, countrPremiumStats, instatusComponents, instatusMetrics] = await Promise.all([
        getCountrData(),
        COUNTR_PREMIUM_API_ENDPOINT ? getCountrData(true) : false,
        getInstatusComponents().catch(() => null),
        getInstatusMetrics().catch(() => null),
    ]);
    if (!countrStats || countrPremiumStats === null || !instatusComponents || !instatusMetrics) {
        // eslint-disable-next-line no-console
        console.log(`Fetching failed for ${Object.entries({ countrStats, countrPremiumStats, instatusComponents, instatusMetrics })
            .filter(([, value]) => !value)
            .map(([key]) => key)
            .join(", ")}`);
    }
    if (!instatusComponents || !instatusMetrics)
        throw new Error("Failed to fetch instatus components or metrics");
    await handleComponents(countrStats, instatusComponents);
    await handleMetrics(countrStats, countrPremiumStats, instatusMetrics);
}
