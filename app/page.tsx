"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ListChecks, Wallet, BellRing } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import type { Account, ContentItem, FinanceRecord, Alert as AlertT } from "@/lib/types";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [finance, setFinance] = useState<FinanceRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [a, c, f, al] = await Promise.all([
          fetch("/api/accounts").then((r) => r.json()),
          fetch("/api/content").then((r) => r.json()),
          fetch("/api/finance").then((r) => r.json()),
          fetch("/api/alerts").then((r) => r.json()),
        ]);
        if (!cancelled) {
          setAccounts(a);
          setContent(c);
          setFinance(f);
          setAlerts(al);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalRevenue = finance.reduce((sum, f) => sum + f.revenue, 0);
  const pendingApproval = content.filter((c) => c.status === "pending_approval").length;
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Tổng quan điều hành</h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          Trạng thái các tài khoản kiếm tiền và nội dung đang chờ xử lý.
        </p>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">
          Đang tải dữ liệu…
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Tài khoản đang quản lý" value={String(accounts.length)} icon={<Users className="h-4 w-4" />} />
            <StatCard label="Nội dung chờ duyệt" value={String(pendingApproval)} icon={<ListChecks className="h-4 w-4" />} />
            <StatCard
              label="Tổng doanh thu ghi nhận"
              value={totalRevenue.toLocaleString("vi-VN")}
              icon={<Wallet className="h-4 w-4" />}
            />
            <StatCard label="Cảnh báo chưa xử lý" value={String(unresolvedAlerts.length)} icon={<BellRing className="h-4 w-4" />} />
          </div>

          <section aria-labelledby="revenue-heading" className="rounded-2xl border border-border dark:border-border-dark p-4">
            <h2 id="revenue-heading" className="mb-3 font-display text-lg font-semibold">
              Xu hướng doanh thu &amp; chi phí
            </h2>
            <RevenueChart records={finance} />
          </section>

          {unresolvedAlerts.length > 0 && (
            <section aria-labelledby="alerts-heading" className="rounded-2xl border border-warning dark:border-warning-dark p-4">
              <h2 id="alerts-heading" className="mb-2 font-display text-lg font-semibold text-warning dark:text-warning-dark">
                Cảnh báo cần chú ý
              </h2>
              <ul className="flex flex-col gap-2 text-sm">
                {unresolvedAlerts.slice(0, 5).map((a) => (
                  <li key={a.id}>{a.message}</li>
                ))}
              </ul>
              <Link href="/alerts" className="mt-3 inline-block text-sm font-medium text-accent dark:text-accent-dark underline">
                Xem tất cả cảnh báo
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  );
}
