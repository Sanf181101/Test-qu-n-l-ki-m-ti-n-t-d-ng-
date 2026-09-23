import { NextRequest, NextResponse } from "next/server";
import { db, newId, nowIso } from "@/lib/db";
import { toAsset } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const conn = await db();
  const res = await conn.execute("SELECT * FROM assets ORDER BY created_at DESC");
  return NextResponse.json(res.rows.map(toAsset));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, name, asset_type, url, tags } = body ?? {};

  if (!name) {
    return NextResponse.json({ error: "Thiếu 'name'." }, { status: 400 });
  }

  const conn = await db();
  const id = newId("ast");
  await conn.execute({
    sql: `INSERT INTO assets (id, account_id, name, asset_type, url, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, account_id ?? null, name, asset_type ?? "other", url ?? null, tags ?? null, nowIso()],
  });
  await logAudit({ action: "create", entityType: "asset", entityId: id, detail: name });

  return NextResponse.json({ id }, { status: 201 });
}
