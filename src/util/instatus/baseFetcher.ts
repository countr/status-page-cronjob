export default async function fetchInstatusEndpoint<ResponseData extends object>(method: Request["method"], path: "" | `/${string}`, data?: object): Promise<ResponseData> {
  const response = await fetch(`https://api.instatus.com/v1/${INSTATUS_PAGE_ID}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${INSTATUS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cf: { cacheTtl: 0 },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    if (retryAfter) {
      // eslint-disable-next-line no-console
      console.log("Rate limited, retrying after", retryAfter);
      await new Promise(resolve => {
        setTimeout(resolve, Number(retryAfter) * 1000);
      });
      return fetchInstatusEndpoint(method, path, data);
    }
  }

  // eslint-disable-next-line no-console
  console.log(method, path, "-", response.status);

  return response.json();
}
