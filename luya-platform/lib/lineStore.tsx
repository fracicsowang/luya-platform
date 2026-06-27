"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { L } from "./i18n";

/* ----------------------------------------------------------------------------
 * Production-line store — MULTI-STATION model.
 * Option A: a supervisor batch pre-generates device identities on a work order.
 * The line then has THREE physical stations, each a different worker's screen:
 *   A 装配/绑定/烧录 → B 测试/质检 → C 装箱/发货
 * Each station only scans and works on devices currently in ITS input stages.
 * Client-side, persisted to localStorage so the demo survives a reload.
 * -------------------------------------------------------------------------- */

export type Stage =
  | "generated" // 已生成身份，待装配
  | "bound" // 部件已绑定
  | "flashed" // 固件已烧录（A 完成，流向 B）
  | "tested" // 测试完成
  | "qc_passed" // QC 通过（B 完成，流向 C）
  | "qc_failed" // QC 失败，待返修
  | "packed" // 已装箱
  | "ship_ready"; // 待发货（C 完成）

export const STAGE_ORDER: Stage[] = ["generated", "bound", "flashed", "tested", "qc_passed", "packed", "ship_ready"];

export const STAGE_LABEL: Record<Stage, L> = {
  generated: { zh: "已生成", en: "Generated" },
  bound: { zh: "部件已绑定", en: "Components bound" },
  flashed: { zh: "固件已烧录", en: "Firmware flashed" },
  tested: { zh: "测试完成", en: "Tested" },
  qc_passed: { zh: "QC 通过", en: "QC passed" },
  qc_failed: { zh: "QC 失败 · 待返修", en: "QC failed · rework" },
  packed: { zh: "已装箱", en: "Packed" },
  ship_ready: { zh: "待发货", en: "Ship-ready" },
};

/* ---- the three physical stations ---- */
export type StationId = "assembly" | "test" | "pack";

export const STATIONS: { id: StationId; tab: L; label: L; desc: L; inputStages: Stage[]; doneStage: Stage; accent: string }[] = [
  {
    id: "assembly",
    tab: { zh: "工位 A · 装配", en: "Station A · Assembly" },
    label: { zh: "工位 A · 装配 / 绑定 / 烧录", en: "Station A · Assembly / Bind / Flash" },
    desc: { zh: "扫设备与部件 SN → 绑定 → 烧录固件，然后流向测试工位。", en: "Scan device & component SNs → bind → flash firmware, then flow to test." },
    inputStages: ["generated", "bound"],
    doneStage: "flashed",
    accent: "blue",
  },
  {
    id: "test",
    tab: { zh: "工位 B · 测试质检", en: "Station B · Test/QC" },
    label: { zh: "工位 B · 测试 / 质检", en: "Station B · Test / QC" },
    desc: { zh: "运行测试清单 → 判定 QC。失败的留在本工位返修重测。", en: "Run the test checklist → decide QC. Failures stay here for rework." },
    inputStages: ["flashed", "tested", "qc_failed"],
    doneStage: "qc_passed",
    accent: "teal",
  },
  {
    id: "pack",
    tab: { zh: "工位 C · 装箱发货", en: "Station C · Pack/Ship" },
    label: { zh: "工位 C · 装箱 / 发货", en: "Station C · Pack / Ship" },
    desc: { zh: "打印标签 → 装箱 → 标记待发货。完成后进入设备管理。", en: "Print label → pack → mark ship-ready. Then enters Device Management." },
    inputStages: ["qc_passed", "packed"],
    doneStage: "ship_ready",
    accent: "violet",
  },
];

export const COMPONENTS: { key: string; label: L }[] = [
  { key: "pcb", label: { zh: "PCB 主板 SN", en: "PCB SN" } },
  { key: "camera", label: { zh: "相机 SN", en: "Camera SN" } },
  { key: "pump", label: { zh: "水泵 SN", en: "Pump SN" } },
  { key: "led", label: { zh: "LED 灯板 SN", en: "LED board SN" } },
  { key: "power", label: { zh: "电源适配器 SN", en: "Power adapter SN" } },
  { key: "wifi", label: { zh: "Wi-Fi MAC", en: "Wi-Fi MAC" } },
  { key: "bt", label: { zh: "蓝牙 MAC", en: "Bluetooth MAC" } },
  { key: "mcu", label: { zh: "MCU ID", en: "MCU ID" } },
];

