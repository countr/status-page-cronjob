export interface InstatusComponent {
  description: string;
  group: InstatusComponentGroup | null;
  id: string;
  name: string;
  order: number;
  status: InstatusComponentStatus;
}

export type InstatusComponentStatus =
  | "DEGRADEDPERFORMANCE"
  | "MAJOROUTAGE"
  | "OPERATIONAL"
  | "PARTIALOUTAGE"
  | "UNDERMAINTENANCE";

export interface InstatusComponentGroup {
  closed: boolean;
  description: null | string;
  id: string;
  name: string;
  order: number;
  titled: null | string;
}

export type InstatusComponentUpdate = { group?: string; grouped?: boolean } & Partial<Omit<InstatusComponent, "group" | "id">>;

export type InstatusComponentBulkUpdate = InstatusComponentUpdate & Pick<InstatusComponent, "id">;

export interface InstatusMetric {
  active: boolean;
  data: InstatusMetricDatapoint[];
  id: string;
  name: string;
  order: number;
  suffix: string;
}

export interface InstatusMetricDatapoint {
  timestamp: number;
  value: number;
}

export type InstatusMetricUpdate = Partial<Omit<InstatusMetric, "id" | "lastDataAt">>;

export interface InstatusMetricBulkUpdateDatapoints {
  data: InstatusMetricDatapoint[];
}
