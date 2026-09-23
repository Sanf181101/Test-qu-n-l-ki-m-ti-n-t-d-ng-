import { NextRequest, NextResponse } from "next/server";
import { db, newId, nowIso } from "@/lib/db";
import { toFinanceRecord } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const conn = await db();
  const res = await conn.execute(
    "SELECT * FROM finance_records ORDER BY record_date DESC"
  );
  return NextResponse.json(res.rows.map(toFinanceRecord));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, record_date, revenue, cost, category, note } = body ?? {};

  if (!record_date) {
    return NextResponse.json({ error: "Thiếu 'record_date'." }, { status: 400 });
  }

  const conn = await db();
  const id = newId("fin");
  await conn.execute({
    sql: `INSERT INTO finance_records
          (id, account_id, record_date, revenue, cost, category, note, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      account_id ?? null,
      record_date,
      Number(revenue ?? 0),
      Number(cost ?? 0),
      category ?? null,
      note ?? null,
      nowIso(),
    ],
  });
  await logAudit({ action: "create", entityType: "finance_record", entityId: id });

  return NextResponse.json({ id }, { status: 201 });
}
