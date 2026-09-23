"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { ConfirmInline } from "@/components/ConfirmInline";
import { useToast } from "@/components/Toast";
import type { Account, Platform } from "@/lib/types";

const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  affiliate: "Affiliate / Bán số",
  other: "Khác",
};

export default function AccountsPage() {
  const { show } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ platform: "tiktok" as Platform, name: "", role: "", goal: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/accounts");
    setAccounts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      show("Vui lòng nhập tên tài khoản.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/accounts", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Lỗi không xác định");
      show("Đã thêm tài khoản.", "success");
      setModalOpen(false);
      setForm({ platform: "tiktok", name: "", role: "", goal: "" });
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      show("Đã xóa tài khoản.", "success");
      await load();
    } else {
      show("Xóa thất bại.", "error");
    }
  }

  const columns: Column<Account>[] = [
    { key: "name", header: "Tên", render: (a) => <span className="font-medium">{a.name}</span> },
    { key: "platform", header: "Nền tảng", render: (a) => PLATFORM_LABEL[a.platform] },
    { key: "role", header: "Vai trò", render: (a) => a.role ?? "—" },
    {
      key: "monetized",
      header: "Đủ điều kiện kiếm tiền",
      render: (a) => (
        <span
          className={
            a.monetized
              ? "rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success dark:bg-success-dark/10 dark:text-success-dark"
              : "rounded-full bg-muted/10 px-2 py-0.5 text-xs font-semibold text-muted dark:text-muted-dark"
          }
        >
          {a.monetized ? "Đã đủ điều kiện" : "Chưa đủ điều kiện"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (a) => <ConfirmInline label="Xóa" onConfirm={() => handleDelete(a.id)} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Account Hub</h1>
          <p className="text-sm text-muted dark:text-muted-dark">Toàn bộ tài khoản kiếm tiền đang quản lý.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm tài khoản
        </button>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Danh sách tài khoản kiếm tiền" columns={columns} rows={accounts} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm tài khoản mới">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nền tảng
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as Platform }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              {Object.entries(PLATFORM_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tên tài khoản
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Vai trò (vd: kênh chính, teaser, thử nghiệm)
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Mục tiêu kiếm tiền
            <input
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="vd: AdSense, affiliate, bán sản phẩm số"
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="tap-target mt-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Đang lưu…" : "Lưu tài khoản"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
