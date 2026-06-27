"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { L } from "./i18n";

/* ----------------------------------------------------------------------------
 * Ownership / sharing / resale model (Luya App).
 *  - No activation code. Add a device by scanning its SN QR (the QR carries a
 *    token, so a public SN alone can't be used to claim) + email. First binder
 *    becomes OWNER.
 *  - Owner can invite MEMBERS (family) with permissions.
 *  - Unbind = factory reset: releases owner + ALL members, wipes personal data,
 *    device returns to unclaimed → the next person scans the SN to become the
 *    new owner. This is the transfer / resale path.
 * Persisted to localStorage (key luya-binding-v1).
 * -------------------------------------------------------------------------- */

export type Member = { email: string; name: string; canOperate: boolean };

export type Binding = {
  sn: string;
  ownerEmail: string;
  ownerName: string;
  members: Member[];
  wifiSsid: string;
  recipeId: string | null;
  boundAt: string;
};

export type Inbound = { sn: string; token: string };
export type Onboarding = { sn: string | null; wifiSsid: string; wifiConnected: boolean };
export type Account = { email: string; name: string };

export type ActState = {
  inbound: Inbound[];
  bindings: Binding[];
  account: Account | null;
  onboarding: Onboarding | null;
};

const initialState: ActState = { inbound: [], bindings: [], account: null, onboarding: null };

const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");

/** Ship-ready units from the production-line batch — each QR carries a token. */
export function readShippedFromLine(): Inbound[] {
  try {
    const raw = window.localStorage.getItem("luya-line-v2");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const devices: { sn: string; activation_key: string; stage: string }[] = parsed?.devices ?? [];
    return devices.filter((d) => d.stage === "ship_ready").map((d) => ({ sn: d.sn, token: d.activation_key }));
  } catch {
    return [];
  }
}

export function seedInbound(): Inbound[] {
  return Array.from({ length: 6 }, (_, i) => ({ sn: `LYX-2606-${String(900 + i).padStart(6, "0")}`, token: hex(12).toUpperCase() }));
}

type Action =
  | { type: "hydrate"; state: ActState }
  | { type: "loadInbound"; inbound: Inbound[] }
  | { type: "login"; email: string; name: string }
  | { type: "logout" }
  | { type: "startAdd" }
  | { type: "cancelAdd" }
  | { type: "pick"; sn: string }
  | { type: "setWifi"; ssid: string }
  | { type: "connectWifi" }
  | { type: "bindOwner"; at: string }
  | { type: "invite"; sn: string; email: string; name: string; canOperate: boolean }
  | { type: "togglePerm"; sn: string; email: string }
  | { type: "removeMember"; sn: string; email: string }
  | { type: "startGrow"; sn: string; recipeId: string }
  | { type: "unbind"; sn: string };

function patchBinding(state: ActState, sn: string, fn: (b: Binding) => Binding): ActState {
  return { ...state, bindings: state.bindings.map((b) => (b.sn === sn ? fn(b) : b)) };
}

function reducer(state: ActState, action: Action): ActState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "loadInbound":
      return { ...state, inbound: action.inbound };
    case "login":
      return { ...state, account: { email: action.email, name: action.name || action.email.split("@")[0] } };
    case "logout":
      return { ...state, account: null, onboarding: null };
    case "startAdd":
      return { ...state, onboarding: { sn: null, wifiSsid: "Home-WiFi", wifiConnected: false } };
    case "cancelAdd":
      return { ...state, onboarding: null };
    case "pick":
      return state.onboarding ? { ...state, onboarding: { ...state.onboarding, sn: action.sn } } : state;
    case "setWifi":
      return state.onboarding ? { ...state, onboarding: { ...state.onboarding, wifiSsid: action.ssid } } : state;
    case "connectWifi":
      return state.onboarding ? { ...state, onboarding: { ...state.onboarding, wifiConnected: true } } : state;
    case "bindOwner": {
      if (!state.account || !state.onboarding?.sn) return state;
      const b: Binding = { sn: state.onboarding.sn, ownerEmail: state.account.email, ownerName: state.account.name, members: [], wifiSsid: state.onboarding.wifiSsid, recipeId: null, boundAt: action.at };
      return { ...state, bindings: [b, ...state.bindings.filter((x) => x.sn !== b.sn)], onboarding: null };
    }
    case "invite":
      return patchBinding(state, action.sn, (b) =>
        b.members.some((m) => m.email.toLowerCase() === action.email.toLowerCase())
          ? b
          : { ...b, members: [...b.members, { email: action.email, name: action.name || action.email.split("@")[0], canOperate: action.canOperate }] }
      );
    case "togglePerm":
      return patchBinding(state, action.sn, (b) => ({ ...b, members: b.members.map((m) => (m.email === action.email ? { ...m, canOperate: !m.canOperate } : m)) }));
    case "removeMember":
      return patchBinding(state, action.sn, (b) => ({ ...b, members: b.members.filter((m) => m.email !== action.email) }));
    case "startGrow":
      return patchBinding(state, action.sn, (b) => ({ ...b, recipeId: action.recipeId }));
    case "unbind":
      // factory reset: drop the whole binding (owner + members) → unclaimed
      return { ...state, bindings: state.bindings.filter((b) => b.sn !== action.sn) };
    default:
      return state;
  }
}

const Ctx = createContext<{ state: ActState; dispatch: React.Dispatch<Action> } | null>(null);
const KEY = "luya-binding-v1";

export function ActivationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.bindings)) dispatch({ type: "hydrate", state: parsed });
      }
    } catch {}
    const fromLine = readShippedFromLine();
    dispatch({ type: "loadInbound", inbound: fromLine.length ? fromLine : seedInbound() });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useActivation() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useActivation must be used inside ActivationProvider");
  return ctx;
}

/** SNs that are bound (claimed). */
function boundSns(state: ActState) {
  return new Set(state.bindings.map((b) => b.sn));
}

/** Unclaimed devices that can be scanned/added. */
export function unclaimed(state: ActState): Inbound[] {
  const claimed = boundSns(state);
  return state.inbound.filter((d) => !claimed.has(d.sn));
}

export type Role = "owner" | "member";

/** Devices the logged-in account can see (as owner or member). */
export function myDevices(state: ActState): { binding: Binding; role: Role }[] {
  if (!state.account) return [];
  const e = state.account.email.toLowerCase();
  return state.bindings
    .filter((b) => b.ownerEmail.toLowerCase() === e || b.members.some((m) => m.email.toLowerCase() === e))
    .map((b) => ({ binding: b, role: b.ownerEmail.toLowerCase() === e ? ("owner" as Role) : ("member" as Role) }));
}

export const ROLE_LABEL: Record<Role, L> = {
  owner: { zh: "拥有者", en: "Owner" },
  member: { zh: "成员", en: "Member" },
};
