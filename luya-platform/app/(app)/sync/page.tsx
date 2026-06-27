"use client";

import { useState } from "react";
import { ModuleShell } from "@/components/ModuleShell";
import { Bi, Card, SectionTitle } from "@/components/ui";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { wfChannelSync } from "@/lib/workflows";
import { products } from "@/lib/products";
import { useRegistry } from "@/lib/deviceRegistry";
import { L } from "@/lib/i18n";

type ExtItem = { sku: string; qty: number };
type ExtOrder = { id: string; channel: "shopify" | "amazon"; buyerEmail: string; buyerName: string; items: ExtItem[]; createdAt: string };

/** Mock orders as they would arrive from Shopify / Amazon (read-only). */
const EXT_ORDERS: ExtOrder[] = [
  { id: "SHO-7001", channel: "shopify", buyerEmail: "alex@example.com", buyerName: "Alex", items: [{ sku: "LYX-01-BLK-US", qty: 1 }, { sku: "NUTR-SET-ABCD", qty: 1 }], createdAt: "2026-06-25" },
  { id: "AMZ-8001", channel: "amazon", buyerEmail: "maria@example.com", buyerName: "Maria", items: [{ sku: "TRAY-BRO-4PK", qty: 2 }], createdAt: "2026-06-25" },
  { id: "SHO-7002", channel: "shopify", buyerEmail: "bob@example.com", buyerName: "Bob", items: [{ sku: "TRAY-RAD-4PK", qty: 1 }], createdAt: "2026-06-26" },
  { id: "AMZ-8002", channel: "amazon", buyerEmail: "newbuyer@gmail.com", buyerName: "New Buyer", items: [{ sku: "LYX-01-WHT-US", qty: 1 }], createdAt: "2026-06-26" },
  { id: "SHO-7003", channel: "shopify", buyerEmail: "kid@example.com", buyerName: "Kid", items: [{ sku: "SUB-TRAY-M", qty: 1 }], createdAt: "2026-06-26" },
  { id: "AMZ-8003", channel: "amazon", buyerEmail: "dana@outlook.com", buyerName: "Dana", items: [{ sku: "BNDL-STARTER-US", qty: 1 }], createdAt: "2026-06-27" },
];

