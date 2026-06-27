"use client";

import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, EnumTag, StatusBadge } from "@/components/ui";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { subscriptions, customerName } from "@/lib/mock";
import { wfSubscription } from "@/lib/workflows";
import { Subscription } from "@/lib/types";

const columns: Column<Subscription>[] = [
  { header: { zh: "订阅", en: "Sub" }, cell: (s) => s.id, mono: true },
  { header: { zh: "客户", en: "Customer" }, cell: (s) => customerName(s.customer_id) },
  { header: { zh: "套餐", en: "Plan" }, cell: (s) => <Bi v={s.plan_name} /> },
  { header: { zh: "类型", en: "Type" }, cell: (s) => <EnumTag value={s.plan_type} /> },
  { header: { zh: "月费", en: "Monthly" }, cell: (s) => `$${s.monthly_price}`, right: true },
  { header: { zh: "下次补货", en: "Next refill" }, cell: (s) => s.next_fulfillment_date, mono: true },
  { header: { zh: "状态", en: "Status" }, cell: (s) => <StatusBadge value={s.status} /> },
];

export default function SubscriptionsPage() {
  const active = subscriptions.filter((s) => s.status === "active");
  const mrr = active.reduce((s, x) => s + x.monthly_price, 0);
  return (
    <ModuleShell
      pillar={{ zh: "客户与订阅", en: "Customers & Subscriptions" }}
      title={{ zh: "订阅", en: "Subscriptions" }}
      desc={{ zh: "消耗品订阅潜力：每月种子盘补货、营养液补货、未来 App 高级功能。到期自动生成履约，由美国种子盘工厂发货。", en: "Consumable subscriptions: monthly seed-tray refill, nutrient refill, future app premium. Each cycle auto-creates a fulfillment shipped from the US seed-tray factory." }}
      workflow={wfSubscription}
      kpis={
        <KpiGrid>
          <KpiCard label={{ zh: "活跃订阅", en: "Active" }} value={active.length} accent />
          <KpiCard label={{ zh: "已暂停", en: "Paused" }} value={subscriptions.filter((s) => s.status === "paused").length} />
          <KpiCard label={{ zh: "逾期", en: "Past due" }} value={subscriptions.filter((s) => s.status === "past_due").length} />
          <KpiCard label={{ zh: "MRR（模拟）", en: "MRR (mock)" }} value={`$${mrr}`} accent />
        </KpiGrid>
      }
    >
      <DataTable columns={columns} rows={subscriptions} />
    </ModuleShell>
  );
}
