"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/DataTable";
import { useToast } from "@/components/Toast";
import type { Alert } from "@/lib/types";

const SEVERITY_COLOR: Record<Alert["severity"], string> = {
  low: "bg-muted/10 text-muted dark:text-muted-dark",
  medium: "bg-warning/10 text-warning dark:text-warning-dark",
  high: "bg-danger/10 text-danger dark:text-danger-dark",
};

export default function AlertsPage() {
  const { show } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/alerts");
    setAlerts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string, resolved: boolean) {
    const res = await fetch(`/api/alerts/${id}`, { method: "PATCH", body: JSON.stringify({ resolved }) });
    if (res.ok) {
      show(resolved ? "Đã đánh dấu đã xử lý." : "Đã mở lại cảnh báo.", "success");
      await load();
    }
  }

  const columns: Column<Alert>[] = [
    { key: "created_at", header: "Thời gian", render: (a) => new Date(a.created_at).toLocaleString("vi-VN") },
    {
      key: "severity",
      header: "Mức độ",
      render: (a) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_COLOR[a.severity]}`}>{a.severity}</span>
      ),
    },
    { key: "message", header: "Nội dung", render: (a) => a.message },
    {
      key: "actions",
      header: "Trạng thái",
      render: (a) => (
        <button
          type="button"
          onClick={() => resolve(a.id, !a.resolved)}
          className="tap-target rounded-lg border border-border dark:border-border-dark px-3 py-1.5 text-xs font-semibold hover:bg-surface-raised dark:hover:bg-surface-raised-dark"
        >
          {a.resolved ? "Mở lại" : "Đánh dấu đã xử lý"}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Alerts</h1>
        <p className="text-sm text-muted dark:text-muted-dark">Cảnh báo doanh thu sụt bất thường và các bất thường khác.</p>
      </div>
      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Danh sách cảnh báo" columns={columns} rows={alerts} emptyMessage="Chưa có cảnh báo nào." />
      )}
    </div>
  );
}
