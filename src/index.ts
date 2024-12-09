import sendDebugResponse from "./debug";
import runSchedule from "./schedule";

// main cronjob
addEventListener("scheduled", event => {
  testEnvironment();
  return event.waitUntil(runSchedule());
});

// debug
addEventListener("fetch", event => {
  testEnvironment(event);
  event.respondWith(sendDebugResponse());
});

function testEnvironment(event?: FetchEvent) {
  try {
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    COUNTR_API_ENDPOINT;
    COUNTR_PREMIUM_API_ENDPOINT;
    INSTATUS_API_KEY;
    INSTATUS_PAGE_ID;
    /* eslint-enable @typescript-eslint/no-unused-expressions */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    if (event) event.respondWith(new Response("Invalid environment variables", { status: 500 }));
    // eslint-disable-next-line no-console
    return console.log("Invalid environment variables");
  }
}
