import type { Row } from "@libsql/client";
import type {
  Account,
  ContentItem,
  AutomationRule,
  FinanceRecord,
  AffiliateOrder,
  KpiSnapshot,
  Asset,
  AuditLogEntry,
  Alert,
} from "./types";

export function toAccount(r: Row): Account {
  return {
    id: String(r.id),
    platform: r.platform as Account["platform"],
    name: String(r.name),
    role: (r.role as string) ?? null,
    goal: (r.goal as string) ?? null,
    monetized: Number(r.monetized) === 1,
    api_status: r.api_status as Account["api_status"],
    created_at: String(r.created_at),
  };
}

export function toContentItem(r: Row): ContentItem {
  return {
    id: String(r.id),
    account_id: String(r.account_id),
    title: String(r.title),
    body: (r.body as string) ?? null,
    media_url: (r.media_url as string) ?? null,
    status: r.status as ContentItem["status"],
    scheduled_at: (r.scheduled_at as string) ?? null,
    posted_at: (r.posted_at as string) ?? null,
    created_at: String(r.created_at),
  };
}

export function toAutomationRule(r: Row): AutomationRule {
  return {
    id: String(r.id),
    name: String(r.name),
    account_id: (r.account_id as string) ?? null,
    trigger_type: r.trigger_type as AutomationRule["trigger_type"],
    config_json: String(r.config_json ?? "{}"),
    enabled: Number(r.enabled) === 1,
    last_run_at: (r.last_run_at as string) ?? null,
    created_at: String(r.created_at),
  };
}

export function toFinanceRecord(r: Row): FinanceRecord {
  return {
    id: String(r.id),
    account_id: (r.account_id as string) ?? null,
    record_date: String(r.record_date),
    revenue: Number(r.revenue),
    cost: Number(r.cost),
    category: (r.category as string) ?? null,
    note: (r.note as string) ?? null,
    created_at: String(r.created_at),
  };
}

export function toAffiliateOrder(r: Row): AffiliateOrder {
  return {
    id: String(r.id),
    account_id: (r.account_id as string) ?? null,
    product: String(r.product),
    commission: Number(r.commission),
    order_date: String(r.order_date),
    status: r.status as AffiliateOrder["status"],
    created_at: String(r.created_at),
  };
}

export function toKpiSnapshot(r: Row): KpiSnapshot {
  return {
    id: String(r.id),
    account_id: String(r.account_id),
    snapshot_date: String(r.snapshot_date),
    followers: Number(r.followers),
    views: Number(r.views),
    engagement_rate: Number(r.engagement_rate),
    created_at: String(r.created_at),
  };
}

export function toAsset(r: Row): Asset {
  return {
    id: String(r.id),
    account_id: (r.account_id as string) ?? null,
    name: String(r.name),
    asset_type: r.asset_type as Asset["asset_type"],
    url: (r.url as string) ?? null,
    tags: (r.tags as string) ?? null,
    created_at: String(r.created_at),
  };
}

export function toAuditLogEntry(r: Row): AuditLogEntry {
  return {
    id: String(r.id),
    actor: String(r.actor),
    action: String(r.action),
    entity_type: String(r.entity_type),
    entity_id: (r.entity_id as string) ?? null,
    detail: (r.detail as string) ?? null,
    created_at: String(r.created_at),
  };
}

export function toAlert(r: Row): Alert {
  return {
    id: String(r.id),
    alert_type: String(r.alert_type),
    message: String(r.message),
    severity: r.severity as Alert["severity"],
    resolved: Number(r.resolved) === 1,
    created_at: String(r.created_at),
  };
}
