import sendDebugResponse from "./debug";
import runSchedule from "./schedule";

export default {
  scheduled() { return testEnvironment() ?? runSchedule(); },
  fetch() { return testEnvironment() ?? sendDebugResponse(); },
} as ExportedHandler;

function testEnvironment(): null | Response {
  try {
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    COUNTR_API_ENDPOINT;
    COUNTR_PREMIUM_API_ENDPOINT;
    INSTATUS_API_KEY;
    INSTATUS_PAGE_ID;
    /* eslint-enable @typescript-eslint/no-unused-expressions */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log("Invalid environment variables");
    return new Response("Invalid environment variables", { status: 500 });
  }

  return null;
}
