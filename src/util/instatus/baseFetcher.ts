import type Env from "../../environment";

export default async function fetchInstatusEndpoint<ResponseData extends object>(version: 1 | 2, method: Request["method"], path: "" | `/${string}`, env: Env, data?: object): Promise<ResponseData> {
  const response = await fetch(`https://api.instatus.com/v${version}/${env.INSTATUS_PAGE_ID}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${env.INSTATUS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cf: { cacheTtl: 0 },
  });

  if (response.status === 429) {
    void response.body?.cancel();
    throw new Error("Rate limit exceeded for Instatus API");
  }

  // eslint-disable-next-line no-console
  console.log(method, path, "-", response.status);

  return response.json();
}
