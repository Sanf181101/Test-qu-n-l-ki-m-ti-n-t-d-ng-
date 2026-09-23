"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { FinanceRecord } from "@/lib/types";

export function RevenueChart({ records }: { records: FinanceRecord[] }) {
  const byDate = new Map<string, { date: string; revenue: number; cost: number }>();
  for (const r of records) {
    const key = r.record_date;
    const existing = byDate.get(key) ?? { date: key, revenue: 0, cost: 0 };
    existing.revenue += r.revenue;
    existing.cost += r.cost;
    byDate.set(key, existing);
  }
  const data = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted dark:text-muted-dark">
        Chưa có dữ liệu tài chính để vẽ biểu đồ. Thêm ở trang Finance & P&L.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border dark:stroke-border-dark" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#0e7490" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="cost" name="Chi phí" stroke="#b91c1c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
