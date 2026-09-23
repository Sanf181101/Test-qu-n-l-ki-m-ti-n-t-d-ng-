import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (body.resolved === undefined) {
    return NextResponse.json({ error: "Thiếu 'resolved'." }, { status: 400 });
  }
  const conn = await db();
  await conn.execute({
    sql: "UPDATE alerts SET resolved = ? WHERE id = ?",
    args: [body.resolved ? 1 : 0, id],
  });
  await logAudit({
    action: body.resolved ? "resolve" : "reopen",
    entityType: "alert",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
