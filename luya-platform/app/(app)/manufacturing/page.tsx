"use client";

import Link from "next/link";
import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, Card, StatusBadge, SectionTitle } from "@/components/ui";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { workOrders, devices } from "@/lib/mock";
import { wfChinaFactory, wfUsSeedProduction } from "@/lib/workflows";
import { WorkOrder } from "@/lib/types";
import { L } from "@/lib/i18n";

const woColumns: Column<WorkOrder>[] = [
  { header: { zh: "工单号", en: "Work order" }, cell: (w) => w.work_order_number, mono: true },
  { header: { zh: "产品型号", en: "Model" }, cell: (w) => w.product_model, mono: true },
  { header: { zh: "工厂", en: "Factory" }, cell: (w) => w.factory_name },
  { header: { zh: "进度", en: "Progress" }, cell: (w) => `${w.produced_quantity} / ${w.planned_quantity}`, right: true },
  { header: { zh: "目标固件", en: "Target FW" }, cell: (w) => w.target_firmware_version, mono: true },
  { header: { zh: "状态", en: "Status" }, cell: (w) => <StatusBadge value={w.status} /> },
];

const TEST_ITEMS: { label: L; result: "pass" | "fail" | "pending" }[] = [
  { label: { zh: "上电测试", en: "Power-on" }, result: "pass" },
  { label: { zh: "Wi-Fi 测试", en: "Wi-Fi" }, result: "pass" },
  { label: { zh: "相机测试", en: "Camera" }, result: "pass" },
  { label: { zh: "水泵测试", en: "Pump" }, result: "pass" },
  { label: { zh: "阀门测试", en: "Valve" }, result: "pass" },
  { label: { zh: "白光 LED", en: "LED white" }, result: "pass" },
  { label: { zh: "红光 LED", en: "LED red" }, result: "pass" },
  { label: { zh: "蓝光 LED", en: "LED blue" }, result: "pass" },
  { label: { zh: "近红外 NIR", en: "LED NIR" }, result: "pending" },
  { label: { zh: "UV-B", en: "LED UV-B" }, result: "pending" },
  { label: { zh: "风扇测试", en: "Fan" }, result: "pass" },
  { label: { zh: "水位传感器", en: "Water level" }, result: "pass" },
  { label: { zh: "温度传感器", en: "Temp sensor" }, result: "pass" },
  { label: { zh: "湿度传感器", en: "Humidity" }, result: "fail" },
  { label: { zh: "门磁传感器", en: "Door sensor" }, result: "pass" },
  { label: { zh: "最终 QC", en: "Final QC" }, result: "pending" },
];

function resultBadge(r: "pass" | "fail" | "pending") {
  const map = {
    pass: { zh: "通过", en: "Pass", c: "bg-green-100 text-green-700" },
    fail: { zh: "失败", en: "Fail", c: "bg-red-100 text-red-700" },
    pending: { zh: "待测", en: "Pending", c: "bg-gray-100 text-gray-500" },
  } as const;
  const m = map[r];
  return <span className={`rounded px-1.5 py-0.5 text-[11px] ${m.c}`}><Bi v={{ zh: m.zh, en: m.en }} /></span>;
}

