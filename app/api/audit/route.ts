import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toAuditLogEntry } from "@/lib/mappers";

export async function GET() {
  const conn = await db();
  const res = await conn.execute(
    "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 500"
  );
  return NextResponse.json(res.rows.map(toAuditLogEntry));
}
