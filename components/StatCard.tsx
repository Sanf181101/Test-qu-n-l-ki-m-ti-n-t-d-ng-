import React from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border dark:border-border-dark bg-surface-raised dark:bg-surface-raised-dark p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted dark:text-muted-dark">{label}</p>
        {icon && <span className="text-accent dark:text-accent-dark" aria-hidden="true">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted dark:text-muted-dark">{hint}</p>}
    </div>
  );
}