export default function ManufacturingPage() {
  const sample = devices[1];
  return (
    <ModuleShell
      pillar={{ zh: "Luya Manufacturing · 制造", en: "Luya Manufacturing" }}
      title={{ zh: "制造门户", en: "Manufacturing Portal" }}
      desc={{ zh: "即使工厂没有 MES，每台设备也必须先在这里「出生」——Luya 掌控设备身份。右侧是中国工厂工人与美国种子盘工厂的作业流程。", en: "Even without a factory MES, every device must be 'born' here — Luya owns device identity. The China factory worker and US seed-tray flows are on the right." }}
      workflows={[wfChinaFactory, wfUsSeedProduction]}
      kpis={
        <KpiGrid>
          <KpiCard label={{ zh: "已开通设备", en: "Provisioned" }} value={devices.length} />
          <KpiCard label={{ zh: "QC 通过", en: "QC passed" }} value={devices.filter((d) => ["qc_passed", "packed", "shipped", "activated", "online", "offline", "maintenance"].includes(d.cloud_status)).length} accent />
          <KpiCard label={{ zh: "进行中工单", en: "WOs in progress" }} value={workOrders.filter((w) => w.status === "in_progress").length} />
          <KpiCard label={{ zh: "工单总数", en: "Total WOs" }} value={workOrders.length} />
        </KpiGrid>
      }
    >
      {/* Entry into the scan-driven operator station */}
      <Link href="/manufacturing/line" className="block">
        <Card className="p-4 border-green-300 bg-green-50/60 hover:bg-green-50 transition-colors">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-green-800">
                📷 <Bi v={{ zh: "进入产线工位（扫码作业）", en: "Enter Production Line Station (scan-driven)" }} />
              </div>
              <div className="text-xs text-green-700/80 mt-0.5">
                <Bi v={{ zh: "下单 100 套时，产线工人在这里：扫码 → 绑定 → 测试 → QC → 装箱 → 待发货", en: "When 100 units are ordered, the line worker works here: scan → bind → test → QC → pack → ship-ready" }} />
              </div>
            </div>
            <span className="text-green-700 text-sm font-medium">→</span>
          </div>
        </Card>
      </Link>

      {/* Entry into the packaging label spec */}
      <Link href="/manufacturing/packaging" className="block">
        <Card className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                📦 <Bi v={{ zh: "包装标签规范", en: "Packaging Label Spec" }} />
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                <Bi v={{ zh: "机身标 / 零售彩盒标 / 运输外箱唛头（Contains FCC ID、UPC、整箱条码、搬运图标…）", en: "Body / retail box / shipping carton labels (Contains FCC ID, UPC, carton barcode, handling icons…)" }} />
              </div>
            </div>
            <span className="text-gray-400 text-sm font-medium">→</span>
          </div>
        </Card>
      </Link>

      {/* Entry into the ID lineage explainer */}
      <Link href="/manufacturing/id-lineage" className="block">
        <Card className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                🧬 <Bi v={{ zh: "设备 ID 谱系图", en: "Device ID Lineage" }} />
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                <Bi v={{ zh: "每个设备 ID 何时生成、什么含义、如何传递（SN / UUID / 激活码 / 部件 SN …）", en: "When each device ID is born, what it means, how it's passed (SN / UUID / key / component SNs …)" }} />
              </div>
            </div>
            <span className="text-gray-400 text-sm font-medium">→</span>
          </div>
        </Card>
      </Link>

      <div>
        <SectionTitle title={{ zh: "生产工单", en: "Work Orders" }} hint={{ zh: "中国硬件工单 + 美国种子盘批次", en: "China hardware WOs + US seed-tray batches" }} />
        <DataTable columns={woColumns} rows={workOrders} />
      </div>

      {/* Factory test checklist */}
      <div>
        <SectionTitle title={{ zh: "工厂测试清单", en: "Factory Test Checklist" }} hint={{ zh: `设备 ${sample.serial_number}`, en: `Device ${sample.serial_number}` }} />
        <Card className="p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEST_ITEMS.map((it, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50/50 px-2 py-1.5">
                <span className="text-xs text-gray-700"><Bi v={it.label} /></span>
                {resultBadge(it.result)}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Label preview */}
      <div>
        <SectionTitle title={{ zh: "标签预览", en: "Label Preview" }} hint={{ zh: "点击「打印标签」的模拟效果（V1 不真实打印）", en: "Mock of the Print Label action (no real printing in V1)" }} />
        <Card className="p-4 max-w-md">
          <div className="flex gap-4">
            <div className="flex-1 text-sm">
              <div className="text-lg font-bold tracking-wide text-gray-900">LUYA</div>
              <div className="mt-1 text-gray-700">Model: <span className="font-mono">LYX-01</span></div>
              <div className="text-gray-700">S/N: <span className="font-mono">{sample.serial_number}</span></div>
              <div className="text-gray-700">HW: <span className="font-mono">{sample.hardware_version}</span></div>
              <div className="text-gray-500 text-xs mt-1">Input: 24V ⎓ 2A · FCC / CE / UL (placeholder)</div>
              <div className="text-gray-500 text-xs">Made in China</div>
            </div>
            <div className="shrink-0 text-center">
              <div className="h-20 w-20 grid place-items-center rounded border-2 border-gray-300 text-[10px] text-gray-400">QR</div>
              <div className="mt-1 text-[10px] text-gray-400 font-mono">activate/{sample.serial_number.slice(-6)}</div>
            </div>
          </div>
          <button className="mt-3 rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
            <Bi v={{ zh: "打印标签", en: "Print Label" }} />
          </button>
        </Card>
      </div>
    </ModuleShell>
  );
}
