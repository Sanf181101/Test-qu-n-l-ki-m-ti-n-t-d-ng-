import { NextRequest, NextResponse } from "next/server";
import { db, newId, nowIso } from "@/lib/db";
import { toAutomationRule } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const conn = await db();
  const res = await conn.execute(
    "SELECT * FROM automation_rules ORDER BY created_at DESC"
  );
  return NextResponse.json(res.rows.map(toAutomationRule));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, account_id, trigger_type, config_json } = body ?? {};

  if (!name || !trigger_type) {
    return NextResponse.json(
      { error: "Thiếu 'name' hoặc 'trigger_type'." },
      { status: 400 }
    );
  }

  const conn = await db();
  const id = newId("rule");
  const created_at = nowIso();
  await conn.execute({
    sql: `INSERT INTO automation_rules
          (id, name, account_id, trigger_type, config_json, enabled, last_run_at, created_at)
          VALUES (?, ?, ?, ?, ?, 1, NULL, ?)`,
    args: [id, name, account_id ?? null, trigger_type, config_json ?? "{}", created_at],
  });
  await logAudit({ action: "create", entityType: "automation_rule", entityId: id, detail: name });

  return NextResponse.json({ id }, { status: 201 });
}
