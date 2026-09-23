"use client";

import { useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/DataTable";
import type { AuditLogEntry } from "@/lib/types";

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<AuditLogEntry>[] = [
    { key: "created_at", header: "Thời gian", render: (e) => new Date(e.created_at).toLocaleString("vi-VN") },
    { key: "actor", header: "Người/hệ thống thực hiện", render: (e) => e.actor },
    { key: "action", header: "Hành động", render: (e) => e.action },
    { key: "entity_type", header: "Đối tượng", render: (e) => e.entity_type },
    { key: "detail", header: "Chi tiết", render: (e) => e.detail ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted dark:text-muted-dark">Lịch sử mọi thao tác — ai/khi nào/thay đổi gì. Chỉ đọc.</p>
      </div>
      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Nhật ký kiểm toán" columns={columns} rows={entries} emptyMessage="Chưa có thao tác nào được ghi nhận." />
      )}
    </div>
  );
}
