import { NextRequest, NextResponse } from "next/server";
import { db, newId, nowIso } from "@/lib/db";
import { toAffiliateOrder } from "@/lib/mappers";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const conn = await db();
  const res = await conn.execute(
    "SELECT * FROM affiliate_orders ORDER BY order_date DESC"
  );
  return NextResponse.json(res.rows.map(toAffiliateOrder));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, product, commission, order_date, status } = body ?? {};

  if (!product || !order_date) {
    return NextResponse.json(
      { error: "Thiếu 'product' hoặc 'order_date'." },
      { status: 400 }
    );
  }

  const conn = await db();
  const id = newId("ord");
  await conn.execute({
    sql: `INSERT INTO affiliate_orders
          (id, account_id, product, commission, order_date, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      account_id ?? null,
      product,
      Number(commission ?? 0),
      order_date,
      status ?? "pending",
      nowIso(),
    ],
  });
  await logAudit({ action: "create", entityType: "affiliate_order", entityId: id, detail: product });

  return NextResponse.json({ id }, { status: 201 });
}
