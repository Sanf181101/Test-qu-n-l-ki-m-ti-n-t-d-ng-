import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const conn = await db();

  const fields: string[] = [];
  const args: Array<string | number | null> = [];
  for (const key of ["platform", "name", "role", "goal", "api_status"] as const) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(body[key]);
    }
  }
  if (body.monetized !== undefined) {
    fields.push("monetized = ?");
    args.push(body.monetized ? 1 : 0);
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: "Không có gì để cập nhật." }, { status: 400 });
  }
  args.push(id);
  await conn.execute({
    sql: `UPDATE accounts SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  await logAudit({ action: "update", entityType: "account", entityId: id });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conn = await db();
  await conn.execute({ sql: "DELETE FROM accounts WHERE id = ?", args: [id] });
  await logAudit({ action: "delete", entityType: "account", entityId: id });
  return NextResponse.json({ ok: true });
}
