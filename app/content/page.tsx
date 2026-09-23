"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { ConfirmInline } from "@/components/ConfirmInline";
import { useToast } from "@/components/Toast";
import type { Account, ContentItem, ContentStatus } from "@/lib/types";

const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Nháp",
  pending_approval: "Chờ duyệt",
  approved: "Đã duyệt",
  scheduled: "Đã lên lịch",
  posted: "Đã đăng",
  rejected: "Bị từ chối",
};

const STATUS_COLOR: Record<ContentStatus, string> = {
  draft: "bg-muted/10 text-muted dark:text-muted-dark",
  pending_approval: "bg-warning/10 text-warning dark:text-warning-dark",
  approved: "bg-accent/10 text-accent dark:text-accent-dark",
  scheduled: "bg-accent/10 text-accent dark:text-accent-dark",
  posted: "bg-success/10 text-success dark:text-success-dark",
  rejected: "bg-danger/10 text-danger dark:text-danger-dark",
};

const NEXT_ACTIONS: Partial<Record<ContentStatus, { to: ContentStatus; label: string }[]>> = {
  draft: [{ to: "pending_approval", label: "Gửi duyệt" }],
  pending_approval: [
    { to: "approved", label: "Duyệt" },
    { to: "rejected", label: "Từ chối" },
  ],
  approved: [{ to: "scheduled", label: "Lên lịch" }],
  scheduled: [{ to: "posted", label: "Đánh dấu đã đăng" }],
  rejected: [{ to: "draft", label: "Đưa lại về Nháp" }],
};

export default function ContentPage() {
  const { show } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ account_id: "", title: "", body: "", scheduled_at: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [c, a] = await Promise.all([
      fetch("/api/content").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]);
    setItems(c);
    setAccounts(a);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.account_id || !form.title.trim()) {
      show("Vui lòng chọn tài khoản và nhập tiêu đề.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/content", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Lỗi không xác định");
      show("Đã tạo nội dung (trạng thái Nháp).", "success");
      setModalOpen(false);
      setForm({ account_id: "", title: "", body: "", scheduled_at: "" });
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function transition(id: string, to: ContentStatus) {
    const res = await fetch(`/api/content/${id}`, { method: "PATCH", body: JSON.stringify({ status: to }) });
    if (res.ok) {
      show(`Đã chuyển sang: ${STATUS_LABEL[to]}`, "success");
      await load();
    } else {
      show((await res.json()).error ?? "Chuyển trạng thái thất bại.", "error");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
    if (res.ok) {
      show("Đã xóa nội dung.", "success");
      await load();
    }
  }

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const columns: Column<ContentItem>[] = [
    { key: "title", header: "Tiêu đề", render: (c) => <span className="font-medium">{c.title}</span> },
    { key: "account", header: "Tài khoản", render: (c) => accountName(c.account_id) },
    {
      key: "status",
      header: "Trạng thái",
      render: (c) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[c.status]}`}>
          {STATUS_LABEL[c.status]}
        </span>
      ),
    },
    { key: "scheduled_at", header: "Giờ hẹn đăng", render: (c) => c.scheduled_at ?? "—" },
    {
      key: "actions",
      header: "Thao tác",
      render: (c) => (
        <div className="flex flex-wrap gap-2">
          {(NEXT_ACTIONS[c.status] ?? []).map((action) => (
            <button
              key={action.to}
              type="button"
              onClick={() => transition(c.id, action.to)}
              className="tap-target rounded-lg border border-border dark:border-border-dark px-3 py-1.5 text-xs font-semibold hover:bg-surface-raised dark:hover:bg-surface-raised-dark"
            >
              {action.label}
            </button>
          ))}
          <ConfirmInline label="Xóa" onConfirm={() => handleDelete(c.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Content Queue</h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            Mọi nội dung phải qua Nháp → Chờ duyệt → Đã duyệt trước khi được lên lịch/đăng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tạo nội dung
        </button>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Hàng đợi nội dung" columns={columns} rows={items} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tạo nội dung mới">
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
            Tiêu đề
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nội dung / caption
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={4}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Giờ hẹn đăng (tùy chọn)
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="tap-target mt-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950 disabled:opacity-60"
          >
            {submitting ? "Đang lưu…" : "Lưu (trạng thái Nháp)"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
