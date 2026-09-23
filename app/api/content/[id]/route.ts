import { NextRequest, NextResponse } from "next/server";
import { db, nowIso } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import type { ContentStatus } from "@/lib/types";

const ALLOWED_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  draft: ["pending_approval"],
  pending_approval: ["approved", "rejected", "draft"],
  approved: ["scheduled", "rejected"],
  scheduled: ["posted", "approved"],
  posted: [],
  rejected: ["draft"],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const conn = await db();

  if (body.status) {
    const current = await conn.execute({
      sql: "SELECT status FROM content_items WHERE id = ?",
      args: [id],
    });
    const currentStatus = current.rows[0]?.status as ContentStatus | undefined;
    if (!currentStatus) {
      return NextResponse.json({ error: "Không tìm thấy nội dung." }, { status: 404 });
    }
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `Không thể chuyển từ '${currentStatus}' sang '${body.status}'.` },
        { status: 400 }
      );
    }
    const postedAt = body.status === "posted" ? nowIso() : null;
    await conn.execute({
      sql:
        body.status === "posted"
          ? "UPDATE content_items SET status = ?, posted_at = ? WHERE id = ?"
          : "UPDATE content_items SET status = ? WHERE id = ?",
      args:
        body.status === "posted"
          ? [body.status, postedAt, id]
          : [body.status, id],
    });
    await logAudit({
      action: `status:${body.status}`,
      entityType: "content_item",
      entityId: id,
      detail: body.reason ?? undefined,
    });
    return NextResponse.json({ ok: true });
  }

  const fields: string[] = [];
  const args: Array<string | number | null> = [];
  for (const key of ["title", "body", "media_url", "scheduled_at"] as const) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(body[key]);
    }
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: "Không có gì để cập nhật." }, { status: 400 });
  }
  args.push(id);
  await conn.execute({
    sql: `UPDATE content_items SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  await logAudit({ action: "update", entityType: "content_item", entityId: id });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conn = await db();
  await conn.execute({ sql: "DELETE FROM content_items WHERE id = ?", args: [id] });
  await logAudit({ action: "delete", entityType: "content_item", entityId: id });
  return NextResponse.json({ ok: true });
}
