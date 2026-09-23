import { NextRequest, NextResponse } from "next/server";
import { db, newId, nowIso } from "@/lib/db";
import { toKpiSnapshot } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const conn = await db();
  const res = await conn.execute(
    "SELECT * FROM kpi_snapshots ORDER BY snapshot_date DESC"
  );
  return NextResponse.json(res.rows.map(toKpiSnapshot));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, snapshot_date, followers, views, engagement_rate } = body ?? {};

  if (!account_id || !snapshot_date) {
    return NextResponse.json(
      { error: "Thiếu 'account_id' hoặc 'snapshot_date'." },
      { status: 400 }
    );
  }

  const conn = await db();
  const id = newId("kpi");
  await conn.execute({
    sql: `INSERT INTO kpi_snapshots
          (id, account_id, snapshot_date, followers, views, engagement_rate, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      account_id,
      snapshot_date,
      Number(followers ?? 0),
      Number(views ?? 0),
      Number(engagement_rate ?? 0),
      nowIso(),
    ],
  });
  await logAudit({ action: "create", entityType: "kpi_snapshot", entityId: id });

  return NextResponse.json({ id }, { status: 201 });
}
