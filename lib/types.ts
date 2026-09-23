export type Platform = "tiktok" | "youtube" | "facebook" | "affiliate" | "other";

export type Account = {
  id: string;
  platform: Platform;
  name: string;
  role: string | null;
  goal: string | null;
  monetized: boolean;
  api_status: "not_connected" | "connected" | "error";
  created_at: string;
};

export type ContentStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "scheduled"
  | "posted"
  | "rejected";

export type ContentItem = {
  id: string;
  account_id: string;
  title: string;
  body: string | null;
  media_url: string | null;
  status: ContentStatus;
  scheduled_at: string | null;
  posted_at: string | null;
  created_at: string;
};

export type AutomationRule = {
  id: string;
  name: string;
  account_id: string | null;
  trigger_type: "schedule" | "on_approval" | "manual";
  config_json: string;
  enabled: boolean;
  last_run_at: string | null;
  created_at: string;
};

export type FinanceRecord = {
  id: string;
  account_id: string | null;
  record_date: string;
  revenue: number;
  cost: number;
  category: string | null;
  note: string | null;
  created_at: string;
};

export type AffiliateOrder = {
  id: string;
  account_id: string | null;
  product: string;
  commission: number;
  order_date: string;
  status: "pending" | "confirmed" | "paid" | "cancelled";
  created_at: string;
};

export type KpiSnapshot = {
  id: string;
  account_id: string;
  snapshot_date: string;
  followers: number;
  views: number;
  engagement_rate: number;
  created_at: string;
};

export type Asset = {
  id: string;
  account_id: string | null;
  name: string;
  asset_type: "image" | "video" | "caption" | "other";
  url: string | null;
  tags: string | null;
  created_at: string;
};

export type AuditLogEntry = {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  detail: string | null;
  created_at: string;
};

export type Alert = {
  id: string;
  alert_type: string;
  message: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
  created_at: string;
};
