import { NextRequest, NextResponse } from "next/server";

// Vì đây là web app cá nhân public trên Vercel free tier, cần một lớp xác thực
// tối thiểu để không ai có link cũng vào được dữ liệu/thao tác được.
// Basic Auth là lựa chọn nhẹ nhất cho 1 người dùng — không cần thêm dịch vụ nào.

// Giới hạn đăng nhập sai theo IP: tối đa MAX_FAILS lần trong WINDOW_MS, sau đó bị khóa.
// Lưu ý: bộ nhớ này nằm trong từng instance serverless nên chỉ là lớp giảm thiểu,
// không phải rào chắn tuyệt đối — vẫn cần APP_PASSWORD đủ mạnh (>= 16 ký tự).
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; first: number }>();

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function isLocked(ip: string, now: number): boolean {
  const rec = fails.get(ip);
  if (!rec) return false;
  if (now - rec.first > WINDOW_MS) {
    fails.delete(ip);
    return false;
  }
  return rec.count >= MAX_FAILS;
}

function recordFail(ip: string, now: number) {
  const rec = fails.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    fails.set(ip, { count: 1, first: now });
  } else {
    rec.count += 1;
  }
  // Tránh phình bộ nhớ.
  if (fails.size > 1000) {
    for (const [k, v] of fails) if (now - v.first > WINDOW_MS) fails.delete(k);
  }
}

// So sánh chuỗi theo thời gian không phụ thuộc vị trí ký tự sai (chống timing attack).
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

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

  const now = Date.now();
  const ip = clientIp(req);
  if (isLocked(ip, now)) {
    return new NextResponse("Đăng nhập sai quá nhiều lần. Thử lại sau 15 phút.", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) },
    });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice(6);
    let decoded = "";
    try {
      decoded = atob(encoded);
    } catch {
      decoded = "";
    }
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex >= 0) {
      const providedUser = decoded.slice(0, separatorIndex);
      const providedPass = decoded.slice(separatorIndex + 1);
      const userOk = safeEqual(providedUser, user);
      const passOk = safeEqual(providedPass, pass);
      if (userOk && passOk) {
        fails.delete(ip);
        return NextResponse.next();
      }
    }
    recordFail(ip, now);
  }

  return new NextResponse("Yêu cầu đăng nhập.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Money Accounts Manager"' },
  });
}

export const config = {
  matcher: ["/((?!api/automation/run|_next/static|_next/image|favicon.ico).*)"],
};
