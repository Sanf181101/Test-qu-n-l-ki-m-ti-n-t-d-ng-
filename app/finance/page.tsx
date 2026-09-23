"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { useToast } from "@/components/Toast";
import type { Account, FinanceRecord } from "@/lib/types";

export default function FinancePage() {
  const { show } = useToast();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    account_id: "",
    record_date: new Date().toISOString().slice(0, 10),
    revenue: "",
    cost: "",
    category: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [f, a] = await Promise.all([
      fetch("/api/finance").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]);
    setRecords(f);
    setAccounts(a);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/finance", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Lỗi không xác định");
      show("Đã ghi nhận số liệu tài chính.", "success");
      setModalOpen(false);
      setForm({ account_id: "", record_date: new Date().toISOString().slice(0, 10), revenue: "", cost: "", category: "", note: "" });
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "Chung";
  const totalRevenue = records.reduce((s, r) => s + r.revenue, 0);
  const totalCost = records.reduce((s, r) => s + r.cost, 0);

  const columns: Column<FinanceRecord>[] = [
    { key: "record_date", header: "Ngày", render: (r) => r.record_date },
    { key: "account", header: "Tài khoản", render: (r) => accountName(r.account_id) },
    { key: "category", header: "Danh mục", render: (r) => r.category ?? "—" },
    { key: "revenue", header: "Doanh thu", render: (r) => r.revenue.toLocaleString("vi-VN") },
    { key: "cost", header: "Chi phí", render: (r) => r.cost.toLocaleString("vi-VN") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Finance &amp; P&amp;L</h1>
          <p className="text-sm text-muted dark:text-muted-dark">Doanh thu, chi phí và lợi nhuận ròng theo tài khoản.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ghi nhận số liệu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tổng doanh thu" value={totalRevenue.toLocaleString("vi-VN")} />
        <StatCard label="Tổng chi phí" value={totalCost.toLocaleString("vi-VN")} />
        <StatCard label="Lợi nhuận ròng" value={(totalRevenue - totalCost).toLocaleString("vi-VN")} />
      </div>

      <section className="rounded-2xl border border-border dark:border-border-dark p-4">
        <h2 className="mb-3 font-display text-lg font-semibold">Biểu đồ</h2>
        <RevenueChart records={records} />
      </section>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Bảng ghi nhận tài chính" columns={columns} rows={records} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ghi nhận số liệu tài chính">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Ngày
            <input
              type="date"
              value={form.record_date}
              onChange={(e) => setForm((f) => ({ ...f, record_date: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tài khoản (bỏ trống = chung)
            <select
              value={form.account_id}
              onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              <option value="">— Chung —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Doanh thu
              <input
                type="number"
                step="0.01"
                value={form.revenue}
                onChange={(e) => setForm((f) => ({ ...f, revenue: e.target.value }))}
                className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Chi phí
              <input
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Danh mục
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="vd: AdSense, stream, quảng cáo"
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
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