function ChannelBadge({ c }: { c: "shopify" | "amazon" }) {
  return <span className={`rounded px-1.5 py-0.5 text-[10px] ${c === "shopify" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{c === "shopify" ? "Shopify" : "Amazon"}</span>;
}

export default function SyncPage() {
  const { customers, all } = useRegistry();
  const [synced, setSynced] = useState(false);

  const rows = EXT_ORDERS.map((o) => {
    const email = o.buyerEmail.toLowerCase();
    const customer = customers.find((c) => c.email.toLowerCase() === email) ?? null;
    const devices = all.filter((d) => d.owner?.email?.toLowerCase() === email);
    return { order: o, customer, deviceSns: devices.map((d) => d.sn) };
  });

  const matchedCust = rows.filter((r) => r.customer).length;
  const matchedDev = rows.filter((r) => r.deviceSns.length > 0).length;
  const newCust = rows.length - matchedCust;

  const skuLabel = (sku: string): L => {
    const p = products.find((x) => x.sku === sku);
    return p ? p.name : { zh: sku, en: sku };
  };

  return (
    <ModuleShell
      pillar={{ zh: "客户与订阅", en: "Customers & Subscriptions" }}
      title={{ zh: "渠道同步（订单 → 设备 → 客户）", en: "Channel Sync (Order → Device → Customer)" }}
      desc={{ zh: "销售在 Shopify/Amazon 后台运营。Luya 只读拉取订单，按买家邮箱匹配/新建客户，再按设备归属邮箱把订单串到具体设备(SN)上——不回写外部后台。", en: "Sales run in Shopify/Amazon. Luya pulls orders read-only, matches/creates the customer by buyer email, then links the order to a specific device (SN) by owner email — no write-back." }}
      workflow={wfChannelSync}
      kpis={
        synced ? (
          <KpiGrid>
            <KpiCard label={{ zh: "已同步订单", en: "Synced" }} value={rows.length} />
            <KpiCard label={{ zh: "匹配到客户", en: "Matched customer" }} value={matchedCust} accent />
            <KpiCard label={{ zh: "匹配到设备", en: "Matched device" }} value={matchedDev} accent />
            <KpiCard label={{ zh: "新建客户", en: "New customers" }} value={newCust} />
          </KpiGrid>
        ) : undefined
      }
    >
      {!synced ? (
        <Card className="p-6">
          <div className="text-sm font-semibold text-gray-900 mb-1"><Bi v={{ zh: "从外部渠道同步订单（只读）", en: "Sync orders from external channels (read-only)" }} /></div>
          <p className="text-xs text-gray-500 mb-4 max-w-xl"><Bi v={{ zh: "模拟从 Shopify webhook + Amazon SP-API 拉取最近订单，并自动匹配到 Luya 的客户与设备。先去激活模拟器绑定几台设备，这里就能看到「订单→设备」对上。", en: "Simulates pulling recent orders from Shopify webhook + Amazon SP-API and auto-matching to Luya customers and devices. Bind a few devices in the activation simulator first to see orders link to devices." }} /></p>
          <button onClick={() => setSynced(true)} className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 text-sm font-medium">🔄 <Bi v={{ zh: "同步订单", en: "Sync orders" }} /></button>
        </Card>
      ) : (
        <div className="space-y-3">
          <SectionTitle title={{ zh: "同步结果", en: "Sync result" }} hint={{ zh: "按买家邮箱匹配客户与设备；绿色=已匹配，灰色=本次新建/未绑定", en: "Matched by buyer email; green = matched, gray = new/unbound" }} />
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-left text-xs text-gray-500">
                    <th className="px-3 py-2.5 font-medium"><Bi v={{ zh: "外部订单", en: "Ext order" }} /></th>
                    <th className="px-3 py-2.5 font-medium"><Bi v={{ zh: "渠道", en: "Channel" }} /></th>
                    <th className="px-3 py-2.5 font-medium"><Bi v={{ zh: "买家邮箱", en: "Buyer email" }} /></th>
                    <th className="px-3 py-2.5 font-medium"><Bi v={{ zh: "商品（SKU）", en: "Items (SKU)" }} /></th>
                    <th className="px-3 py-2.5 font-medium"><Bi v={{ zh: "→ 客户", en: "→ Customer" }} /></th>
                    <th className="px-3 py-2.5 font-medium"><Bi v={{ zh: "→ 设备(SN)", en: "→ Device (SN)" }} /></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ order, customer, deviceSns }) => (
                    <tr key={order.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2.5 font-mono text-xs">{order.id}</td>
                      <td className="px-3 py-2.5"><ChannelBadge c={order.channel} /></td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{order.buyerEmail}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          {order.items.map((it, i) => (
                            <span key={i} className="text-xs text-gray-700"><span className="font-mono text-gray-400">{it.sku}</span> ×{it.qty}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {customer ? (
                          <span className="inline-flex items-center gap-1 rounded bg-green-100 text-green-700 px-1.5 py-0.5 text-xs">✓ {customer.name}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-gray-100 text-gray-500 px-1.5 py-0.5 text-xs">＋ <Bi v={{ zh: "新建客户", en: "new customer" }} /></span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {deviceSns.length > 0 ? (
                          <span className="font-mono text-xs text-green-700">{deviceSns.join(", ")}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100"><Bi v={{ zh: "“→设备”仅当买家邮箱已绑定某台设备时才连上（消耗品订单也能据此知道补给哪台机器）。只读：不修改 Shopify/Amazon。", en: "“→Device” links only when the buyer email already owns a device (so consumable orders know which machine to refill). Read-only: nothing written back." }} /></div>
          </Card>
          <button onClick={() => setSynced(false)} className="text-xs text-gray-400 hover:text-gray-700"><Bi v={{ zh: "重置", en: "Reset" }} /></button>
        </div>
      )}
    </ModuleShell>
  );
}
