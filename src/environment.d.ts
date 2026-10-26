export default interface Env extends Cloudflare.Env {
  COUNTR_API_ENDPOINT: string;
  COUNTR_PREMIUM_API_ENDPOINT: string | undefined;
  INSTATUS_ALLOW_COMPONENT_CREATION?: string;
  INSTATUS_ALLOW_METRIC_CREATION?: string;
  INSTATUS_API_KEY: string;
  INSTATUS_PAGE_ID: string;
}
