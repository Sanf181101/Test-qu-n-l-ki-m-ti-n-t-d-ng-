"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { useToast } from "@/components/Toast";

type FinanceRow = { record_date: string; revenue?: string; cost?: string; category?: string; account_id?: string };
type AffiliateRow = { order_date: string; product: string; commission?: string; account_id?: string; status?: string };

export default function ImportPage() {
  const { show } = useToast();
  const [kind, setKind] = useState<"finance" | "affiliate">("finance");
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setSummary(null);

    Papa.parse<FinanceRow | AffiliateRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let ok = 0;
        let failed = 0;
        for (const row of results.data) {
          try {
            const endpoint = kind === "finance" ? "/api/finance" : "/api/affiliate";
            const res = await fetch(endpoint, { method: "POST", body: JSON.stringify(row) });
            if (res.ok) ok += 1;
            else failed += 1;
          } catch {
            failed += 1;
          }
        }
        setSummary(`Đã nhập ${ok} dòng thành công, ${failed} dòng lỗi.`);
        show(failed === 0 ? "Import thành công." : "Import xong, có một số dòng lỗi.", failed === 0 ? "success" : "error");
        setImporting(false);
        e.target.value = "";
      },
      error: () => {
        setImporting(false);
        show("Không đọc được file CSV.", "error");
      },
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Import Center</h1>
        <p className="text-sm text-muted dark:text-muted-dark">
          Nhiều mạng affiliate chưa có API free ổn định — import CSV export định kỳ từ nền tảng đó là cách an toàn nhất.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2 rounded-2xl border border-border dark:border-border-dark p-4">
        <legend className="px-1 text-sm font-semibold">Loại dữ liệu</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="kind" checked={kind === "finance"} onChange={() => setKind("finance")} />
          Tài chính (record_date, revenue, cost, category, account_id)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="kind" checked={kind === "affiliate"} onChange={() => setKind("affiliate")} />
          Đơn hàng affiliate (order_date, product, commission, account_id, status)
        </label>
      </fieldset>

      <label className="tap-target flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border dark:border-border-dark px-4 py-8 text-sm font-medium text-muted dark:text-muted-dark hover:border-accent dark:hover:border-accent-dark">
        <Upload className="h-4 w-4" aria-hidden="true" />
        {importing ? "Đang import…" : "Chọn file CSV để import"}
        <input type="file" accept=".csv" className="sr-only" onChange={handleFile} disabled={importing} />
      </label>

      {summary && (
        <p role="status" className="text-sm">
          {summary}
        </p>
      )}
    </div>
  );
}
