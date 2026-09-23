import { db, newId, nowIso } from "./db";
import { toContentItem } from "./mappers";
import { logAudit } from "./audit";
import { getAdapter } from "./platforms";

export async function runAutomationOnce(actor: "automation" | "manual") {
  const conn = await db();
  const now = nowIso();
  const results: Array<{ id: string; result: string }> = [];

  const due = await conn.execute({
    sql: `SELECT * FROM content_items
          WHERE status = 'approved' AND scheduled_at IS NOT NULL AND scheduled_at <= ?`,
    args: [now],
  });

  for (const row of due.rows) {
    const item = toContentItem(row);
    await conn.execute({
      sql: "UPDATE content_items SET status = 'scheduled' WHERE id = ?",
      args: [item.id],
    });

    const accountRes = await conn.execute({
      sql: "SELECT platform FROM accounts WHERE id = ?",
      args: [item.account_id],
    });
    const platform = String(accountRes.rows[0]?.platform ?? "other");
    const adapter = getAdapter(platform);
    const publishResult = await adapter.publish(item);

    if (publishResult.ok) {
      await conn.execute({
        sql: "UPDATE content_items SET status = 'posted', posted_at = ? WHERE id = ?",
        args: [nowIso(), item.id],
      });
      await logAudit({ action: "auto-posted", entityType: "content_item", entityId: item.id, actor });
      results.push({ id: item.id, result: "posted" });
    } else {
      await logAudit({
        action: "auto-scheduled",
        entityType: "content_item",
        entityId: item.id,
        detail: publishResult.reason,
        actor,
      });
      results.push({ id: item.id, result: `scheduled_only: ${publishResult.reason}` });
    }
  }

  const revenueCheck = await conn.execute(
    `SELECT
       SUM(CASE WHEN record_date >= date('now','-7 day') THEN revenue ELSE 0 END) AS recent,
       SUM(CASE WHEN record_date < date('now','-7 day') AND record_date >= date('now','-14 day') THEN revenue ELSE 0 END) AS previous
     FROM finance_records`
  );
  const recent = Number(revenueCheck.rows[0]?.recent ?? 0);
  const previous = Number(revenueCheck.rows[0]?.previous ?? 0);
  if (previous > 0 && recent < previous * 0.7) {
    await conn.execute({
      sql: `INSERT INTO alerts (id, alert_type, message, severity, resolved, created_at)
            VALUES (?, 'revenue_drop', ?, 'high', 0, ?)`,
      args: [
        newId("alt"),
        `Doanh thu 7 ngày gần nhất (${recent.toFixed(0)}) giảm hơn 30% so với 7 ngày trước (${previous.toFixed(0)}).`,
        nowIso(),
      ],
    });
    results.push({ id: "revenue-check", result: "alert_created" });
  }

  return { ranAt: now, processed: results };
}
