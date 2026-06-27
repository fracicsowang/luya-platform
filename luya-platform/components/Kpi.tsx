"use client";

import { L } from "@/lib/i18n";
import { Bi, Card } from "./ui";

export function KpiCard({ label, value, sub, accent }: { label: L; value: string | number; sub?: L; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? "ring-1 ring-green-200" : ""}`}>
      <div className="text-xs text-gray-500">
        <Bi v={label} />
      </div>
      <div className={`mt-1 text-2xl font-semibold ${accent ? "text-green-700" : "text-gray-900"}`}>{value}</div>
      {sub ? (
        <div className="text-xs text-gray-400 mt-0.5">
          <Bi v={sub} />
        </div>
      ) : null}
    </Card>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">{children}</div>;
}
