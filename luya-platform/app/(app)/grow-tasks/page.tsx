"use client";

import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, StatusBadge } from "@/components/ui";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { growTasks, customerName, recipes } from "@/lib/mock";
import { wfGrow } from "@/lib/workflows";
import { GrowTask } from "@/lib/types";

const recipeName = (id: string) => recipes.find((r) => r.id === id)?.name ?? { zh: "—", en: "—" };

const columns: Column<GrowTask>[] = [
  { header: { zh: "任务", en: "Task" }, cell: (g) => g.id, mono: true },
  { header: { zh: "设备", en: "Device" }, cell: (g) => g.device_id, mono: true },
  { header: { zh: "客户", en: "Customer" }, cell: (g) => customerName(g.customer_id) },
  { header: { zh: "种子 / 配方", en: "Seed / Recipe" }, cell: (g) => <span><Bi v={g.seed_type} /> · <Bi v={recipeName(g.recipe_id)} /></span> },
  { header: { zh: "进度", en: "Progress" }, cell: (g) => `${g.current_day} / ${g.duration_days} 天` , right: true },
  { header: { zh: "健康分", en: "Health" }, cell: (g) => <span className={g.health_score < 60 ? "text-red-600 font-medium" : "text-gray-800"}>{g.health_score}</span>, right: true },
  { header: { zh: "状态", en: "Status" }, cell: (g) => <StatusBadge value={g.status} /> },
];

export default function GrowTasksPage() {
  return (
    <ModuleShell
      pillar={{ zh: "Luya Cloud · 设备云", en: "Luya Cloud" }}
      title={{ zh: "种植任务", en: "Grow Tasks" }}
      desc={{ zh: "一个种植任务 = 一个生长周期，把 设备 + 客户 + 种子盘 + 配方 串起来。AI 健康分为占位（绿度、覆盖率、发黄、霉变风险）。", en: "A grow task = one cycle, tying device + customer + tray + recipe. AI health score is a placeholder (greenness, coverage, yellowing, mold risk)." }}
      workflow={wfGrow}
      kpis={
        <KpiGrid>
          <KpiCard label={{ zh: "进行中", en: "Active" }} value={growTasks.filter((g) => g.status === "active").length} accent />
          <KpiCard label={{ zh: "已完成", en: "Completed" }} value={growTasks.filter((g) => g.status === "completed").length} />
          <KpiCard label={{ zh: "失败", en: "Failed" }} value={growTasks.filter((g) => g.status === "failed").length} />
          <KpiCard label={{ zh: "计划中", en: "Planned" }} value={growTasks.filter((g) => g.status === "planned").length} />
        </KpiGrid>
      }
    >
      <DataTable columns={columns} rows={growTasks} />
    </ModuleShell>
  );
}
