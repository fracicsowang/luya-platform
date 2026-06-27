"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Bi, Card } from "@/components/ui";
import { L } from "@/lib/i18n";

/** Fake 1D barcode (visual only). */
function Barcode({ value, type }: { value: string; type?: string }) {
  return (
    <div>
      <div
        className="h-10 w-full rounded-sm"
        style={{ background: "repeating-linear-gradient(90deg,#111 0 2px,#fff 2px 3px,#111 3px 5px,#fff 5px 6px,#111 6px 9px,#fff 9px 11px)" }}
      />
      <div className="mt-0.5 flex justify-between text-[10px] font-mono text-gray-500">
        <span>{type ?? ""}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

function Row({ k, v, hint }: { k: L; v: string; hint?: L }) {
  return (
    <div className="flex justify-between gap-2 py-0.5 text-xs">
      <span className="text-gray-500"><Bi v={k} /></span>
      <span className="text-right text-gray-900 font-mono">{v}</span>
      {hint ? <span className="sr-only"><Bi v={hint} /></span> : null}
    </div>
  );
}

const WHERE: Record<string, { label: L; cls: string }> = {
  body: { label: { zh: "贴在机身", en: "On the device" }, cls: "bg-slate-100 text-slate-700" },
  retail: { label: { zh: "印在彩盒外", en: "On the retail box" }, cls: "bg-blue-100 text-blue-700" },
  carton: { label: { zh: "贴在运输纸箱", en: "On the shipping carton" }, cls: "bg-amber-100 text-amber-800" },
};

function LabelCard({ where, title, children, note }: { where: keyof typeof WHERE; title: L; children: React.ReactNode; note?: L }) {
  const w = WHERE[where];
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/60">
        <span className="text-sm font-semibold text-gray-900"><Bi v={title} /></span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${w.cls}`}><Bi v={w.label} /></span>
      </div>
      <div className="p-3">
        {/* the printed label mock */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-3">{children}</div>
        {note ? <p className="mt-2 text-[11px] text-gray-400"><Bi v={note} /></p> : null}
      </div>
    </Card>
  );
}

export default function PackagingPage() {
  return (
    <div>
      <PageHeader
        pillar={{ zh: "Luya Manufacturing · 制造", en: "Luya Manufacturing" }}
        title={{ zh: "包装标签规范", en: "Packaging Label Spec" }}
        desc={{ zh: "三层标签：机身标 / 零售彩盒标 / 运输外箱唛头。因 Wi-Fi·蓝牙用现成（预认证）模组，须标 Contains FCC ID；激活改用邮箱+蓝牙，外部不再印激活码。", en: "Three label layers: device body / retail box / shipping carton. Wi-Fi·BT use a pre-certified module → must show Contains FCC ID; activation moved to email + Bluetooth, so no key printed outside." }}
      />
      <div className="mb-4">
        <Link href="/manufacturing" className="text-sm text-gray-500 hover:text-gray-800">← <Bi v={{ zh: "返回制造门户", en: "Back to Manufacturing" }} /></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* 1. Device body label */}
        <LabelCard where="body" title={{ zh: "① 机身标", en: "① Device body label" }} note={{ zh: "贴机身底部，永久标识；含监管标。", en: "On the device base — permanent ID + regulatory marks." }}>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="text-base font-bold tracking-wide">LUYA</div>
              <Row k={{ zh: "型号", en: "Model" }} v="LYX-01" />
              <Row k={{ zh: "序列号", en: "S/N" }} v="LYX-2607-000001" />
              <Row k={{ zh: "输入", en: "Input" }} v="24V ⎓ 2A" />
              <Row k={{ zh: "硬件", en: "HW" }} v="HW1.2" />
            </div>
            <div className="shrink-0 text-center">
              <div className="h-14 w-14 grid place-items-center rounded border-2 border-gray-300 text-[10px] text-gray-400">QR</div>
            </div>
          </div>
          <div className="mt-2 border-t border-gray-100 pt-1.5 text-[10px] text-gray-500 space-y-0.5">
            <div>Contains FCC ID: 2A1B3-WB01</div>
            <div>UL / ETL · DOE Level VI</div>
            <div>Made in China</div>
          </div>
        </LabelCard>

        {/* 2. Retail box label */}
        <LabelCard where="retail" title={{ zh: "② 零售彩盒标", en: "② Retail box label" }} note={{ zh: "消费者面；零售/Amazon 扫码靠 UPC；含责任方与监管声明。", en: "Customer-facing; retail/Amazon scan the UPC; responsible party + regulatory statements." }}>
          <div className="text-sm font-bold">LUYA <span className="font-normal text-gray-500">· {""}</span></div>
          <div className="text-xs text-gray-600 mb-2"><Bi v={{ zh: "室内微菜种植机 LYX-01", en: "Indoor Microgreens Grower LYX-01" }} /></div>
          <Barcode value="8 12345 67890 5" type="UPC-A" />
          <div className="mt-2 space-y-0.5">
            <Row k={{ zh: "序列号", en: "S/N" }} v="LYX-2607-000001" />
            <Row k={{ zh: "SKU", en: "SKU" }} v="LYX-01-BLK-US" />
          </div>
          <div className="mt-2 border-t border-gray-100 pt-1.5 text-[10px] text-gray-500 space-y-0.5">
            <div>Contains FCC ID: 2A1B3-WB01 · This device complies with Part 15.</div>
            <div>UL / ETL Listed · DOE Level VI · ♻</div>
            <div><Bi v={{ zh: "责任方（进口商）", en: "Responsible party (importer)" }} />: Luya Inc., Austin TX, USA</div>
            <div>Made in China</div>
          </div>
        </LabelCard>

        {/* 3. Master shipping carton */}
        <LabelCard where="carton" title={{ zh: "③ 运输外箱唛头", en: "③ Master carton mark" }} note={{ zh: "整箱发仓，非消费者面；走 FBA 时再加 Box ID + 箱内容标。", en: "Bulk to warehouse, not customer-facing; add FBA Box ID + content labels if via FBA." }}>
          <div className="flex justify-between text-xs font-semibold">
            <span>LUYA · LYX-01</span>
            <span><Bi v={{ zh: "数量", en: "QTY" }} />: 6 PCS</span>
          </div>
          <div className="text-[11px] text-gray-500 mb-2">PO: SHO-2026-0142 · <Bi v={{ zh: "目的地", en: "Dest" }} />: US Warehouse</div>
          <Barcode value="1 0 08123456789 0" type="ITF-14" />
          <div className="mt-2 grid grid-cols-2 gap-x-3">
            <Row k={{ zh: "箱号", en: "Carton No." }} v="1 / 20" />
            <Row k={{ zh: "毛重", en: "G.W." }} v="9.8 kg" />
            <Row k={{ zh: "尺寸", en: "DIM" }} v="48×32×26cm" />
            <Row k={{ zh: "净重", en: "N.W." }} v="8.4 kg" />
          </div>
          <div className="mt-2 border-t border-gray-100 pt-1.5 flex items-center gap-3 text-[11px] text-gray-600">
            <span title="Fragile">🍷 <Bi v={{ zh: "易碎", en: "Fragile" }} /></span>
            <span title="This way up">⬆️ <Bi v={{ zh: "向上", en: "Up" }} /></span>
            <span title="Keep dry">☂️ <Bi v={{ zh: "防潮", en: "Dry" }} /></span>
          </div>
          <div className="mt-1 text-[10px] text-gray-500">Made in China</div>
        </LabelCard>
      </div>

      {/* inside vs outside rule */}
      <Card className="p-4 mt-6 bg-green-50/40 border-green-200">
        <div className="text-sm font-semibold text-gray-900 mb-1"><Bi v={{ zh: "印外面 vs 藏箱内", en: "Outside vs inside" }} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-medium text-gray-700 mb-1"><Bi v={{ zh: "✅ 印在外面（机身/彩盒/外箱）", en: "✅ Printed outside" }} /></div>
            <ul className="text-gray-600 space-y-0.5 list-disc pl-4">
              <li><Bi v={{ zh: "SN + 二维码（公开身份）", en: "SN + QR (public identity)" }} /></li>
              <li><Bi v={{ zh: "Contains FCC ID、UL/ETL、能效、Made in China、责任方", en: "Contains FCC ID, UL/ETL, efficiency, origin, responsible party" }} /></li>
              <li><Bi v={{ zh: "UPC（零售盒）、整箱条码与唛头（外箱）", en: "UPC (retail), carton barcode + marks" }} /></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-1"><Bi v={{ zh: "🔒 不再需要藏箱内的激活码卡", en: "🔒 No more in-box key card" }} /></div>
            <p className="text-gray-600"><Bi v={{ zh: "激活改用「邮箱账户 + 蓝牙就近认领」，外部和箱内都不印激活码——少一张卡、少一道工序，二手转让也更顺。", en: "Activation now uses email account + Bluetooth proximity claim — no key printed anywhere. One less card, one less step, and resale/transfer is smoother." }} /></p>
          </div>
        </div>
      </Card>
    </div>
  );
}
