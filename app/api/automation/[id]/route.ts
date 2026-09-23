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
  for (const key of ["name", "account_id", "trigger_type", "config_json"] as const) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(body[key]);
    }
  }
  if (body.enabled !== undefined) {
    fields.push("enabled = ?");
    args.push(body.enabled ? 1 : 0);
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: "Không có gì để cập nhật." }, { status: 400 });
  }
  args.push(id);
  await conn.execute({
    sql: `UPDATE automation_rules SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  await logAudit({
    action: body.enabled !== undefined ? (body.enabled ? "enable" : "disable") : "update",
    entityType: "automation_rule",
    entityId: id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conn = await db();
  await conn.execute({ sql: "DELETE FROM automation_rules WHERE id = ?", args: [id] });
  await logAudit({ action: "delete", entityType: "automation_rule", entityId: id });
  return NextResponse.json({ ok: true });
}
