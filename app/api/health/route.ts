import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const startedAt = Date.now();
  try {
    const conn = await db();
    await conn.execute("SELECT 1");
    const latencyMs = Date.now() - startedAt;
    return NextResponse.json({
      db: "connected",
      latencyMs,
      databaseUrl: process.env.DATABASE_URL ? "configured" : "file:local.db (default)",
      automationSecretConfigured: Boolean(process.env.AUTOMATION_SECRET),
    });
  } catch (err) {
    return NextResponse.json(
      { db: "error", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
