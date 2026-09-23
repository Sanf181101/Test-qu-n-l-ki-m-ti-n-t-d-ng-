import { NextRequest, NextResponse } from "next/server";
import { db, newId, nowIso } from "@/lib/db";
import { toContentItem } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const conn = await db();
  const res = await conn.execute(
    "SELECT * FROM content_items ORDER BY created_at DESC"
  );
  return NextResponse.json(res.rows.map(toContentItem));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, title, body: content, media_url, scheduled_at } = body ?? {};

  if (!account_id || !title) {
    return NextResponse.json(
      { error: "Thiếu 'account_id' hoặc 'title'." },
      { status: 400 }
    );
  }

  const conn = await db();
  const id = newId("cnt");
  const created_at = nowIso();
  // Mọi nội dung mới đều bắt đầu ở trạng thái "draft" — phải qua Approval Gate
  // (đổi sang pending_approval rồi approved) mới được phép lên lịch/đăng.
  await conn.execute({
    sql: `INSERT INTO content_items
          (id, account_id, title, body, media_url, status, scheduled_at, posted_at, created_at)
          VALUES (?, ?, ?, ?, ?, 'draft', ?, NULL, ?)`,
    args: [id, account_id, title, content ?? null, media_url ?? null, scheduled_at ?? null, created_at],
  });
  await logAudit({ action: "create", entityType: "content_item", entityId: id, detail: title });

  return NextResponse.json({ id }, { status: 201 });
}