export const TEST_ITEMS: { key: string; label: L }[] = [
  { key: "power_on", label: { zh: "上电测试", en: "Power-on" } },
  { key: "wifi", label: { zh: "Wi-Fi 测试", en: "Wi-Fi" } },
  { key: "camera", label: { zh: "相机测试", en: "Camera" } },
  { key: "pump", label: { zh: "水泵测试", en: "Pump" } },
  { key: "valve", label: { zh: "阀门测试", en: "Valve" } },
  { key: "led_white", label: { zh: "白光 LED", en: "LED white" } },
  { key: "led_red", label: { zh: "红光 LED", en: "LED red" } },
  { key: "led_blue", label: { zh: "蓝光 LED", en: "LED blue" } },
  { key: "led_nir", label: { zh: "近红外 NIR", en: "LED NIR" } },
  { key: "led_uvb", label: { zh: "UV-B", en: "LED UV-B" } },
  { key: "fan", label: { zh: "风扇测试", en: "Fan" } },
  { key: "water_level", label: { zh: "水位传感器", en: "Water level" } },
  { key: "temp", label: { zh: "温度传感器", en: "Temp sensor" } },
  { key: "humidity", label: { zh: "湿度传感器", en: "Humidity" } },
  { key: "door", label: { zh: "门磁传感器", en: "Door sensor" } },
  { key: "final_qc", label: { zh: "最终 QC", en: "Final QC" } },
];

export type TestResult = "pending" | "pass" | "fail";

export type LineDevice = {
  index: number;
  sn: string;
  uuid: string;
  activation_key: string;
  stage: Stage;
  components: Record<string, string | null>;
  tests: Record<string, TestResult>;
};

export type WorkOrder = { number: string; model: string; hw: string; fw: string; qty: number };

export type LineState = {
  wo: WorkOrder;
  labelsPrinted: boolean;
  devices: LineDevice[];
  activeByStation: Record<StationId, string | null>;
};

const DEFAULT_WO: WorkOrder = { number: "WO-CHINA-004", model: "LYX-01", hw: "HW1.2", fw: "1.5.1", qty: 100 };

const initialState: LineState = {
  wo: DEFAULT_WO,
  labelsPrinted: false,
  devices: [],
  activeByStation: { assembly: null, test: null, pack: null },
};

/* ---- helpers ---- */
const hex = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
const mac = () => Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase()).join(":");

function emptyTests(): Record<string, TestResult> {
  return Object.fromEntries(TEST_ITEMS.map((t) => [t.key, "pending"]));
}
function autoComponents(sn: string): Record<string, string | null> {
  const tail = sn.slice(-6);
  return {
    pcb: `PCB-${tail}`,
    camera: `CAM-${hex(6).toUpperCase()}`,
    pump: `PMP-${tail}`,
    led: `LED-${hex(6).toUpperCase()}`,
    power: `PWR-${tail}`,
    wifi: mac(),
    bt: mac(),
    mcu: `MCU-${hex(8).toUpperCase()}`,
  };
}

export const stageRank = (s: Stage) => (s === "qc_failed" ? 2.5 : STAGE_ORDER.indexOf(s));
export const stationOf = (id: StationId) => STATIONS.find((s) => s.id === id)!;

/* ---- reducer ---- */
type Action =
  | { type: "generate" }
  | { type: "printLabels" }
  | { type: "scan"; station: StationId; sn: string }
  | { type: "scanNext"; station: StationId }
  | { type: "bind"; sn: string }
  | { type: "flash"; sn: string }
  | { type: "setTest"; sn: string; key: string; result: TestResult }
  | { type: "passAllTests"; sn: string }
  | { type: "finishTests"; sn: string }
  | { type: "qc"; sn: string; pass: boolean }
  | { type: "pack"; sn: string }
  | { type: "ship"; sn: string }
  | { type: "rework"; sn: string }
  | { type: "hydrate"; state: LineState }
  | { type: "reset" };

