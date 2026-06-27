"use client";

import { ReactNode } from "react";
import { L } from "@/lib/i18n";
import { Bi, Card } from "./ui";

export type Column<T> = { header: L; cell: (row: T) => ReactNode; mono?: boolean; right?: boolean };

export function DataTable<T>({ columns, rows, caption }: { columns: Column<T>[]; rows: T[]; caption?: L }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70 text-left">
              {columns.map((c, i) => (
                <th key={i} className={`px-3 py-2.5 font-medium text-gray-500 text-xs whitespace-nowrap ${c.right ? "text-right" : ""}`}>
                  <Bi v={c.header} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-100 last:border-0 hover:bg-green-50/40 transition-colors">
                {columns.map((c, ci) => (
                  <td key={ci} className={`px-3 py-2.5 align-middle ${c.mono ? "font-mono text-xs text-gray-700" : "text-gray-800"} ${c.right ? "text-right tabular-nums" : ""}`}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
          <Bi v={caption} />
        </div>
      ) : null}
    </Card>
  );
}
