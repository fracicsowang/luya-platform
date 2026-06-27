"use client";

import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, EnumTag } from "@/components/ui";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { orders } from "@/lib/mock";
import { wfActivation } from "@/lib/workflows";
import { useRegistry, UCustomer } from "@/lib/deviceRegistry";

const columns: Column<UCustomer>[] = [
  {
    header: { zh: "姓名", en: "Name" },
    cell: (c) => (
      <span className="flex items-center gap-1.5">
        {c.name}
        {c.viaActivation ? <span className="rounded bg-green-100 text-green-700 px-1.5 py-0.5 text-[10px]"><Bi v={{ zh: "激活注册", en: "via activation" }} /></span> : null}
      </span>
    ),
  },
  { header: { zh: "邮箱", en: "Email" }, cell: (c) => c.email, mono: true },
  { header: { zh: "来源", en: "Source" }, cell: (c) => <EnumTag value={c.source} /> },
  { header: { zh: "订单数", en: "Orders" }, cell: (c) => orders.filter((o) => o.customer_id === c.id).length, right: true },
  { header: { zh: "设备数", en: "Devices" }, cell: (c) => c.deviceCount, right: true },
];

export default function CustomersPage() {
  const { customers } = useRegistry();
  const viaAct = customers.filter((c) => c.viaActivation).length;
  return (
    <ModuleShell
      pillar={{ zh: "客户与订阅", en: "Customers & Subscriptions" }}
      title={{ zh: "客户", en: "Customers" }}
      desc={{ zh: "客户来自 Shopify / Amazon / 手动录入 / App 激活。在激活模拟器里激活设备的客户会自动出现在这里，并绑定其设备。", en: "Customers come from Shopify / Amazon / manual / App activation. Anyone who activates a device in the simulator shows up here, bound to their device." }}
      workflow={wfActivation}
      kpis={
        <KpiGrid>
          <KpiCard label={{ zh: "客户总数", en: "Total" }} value={customers.length} />
          <KpiCard label={{ zh: "Shopify", en: "Shopify" }} value={customers.filter((c) => c.source === "shopify").length} />
          <KpiCard label={{ zh: "Amazon", en: "Amazon" }} value={customers.filter((c) => c.source === "amazon").length} />
          <KpiCard label={{ zh: "激活注册", en: "Via activation" }} value={viaAct} accent />
        </KpiGrid>
      }
    >
      <DataTable columns={columns} rows={customers} />
    </ModuleShell>
  );
}
