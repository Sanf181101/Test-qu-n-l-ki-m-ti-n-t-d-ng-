"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";

type Health = {
  db: string;
  latencyMs?: number;
  databaseUrl?: string;
  automationSecretConfigured?: boolean;
  message?: string;
};

export default function SettingsPage() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth);
  }, []);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings &amp; System Health</h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          API key và mật khẩu KHÔNG được cấu hình trong giao diện — luôn đặt qua biến môi trường (xem README.md) để
          không lộ khi commit lên GitHub.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Kết nối cơ sở dữ liệu" value={health?.db === "connected" ? "Bình thường" : "Lỗi"} />
        <StatCard label="Độ trễ DB" value={health?.latencyMs !== undefined ? `${health.latencyMs} ms` : "—"} />
        <StatCard label="Nguồn dữ liệu" value={health?.databaseUrl ?? "—"} />
        <StatCard
          label="Secret cho Automation"
          value={health?.automationSecretConfigured ? "Đã cấu hình" : "Chưa cấu hình"}
        />
      </div>

      <section className="rounded-2xl border border-border dark:border-border-dark p-4 text-sm">
        <h2 className="mb-2 font-display text-base font-semibold">Biến môi trường cần thiết</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted dark:text-muted-dark">
          <li><code>APP_USER</code>, <code>APP_PASSWORD</code> — đăng nhập vào toàn bộ web app</li>
          <li><code>DATABASE_URL</code> — mặc định <code>file:local.db</code>, đổi sang Turso khi deploy</li>
          <li><code>DATABASE_AUTH_TOKEN</code> — chỉ cần khi dùng Turso</li>
          <li><code>AUTOMATION_SECRET</code> — để GitHub Actions gọi được endpoint tự động hóa</li>
        </ul>
      </section>
    </div>
  );
}
