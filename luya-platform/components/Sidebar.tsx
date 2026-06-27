"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { Bi } from "./ui";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0 overflow-y-auto hidden md:block">
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white font-bold">L</span>
          <span>
            <span className="block text-sm font-semibold text-gray-900 leading-tight">Luya Platform</span>
            <span className="block text-[11px] text-gray-400 leading-tight">模拟系统 · Mock</span>
          </span>
        </Link>
      </div>
      <nav className="px-2 py-3 space-y-4">
        {NAV.map((group, gi) => (
          <div key={gi}>
            <div className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              <Bi v={group.title} />
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        active ? "bg-green-50 text-green-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base leading-none">{item.icon}</span>
                      <span className="truncate">
                        <Bi v={item.label} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
