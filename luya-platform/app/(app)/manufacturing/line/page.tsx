"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Bi, Card } from "@/components/ui";
import { TONE_BADGE, Tone } from "@/lib/tone";
import { L } from "@/lib/i18n";
import { activeMachineSkus } from "@/lib/products";
import {
  COMPONENTS,
  LineProvider,
  LineState,
  Stage,
  StationId,
  STATIONS,
  STAGE_LABEL,
  STAGE_ORDER,
  TEST_ITEMS,
  counters,
  deviceBySn,
  stageRank,
  stationOf,
  stationQueue,
  useLine,
} from "@/lib/lineStore";

const STAGE_TONE: Record<Stage, Tone> = {
  generated: "gray",
  bound: "blue",
  flashed: "indigo",
  tested: "teal",
  qc_passed: "green",
  qc_failed: "red",
  packed: "violet",
  ship_ready: "green",
};

function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_BADGE[STAGE_TONE[stage]]}`}>
      <Bi v={STAGE_LABEL[stage]} />
    </span>
  );
}

function Btn({ onClick, children, tone = "green", disabled }: { onClick: () => void; children: React.ReactNode; tone?: "green" | "red" | "gray" | "blue"; disabled?: boolean }) {
  const map = {
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    gray: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${map[tone]}`}>
      {children}
    </button>
  );
}

