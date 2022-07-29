export default function fetchInstatusEndpoint<ResponseData extends object>(method: Request["method"], path: "" | `/${string}`, data?: object): Promise<ResponseData> {
  return fetch(`https://api.instatus.com/v1/${INSTATUS_PAGE_ID}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${INSTATUS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(res => res.json<ResponseData>());
}
