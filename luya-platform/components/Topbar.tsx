"use client";

import { Lang, useLang } from "@/lib/i18n";

const OPTS: { key: Lang; label: string }[] = [
  { key: "zh", label: "中" },
  { key: "both", label: "中/EN" },
  { key: "en", label: "EN" },
];

export function Topbar() {
  const { lang, setLang } = useLang();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/90 backdrop-blur px-4 md:px-6 py-2.5">
      <div className="text-sm text-gray-500">
        <span className="md:hidden font-semibold text-gray-900 mr-2">Luya Platform</span>
        <span className="hidden sm:inline">IoT 设备云 · 制造门户 · 客户与订阅</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs">
          {OPTS.map((o) => (
            <button
              key={o.key}
              onClick={() => setLang(o.key)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === o.key ? "bg-white text-green-700 shadow-sm font-medium" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-semibold">AD</span>
          <span className="text-gray-600">Admin</span>
        </div>
      </div>
    </header>
  );
}
