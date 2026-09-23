"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import type { Account, Asset } from "@/lib/types";

const TYPE_LABEL: Record<Asset["asset_type"], string> = {
  image: "Ảnh",
  video: "Video",
  caption: "Caption mẫu",
  other: "Khác",
};

export default function AssetsPage() {
  const { show } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ account_id: "", name: "", asset_type: "other" as Asset["asset_type"], url: "", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [as, a] = await Promise.all([
      fetch("/api/assets").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]);
    setAssets(as);
    setAccounts(a);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      show("Vui lòng nhập tên tài nguyên.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/assets", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Lỗi không xác định");
      show("Đã thêm tài nguyên.", "success");
      setModalOpen(false);
      setForm({ account_id: "", name: "", asset_type: "other", url: "", tags: "" });
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const accountName = (id: string | null) => accounts.find((a) => a.id === id)?.name ?? "Chung";

  const columns: Column<Asset>[] = [
    { key: "name", header: "Tên", render: (a) => <span className="font-medium">{a.name}</span> },
    { key: "type", header: "Loại", render: (a) => TYPE_LABEL[a.asset_type] },
    { key: "account", header: "Tài khoản", render: (a) => accountName(a.account_id) },
    {
      key: "url",
      header: "Đường dẫn",
      render: (a) =>
        a.url ? (
          <a href={a.url} target="_blank" rel="noreferrer" className="text-accent dark:text-accent-dark underline">
            Mở
          </a>
        ) : (
          "—"
        ),
    },
    { key: "tags", header: "Tags", render: (a) => a.tags ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Asset Library</h1>
          <p className="text-sm text-muted dark:text-muted-dark">Media gốc, caption mẫu, hashtag theo tài khoản.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="tap-target inline-flex items-center gap-2 rounded-xl bg-accent dark:bg-accent-dark px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm tài nguyên
        </button>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-muted dark:text-muted-dark">Đang tải…</p>
      ) : (
        <DataTable caption="Thư viện tài nguyên" columns={columns} rows={assets} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Thêm tài nguyên">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tên
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Loại
            <select
              value={form.asset_type}
              onChange={(e) => setForm((f) => ({ ...f, asset_type: e.target.value as Asset["asset_type"] }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            >
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
          <label className="flex flex-col gap-1 text-sm font-medium">
            Đường dẫn (URL lưu trữ ngoài, vd Google Drive)
            <input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              className="rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tags (phân cách bằng dấu phẩy)
            <input
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
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
