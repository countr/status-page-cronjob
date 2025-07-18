import type Env from "./environment";
import sendDebugResponse from "./debug";
import runSchedule from "./schedule";

export default {
  scheduled(_, env) { return runSchedule(env); },
  fetch(_, env) { return sendDebugResponse(env); },
} as ExportedHandler<Env>;
