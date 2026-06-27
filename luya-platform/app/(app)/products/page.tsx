"use client";

import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, Card, EnumTag, StatusBadge, SectionTitle } from "@/components/ui";
import { useRegistry } from "@/lib/deviceRegistry";
import { products, ID_SOURCES, Product } from "@/lib/products";
import { L } from "@/lib/i18n";

function ChannelTags({ p }: { p: Product }) {
  return (
    <div className="flex gap-1">
      {p.channels.map((c) => (
        <span key={c} className={`rounded px-1.5 py-0.5 text-[10px] ${c === "shopify" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
          {c === "shopify" ? "Shopify" : "Amazon"}
        </span>
      ))}
    </div>
  );
}

const columns: Column<Product>[] = [
  { header: { zh: "SKU（Luya 定）", en: "SKU (Luya)" }, cell: (p) => p.sku, mono: true },
  { header: { zh: "商品", en: "Product" }, cell: (p) => <span><Bi v={p.name} /> <span className="text-gray-400 text-xs">· <Bi v={p.variant} /></span></span> },
  { header: { zh: "类型", en: "Type" }, cell: (p) => <EnumTag value={p.type} /> },
  { header: { zh: "UPC / GTIN（印盒上）", en: "UPC (on box)" }, cell: (p) => (p.upc ? p.upc : <span className="text-gray-300">—</span>), mono: true },
  { header: { zh: "ASIN（Amazon 生成）", en: "ASIN (Amazon)" }, cell: (p) => (p.asin ? p.asin : <span className="text-gray-300">—</span>), mono: true },
  { header: { zh: "渠道", en: "Channels" }, cell: (p) => <ChannelTags p={p} /> },
  { header: { zh: "价格", en: "Price" }, cell: (p) => `$${p.price}`, right: true },
  { header: { zh: "状态", en: "Status" }, cell: (p) => <StatusBadge value={p.status} /> },
];

function IdBox({ label, sub, tone }: { label: string; sub: L; tone: string }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${tone}`}>
      <div className="font-mono text-sm font-semibold text-gray-900">{label}</div>
      <div className="text-[11px] text-gray-500 leading-tight"><Bi v={sub} /></div>
    </div>
  );
}

export default function ProductsPage() {
  const { all } = useRegistry();
  const deviceUnits = all.length; // SNs that exist (product LYX-01 → many devices)

  return (
    <div>
      <PageHeader
        pillar={{ zh: "客户与订阅", en: "Customers & Subscriptions" }}
        title={{ zh: "商品主数据（SKU ↔ UPC ↔ ASIN）", en: "Product Master (SKU ↔ UPC ↔ ASIN)" }}
        desc={{ zh: "「商品身份」与「设备身份」是两条线。商品身份是品类级（一款商品），设备身份是单台级（一台机器）。一个 SKU 下有成千上万台不同 SN。", en: "“Product identity” and “device identity” are two separate lines. Product identity is per-product; device identity is per-unit. One SKU has thousands of distinct SNs under it." }}
      />

      {/* two identity lines */}
      <Card className="p-4 mb-6">
        <SectionTitle title={{ zh: "两条身份线", en: "Two identity lines" }} />
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-28 shrink-0 text-xs font-medium text-blue-700"><Bi v={{ zh: "商品身份（品类级）", en: "Product (per-product)" }} /></span>
            <IdBox label="SKU" sub={{ zh: "Luya 内部码", en: "Luya internal" }} tone="bg-blue-50 border-blue-200" />
            <span className="text-gray-400 text-xs">—印盒上→</span>
            <IdBox label="UPC" sub={{ zh: "GS1 全球条码", en: "GS1 barcode" }} tone="bg-emerald-50 border-emerald-200" />
            <span className="text-gray-400 text-xs">—上架 Amazon→</span>
            <IdBox label="ASIN" sub={{ zh: "Amazon 编号", en: "Amazon id" }} tone="bg-amber-50 border-amber-200" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-28 shrink-0 text-xs font-medium text-green-700"><Bi v={{ zh: "设备身份（单台级）", en: "Device (per-unit)" }} /></span>
            <IdBox label="SN" sub={{ zh: "这一台的序列号", en: "this unit's serial" }} tone="bg-green-50 border-green-200" />
            <span className="text-gray-400 text-xs">—出厂生成→</span>
            <IdBox label="UUID" sub={{ zh: "云端真身", en: "cloud identity" }} tone="bg-gray-50 border-gray-200" />
            <span className="ml-1 text-[11px] text-gray-400">× {deviceUnits.toLocaleString()} <Bi v={{ zh: "台（本 mock 当前）", en: "units (in this mock)" }} /></span>
          </div>
          <p className="text-xs text-gray-500 border-t border-gray-100 pt-2">
            <Bi v={{ zh: "连接点：订单行用 SKU 下单 → 履约 / 激活落到具体 SN。SKU=「哪款」，SN=「哪一台」。", en: "Link: orders are placed by SKU → fulfillment / activation resolve to a specific SN. SKU = which product, SN = which unit." }} />
          </p>
        </div>
      </Card>

      {/* who generates each id */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {ID_SOURCES.map((s) => (
          <Card key={s.id} className={`p-4 border ${s.tone}`}>
            <div className="font-mono text-sm font-semibold text-gray-900">{s.id}</div>
            <div className="text-xs text-gray-700 mt-1"><Bi v={s.gen} /></div>
            <div className="text-[11px] text-gray-500 mt-0.5"><Bi v={s.when} /></div>
          </Card>
        ))}
      </div>

      <SectionTitle title={{ zh: "商品清单", en: "Product catalog" }} hint={{ zh: "一个型号可有多个 SKU（颜色/套装）；每个可售 SKU 一个 UPC；订阅无 UPC/ASIN", en: "One model → several SKUs (color/bundle); one UPC per sellable SKU; subscriptions have no UPC/ASIN" }} />
      <DataTable columns={columns} rows={products} caption={{ zh: "“—” 表示该商品未上架 Amazon 或非实体零售品（如订阅）", en: "“—” means not listed on Amazon or not a physical retail good (e.g. subscription)" }} />
    </div>
  );
}
