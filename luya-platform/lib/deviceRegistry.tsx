"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { devices as seedDevices, customers as seedCustomers } from "./mock";
import { DeviceStatus } from "./types";
import { Stage } from "./lineStore";
import { Binding } from "./activationStore";
import { L } from "./i18n";

/* ----------------------------------------------------------------------------
 * Device registry — single merged view of every device:
 *  - seed devices (static mock)
 *  - factory devices (live production-line batch in localStorage)
 *  - the binding overlay (owner + members) from localStorage
 * Plus customers derived from bindings. Closes the loop so a bound device shows
 * up under Devices and its owner/members under Customers.
 * -------------------------------------------------------------------------- */

export type UDeviceSource = "seed" | "factory";
export type UOwner = { id?: string; name: string; email?: string };

export type UDevice = {
  sn: string;
  uuid: string;
  activation_key?: string;
  model: string;
  sku?: string;
  hardware_version: string;
  firmware_version: string;
  work_order_number?: string;
  factory?: string;
  components?: Record<string, string | null>;
  stage?: Stage;
  cloud_status: DeviceStatus;
  activated: boolean;
  owner?: UOwner;
  members?: { email: string; name: string; canOperate: boolean }[];
  grow?: { recipeId: string | null };
  source: UDeviceSource;
  created_at?: string;
};

export type UCustomer = {
  id: string;
  name: string;
  email: string;
  source: "shopify" | "amazon" | "manual" | "app";
  viaActivation?: boolean;
  role?: "owner" | "member";
  deviceCount: number;
};

const STAGE_TO_STATUS: Record<Stage, DeviceStatus> = {
  generated: "provisioned",
  bound: "in_production",
  flashed: "in_production",
  tested: "tested",
  qc_passed: "qc_passed",
  qc_failed: "maintenance",
  packed: "packed",
  ship_ready: "shipped",
};

type LineBatch = {
  wo?: { number: string; model: string; sku: string; hw: string; fw: string };
  devices?: { sn: string; uuid: string; activation_key: string; sku?: string; stage: Stage; components: Record<string, string | null> }[];
};

const BIND_KEY = "luya-binding-v1";

function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Physical factory reset (resale fallback): drop a device's binding even
 *  without the owner's app. Returns true if a binding was removed. */
export function factoryResetBinding(sn: string): boolean {
  try {
    const parsed = readJSON<{ bindings?: Binding[] }>(BIND_KEY);
    if (!parsed?.bindings) return false;
    const next = parsed.bindings.filter((b) => b.sn !== sn);
    if (next.length === parsed.bindings.length) return false;
    window.localStorage.setItem(BIND_KEY, JSON.stringify({ ...parsed, bindings: next }));
    return true;
  } catch {
    return false;
  }
}

export function useRegistry() {
  const pathname = usePathname();
  const [batch, setBatch] = useState<LineBatch | null>(null);
  const [bindings, setBindings] = useState<Binding[]>([]);

  const refresh = useCallback(() => {
    setBatch(readJSON<LineBatch>("luya-line-v2"));
    setBindings(readJSON<{ bindings?: Binding[] }>(BIND_KEY)?.bindings ?? []);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh, pathname]);

  const bindBySn = new Map(bindings.map((b) => [b.sn, b]));

  const seed: UDevice[] = seedDevices.map((d) => {
    const owner = d.owner_customer_id ? seedCustomers.find((c) => c.id === d.owner_customer_id) : undefined;
    return {
      sn: d.serial_number,
      uuid: d.device_uuid,
      model: d.model,
      hardware_version: d.hardware_version,
      firmware_version: d.firmware_version,
      work_order_number: d.work_order_id,
      factory: d.factory,
      cloud_status: d.cloud_status,
      activated: d.activated,
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : undefined,
      source: "seed",
      created_at: d.created_at,
    };
  });

  const factory: UDevice[] = (batch?.devices ?? []).map((d) => {
    const b = bindBySn.get(d.sn);
    return {
      sn: d.sn,
      uuid: d.uuid,
      activation_key: d.activation_key,
      model: batch?.wo?.model ?? "LYX-01",
      sku: d.sku ?? batch?.wo?.sku,
      hardware_version: batch?.wo?.hw ?? "HW1.2",
      firmware_version: batch?.wo?.fw ?? "1.5.1",
      work_order_number: batch?.wo?.number ?? "WO-CHINA-004",
      factory: "Shenzhen Partner Co.",
      components: d.components,
      stage: d.stage,
      cloud_status: b ? "online" : STAGE_TO_STATUS[d.stage],
      activated: !!b,
      owner: b ? { name: b.ownerName, email: b.ownerEmail } : undefined,
      members: b ? b.members : undefined,
      grow: b ? { recipeId: b.recipeId } : undefined,
      source: "factory",
    };
  });

  const all = [...factory, ...seed];
  const bySn = (sn: string) => all.find((d) => d.sn === sn) ?? null;

  // customers = seed customers + everyone who appears in a binding (owner or member)
  const seedEmails = new Set(seedCustomers.map((c) => c.email.toLowerCase()));
  const derived = new Map<string, UCustomer>();
  bindings.forEach((b) => {
    const add = (email: string, name: string, role: "owner" | "member") => {
      const e = email.toLowerCase();
      if (!e || seedEmails.has(e)) return;
      const existing = derived.get(e);
      const count = all.filter((d) => d.owner?.email?.toLowerCase() === e || d.members?.some((m) => m.email.toLowerCase() === e)).length;
      if (existing) {
        existing.deviceCount = count;
        if (role === "owner") existing.role = "owner";
      } else {
        derived.set(e, { id: `app_${e}`, name, email, source: "app", viaActivation: true, role, deviceCount: count });
      }
    };
    add(b.ownerEmail, b.ownerName, "owner");
    b.members.forEach((m) => add(m.email, m.name, "member"));
  });

  const customers: UCustomer[] = [
    ...seedCustomers.map((c) => ({ id: c.id, name: c.name, email: c.email, source: c.source, deviceCount: all.filter((d) => d.owner?.id === c.id).length })),
    ...derived.values(),
  ];

  return { all, seed, factory, bySn, customers, refresh, factoryCount: factory.length, activatedCount: factory.filter((d) => d.activated).length };
}

/** Component field labels for the detail page. */
export const COMPONENT_LABELS: { key: string; label: L }[] = [
  { key: "pcb", label: { zh: "PCB 主板 SN", en: "PCB SN" } },
  { key: "camera", label: { zh: "相机 SN", en: "Camera SN" } },
  { key: "pump", label: { zh: "水泵 SN", en: "Pump SN" } },
  { key: "led", label: { zh: "LED 灯板 SN", en: "LED board SN" } },
  { key: "power", label: { zh: "电源适配器 SN", en: "Power adapter SN" } },
  { key: "wifi", label: { zh: "Wi-Fi MAC", en: "Wi-Fi MAC" } },
  { key: "bt", label: { zh: "蓝牙 MAC", en: "Bluetooth MAC" } },
  { key: "mcu", label: { zh: "MCU ID", en: "MCU ID" } },
];
