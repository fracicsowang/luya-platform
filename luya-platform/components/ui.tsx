"use client";

import { ReactNode } from "react";
import { L, useLang, useTParts } from "@/lib/i18n";
import { statusOf, enumLabel } from "@/lib/labels";
import { TONE_BADGE } from "@/lib/tone";

/** Inline bilingual text. In "both" mode shows zh then a muted en. */
export function Bi({ v, className }: { v: L; className?: string }) {
  const parts = useTParts();
  const { primary, secondary } = parts(v);
  return (
    <span className={className}>
      {primary}
      {secondary ? <span className="text-gray-400 font-normal"> · {secondary}</span> : null}
    </span>
  );
}

/** Block bilingual text: en on a second line, good for headings. */
export function BiBlock({ v, className }: { v: L; className?: string }) {
  const { lang } = useLang();
  if (lang === "zh") return <span className={className}>{v.zh}</span>;
  if (lang === "en") return <span className={className}>{v.en}</span>;
  return (
    <span className={className}>
      {v.zh}
      <span className="block text-[0.7em] font-normal text-gray-400 leading-tight">{v.en}</span>
    </span>
  );
}

/** Colored status pill driven by the central STATUS dictionary. */
export function StatusBadge({ value }: { value?: string }) {
  const s = statusOf(value);
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${TONE_BADGE[s.tone]}`}>
      <Bi v={s.label} />
    </span>
  );
}

/** Neutral pill for non-status enums (source, location, type). */
export function EnumTag({ value }: { value?: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 ring-1 ring-inset ring-gray-500/10 whitespace-nowrap">
      <Bi v={enumLabel(value)} />
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function SectionTitle({ title, hint }: { title: L; hint?: L }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-gray-900">
        <Bi v={title} />
      </h2>
      {hint ? (
        <p className="text-xs text-gray-500 mt-0.5">
          <Bi v={hint} />
        </p>
      ) : null}
    </div>
  );
}
