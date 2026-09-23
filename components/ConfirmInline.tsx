"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  label: string; // nhãn nút ở trạng thái ban đầu, vd "Xóa"
  confirmLabel?: string; // nhãn khi đã bấm lần 1, vd "Bấm lần nữa để xác nhận"
  onConfirm: () => void;
  className?: string;
};

// Xác nhận 2 bước ngay tại chỗ — không dùng window.confirm() (chặn, không thân thiện mobile)
export function ConfirmInline({ label, confirmLabel = "Bấm lần nữa để xác nhận", onConfirm, className }: Props) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <button
        type="button"
        className={
          "tap-target inline-flex items-center gap-1.5 rounded-lg border border-danger dark:border-danger-dark px-3 py-1.5 text-sm font-semibold text-danger dark:text-danger-dark " +
          (className ?? "")
        }
        onClick={() => {
          onConfirm();
          setArmed(false);
        }}
        onBlur={() => setArmed(false)}
        autoFocus
      >
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        {confirmLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={
        "tap-target rounded-lg border border-border dark:border-border-dark px-3 py-1.5 text-sm font-medium text-danger dark:text-danger-dark hover:bg-surface-raised dark:hover:bg-surface-raised-dark " +
        (className ?? "")
      }
      onClick={() => setArmed(true)}
    >
      {label}
    </button>
  );
}
