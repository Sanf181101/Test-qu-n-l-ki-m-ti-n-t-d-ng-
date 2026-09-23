import { NextRequest, NextResponse } from "next/server";

// Vì đây là web app cá nhân public trên Vercel free tier, cần một lớp xác thực
// tối thiểu để không ai có link cũng vào được dữ liệu/thao tác được.
// Basic Auth là lựa chọn nhẹ nhất cho 1 người dùng — không cần thêm dịch vụ nào.
export function middleware(req: NextRequest) {
  const user = process.env.APP_USER;
  const pass = process.env.APP_PASSWORD;

  if (!user || !pass) {
    // Chưa cấu hình mật khẩu -> chặn hẳn thay vì mở toang không xác thực.
    return new NextResponse(
      "Chưa cấu hình APP_USER / APP_PASSWORD trong biến môi trường. Xem README.md.",
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice(6);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const providedUser = decoded.slice(0, separatorIndex);
    const providedPass = decoded.slice(separatorIndex + 1);
    if (providedUser === user && providedPass === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Yêu cầu đăng nhập.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Money Accounts Manager"' },
  });
}

export const config = {
  matcher: ["/((?!api/automation/run|_next/static|_next/image|favicon.ico).*)"],
};
