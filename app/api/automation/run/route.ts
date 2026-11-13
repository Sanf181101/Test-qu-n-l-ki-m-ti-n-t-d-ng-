import { NextRequest, NextResponse } from "next/server";
import { runAutomationOnce } from "@/lib/automationRunner";

// Endpoint này được GitHub Actions gọi theo lịch (xem .github/workflows/automation.yml).
// KHÔNG đi qua middleware Basic Auth (xem matcher trong middleware.ts) vì cron không
// đăng nhập được — thay vào đó bắt buộc có secret riêng.
function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.AUTOMATION_SECRET;
  if (!expected) return false; // an toàn mặc định: chưa cấu hình secret thì luôn từ chối
  const provided = req.headers.get("x-automation-secret") ?? "";
  // So sánh thời gian không đổi để chống timing attack.
  const len = Math.max(provided.length, expected.length);
  let diff = provided.length ^ expected.length;
  for (let i = 0; i < len; i++) {
    diff |= (provided.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runAutomationOnce("automation");
  return NextResponse.json(result);
}
