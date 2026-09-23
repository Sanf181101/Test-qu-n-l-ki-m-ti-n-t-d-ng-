"use client";

import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
  label: string; // bắt buộc — trở thành aria-label, tránh lỗi nút-chỉ-icon không tên (đã gặp ở KMO Pro)
};

export const IconButton = React.forwardRef<HTMLButtonElement, Props>(
  function IconButton({ icon, label, className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={clsx(
          "tap-target inline-flex items-center justify-center rounded-lg",
          "text-muted dark:text-muted-dark",
          "hover:bg-surface-raised dark:hover:bg-surface-raised-dark",
          "hover:text-ink dark:hover:text-ink-dark transition-colors",
          className
        )}
        {...rest}
      >
        {icon}
      </button>
    );
  }
);
