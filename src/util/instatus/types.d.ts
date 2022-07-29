export interface InstatusComponent {
  id: string;
  name: string;
  description: string;
  status: InstatusComponentStatus;
  order: number;
  group: InstatusComponentGroup | null;
}

export type InstatusComponentStatus =
  | "DEGRADEDPERFORMANCE"
  | "MAJOROUTAGE"
  | "MINOROUTAGE"
  | "OPERATIONAL"
  | "PARTIALOUTAGE"
  | "UNDERMAINTENANCE";

export interface InstatusComponentGroup {
  id: string;
  name: string;
  description: string | null;
  titled: string | null;
  closed: boolean;
  order: number;
}

export type InstatusComponentUpdate = Partial<Omit<InstatusComponent, "group" | "id">> & { grouped?: boolean; group?: string };

export type InstatusComponentBulkUpdate = InstatusComponentUpdate & Pick<InstatusComponent, "id">;

export interface InstatusMetric {
  id: string;
  name: string;
  active: boolean;
  order: number;
  suffix: string;
  lastDataAt?: number;
  data: InstatusMetricDatapoint[];
}

export interface InstatusMetricDatapoint {
  timestamp: number;
  value: number;
}

export type InstatusMetricUpdate = Partial<Omit<InstatusMetric, "id" | "lastDataAt">>;

export interface InstatusMetricBulkUpdateDatapoints {
  data: InstatusMetricDatapoint[];
}