function patch(state: LineState, sn: string, fn: (d: LineDevice) => LineDevice): LineState {
  return { ...state, devices: state.devices.map((d) => (d.sn === sn ? fn(d) : d)) };
}

function reducer(state: LineState, action: Action): LineState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "generate": {
      const month = "2607";
      const devices: LineDevice[] = Array.from({ length: state.wo.qty }, (_, i) => {
        const sn = `LYX-${month}-${String(i + 1).padStart(6, "0")}`;
        return {
          index: i + 1,
          sn,
          uuid: `${hex(8)}-${hex(4)}-${hex(4)}-${hex(12)}`,
          activation_key: hex(12).toUpperCase(),
          stage: "generated",
          components: Object.fromEntries(COMPONENTS.map((c) => [c.key, null])),
          tests: emptyTests(),
        };
      });
      return { ...state, devices, activeByStation: { assembly: null, test: null, pack: null }, labelsPrinted: false };
    }
    case "printLabels":
      return { ...state, labelsPrinted: true };
    case "scan":
      return { ...state, activeByStation: { ...state.activeByStation, [action.station]: action.sn } };
    case "scanNext": {
      const st = stationOf(action.station);
      const next = state.devices
        .filter((d) => st.inputStages.includes(d.stage))
        .sort((a, b) => a.index - b.index)[0];
      return next ? { ...state, activeByStation: { ...state.activeByStation, [action.station]: next.sn } } : state;
    }
    case "bind":
      return patch(state, action.sn, (d) => ({ ...d, components: autoComponents(d.sn), stage: "bound" }));
    case "flash":
      return patch(state, action.sn, (d) => ({ ...d, stage: "flashed" }));
    case "setTest":
      return patch(state, action.sn, (d) => ({ ...d, tests: { ...d.tests, [action.key]: action.result } }));
    case "passAllTests":
      return patch(state, action.sn, (d) => ({ ...d, tests: Object.fromEntries(TEST_ITEMS.map((t) => [t.key, "pass"])), stage: "tested" }));
    case "finishTests":
      return patch(state, action.sn, (d) => ({
        ...d,
        tests: Object.fromEntries(Object.entries(d.tests).map(([k, v]) => [k, v === "pending" ? "pass" : v])) as Record<string, TestResult>,
        stage: "tested",
      }));
    case "qc":
      return patch(state, action.sn, (d) => ({ ...d, stage: action.pass ? "qc_passed" : "qc_failed" }));
    case "pack":
      return patch(state, action.sn, (d) => ({ ...d, stage: "packed" }));
    case "ship":
      return patch(state, action.sn, (d) => ({ ...d, stage: "ship_ready" }));
    case "rework":
      return patch(state, action.sn, (d) => ({ ...d, tests: emptyTests(), stage: "flashed" }));
    case "reset":
      return initialState;
    default:
      return state;
  }
}

const Ctx = createContext<{ state: LineState; dispatch: React.Dispatch<Action> } | null>(null);
const KEY = "luya-line-v2";

export function LineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.activeByStation) dispatch({ type: "hydrate", state: parsed });
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

export function useLine() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLine must be used inside LineProvider");
  return ctx;
}

export function deviceBySn(state: LineState, sn: string | null) {
  return state.devices.find((d) => d.sn === sn) ?? null;
}

/** Devices currently queued at a station (its input stages). */
export function stationQueue(state: LineState, id: StationId) {
  const st = stationOf(id);
  return state.devices.filter((d) => st.inputStages.includes(d.stage)).sort((a, b) => a.index - b.index);
}

export function counters(state: LineState) {
  const at = (min: number) => state.devices.filter((d) => stageRank(d.stage) >= min).length;
  return {
    total: state.devices.length,
    pool: state.devices.filter((d) => d.stage === "generated").length,
    qA: stationQueue(state, "assembly").length,
    qB: stationQueue(state, "test").length,
    qC: stationQueue(state, "pack").length,
    rework: state.devices.filter((d) => d.stage === "qc_failed").length,
    bound: at(1),
    flashed: at(2),
    tested: at(3),
    qcPassed: state.devices.filter((d) => d.stage === "qc_passed" || stageRank(d.stage) >= 5).length,
    packed: at(5),
    shipReady: at(6),
  };
}
