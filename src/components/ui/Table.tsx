import * as React from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = "Tiada rekod dijumpai.",
  className,
}: TableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-gray-200", className)}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-4 py-3 text-left font-semibold whitespace-nowrap",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn("px-4 py-3 align-top", col.className)}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? "—")}
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

// Komponen kad untuk paparan mudah alih
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-4", className)}>
      {children}
    </div>
  );
}
