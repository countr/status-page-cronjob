import type Env from "../../environment";
import type { CountrApiResponse } from "./types";

export default function getCountrData(env: Env, premium = false): Promise<CountrApiResponse | null> {
  return env[premium ? "COUNTR_PREMIUM_VPC_SERVICE" : "COUNTR_VPC_SERVICE"]
    .fetch(premium ? env.COUNTR_PREMIUM_API_ENDPOINT! : env.COUNTR_API_ENDPOINT, { cf: { cacheTtl: 0 } })
    .then(res => res.json<CountrApiResponse>())
    .catch(() => null);
}
