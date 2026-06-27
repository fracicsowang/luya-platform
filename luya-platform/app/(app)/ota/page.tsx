"use client";

import { ModuleShell } from "@/components/ModuleShell";
import { DataTable, Column } from "@/components/DataTable";
import { EnumTag, StatusBadge, SectionTitle } from "@/components/ui";
import { otaPackages, otaDeployments } from "@/lib/mock";
import { wfOta } from "@/lib/workflows";
import { OtaPackage, OtaDeployment } from "@/lib/types";

const pkgColumns: Column<OtaPackage>[] = [
  { header: { zh: "名称", en: "Name" }, cell: (p) => p.name },
  { header: { zh: "版本", en: "Version" }, cell: (p) => p.version, mono: true },
  { header: { zh: "类型", en: "Type" }, cell: (p) => <EnumTag value={p.package_type} /> },
  { header: { zh: "目标型号", en: "Model" }, cell: (p) => p.target_model, mono: true },
  { header: { zh: "状态", en: "Status" }, cell: (p) => <StatusBadge value={p.status} /> },
];

const depColumns: Column<OtaDeployment>[] = [
  { header: { zh: "包", en: "Package" }, cell: (d) => d.package_name },
  { header: { zh: "范围", en: "Scope" }, cell: (d) => <EnumTag value={d.target_scope} /> },
  { header: { zh: "设备数", en: "Devices" }, cell: (d) => d.device_count, right: true },
  { header: { zh: "状态", en: "Status" }, cell: (d) => <StatusBadge value={d.status} /> },
  { header: { zh: "开始时间", en: "Started" }, cell: (d) => d.started_at, mono: true },
];

export default function OtaPage() {
  return (
    <ModuleShell
      pillar={{ zh: "Luya Cloud · 设备云", en: "Luya Cloud" }}
      title={{ zh: "OTA 升级", en: "OTA" }}
      desc={{ zh: "OTA 属于 Luya Cloud：固件 / 配方 / AI 模型 / 配置 的远程下发。V1 仅创建模拟记录，不做真实推送。", en: "OTA is part of Luya Cloud: remote delivery of firmware / recipe / AI model / config. V1 creates mock records only — no real push." }}
      workflow={wfOta}
    >
      <div>
        <SectionTitle title={{ zh: "OTA 升级包", en: "OTA Packages" }} />
        <DataTable columns={pkgColumns} rows={otaPackages} />
      </div>
      <div>
        <SectionTitle title={{ zh: "OTA 部署", en: "OTA Deployments" }} />
        <DataTable columns={depColumns} rows={otaDeployments} />
      </div>
    </ModuleShell>
  );
}
