import React from "react";

export type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
  key: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  caption,
  emptyMessage = "Chưa có dữ liệu.",
}: {
  columns: Column<T>[];
  rows: T[];
  caption: string;
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border dark:border-border-dark">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border dark:border-border-dark bg-surface-raised dark:bg-surface-raised-dark">
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-4 py-3 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-muted dark:text-muted-dark">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-border dark:border-border-dark last:border-0">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-middle">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
