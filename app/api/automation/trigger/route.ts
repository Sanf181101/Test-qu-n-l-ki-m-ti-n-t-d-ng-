import { NextResponse } from "next/server";
import { runAutomationOnce } from "@/lib/automationRunner";

// Route này nằm sau middleware Basic Auth (không nằm trong danh sách loại trừ ở
// middleware.ts) nên không cần secret riêng — chỉ Mai đăng nhập được mới gọi được.
export async function POST() {
  const result = await runAutomationOnce("manual");
  return NextResponse.json(result);
}