/* ---- Pipeline overview: WIP queued at each station (the bottleneck view) ---- */
function Pipeline({ state, selected, onSelect }: { state: LineState; selected: StationId; onSelect: (s: StationId) => void }) {
  const c = counters(state);
  const boxes: { id?: StationId; title: L; count: number; tone: Tone; sub?: L; alert?: L }[] = [
    { id: "assembly", title: { zh: "工位 A 装配", en: "A · Assembly" }, count: c.qA, tone: "blue", sub: { zh: `含待装配 ${c.pool}`, en: `${c.pool} waiting` } },
    { id: "test", title: { zh: "工位 B 测试质检", en: "B · Test/QC" }, count: c.qB, tone: "teal", alert: c.rework ? { zh: `含返修 ${c.rework}`, en: `${c.rework} rework` } : undefined },
    { id: "pack", title: { zh: "工位 C 装箱发货", en: "C · Pack/Ship" }, count: c.qC, tone: "violet" },
    { title: { zh: "已完成", en: "Done" }, count: c.shipReady, tone: "green" },
  ];
  return (
    <Card className="p-3">
      <div className="text-xs text-gray-500 mb-2">
        <Bi v={{ zh: "线体流水总览（每个工位在制/排队数，点击切换工位）", en: "Line overview — WIP per station (click to switch station)" }} />
      </div>
      <div className="flex items-stretch gap-1 overflow-x-auto">
        {boxes.map((b, i) => (
          <div key={i} className="flex items-center gap-1">
            <button
              onClick={() => b.id && onSelect(b.id)}
              disabled={!b.id}
              className={`min-w-[92px] rounded-lg px-2.5 py-2 text-left ring-1 ring-inset transition-all ${TONE_BADGE[b.tone]} ${b.id ? "cursor-pointer hover:brightness-95" : "cursor-default"} ${b.id === selected ? "outline outline-2 outline-offset-1 outline-green-500" : ""}`}
            >
              <div className="text-xl font-semibold tabular-nums leading-none">{b.count}</div>
              <div className="text-[10px] mt-1 leading-tight"><Bi v={b.title} /></div>
              {b.sub ? <div className="text-[10px] opacity-60 mt-0.5 leading-tight"><Bi v={b.sub} /></div> : null}
              {b.alert ? <div className="text-[10px] text-red-600 mt-0.5 leading-tight"><Bi v={b.alert} /></div> : null}
            </button>
            {i < boxes.length - 1 ? <span className="text-gray-300 text-lg shrink-0">→</span> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

function StationTabs({ selected, onSelect, state }: { selected: StationId; onSelect: (s: StationId) => void; state: LineState }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {STATIONS.map((st) => {
        const q = stationQueue(state, st.id).length;
        const active = selected === st.id;
        return (
          <button
            key={st.id}
            onClick={() => onSelect(st.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ring-1 ring-inset ${active ? "bg-green-600 text-white ring-green-600" : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"}`}
          >
            <Bi v={st.tab} /> <span className={`ml-1 tabular-nums ${active ? "text-white/80" : "text-gray-400"}`}>{q}</span>
          </button>
        );
      })}
    </div>
  );
}

function ComponentList({ dev }: { dev: { components: Record<string, string | null> } }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {COMPONENTS.map((c) => {
        const v = dev.components[c.key];
        return (
          <div key={c.key} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50/50 px-2 py-1">
            <span className="text-[11px] text-gray-600"><Bi v={c.label} /></span>
            <span className={`font-mono text-[11px] ${v ? "text-green-700" : "text-gray-300"}`}>{v ?? "—"}</span>
          </div>
        );
      })}
    </div>
  );
}

function PanelTitle({ title, hint }: { title: L; hint?: L }) {
  return (
    <div className="mb-3">
      <div className="text-sm font-semibold text-gray-900"><Bi v={title} /></div>
      {hint ? <div className="text-xs text-gray-500"><Bi v={hint} /></div> : null}
    </div>
  );
}

function FlowedOn({ msg, onNext }: { msg: L; onNext: () => void }) {
  return (
    <div className="rounded-md bg-green-50 text-green-700 text-sm px-3 py-3 flex items-center justify-between gap-2 flex-wrap">
      <span>✅ <Bi v={msg} /></span>
      <Btn onClick={onNext}>📷 <Bi v={{ zh: "扫码下一台", en: "Scan next" }} /></Btn>
    </div>
  );
}

/* ---- Station-scoped action card: only this station's actions for this device ---- */
function StationActive({ stationId }: { stationId: StationId }) {
  const { state, dispatch } = useLine();
  const st = stationOf(stationId);
  const dev = deviceBySn(state, state.activeByStation[stationId]);
  const next = () => dispatch({ type: "scanNext", station: stationId });

  if (!dev) {
    return (
      <Card className="p-6 text-center">
        <div className="text-sm text-gray-500">
          <Bi v={{ zh: "扫描设备二维码，或点「扫码下一台」从本工位队列取一台。", en: "Scan a device QR, or tap “Scan next” to pull one from this station's queue." }} />
        </div>
      </Card>
    );
  }

  const passCount = TEST_ITEMS.filter((t) => dev.tests[t.key] === "pass").length;
  const failCount = TEST_ITEMS.filter((t) => dev.tests[t.key] === "fail").length;
  const inThisStation = st.inputStages.includes(dev.stage);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-gray-400"><Bi v={{ zh: "当前设备", en: "Active device" }} /></div>
          <div className="font-mono text-lg font-semibold text-gray-900">{dev.sn}</div>
          <div className="font-mono text-[11px] text-gray-400">UUID {dev.uuid}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StageBadge stage={dev.stage} />
          <div className="h-14 w-14 grid place-items-center rounded border-2 border-gray-300 text-[10px] text-gray-400">QR</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 flex-wrap">
        {STAGE_ORDER.map((s, i) => {
          const done = stageRank(dev.stage) >= stageRank(s);
          const current = dev.stage === s || (dev.stage === "qc_failed" && s === "qc_passed");
          const failed = dev.stage === "qc_failed" && s === "qc_passed";
          return (
            <div key={s} className="flex items-center gap-1">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${failed ? "bg-red-100 text-red-700" : current ? "bg-green-600 text-white" : done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                <Bi v={STAGE_LABEL[s]} />
              </span>
              {i < STAGE_ORDER.length - 1 ? <span className="text-gray-300">›</span> : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        {/* device finished this station and flowed to the next one */}
        {!inThisStation && dev.stage === "flashed" && stationId === "assembly" && (
          <FlowedOn msg={{ zh: "装配完成，已流向「工位 B 测试质检」。", en: "Assembly done — flowed to Station B (Test/QC)." }} onNext={next} />
        )}
        {!inThisStation && dev.stage === "qc_passed" && stationId === "test" && (
          <FlowedOn msg={{ zh: "QC 通过，已流向「工位 C 装箱发货」。", en: "QC passed — flowed to Station C (Pack/Ship)." }} onNext={next} />
        )}
        {!inThisStation && dev.stage === "ship_ready" && stationId === "pack" && (
          <FlowedOn msg={{ zh: "已完成，进入「设备管理」，等待客户激活。", en: "Done — now in Device Management, awaiting activation." }} onNext={next} />
        )}
        {!inThisStation && !["flashed", "qc_passed", "ship_ready"].includes(dev.stage) && (
          <div className="rounded-md bg-amber-50 text-amber-800 text-sm px-3 py-3 flex items-center justify-between gap-2 flex-wrap">
            <span>⚠ <Bi v={{ zh: "这台不在本工位（当前阶段见上方），请扫本工位的设备。", en: "This unit isn't at this station. Scan one from this station." }} /></span>
            <Btn tone="gray" onClick={next}>📷 <Bi v={{ zh: "扫码下一台", en: "Scan next" }} /></Btn>
          </div>
        )}

        {/* STATION A actions */}
        {stationId === "assembly" && dev.stage === "generated" && (
          <div>
            <PanelTitle title={{ zh: "绑定硬件部件", en: "Bind components" }} hint={{ zh: "扫码枪逐个扫部件 SN（演示点按钮自动填充）", en: "Scan each component SN (button auto-fills here)" }} />
            <ComponentList dev={dev} />
            <div className="mt-3"><Btn tone="blue" onClick={() => dispatch({ type: "bind", sn: dev.sn })}>📷 <Bi v={{ zh: "扫码绑定全部部件", en: "Scan & bind all" }} /></Btn></div>
          </div>
        )}
        {stationId === "assembly" && dev.stage === "bound" && (
          <div>
            <PanelTitle title={{ zh: "烧录固件", en: "Flash firmware" }} hint={{ zh: `目标固件 ${state.wo.fw}`, en: `Target firmware ${state.wo.fw}` }} />
            <ComponentList dev={dev} />
            <div className="mt-3"><Btn tone="blue" onClick={() => dispatch({ type: "flash", sn: dev.sn })}>⚡ <Bi v={{ zh: "烧录固件", en: "Flash firmware" }} /></Btn></div>
          </div>
        )}

        {/* STATION B actions */}
        {stationId === "test" && dev.stage === "flashed" && (
          <div>
            <PanelTitle title={{ zh: "工厂测试", en: "Factory test" }} hint={{ zh: "逐项点 ✓ / ✗，或一键全部通过", en: "Tap ✓ / ✗ per item, or pass all" }} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TEST_ITEMS.map((t) => {
                const r = dev.tests[t.key];
                return (
                  <div key={t.key} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50/50 px-2 py-1">
                    <span className="text-[11px] text-gray-700"><Bi v={t.label} /></span>
                    <span className="flex gap-1">
                      <button onClick={() => dispatch({ type: "setTest", sn: dev.sn, key: t.key, result: "pass" })} className={`h-5 w-5 rounded text-[11px] ${r === "pass" ? "bg-green-600 text-white" : "bg-white text-green-600 ring-1 ring-green-200"}`}>✓</button>
                      <button onClick={() => dispatch({ type: "setTest", sn: dev.sn, key: t.key, result: "fail" })} className={`h-5 w-5 rounded text-[11px] ${r === "fail" ? "bg-red-600 text-white" : "bg-white text-red-500 ring-1 ring-red-200"}`}>✗</button>
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Btn onClick={() => dispatch({ type: "passAllTests", sn: dev.sn })}>✅ <Bi v={{ zh: "全部通过", en: "Pass all" }} /></Btn>
              <Btn tone="gray" onClick={() => dispatch({ type: "finishTests", sn: dev.sn })}><Bi v={{ zh: "完成测试", en: "Finish tests" }} /></Btn>
            </div>
          </div>
        )}
        {stationId === "test" && dev.stage === "tested" && (
          <div>
            <PanelTitle title={{ zh: "QC 判定", en: "QC decision" }} hint={{ zh: `${passCount} 项通过 · ${failCount} 项失败`, en: `${passCount} pass · ${failCount} fail` }} />
            <div className="flex gap-2 flex-wrap">
              <Btn onClick={() => dispatch({ type: "qc", sn: dev.sn, pass: true })}>👍 <Bi v={{ zh: "QC 通过", en: "QC pass" }} /></Btn>
              <Btn tone="red" onClick={() => dispatch({ type: "qc", sn: dev.sn, pass: false })}>👎 <Bi v={{ zh: "QC 失败（返修）", en: "QC fail (rework)" }} /></Btn>
            </div>
          </div>
        )}
        {stationId === "test" && dev.stage === "qc_failed" && (
          <div>
            <PanelTitle title={{ zh: "返修流", en: "Rework" }} hint={{ zh: "该设备不能装箱，返修后重测", en: "Cannot be packed; rework then re-test" }} />
            <div className="rounded-md bg-red-50 text-red-700 text-xs px-3 py-2 mb-3"><Bi v={{ zh: "已标记 QC 失败，留在测试工位返修。", en: "Marked QC-failed; held at the test station for rework." }} /></div>
            <Btn tone="blue" onClick={() => dispatch({ type: "rework", sn: dev.sn })}>🔧 <Bi v={{ zh: "返修后重测", en: "Rework & re-test" }} /></Btn>
          </div>
        )}

        {/* STATION C actions */}
        {stationId === "pack" && dev.stage === "qc_passed" && (
          <div>
            <PanelTitle title={{ zh: "打标签 + 装箱", en: "Label + pack" }} hint={{ zh: "标签含 品牌/型号/SN/二维码/认证占位", en: "Brand / model / SN / QR / cert placeholders" }} />
            <Btn tone="blue" onClick={() => dispatch({ type: "pack", sn: dev.sn })}>🖨️ <Bi v={{ zh: "打印标签并装箱", en: "Print label & pack" }} /></Btn>
          </div>
        )}
        {stationId === "pack" && dev.stage === "packed" && (
          <div className="space-y-3">
            <PanelTitle title={{ zh: "装箱 · 待发货", en: "Pack · ship-ready" }} hint={{ zh: "外箱只贴 SN + 二维码；激活改用邮箱+蓝牙，无需放激活码卡。", en: "Box carries only SN + QR; activation uses email + Bluetooth, no key card needed." }} />
            <Btn onClick={() => dispatch({ type: "ship", sn: dev.sn })}>📦 <Bi v={{ zh: "标记待发货", en: "Mark ship-ready" }} /></Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

function StationScanBar({ stationId }: { stationId: StationId }) {
  const { state, dispatch } = useLine();
  const [sn, setSn] = useState("");
  const queue = stationQueue(state, stationId);
  return (
    <Card className="p-3">
      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-gray-500"><Bi v={{ zh: "扫描 / 输入序列号", en: "Scan / type serial number" }} /></label>
          <div className="flex gap-2 mt-1">
            <input
              value={sn}
              onChange={(e) => setSn(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && sn) dispatch({ type: "scan", station: stationId, sn: sn.trim() }); }}
              placeholder="LYX-2607-000001"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Btn tone="gray" onClick={() => sn && dispatch({ type: "scan", station: stationId, sn: sn.trim() })}><Bi v={{ zh: "打开", en: "Open" }} /></Btn>
          </div>
        </div>
        <Btn onClick={() => dispatch({ type: "scanNext", station: stationId })}>📷 <Bi v={{ zh: "扫码下一台", en: "Scan next" }} /></Btn>
        <select
          onChange={(e) => e.target.value && dispatch({ type: "scan", station: stationId, sn: e.target.value })}
          value={state.activeByStation[stationId] ?? ""}
          className="rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono max-w-[160px]"
        >
          <option value="">{`本工位队列 ${queue.length}`}</option>
          {queue.slice(0, 50).map((d) => (<option key={d.sn} value={d.sn}>{d.sn}</option>))}
        </select>
      </div>
    </Card>
  );
}

function GeneratePanel() {
  const { state, dispatch } = useLine();
  const machineSkus = activeMachineSkus();
  const [sku, setSku] = useState(state.wo.sku);
  return (
    <Card className="p-6">
      <div className="text-sm font-semibold text-gray-900 mb-1"><Bi v={{ zh: "第 1 步 · 批量预生成设备身份（主管）", en: "Step 1 · Batch pre-generate identities (supervisor)" }} /></div>
      <p className="text-xs text-gray-500 mb-3 max-w-xl">
        <Bi v={{ zh: `工单 ${state.wo.number} 计划 ${state.wo.qty} 台。先选本批次的 SKU（型号+颜色+市场）——每个生成的 SN 都带上它，打通 SN→SKU→UPC/ASIN。`, en: `Work order ${state.wo.number}, qty ${state.wo.qty}. Pick the batch SKU (model+color+market) — every generated SN carries it, connecting SN→SKU→UPC/ASIN.` }} />
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs text-gray-500"><Bi v={{ zh: "本批次 SKU", en: "Batch SKU" }} /></span>
          <select value={sku} onChange={(e) => setSku(e.target.value)} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono">
            {machineSkus.map((p) => (<option key={p.sku} value={p.sku}>{p.sku} · {p.variant.zh}</option>))}
          </select>
        </label>
        <Btn onClick={() => dispatch({ type: "generate", sku })}>🏷️ <Bi v={{ zh: `生成 ${state.wo.qty} 台设备`, en: `Generate ${state.wo.qty} devices` }} /></Btn>
      </div>
    </Card>
  );
}

function LineStation() {
  const { state, dispatch } = useLine();
  const [selected, setSelected] = useState<StationId>("assembly");
  const c = counters(state);
  const generated = state.devices.length > 0;
  const pct = c.total ? Math.round((c.shipReady / c.total) * 100) : 0;
  const st = stationOf(selected);

  return (
    <div>
      <PageHeader
        pillar={{ zh: "Luya Manufacturing · 制造", en: "Luya Manufacturing" }}
        title={{ zh: "产线工位（多工位 · 扫码作业）", en: "Production Line (multi-station · scan-driven)" }}
        desc={{ zh: "三个独立工位，各代表一名工人的屏幕：A 装配/绑定/烧录 → B 测试/质检 → C 装箱/发货。每个工位只处理流到自己队列里的设备。", en: "Three independent stations, each a worker's screen: A Assembly → B Test/QC → C Pack/Ship. Each station only handles devices in its own queue." }}
      />

      <div className="mb-4 flex items-center gap-3 flex-wrap text-sm">
        <Link href="/manufacturing" className="text-gray-500 hover:text-gray-800">← <Bi v={{ zh: "返回制造门户", en: "Back to Manufacturing" }} /></Link>
        {c.shipReady > 0 ? (
          <Link href="/devices/activate" className="text-green-700 hover:text-green-800 font-medium">
            <Bi v={{ zh: `下一步：客户激活已发货的 ${c.shipReady} 台 →`, en: `Next: customer activates the ${c.shipReady} shipped units →` }} />
          </Link>
        ) : null}
        {generated ? (
          <button onClick={() => { if (confirm("重置本批次演示？ / Reset this batch demo?")) dispatch({ type: "reset" }); }} className="text-gray-400 hover:text-red-600 text-xs">
            <Bi v={{ zh: "重置演示", en: "Reset demo" }} />
          </button>
        ) : null}
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div className="text-sm">
            <span className="font-mono font-semibold text-gray-900">{state.wo.number}</span>
            <span className="text-gray-400"> · SKU </span><span className="font-mono text-gray-700">{state.wo.sku}</span>
            <span className="text-gray-400"> · {state.wo.hw} · FW {state.wo.fw}</span>
          </div>
          <div className="text-sm tabular-nums text-gray-600">
            <Bi v={{ zh: "待发货", en: "Ship-ready" }} /> <span className="font-semibold text-green-700">{c.shipReady}</span> / {state.wo.qty} <span className="text-gray-400">({pct}%)</span>
          </div>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      {!generated ? (
        <GeneratePanel />
      ) : (
        <div className="space-y-4">
          {!state.labelsPrinted ? (
            <Card className="p-3 flex items-center justify-between gap-2 flex-wrap bg-amber-50/50 border-amber-200">
              <span className="text-xs text-amber-800"><Bi v={{ zh: "已生成身份。提前打印整卷二维码标签，分发到各工位。", en: "Identities ready. Pre-print the QR label roll and distribute to stations." }} /></span>
              <Btn tone="gray" onClick={() => dispatch({ type: "printLabels" })}>🖨️ <Bi v={{ zh: `打印 ${state.wo.qty} 张标签`, en: `Print ${state.wo.qty} labels` }} /></Btn>
            </Card>
          ) : null}

          <Pipeline state={state} selected={selected} onSelect={setSelected} />

          <StationTabs state={state} selected={selected} onSelect={setSelected} />

          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
            <div className="text-sm font-semibold text-gray-900"><Bi v={st.label} /></div>
            <div className="text-xs text-gray-500"><Bi v={st.desc} /></div>
          </div>

          <StationScanBar stationId={selected} />
          <StationActive stationId={selected} />
        </div>
      )}
    </div>
  );
}

export default function ProductionLinePage() {
  return (
    <LineProvider>
      <LineStation />
    </LineProvider>
  );
}
