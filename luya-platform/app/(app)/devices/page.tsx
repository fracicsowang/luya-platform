"use client";

import Link from "next/link";
import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, Card, StatusBadge } from "@/components/ui";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { wfDeviceLifecycle } from "@/lib/workflows";
import { useRegistry, UDevice } from "@/lib/deviceRegistry";

const columns: Column<UDevice>[] = [
  {
    header: { zh: "序列号", en: "Serial No." },
    cell: (d) => (
      <Link href={`/devices/detail?sn=${encodeURIComponent(d.sn)}`} className="text-green-700 hover:underline font-mono">
        {d.sn}
      </Link>
    ),
  },
  {
    header: { zh: "来源", en: "Source" },
    cell: (d) => (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${d.source === "factory" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
        <Bi v={d.source === "factory" ? { zh: "产线批次", en: "Factory" } : { zh: "示例", en: "Seed" }} />
      </span>
    ),
  },
  { header: { zh: "型号 / 硬件 / 固件", en: "Model / HW / FW" }, cell: (d) => `${d.model} · ${d.hardware_version} · ${d.firmware_version}`, mono: true },
  { header: { zh: "云状态", en: "Cloud status" }, cell: (d) => <StatusBadge value={d.cloud_status} /> },
  { header: { zh: "归属客户", en: "Owner" }, cell: (d) => d.owner?.name ?? "—" },
  { header: { zh: "工单", en: "Work order" }, cell: (d) => d.work_order_number ?? "—", mono: true },
];

export default function DevicesPage() {
  const { all, factoryCount, activatedCount } = useRegistry();
  const online = all.filter((d) => d.cloud_status === "online").length;
  return (
    <ModuleShell
      pillar={{ zh: "Luya Cloud · 设备云", en: "Luya Cloud" }}
      title={{ zh: "设备管理", en: "Devices" }}
      desc={{ zh: "示例数据 + 你产线生成的真实批次合并在此。点序列号查看完整 ID 链。状态从工厂一路流转到客户在线。", en: "Seed data + the live batch from your line, merged here. Click a serial to see its full ID chain. Status flows factory → online." }}
      workflow={wfDeviceLifecycle}
      kpis={
        <KpiGrid>
          <KpiCard label={{ zh: "设备总数", en: "Total" }} value={all.length} />
          <KpiCard label={{ zh: "产线批次", en: "From line" }} value={factoryCount} />
          <KpiCard label={{ zh: "已激活", en: "Activated" }} value={all.filter((d) => d.activated).length} accent />
          <KpiCard label={{ zh: "在线", en: "Online" }} value={online} />
        </KpiGrid>
      }
    >
      <Link href="/devices/activate" className="block">
        <Card className="p-4 border-green-300 bg-green-50/60 hover:bg-green-50 transition-colors">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-green-800">📱 <Bi v={{ zh: "用户激活模拟器（Luya App）", en: "Customer Activation Simulator (Luya App)" }} /></div>
              <div className="text-xs text-green-700/80 mt-0.5"><Bi v={{ zh: "机器发货后，客户怎么激活：扫码 → Wi-Fi → 绑定账户 → 上线 → 首次种植", en: "After shipping: scan → Wi-Fi → bind account → online → first grow" }} /></div>
            </div>
            <span className="text-green-700 text-sm font-medium">→</span>
          </div>
        </Card>
      </Link>

      <DataTable
        columns={columns}
        rows={all}
        caption={{ zh: `共 ${all.length} 台（含产线 ${factoryCount} 台、已激活 ${activatedCount} 台）。点序列号看 ID 链。`, en: `${all.length} devices (${factoryCount} from line, ${activatedCount} activated). Click a serial for its ID chain.` }}
      />
    </ModuleShell>
  );
}
