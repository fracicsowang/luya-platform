"use client";

import { L } from "@/lib/i18n";
import { Bi } from "./ui";

export function PageHeader({ title, desc, pillar }: { title: L; desc?: L; pillar?: L }) {
  return (
    <header className="mb-6">
      {pillar ? (
        <div className="text-xs font-medium text-green-700 mb-1">
          <Bi v={pillar} />
        </div>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        <Bi v={title} />
      </h1>
      {desc ? (
        <p className="mt-1 text-sm text-gray-500 max-w-3xl">
          <Bi v={desc} />
        </p>
      ) : null}
    </header>
  );
}
