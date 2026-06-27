"use client";

import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, Card, EnumTag, StatusBadge, SectionTitle } from "@/components/ui";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { tickets, customerName } from "@/lib/mock";
import { wfSupport } from "@/lib/workflows";
import { Ticket } from "@/lib/types";
import { L } from "@/lib/i18n";

const columns: Column<Ticket>[] = [
  { header: { zh: "工单号", en: "Ticket" }, cell: (t) => t.ticket_number, mono: true },
  { header: { zh: "客户", en: "Customer" }, cell: (t) => customerName(t.customer_id) },
  { header: { zh: "设备", en: "Device" }, cell: (t) => t.device_id ?? "—", mono: true },
  { header: { zh: "类型", en: "Type" }, cell: (t) => <EnumTag value={t.type} /> },
  { header: { zh: "主题", en: "Subject" }, cell: (t) => <Bi v={t.subject} /> },
  { header: { zh: "优先级", en: "Priority" }, cell: (t) => <StatusBadge value={t.priority} /> },
  { header: { zh: "状态", en: "Status" }, cell: (t) => <StatusBadge value={t.status} /> },
];

const CONTEXT: L[] = [
  { zh: "客户资料", en: "Customer info" },
  { zh: "设备状态 + 最近日志", en: "Device status + logs" },
  { zh: "当前种植任务 + 健康分", en: "Current grow task + health" },
  { zh: "订单历史", en: "Order history" },
  { zh: "履约历史", en: "Fulfillment history" },
  { zh: "订阅状态", en: "Subscription status" },
];

export default function SupportPage() {
  return (
    <ModuleShell
      pillar={{ zh: "客户与订阅", en: "Customers & Subscriptions" }}
      title={{ zh: "客服支持", en: "Support" }}
      desc={{ zh: "客服把 客户 / 设备 / 订单 / 种植任务 连接起来。打开一张工单，即可看到完整 360° 上下文。", en: "Support connects customer / device / order / grow task. Opening a ticket shows the full 360° context." }}
      workflow={wfSupport}
      kpis={
        <KpiGrid>
          <KpiCard label={{ zh: "工单总数", en: "Total" }} value={tickets.length} />
          <KpiCard label={{ zh: "待处理", en: "Open" }} value={tickets.filter((t) => t.status === "open").length} accent />
          <KpiCard label={{ zh: "处理中", en: "In progress" }} value={tickets.filter((t) => t.status === "in_progress").length} />
          <KpiCard label={{ zh: "紧急", en: "Urgent" }} value={tickets.filter((t) => t.priority === "urgent").length} />
        </KpiGrid>
      }
    >
      <Card className="p-3 border-green-200 bg-green-50/40">
        <SectionTitle title={{ zh: "打开工单时，客服可看到", en: "When opening a ticket, the agent sees" }} />
        <div className="flex flex-wrap gap-2">
          {CONTEXT.map((c, i) => (
            <span key={i} className="rounded-md bg-white border border-green-200 px-2 py-1 text-xs text-gray-700">
              <Bi v={c} />
            </span>
          ))}
        </div>
      </Card>
      <DataTable columns={columns} rows={tickets} />
    </ModuleShell>
  );
}
