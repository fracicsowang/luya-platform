"use client";

import { PageHeader } from "@/components/PageHeader";
import { Bi, Card, SectionTitle } from "@/components/ui";
import { L } from "@/lib/i18n";
import { devices, orders, growTasks } from "@/lib/mock";

function Funnel({ steps }: { steps: { label: L; value: number }[] }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pct = Math.round((s.value / max) * 100);
        const conv = i === 0 ? 100 : Math.round((s.value / steps[0].value) * 100);
        return (
          <div key={i}>
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span><Bi v={s.label} /></span>
              <span className="tabular-nums">{s.value} <span className="text-gray-400">· {conv}%</span></span>
            </div>
            <div className="h-6 rounded bg-gray-100 overflow-hidden">
              <div className="h-full rounded bg-green-500/80" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Bars({ rows }: { rows: { label: L; value: number; tone?: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs text-gray-600 mb-0.5">
            <span><Bi v={r.label} /></span>
            <span className="tabular-nums">{r.value}</span>
          </div>
          <div className="h-4 rounded bg-gray-100 overflow-hidden">
            <div className={`h-full rounded ${r.tone ?? "bg-emerald-500/80"}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const produced = devices.length;
  const shipped = devices.filter((d) => ["shipped", "activated", "online", "offline", "maintenance"].includes(d.cloud_status)).length;
  const activated = devices.filter((d) => d.activated).length;
  const online = devices.filter((d) => d.cloud_status === "online").length;

  const seedTypes = ["Broccoli", "Radish", "Pea Shoots", "Sunflower"];
  const seedBars = seedTypes.map((s) => {
    const list = growTasks.filter((g) => g.seed_type.en === s);
    const done = list.filter((g) => g.status === "completed").length;
    const fail = list.filter((g) => g.status === "failed").length;
    const rate = Math.round((done / Math.max(1, done + fail)) * 100);
    const zhMap: Record<string, string> = { Broccoli: "西兰花", Radish: "萝卜苗", "Pea Shoots": "豌豆苗", Sunflower: "葵花苗" };
    return { label: { zh: `${zhMap[s]} 成功率`, en: `${s} success` }, value: rate };
  });

  const qcPass = devices.filter((d) => ["qc_passed", "packed", "shipped", "activated", "online", "offline", "maintenance"].includes(d.cloud_status)).length;
  const qcRate = Math.round((qcPass / produced) * 100);

  return (
    <div>
      <PageHeader
        pillar={{ zh: "概览", en: "Overview" }}
        title={{ zh: "数据分析", en: "Analytics" }}
        desc={{ zh: "把 Cloud 与 Business 数据合在一起：激活漏斗、订单到激活、种植成功率、制造质量。", en: "Combines Cloud + Business data: activation funnel, order-to-activation, grow success, manufacturing quality." }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <SectionTitle title={{ zh: "设备激活漏斗", en: "Device Activation Funnel" }} hint={{ zh: "生产 → 发货 → 激活 → 在线", en: "Produced → Shipped → Activated → Online" }} />
          <Funnel
            steps={[
              { label: { zh: "已生产", en: "Produced" }, value: produced },
              { label: { zh: "已发货", en: "Shipped" }, value: shipped },
              { label: { zh: "已激活", en: "Activated" }, value: activated },
              { label: { zh: "在线", en: "Online" }, value: online },
            ]}
          />
        </Card>

        <Card className="p-4">
          <SectionTitle title={{ zh: "订单 → 激活漏斗", en: "Order → Activation Funnel" }} />
          <Funnel
            steps={[
              { label: { zh: "订单创建", en: "Order created" }, value: orders.length },
              { label: { zh: "已履约", en: "Fulfilled" }, value: orders.filter((o) => ["fulfilled", "partially_fulfilled"].includes(o.status)).length },
              { label: { zh: "设备激活", en: "Device activated" }, value: activated },
              { label: { zh: "首次种植", en: "First grow" }, value: growTasks.length },
            ]}
          />
        </Card>

        <Card className="p-4">
          <SectionTitle title={{ zh: "各品类种植成功率", en: "Grow Success by Seed" }} />
          <Bars rows={seedBars} />
        </Card>

        <Card className="p-4">
          <SectionTitle title={{ zh: "制造质量", en: "Manufacturing Quality" }} />
          <Bars
            rows={[
              { label: { zh: "QC 通过率", en: "QC pass rate" }, value: qcRate, tone: "bg-green-500/80" },
              { label: { zh: "HW1.0 占比", en: "HW1.0 share" }, value: Math.round((devices.filter((d) => d.hardware_version === "HW1.0").length / produced) * 100) },
              { label: { zh: "HW1.1 占比", en: "HW1.1 share" }, value: Math.round((devices.filter((d) => d.hardware_version === "HW1.1").length / produced) * 100) },
              { label: { zh: "HW1.2 占比", en: "HW1.2 share" }, value: Math.round((devices.filter((d) => d.hardware_version === "HW1.2").length / produced) * 100) },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
