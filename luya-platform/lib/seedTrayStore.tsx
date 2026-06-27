"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { L } from "./i18n";

/* ----------------------------------------------------------------------------
 * US seed-tray production. 5-step worker flow per tray:
 *   a. take tray → b. coco coir → c. sow seeds → d. package → e. label (name+QR)
 * Each tray gets a unique ID + QR (with a token). Customers scan the QR ONCE to
 * add a tray to a grow; the QR is then consumed (single-use). Only Luya-made
 * trays exist here. Persisted to localStorage (key luya-seedtray-v1).
 * -------------------------------------------------------------------------- */

export type SeedStage = "created" | "coir" | "seeded" | "packaged" | "labeled";

export const SEED_STAGE_ORDER: SeedStage[] = ["created", "coir", "seeded", "packaged", "labeled"];

export const SEED_STAGE_LABEL: Record<SeedStage, L> = {
  created: { zh: "已取盘", en: "Tray taken" },
  coir: { zh: "已放椰糠", en: "Coir added" },
  seeded: { zh: "已撒种子", en: "Seeded" },
  packaged: { zh: "已包装", en: "Packaged" },
  labeled: { zh: "已贴标签·入库", en: "Labeled · stocked" },
};

/** The action that moves a tray from its current stage to the next. */
export const SEED_NEXT_ACTION: Record<SeedStage, L | null> = {
  created: { zh: "🥥 放入椰糠", en: "🥥 Add coco coir" },
  coir: { zh: "🌱 撒种子", en: "🌱 Sow seeds" },
  seeded: { zh: "📦 包装", en: "📦 Package" },
  packaged: { zh: "🏷️ 贴种子名+二维码", en: "🏷️ Label (name + QR)" },
  labeled: null,
};

export type SeedKey = "broccoli" | "radish" | "pea" | "sunflower" | "kale" | "arugula" | "mustard" | "beet" | "cabbage" | "wheatgrass";

export const SEEDS: Record<SeedKey, { name: L; abbr: string; recipeId: string }> = {
  broccoli: { name: { zh: "西兰花", en: "Broccoli" }, abbr: "BRO", recipeId: "rec_1" },
  radish: { name: { zh: "萝卜苗", en: "Radish" }, abbr: "RAD", recipeId: "rec_2" },
  pea: { name: { zh: "豌豆苗", en: "Pea Shoots" }, abbr: "PEA", recipeId: "rec_3" },
  sunflower: { name: { zh: "葵花苗", en: "Sunflower" }, abbr: "SUN", recipeId: "rec_4" },
  kale: { name: { zh: "羽衣甘蓝", en: "Kale" }, abbr: "KAL", recipeId: "rec_6" },
  arugula: { name: { zh: "芝麻菜", en: "Arugula" }, abbr: "ARU", recipeId: "rec_7" },
  mustard: { name: { zh: "芥菜", en: "Mustard" }, abbr: "MUS", recipeId: "rec_8" },
  beet: { name: { zh: "甜菜", en: "Beet" }, abbr: "BEE", recipeId: "rec_9" },
  cabbage: { name: { zh: "紫甘蓝", en: "Red Cabbage" }, abbr: "CAB", recipeId: "rec_10" },
  wheatgrass: { name: { zh: "小麦草", en: "Wheatgrass" }, abbr: "WHE", recipeId: "rec_11" },
};

/** The sellable tray SKU for a seed (TRAY-<ABBR>-4PK). */
export const traySku = (seedKey: SeedKey) => `TRAY-${SEEDS[seedKey].abbr}-4PK`;

export type TrayUse = { email: string; sn: string; at: string };

export type SeedTray = {
  index: number;
  id: string;
  seedKey: SeedKey;
  lot: string;
  expiry: string;
  token: string;
  stage: SeedStage;
  used: TrayUse | null;
};

export type SeedBatch = { seedKey: SeedKey; qty: number; lot: string; expiry: string };

export type SeedState = { batch: SeedBatch | null; trays: SeedTray[]; activeId: string | null; labelsPrinted: boolean };

const initialState: SeedState = { batch: null, trays: [], activeId: null, labelsPrinted: false };

const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");

type Action =
  | { type: "hydrate"; state: SeedState }
  | { type: "generate"; seedKey: SeedKey; qty: number }
  | { type: "printLabels" }
  | { type: "scan"; id: string }
  | { type: "scanNext" }
  | { type: "advance"; id: string }
  | { type: "reset" };

function reducer(state: SeedState, action: Action): SeedState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "generate": {
      const month = "2607";
      const lot = `LOT-${month}-${SEEDS[action.seedKey].abbr}`;
      const expiry = "2027-06-30";
      const trays: SeedTray[] = Array.from({ length: action.qty }, (_, i) => ({
        index: i + 1,
        id: `TRAY-${SEEDS[action.seedKey].abbr}-${month}-${String(i + 1).padStart(6, "0")}`,
        seedKey: action.seedKey,
        lot,
        expiry,
        token: hex(10).toUpperCase(),
        stage: "created",
        used: null,
      }));
      return { batch: { seedKey: action.seedKey, qty: action.qty, lot, expiry }, trays, activeId: null, labelsPrinted: false };
    }
    case "printLabels":
      return { ...state, labelsPrinted: true };
    case "scan":
      return { ...state, activeId: action.id };
    case "scanNext": {
      const next = state.trays.filter((t) => t.stage !== "labeled").sort((a, b) => a.index - b.index)[0];
      return next ? { ...state, activeId: next.id } : state;
    }
    case "advance":
      return {
        ...state,
        trays: state.trays.map((t) => {
          if (t.id !== action.id) return t;
          const i = SEED_STAGE_ORDER.indexOf(t.stage);
          return i < SEED_STAGE_ORDER.length - 1 ? { ...t, stage: SEED_STAGE_ORDER[i + 1] } : t;
        }),
      };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

const Ctx = createContext<{ state: SeedState; dispatch: React.Dispatch<Action> } | null>(null);
const KEY = "luya-seedtray-v1";

export function SeedTrayProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.trays)) dispatch({ type: "hydrate", state: parsed });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useSeedTray() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSeedTray must be used inside SeedTrayProvider");
  return ctx;
}

export function seedCounters(state: SeedState) {
  const at = (stage: SeedStage) => state.trays.filter((t) => SEED_STAGE_ORDER.indexOf(t.stage) >= SEED_STAGE_ORDER.indexOf(stage)).length;
  return {
    total: state.trays.length,
    coir: at("coir"),
    seeded: at("seeded"),
    packaged: at("packaged"),
    labeled: at("labeled"),
    used: state.trays.filter((t) => t.used).length,
  };
}

/* ---- customer-side helpers (read/write localStorage directly) ---- */

function readSeed(): SeedState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Trays that are labeled/stocked and not yet used — scannable by a customer. */
export function availableTrays(): SeedTray[] {
  const s = readSeed();
  return (s?.trays ?? []).filter((t) => t.stage === "labeled" && !t.used);
}

/** Consume a tray (single-use). Returns the seed's recipeId, or null if invalid. */
export function useTray(id: string, by: TrayUse): string | null {
  const s = readSeed();
  if (!s?.trays) return null;
  const tray = s.trays.find((t) => t.id === id);
  if (!tray || tray.stage !== "labeled" || tray.used) return null;
  const next = { ...s, trays: s.trays.map((t) => (t.id === id ? { ...t, used: by } : t)) };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return SEEDS[tray.seedKey].recipeId;
}
