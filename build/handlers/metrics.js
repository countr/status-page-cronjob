import { addInstatusMetricDatapoint, createInstatusMetric } from "../util/instatus/metrics";
export const userMetricName = "Countr Users";
export const guildMetricName = "Countr Guilds";
export const pingMetricName = "Countr Ping";
export const premiumPingMetricName = "Countr Premium Ping";
export default async function handleMetrics(countrData, countrPremiumData, metrics) {
    const userMetric = metrics.find(metric => metric.name === userMetricName) ?? await createInstatusMetric({ name: "Countr Users", active: true, suffix: "" });
    const guildMetric = metrics.find(metric => metric.name === guildMetricName) ?? await createInstatusMetric({ name: "Countr Guilds", active: true, suffix: "" });
    const pingMetric = metrics.find(metric => metric.name === pingMetricName) ?? await createInstatusMetric({ name: "Countr Ping", active: true, suffix: "ms" });
    const premiumPingMetric = countrPremiumData !== false && (metrics.find(metric => metric.name === premiumPingMetricName) || await createInstatusMetric({ name: "Countr Premium Ping", active: true, suffix: "ms" }));
    const users = (countrData?.users ?? 0) + (countrPremiumData ? countrPremiumData.users : 0);
    const guilds = (countrData?.guilds ?? 0) + (countrPremiumData ? countrPremiumData.guilds : 0);
    const timestamp = Date.now();
    for (const [metric, value] of [
        [userMetric, users],
        [guildMetric, guilds],
        [pingMetric, getAveragePing(countrData?.shards ?? null)],
        [premiumPingMetric, getAveragePing(countrPremiumData ? countrPremiumData.shards : null)],
    ]) {
        if (metric)
            await addInstatusMetricDatapoint(metric.id, { timestamp, value });
    }
}
function getAveragePing(shards) {
    if (!shards)
        return 0;
    return Object.values(shards).reduce((a, b) => a + b.ping, 0) / Object.keys(shards).length;
}
