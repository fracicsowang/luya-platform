"use client";

import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { Bi, Card, StatusBadge, SectionTitle } from "@/components/ui";
import { recipes } from "@/lib/mock";
import { wfGrow } from "@/lib/workflows";
import { Recipe } from "@/lib/types";

const columns: Column<Recipe>[] = [
  { header: { zh: "配方名称", en: "Name" }, cell: (r) => <Bi v={r.name} /> },
  { header: { zh: "种子类型", en: "Seed type" }, cell: (r) => <Bi v={r.seed_type} /> },
  { header: { zh: "版本", en: "Version" }, cell: (r) => r.version, mono: true },
  { header: { zh: "周期(天)", en: "Days" }, cell: (r) => r.duration_days, right: true },
  { header: { zh: "状态", en: "Status" }, cell: (r) => <StatusBadge value={r.status} /> },
];

const recipeJson = `{
  "led_schedule": { "white": "06:00-20:00", "red": "06:00-18:00",
                    "blue": "06:00-12:00", "nir": "off", "uvb": "16:00-16:30" },
  "watering": { "interval_h": 6, "ml": 120 },
  "fan": { "speed": "low", "interval_h": 2 },
  "target": { "temp_c": 22, "humidity_pct": 65 },
  "stages": ["germination", "early_growth", "canopy_expansion", "harvest_prep"]
}`;

export default function RecipesPage() {
  return (
    <ModuleShell
      pillar={{ zh: "Luya Cloud · 设备云", en: "Luya Cloud" }}
      title={{ zh: "配方", en: "Recipes" }}
      desc={{ zh: "配方是植物生长程序：LED 光谱日程、浇水、风扇、温湿度、生长阶段。V1 以 JSON 文本存储，可通过 OTA 下发。", en: "A recipe is a plant-growing program: LED schedule, watering, fan, climate, growth stages. Stored as JSON in V1, deliverable via OTA." }}
      workflow={wfGrow}
    >
      <DataTable columns={columns} rows={recipes} />
      <div>
        <SectionTitle title={{ zh: "配方参数（JSON）", en: "Recipe Parameters (JSON)" }} hint={{ zh: "西兰花微菜 v1.0 示例", en: "Example: Broccoli Microgreens v1.0" }} />
        <Card className="p-3">
          <pre className="text-xs text-gray-700 overflow-x-auto font-mono leading-relaxed">{recipeJson}</pre>
        </Card>
      </div>
    </ModuleShell>
  );
}
