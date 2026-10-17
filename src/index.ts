import type Env from "./environment";
import sendDebugResponse from "./debug";
import runSchedule from "./schedule";

export default {
  scheduled(_, env, ctx) { ctx.waitUntil(runSchedule(env)); },
  fetch(_, env) { return sendDebugResponse(env); },
} satisfies ExportedHandler<Env>;
