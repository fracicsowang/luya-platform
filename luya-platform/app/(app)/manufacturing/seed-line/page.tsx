"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Bi, Card } from "@/components/ui";
import { TONE_BADGE, Tone } from "@/lib/tone";
import { L } from "@/lib/i18n";
import {
  SEEDS,
  SeedKey,
  SeedState,
  SEED_NEXT_ACTION,
  SEED_STAGE_LABEL,
  SEED_STAGE_ORDER,
  SeedTrayProvider,
  seedCounters,
  useSeedTray,
} from "@/lib/seedTrayStore";

function Btn({ onClick, children, tone = "green", disabled }: { onClick: () => void; children: React.ReactNode; tone?: "green" | "gray" | "blue"; disabled?: boolean }) {
  const map = { green: "bg-green-600 hover:bg-green-700 text-white", blue: "bg-blue-600 hover:bg-blue-700 text-white", gray: "bg-gray-100 hover:bg-gray-200 text-gray-700" };
  return <button onClick={onClick} disabled={disabled} className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${map[tone]}`}>{children}</button>;
}

function Counters({ state }: { state: SeedState }) {
  const c = seedCounters(state);
  const items: { label: L; value: number; tone: Tone }[] = [
    { label: { zh: "已取盘", en: "Taken" }, value: c.total, tone: "gray" },
    { label: { zh: "椰糠", en: "Coir" }, value: c.coir, tone: "amber" },
    { label: { zh: "撒种", en: "Seeded" }, value: c.seeded, tone: "blue" },
    { label: { zh: "包装", en: "Packaged" }, value: c.packaged, tone: "violet" },
    { label: { zh: "入库", en: "Stocked" }, value: c.labeled, tone: "green" },
    { label: { zh: "已被客户使用", en: "Used by customers" }, value: c.used, tone: "teal" },
  ];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {items.map((it, i) => (
        <div key={i} className={`rounded-lg px-3 py-2 ring-1 ring-inset ${TONE_BADGE[it.tone]}`}>
          <div className="text-lg font-semibold tabular-nums">{it.value}</div>
          <div className="text-[11px] opacity-80"><Bi v={it.label} /></div>
        </div>
      ))}
    </div>
  );
}

function TrayLabel({ id, seedKey, lot, expiry }: { id: string; seedKey: SeedKey; lot: string; expiry: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-3 max-w-xs">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-600 text-white text-xs font-bold">L</span>
        <span className="text-sm font-semibold text-gray-900"><Bi v={SEEDS[seedKey].name} /> <span className="text-gray-400 font-normal">· <Bi v={{ zh: "微菜种子盘", en: "Microgreens Tray" }} /></span></span>
      </div>
      <div className="mt-2 flex gap-3">
        <div className="flex-1 text-xs space-y-0.5">
          <div className="text-gray-700 font-mono">{id}</div>
          <div className="text-gray-500">Lot: <span className="font-mono">{lot}</span></div>
          <div className="text-gray-500"><Bi v={{ zh: "有效期", en: "Expiry" }} />: {expiry}</div>
          <div className="text-[10px] text-green-700 mt-1"><Bi v={{ zh: "Luya 自产 · 仅适用 Luya 种植机", en: "Made by Luya · Luya growers only" }} /></div>
        </div>
        <div className="shrink-0 text-center">
          <div className="h-16 w-16 grid place-items-center rounded border-2 border-gray-300 text-[10px] text-gray-400">QR</div>
          <div className="mt-1 text-[9px] text-gray-400 font-mono">add/{id.slice(-6)}</div>
        </div>
      </div>
      <div className="mt-2 border-t border-gray-100 pt-1.5 text-[10px] text-gray-500">
        <Bi v={{ zh: "客户扫码添加（一次性，添加后失效）", en: "Customer scans to add (single-use; invalid afterward)" }} />
      </div>
    </div>
  );
}

const SEED_OPTIONS: SeedKey[] = ["broccoli", "radish", "pea", "sunflower"];

function GeneratePanel() {
  const { dispatch } = useSeedTray();
  const [seed, setSeed] = useState<SeedKey>("broccoli");
  const [qty, setQty] = useState(200);
  return (
    <Card className="p-6">
      <div className="text-sm font-semibold text-gray-900 mb-1"><Bi v={{ zh: "第 1 步 · 创建播种批次", en: "Step 1 · Create seeding batch" }} /></div>
      <p className="text-xs text-gray-500 mb-4 max-w-xl"><Bi v={{ zh: "选种子类型和数量，系统为每个托盘生成唯一 ID + 二维码（含 token）。", en: "Pick seed type & qty; the system issues a unique ID + QR (with token) per tray." }} /></p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs text-gray-500"><Bi v={{ zh: "种子类型", en: "Seed type" }} /></span>
          <select value={seed} onChange={(e) => setSeed(e.target.value as SeedKey)} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm">
            {SEED_OPTIONS.map((s) => (<option key={s} value={s}>{SEEDS[s].name.zh} · {SEEDS[s].name.en}</option>))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-500"><Bi v={{ zh: "数量", en: "Qty" }} /></span>
          <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} className="mt-1 block w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </label>
        <Btn onClick={() => dispatch({ type: "generate", seedKey: seed, qty })}>🌱 <Bi v={{ zh: `生成 ${qty} 个托盘`, en: `Generate ${qty} trays` }} /></Btn>
      </div>
    </Card>
  );
}

function PrintLabels() {
  const { state, dispatch } = useSeedTray();
  if (!state.batch) return null;
  const sample = state.trays[0];
  if (state.labelsPrinted) {
    return (
      <Card className="p-3 flex items-center gap-2 flex-wrap bg-green-50/50 border-green-200">
        <span className="text-xs text-green-800">✓ <Bi v={{ zh: `已批量打印 ${state.batch.qty} 张防水标签卷，下发到贴标工位（第 e 步）。`, en: `Printed a roll of ${state.batch.qty} waterproof labels, sent to the labeling station (step e).` }} /></span>
      </Card>
    );
  }
  return (
    <Card className="p-4 bg-amber-50/50 border-amber-200">
      <div className="text-sm font-semibold text-amber-900 mb-1"><Bi v={{ zh: "第 2 步 · 批量印刷标签卷", en: "Step 2 · Batch-print the label roll" }} /></div>
      <p className="text-xs text-amber-800/90 mb-3 max-w-xl"><Bi v={{ zh: "种子盘提前整卷预印（防水），到第 e 步顺序撕贴——产线又湿又快，不逐盘打印。二维码含 token：防伪、保证一次性、仅 Luya 自产。", en: "Pre-print the whole waterproof roll up front; peel one per tray at step e (the line is wet & fast). The QR carries a token: anti-counterfeit, single-use, Luya-only." }} /></p>
      {sample ? <div className="mb-3"><TrayLabel id={sample.id} seedKey={sample.seedKey} lot={sample.lot} expiry={sample.expiry} /></div> : null}
      <Btn onClick={() => dispatch({ type: "printLabels" })}>🖨️ <Bi v={{ zh: `打印 ${state.batch.qty} 张标签卷`, en: `Print ${state.batch.qty}-label roll` }} /></Btn>
    </Card>
  );
}

function Station() {
  const { state, dispatch } = useSeedTray();
  const tray = state.trays.find((t) => t.id === state.activeId) ?? null;

  if (!tray) {
    return (
      <Card className="p-6 text-center text-sm text-gray-500">
        <Bi v={{ zh: "扫描托盘二维码，或点「扫码下一个」开始作业。", en: "Scan a tray QR, or tap “Scan next” to start." }} />
        <div className="mt-3"><Btn onClick={() => dispatch({ type: "scanNext" })}>📷 <Bi v={{ zh: "扫码下一个托盘", en: "Scan next tray" }} /></Btn></div>
      </Card>
    );
  }

  const nextAction = SEED_NEXT_ACTION[tray.stage];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs text-gray-400"><Bi v={{ zh: "当前托盘", en: "Active tray" }} /></div>
          <div className="font-mono text-lg font-semibold text-gray-900">{tray.id}</div>
          <div className="text-xs text-gray-500"><Bi v={SEEDS[tray.seedKey].name} /> · Lot {tray.lot}</div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_BADGE[tray.stage === "labeled" ? "green" : "amber"]}`}>
          <Bi v={SEED_STAGE_LABEL[tray.stage]} />
        </span>
      </div>

      {/* 5-step stepper */}
      <div className="mt-3 flex items-center gap-1 flex-wrap">
        {SEED_STAGE_ORDER.map((s, i) => {
          const done = SEED_STAGE_ORDER.indexOf(tray.stage) >= SEED_STAGE_ORDER.indexOf(s);
          const current = tray.stage === s;
          return (
            <div key={s} className="flex items-center gap-1">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${current ? "bg-green-600 text-white" : done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}><Bi v={SEED_STAGE_LABEL[s]} /></span>
              {i < SEED_STAGE_ORDER.length - 1 ? <span className="text-gray-300">›</span> : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        {nextAction ? (
          <div className="space-y-3">
            {tray.stage === "packaged" ? <TrayLabel id={tray.id} seedKey={tray.seedKey} lot={tray.lot} expiry={tray.expiry} /> : null}
            <Btn tone={tray.stage === "packaged" ? "green" : "blue"} disabled={tray.stage === "packaged" && !state.labelsPrinted} onClick={() => dispatch({ type: "advance", id: tray.id })}><Bi v={nextAction} /></Btn>
            {tray.stage === "packaged" && !state.labelsPrinted ? (
              <div className="text-[11px] text-amber-700"><Bi v={{ zh: "请先在上方「批量印刷标签卷」，才能贴标。", en: "Print the label roll above first before labeling." }} /></div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md bg-green-50 text-green-700 text-sm px-3 py-3 flex items-center justify-between gap-2 flex-wrap">
            <span>✅ <Bi v={{ zh: "已完成，入库待发货。客户扫此码即可添加并种植。", en: "Done — stocked & ship-ready. The customer scans this QR to add & grow." }} /></span>
            <Btn onClick={() => dispatch({ type: "scanNext" })}>📷 <Bi v={{ zh: "扫码下一个", en: "Scan next" }} /></Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

function ScanBar() {
  const { state, dispatch } = useSeedTray();
  const pending = state.trays.filter((t) => t.stage !== "labeled");
  return (
    <Card className="p-3 flex items-center gap-2 flex-wrap">
      <Btn onClick={() => dispatch({ type: "scanNext" })}>📷 <Bi v={{ zh: "扫码下一个托盘", en: "Scan next tray" }} /></Btn>
      <select onChange={(e) => e.target.value && dispatch({ type: "scan", id: e.target.value })} value={state.activeId ?? ""} className="rounded-lg border border-gray-300 px-2 py-2 text-sm font-mono max-w-[200px]">
        <option value="">{`待处理 ${pending.length} 个`}</option>
        {pending.slice(0, 50).map((t) => (<option key={t.id} value={t.id}>{t.id}</option>))}
      </select>
    </Card>
  );
}

function SeedLine() {
  const { state, dispatch } = useSeedTray();
  const c = seedCounters(state);
  const has = state.trays.length > 0;
  const pct = c.total ? Math.round((c.labeled / c.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        pillar={{ zh: "Luya Manufacturing · 制造", en: "Luya Manufacturing" }}
        title={{ zh: "美国种子盘生产线（扫码作业）", en: "US Seed-Tray Production Line (scan-driven)" }}
        desc={{ zh: "美国工厂工人按 5 步生产种子盘：取盘 → 放椰糠 → 撒种 → 包装 → 贴种子名+二维码。每个托盘唯一二维码，客户扫码一次性添加。", en: "US worker, 5 steps: take tray → coco coir → sow → package → label (name + QR). Each tray has a unique single-use QR for the customer." }}
      />
      <div className="mb-4 flex items-center gap-3 flex-wrap text-sm">
        <Link href="/manufacturing" className="text-gray-500 hover:text-gray-800">← <Bi v={{ zh: "返回制造门户", en: "Back to Manufacturing" }} /></Link>
        {has ? <button onClick={() => { if (confirm("重置本批次？/ Reset this batch?")) dispatch({ type: "reset" }); }} className="text-gray-400 hover:text-red-600 text-xs"><Bi v={{ zh: "重置演示", en: "Reset" }} /></button> : null}
      </div>

      {has ? (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="text-sm"><span className="font-mono font-semibold text-gray-900">{state.batch?.lot}</span><span className="text-gray-400"> · <Bi v={SEEDS[state.batch!.seedKey].name} /> · {state.batch?.qty} <Bi v={{ zh: "个托盘", en: "trays" }} /></span></div>
            <div className="text-sm tabular-nums text-gray-600"><Bi v={{ zh: "入库", en: "Stocked" }} /> <span className="font-semibold text-green-700">{c.labeled}</span> / {c.total} <span className="text-gray-400">({pct}%)</span></div>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-3"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} /></div>
          <Counters state={state} />
        </Card>
      ) : null}

      {!has ? <GeneratePanel /> : (
        <div className="space-y-4">
          <PrintLabels />
          <ScanBar />
          <Station />
        </div>
      )}
    </div>
  );
}

export default function SeedLinePage() {
  return (
    <SeedTrayProvider>
      <SeedLine />
    </SeedTrayProvider>
  );
}
