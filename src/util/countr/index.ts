import type { CountrApiResponse } from "./types";

export default function getCountrData(premium = false): Promise<CountrApiResponse | null> {
  return fetch(premium ? COUNTR_PREMIUM_API_ENDPOINT! : COUNTR_API_ENDPOINT, { cf: { cacheTtl: 0 } })
    .then(res => res.json<CountrApiResponse>())
    .catch(() => null);
}
