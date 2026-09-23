import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toAlert } from "@/lib/mappers";

export async function GET() {
  const conn = await db();
  const res = await conn.execute(
    "SELECT * FROM alerts ORDER BY created_at DESC LIMIT 200"
  );
  return NextResponse.json(res.rows.map(toAlert));
}
