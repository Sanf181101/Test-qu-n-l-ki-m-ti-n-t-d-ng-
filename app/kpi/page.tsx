"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import type { Account, KpiSnapshot } from "@/lib/types";

export default function KpiPage() {
  const { show } = useToast();
  const [snapshots, setSnapshots] = useState<KpiSnapshot[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    account_id: "",
    snapshot_date: new Date().toISOString().slice(0, 10),
    followers: "",
    views: "",
    engagement_rate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [k, a] = await Promise.all([
      fetch("/api/kpi").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]);
    setSnapshots(k);
    setAccounts(a);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.account_id) {
      show("Vui lòng chọn tài khoản.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/kpi", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Lỗi không xác định");
      show("Đã ghi nhận KPI.", "success");
      setModalOpen(false);
      setForm({ account_id: "", snapshot_date: new Date().toISOString().slice(0, 10), followers: "", views: "", engagement_rate: "" });
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const columns: Column<KpiSnapshot>[] = [
    { key: "snapshot_date", header: "Ngày", render: (k) => k.snapshot_date },
    { key: "account", header: "Tài khoản", render: (k) => accountName(k.account_id) },
    { key: "followers", header: "Followers", render: (k) => k.followers.toLocaleString("vi-VN") },
    { key: "views", header: "Lượt xem", render: (k) => k.views.toLocaleString("vi-VN") },
    { key: "engagement_rate", header: "Tỷ lệ tương tác", render: (k) => `${k.engagement_rate}%` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">KPI Dashboard</h1>
          <p className="text-sm text-muted dark:text-muted-dark">Followers, lượt xem, tỷ lệ tương tác theo tài khoản.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ghi nhận KPI
        </button>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Số liệu KPI theo tài khoản" columns={columns} rows={snapshots} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ghi nhận KPI">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tài khoản
            <select
              value={form.account_id}
              onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              <option value="">— Chọn tài khoản —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Ngày
            <input
              type="date"
              value={form.snapshot_date}
              onChange={(e) => setForm((f) => ({ ...f, snapshot_date: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Followers
              <input
                type="number"
                value={form.followers}
                onChange={(e) => setForm((f) => ({ ...f, followers: e.target.value }))}
                className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Lượt xem
              <input
                type="number"
                value={form.views}
                onChange={(e) => setForm((f) => ({ ...f, views: e.target.value }))}
                className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              % Tương tác
              <input
                type="number"
                step="0.1"
                value={form.engagement_rate}
                onChange={(e) => setForm((f) => ({ ...f, engagement_rate: e.target.value }))}
                className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="tap-target mt-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Đang lưu…" : "Lưu"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
