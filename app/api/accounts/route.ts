import { NextRequest, NextResponse } from "next/server";
import { db, newId, nowIso } from "@/lib/db";
import { toAccount } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const conn = await db();
  const res = await conn.execute("SELECT * FROM accounts ORDER BY created_at DESC");
  return NextResponse.json(res.rows.map(toAccount));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { platform, name, role, goal } = body ?? {};

  if (!platform || !name) {
    return NextResponse.json(
      { error: "Thiếu 'platform' hoặc 'name'." },
      { status: 400 }
    );
  }

  const conn = await db();
  const id = newId("acc");
  const created_at = nowIso();
  await conn.execute({
    sql: `INSERT INTO accounts (id, platform, name, role, goal, monetized, api_status, created_at)
          VALUES (?, ?, ?, ?, ?, 0, 'not_connected', ?)`,
    args: [id, platform, name, role ?? null, goal ?? null, created_at],
  });
  await logAudit({ action: "create", entityType: "account", entityId: id, detail: name });

  return NextResponse.json({ id }, { status: 201 });
}
