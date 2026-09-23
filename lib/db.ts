import { createClient, type Client } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

// DATABASE_URL:
//   - "file:local.db"  -> chạy local, không cần tài khoản gì (mặc định)
//   - "libsql://xxx.turso.io" -> Turso free tier khi deploy lên Vercel
// Đổi qua lại chỉ cần sửa biến môi trường, KHÔNG cần sửa code.
const url = process.env.DATABASE_URL || "file:local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    client = createClient(authToken ? { url, authToken } : { url });
  }
  return client;
}

async function ensureSchema(): Promise<void> {
  const db = getClient();
  const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await db.execute(statement);
  }
}

// Gọi hàm này ở đầu mỗi API route trước khi truy vấn.
// CREATE TABLE IF NOT EXISTS nên gọi nhiều lần vô hại; Promise được cache
// để không chạy lặp lại trong cùng 1 lần cold start.
export async function db(): Promise<Client> {
  if (!schemaReady) {
    schemaReady = ensureSchema();
  }
  await schemaReady;
  return getClient();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
