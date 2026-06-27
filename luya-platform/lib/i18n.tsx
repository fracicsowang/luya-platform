"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/** A bilingual string: Chinese + English. The whole app speaks in these. */
export type L = { zh: string; en: string };

/** Helper to declare bilingual strings tersely. */
export const t = (zh: string, en: string): L => ({ zh, en });

export type Lang = "zh" | "en" | "both";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("both");

  useEffect(() => {
    const saved = window.localStorage.getItem("luya-lang") as Lang | null;
    if (saved === "zh" || saved === "en" || saved === "both") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("luya-lang", l);
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

/** Render a bilingual value according to the current language mode. */
export function useT() {
  const { lang } = useLang();
  return (v: L | string | undefined | null): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (lang === "zh") return v.zh;
    if (lang === "en") return v.en;
    return v.zh + "  ·  " + v.en;
  };
}

/** Like useT but returns the two parts separately so callers can style them. */
export function useTParts() {
  const { lang } = useLang();
  return (v: L): { primary: string; secondary?: string } => {
    if (lang === "zh") return { primary: v.zh };
    if (lang === "en") return { primary: v.en };
    return { primary: v.zh, secondary: v.en };
  };
}
