"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import type { Account, AffiliateOrder } from "@/lib/types";

const STATUS_LABEL: Record<AffiliateOrder["status"], string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy",
};

export default function AffiliatePage() {
  const { show } = useToast();
  const [orders, setOrders] = useState<AffiliateOrder[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    account_id: "",
    product: "",
    commission: "",
    order_date: new Date().toISOString().slice(0, 10),
    status: "pending" as AffiliateOrder["status"],
  });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [o, a] = await Promise.all([
      fetch("/api/affiliate").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]);
    setOrders(o);
    setAccounts(a);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product.trim()) {
      show("Vui lòng nhập tên sản phẩm.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/affiliate", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Lỗi không xác định");
      show("Đã thêm đơn hàng affiliate.", "success");
      setModalOpen(false);
      setForm({ account_id: "", product: "", commission: "", order_date: new Date().toISOString().slice(0, 10), status: "pending" });
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "—";
  const totalCommission = orders.reduce((s, o) => s + o.commission, 0);

  const columns: Column<AffiliateOrder>[] = [
    { key: "product", header: "Sản phẩm", render: (o) => <span className="font-medium">{o.product}</span> },
    { key: "account", header: "Kênh", render: (o) => accountName(o.account_id) },
    { key: "order_date", header: "Ngày", render: (o) => o.order_date },
    { key: "commission", header: "Hoa hồng", render: (o) => o.commission.toLocaleString("vi-VN") },
    { key: "status", header: "Trạng thái", render: (o) => STATUS_LABEL[o.status] },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Affiliate / Bán sản phẩm số</h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            Tổng hoa hồng ghi nhận: <span className="font-semibold">{totalCommission.toLocaleString("vi-VN")}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm đơn hàng
        </button>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Đơn hàng affiliate / sản phẩm số" columns={columns} rows={orders} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm đơn hàng affiliate">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Sản phẩm
            <input
              value={form.product}
              onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Kênh (tài khoản)
            <select
              value={form.account_id}
              onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              <option value="">— Không gắn kênh —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium">
              Hoa hồng
              <input
                type="number"
                step="0.01"
                value={form.commission}
                onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
                className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Ngày đặt hàng
              <input
                type="date"
                value={form.order_date}
                onChange={(e) => setForm((f) => ({ ...f, order_date: e.target.value }))}
                required
                className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Trạng thái
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AffiliateOrder["status"] }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
