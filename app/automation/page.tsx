"use client";

import { useEffect, useState } from "react";
import { Plus, Play } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { ConfirmInline } from "@/components/ConfirmInline";
import { useToast } from "@/components/Toast";
import type { Account, AutomationRule } from "@/lib/types";

const TRIGGER_LABEL: Record<AutomationRule["trigger_type"], string> = {
  schedule: "Theo lịch (giờ hẹn đăng)",
  on_approval: "Khi được duyệt",
  manual: "Chạy thủ công",
};

export default function AutomationPage() {
  const { show } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState({ name: "", account_id: "", trigger_type: "schedule" as AutomationRule["trigger_type"] });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [r, a] = await Promise.all([
      fetch("/api/automation").then((res) => res.json()),
      fetch("/api/accounts").then((res) => res.json()),
    ]);
    setRules(r);
    setAccounts(a);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      show("Vui lòng nhập tên quy tắc.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/automation", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Lỗi không xác định");
      show("Đã tạo quy tắc tự động hóa.", "success");
      setModalOpen(false);
      setForm({ name: "", account_id: "", trigger_type: "schedule" });
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleEnabled(rule: AutomationRule) {
    const res = await fetch(`/api/automation/${rule.id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: !rule.enabled }),
    });
    if (res.ok) {
      show(!rule.enabled ? "Đã bật quy tắc." : "Đã tắt quy tắc.", "success");
      await load();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/automation/${id}`, { method: "DELETE" });
    if (res.ok) {
      show("Đã xóa quy tắc.", "success");
      await load();
    }
  }

  async function runNow() {
    setRunning(true);
    try {
      const res = await fetch("/api/automation/trigger", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chạy thất bại.");
      show(`Đã chạy: ${data.processed.length} mục được xử lý.`, "success");
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setRunning(false);
    }
  }

  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "Tất cả tài khoản";

  const columns: Column<AutomationRule>[] = [
    { key: "name", header: "Tên quy tắc", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "trigger", header: "Kích hoạt khi", render: (r) => TRIGGER_LABEL[r.trigger_type] },
    { key: "account", header: "Áp dụng cho", render: (r) => accountName(r.account_id) },
    {
      key: "enabled",
      header: "Trạng thái",
      render: (r) => (
        <button
          type="button"
          onClick={() => toggleEnabled(r)}
          className={
            "tap-target rounded-full px-3 py-1 text-xs font-semibold " +
            (r.enabled
              ? "bg-success/10 text-success dark:text-success-dark"
              : "bg-muted/10 text-muted dark:text-muted-dark")
          }
        >
          {r.enabled ? "Đang bật" : "Đang tắt"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (r) => <ConfirmInline label="Xóa" onConfirm={() => handleDelete(r.id)} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Automation Engine</h1>
          <p className="text-sm text-muted dark:text-muted-dark">
            GitHub Actions chạy tự động theo lịch. Có thể chạy thử ngay bên dưới (Dry-Run an toàn nếu chưa cấu hình API nền tảng).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={runNow}
            disabled={running}
            className="tap-target inline-flex items-center gap-2 rounded-xl border border-border dark:border-border-dark px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {running ? "Đang chạy…" : "Chạy ngay"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Thêm quy tắc
          </button>
        </div>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Danh sách quy tắc tự động hóa" columns={columns} rows={rules} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm quy tắc tự động hóa">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tên quy tắc
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Áp dụng cho tài khoản (bỏ trống = tất cả)
            <select
              value={form.account_id}
              onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              <option value="">— Tất cả tài khoản —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Kích hoạt khi
            <select
              value={form.trigger_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, trigger_type: e.target.value as AutomationRule["trigger_type"] }))
              }
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              {Object.entries(TRIGGER_LABEL).map(([value, label]) => (
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
            {submitting ? "Đang lưu…" : "Lưu quy tắc"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
