# Money Accounts Manager

Web app cá nhân để quản lý & tự động hóa các tài khoản kiếm tiền số: nội dung
(TikTok, YouTube, Facebook...) và affiliate/bán sản phẩm số. Xây theo tôn chỉ
**"Mai quyết định — hệ thống thực hiện"**: mọi hành động công khai (đăng bài,
đổi trạng thái) đều qua bước duyệt thủ công.

100% miễn phí ở Phase 1 (dùng cá nhân, không thương mại).

## Tech stack

| Thành phần | Công nghệ |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Database | libsql — chạy file local hoặc Turso (free) khi deploy |
| Tự động hóa theo lịch | GitHub Actions (thay n8n, không cần server 24/7) |
| Hosting | Vercel Hobby (free) |
| Đăng nhập | Basic Auth 1 người dùng (nhẹ, đủ dùng cho công cụ cá nhân) |

## Chạy local

```bash
npm install
cp .env.example .env.local
# Mở .env.local, đổi APP_USER / APP_PASSWORD / AUTOMATION_SECRET
npm run dev
```

Mở http://localhost:3000 — trình duyệt sẽ hỏi user/password (Basic Auth) theo
giá trị bạn đặt trong `.env.local`. Database mặc định là file `local.db` tạo
tự động trong thư mục dự án — không cần cài gì thêm.

## Kiểm tra trước khi dùng thật

```bash
npm run typecheck   # kiểm tra kiểu TypeScript
npm run build       # build production, bắt lỗi runtime sớm
```

## Deploy miễn phí lên Vercel + Turso

1. Đẩy code lên GitHub (repo có thể để Private).
2. Tạo database free tại https://turso.tech → lấy `DATABASE_URL` và
   `DATABASE_AUTH_TOKEN`.
3. Vào https://vercel.com → Import repo GitHub này → ở phần Environment
   Variables, thêm đủ 5 biến trong `.env.example` (dùng giá trị Turso thật
   cho `DATABASE_URL`/`DATABASE_AUTH_TOKEN`).
4. Deploy. Vercel Hobby free cho web cá nhân/phi thương mại — đúng mục đích
   dùng ở đây.

## Bật tự động hóa theo lịch (GitHub Actions)

1. Vào repo trên GitHub → Settings → Secrets and variables → Actions.
2. Thêm 2 secret:
   - `APP_URL` — domain Vercel của bạn, vd `https://money-accounts-manager.vercel.app`
   - `AUTOMATION_SECRET` — **giống hệt** giá trị đã đặt trên Vercel
3. Workflow ở `.github/workflows/automation.yml` sẽ tự chạy mỗi giờ. Có thể
   bấm chạy tay ở tab **Actions** trên GitHub (nút "Run workflow").
4. Cũng có thể bấm nút **"Chạy ngay"** trực tiếp trong trang Automation Engine
   của web app — không cần đợi tới giờ.

## Về việc đăng bài thật lên TikTok / YouTube

`lib/platforms/index.ts` định nghĩa adapter cho từng nền tảng. **Mặc định các
adapter CHƯA gọi API thật** — chúng chỉ trả về "chưa cấu hình" và giữ nội
dung ở trạng thái `scheduled` để bạn tự đăng thủ công. Lý do:

- **TikTok Content Posting API** cần app được TikTok duyệt (audit) mới đăng
  công khai được; trước đó chỉ đăng ở chế độ Private/Draft.
- **YouTube Data API v3** có quota free 10.000 unit/ngày (~6 video upload/ngày).

Khi app của bạn được duyệt, cắm code gọi API thật vào từng adapter tương ứng
trong `lib/platforms/index.ts` — không cần sửa gì ở API route hay giao diện.

## Cấu trúc dự án

```
app/
  page.tsx               Dashboard
  accounts/               Account Hub
  content/                Content Queue (có Approval Gate)
  automation/             Automation Engine
  finance/                Finance & P&L
  affiliate/              Affiliate / bán sản phẩm số
  kpi/                    KPI Dashboard
  assets/                 Asset Library
  import/                 Import Center (CSV)
  audit/                  Audit Log (chỉ đọc)
  alerts/                 Alerts
  settings/               Settings & System Health
  api/                    Toàn bộ API route (REST, JSON)
components/               UI dùng chung (Modal, DataTable, Toast, ...)
lib/                      DB client, types, automation runner, platform adapters
.github/workflows/        Lịch tự động hóa (GitHub Actions)
```

## Khả năng tiếp cận (accessibility) đã áp dụng

Dự án này sửa các lỗi từng phát hiện khi audit KMO Pro v2.0:

- Bảng màu (`tailwind.config.ts`) được tính sẵn để đạt tối thiểu 4.5:1 tương
  phản ở **cả hai** theme sáng/tối.
- Mọi nút chỉ có icon (`IconButton`) bắt buộc phải có `label` → sinh `aria-label`.
- Modal (`components/Modal.tsx`) có phím Escape để đóng, focus trap, tự động
  focus khi mở.
- Xác nhận xóa dùng `ConfirmInline` (2 bước, ngay tại chỗ) thay vì
  `window.confirm()`.
- Toast dùng `aria-live="polite"`, không chặn thao tác.
- Bảng dữ liệu dùng `<table>`/`<caption>`/`scope="col"` đúng ngữ nghĩa.
- Có skip-link, landmark `nav`/`header`/`main` rõ ràng.
- Nút bấm tối thiểu 44×44px (`class .tap-target`).

## Việc còn để ngỏ (Phase 2+)

- Kết nối API thật cho TikTok/YouTube khi app được duyệt
- Content Repurposing (1 bài gốc → nhiều bản) — hiện chưa có màn hình riêng
- Đa người dùng / RBAC nếu sau này cần chia sẻ cho người khác quản lý cùng
