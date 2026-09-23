import { db, newId, nowIso } from "./db";

export async function logAudit(params: {
  action: string;
  entityType: string;
  entityId?: string;
  detail?: string;
  actor?: string;
}): Promise<void> {
  const conn = await db();
  await conn.execute({
    sql: `INSERT INTO audit_log (id, actor, action, entity_type, entity_id, detail, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      newId("aud"),
      params.actor ?? "mai",
      params.action,
      params.entityType,
      params.entityId ?? null,
      params.detail ?? null,
      nowIso(),
    ],
  });
}
