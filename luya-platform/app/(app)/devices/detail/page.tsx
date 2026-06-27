"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bi, Card, StatusBadge } from "@/components/ui";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";
import { wfDeviceLifecycle } from "@/lib/workflows";
import { useRegistry, factoryResetBinding, COMPONENT_LABELS, UDevice } from "@/lib/deviceRegistry";
import { recipes } from "@/lib/mock";
import { L } from "@/lib/i18n";

/** One ID row: label, value, and what it means / who passes it. */
function IdRow({ label, value, meaning, missing }: { label: L; value?: string; meaning: L; missing?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-1 sm:gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="text-xs text-gray-500 pt-0.5"><Bi v={label} /></div>
      <div>
        <div className={`font-mono text-sm ${missing ? "text-gray-300" : "text-gray-900"}`}>{value ?? "—"}</div>
        <div className="text-[11px] text-gray-400 mt-0.5"><Bi v={meaning} /></div>
      </div>
    </div>
  );
}

function Section({ step, title, born, children }: { step: string; title: L; born: L; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white text-[11px] font-semibold">{step}</span>
        <span className="text-sm font-semibold text-gray-900"><Bi v={title} /></span>
        <span className="text-[11px] text-gray-400">·</span>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500"><Bi v={{ zh: "生成于：", en: "Born at: " }} /><Bi v={born} /></span>
      </div>
      {children}
    </Card>
  );
}

function DetailBody({ dev, onReset }: { dev: UDevice; onReset: () => void }) {
  const isFactory = dev.source === "factory";
  const recipe = dev.grow?.recipeId ? recipes.find((r) => r.id === dev.grow!.recipeId) : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6 items-start">
      <div className="space-y-4 min-w-0">
        <Section step="0" title={{ zh: "批次", en: "Batch" }} born={{ zh: "开单（运营）", en: "Work order (Ops)" }}>
          <IdRow label={{ zh: "工单号", en: "Work order" }} value={dev.work_order_number} meaning={{ zh: "批次号，质量可追溯到生产批", en: "Batch number — quality traceable to the production batch" }} />
          <IdRow label={{ zh: "工厂", en: "Factory" }} value={dev.factory} meaning={{ zh: "代工厂，失败率/QC 按工厂统计", en: "Contract factory — QC stats grouped by factory" }} />
        </Section>

        <Section step="1" title={{ zh: "设备身份", en: "Device identity" }} born={{ zh: "工位 A 生成（系统）", en: "Station A · generate (system)" }}>
          <IdRow label={{ zh: "序列号 SN", en: "Serial No. (SN)" }} value={dev.sn} meaning={{ zh: "人读主键，印在标签+二维码，全链路用它查（公开）", en: "Human-readable key on label + QR, used everywhere to look up (public)" }} />
          <IdRow label={{ zh: "设备 UUID", en: "Device UUID" }} value={dev.uuid} meaning={{ zh: "永不变的云端真身，证书/MQTT 认它（内部）", en: "Immutable cloud identity; certs/MQTT bind to it (internal)" }} />
          <IdRow label={{ zh: "设备凭证", en: "Device secret" }} value={dev.activation_key} missing={!dev.activation_key} meaning={{ zh: "设备↔云端通信凭证（内部，不印卡、不给客户）；激活改用邮箱+蓝牙", en: "Device↔cloud credential (internal — not printed); activation uses email + Bluetooth" }} />
          <IdRow label={{ zh: "二维码 URL", en: "QR URL" }} value={`https://luya.ai/app/${dev.sn}`} meaning={{ zh: "引导下载 App / 蓝牙认领，内含 SN（公开）", en: "Leads to App / Bluetooth claim, embeds the SN (public)" }} />
        </Section>

        <Section step="2" title={{ zh: "硬件部件 SN / MAC", en: "Component SN / MAC" }} born={{ zh: "工位 A 绑定（工人扫枪）", en: "Station A · bind (operator)" }}>
          {isFactory && dev.components ? (
            COMPONENT_LABELS.map((c) => (
              <IdRow key={c.key} label={c.label} value={dev.components![c.key] ?? undefined} missing={!dev.components![c.key]} meaning={c.key === "mcu" ? { zh: "主控芯片唯一号，防伪/绑定校验", en: "MCU unique id — anti-counterfeit / binding check" } : c.key.includes("wifi") || c.key === "bt" ? { zh: "网络身份，配网/识别", en: "Network identity, used for pairing" } : { zh: "部件级追溯，RMA/批次召回靠它", en: "Component-level traceability for RMA / recall" }} />
            ))
          ) : (
            <div className="text-xs text-gray-400 py-2"><Bi v={{ zh: "示例设备：部件级 SN 在工厂工位绑定，本 mock 的静态样本未导入明细。去产线工位用真实设备查看完整绑定。", en: "Seed device: component SNs are bound at the factory station; this static sample has no detail. Use the production line for a fully-bound unit." }} /></div>
          )}
        </Section>

        <Section step="3" title={{ zh: "固件", en: "Firmware" }} born={{ zh: "工位 A 烧录 / 后续 OTA", en: "Station A flash / later OTA" }}>
          <IdRow label={{ zh: "固件版本", en: "Firmware" }} value={dev.firmware_version} meaning={{ zh: "当前固件，可通过 OTA 更新", en: "Current firmware, updatable via OTA" }} />
        </Section>

        <Section step="4" title={{ zh: "归属与共享", en: "Ownership & sharing" }} born={{ zh: "客户绑定（扫 SN 二维码 + 邮箱）", en: "Customer binds (scan SN QR + email)" }}>
          {dev.owner ? (
            <>
              <IdRow label={{ zh: "拥有者 Owner", en: "Owner" }} value={dev.owner.name} meaning={{ zh: "第一个扫码绑定的账户；可邀请成员、可解绑转让", en: "First account to scan-and-bind; can invite members & unbind to transfer" }} />
              <IdRow label={{ zh: "拥有者邮箱", en: "Owner email" }} value={dev.owner.email} meaning={{ zh: "账户标识", en: "Account identifier" }} />
              {dev.members && dev.members.length > 0 ? (
                <div className="py-2 border-b border-gray-100 last:border-0">
                  <div className="text-xs text-gray-500 mb-1"><Bi v={{ zh: "家庭成员", en: "Members" }} /> ({dev.members.length})</div>
                  <div className="space-y-1">
                    {dev.members.map((m) => (
                      <div key={m.email} className="flex items-center justify-between text-xs bg-gray-50/60 rounded px-2 py-1">
                        <span className="font-mono">{m.name} · {m.email}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] ${m.canOperate ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}><Bi v={m.canOperate ? { zh: "可操作", en: "Operate" } : { zh: "只读", en: "View" }} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-xs text-gray-400 py-2"><Bi v={{ zh: "未认领，无归属。发货后用户扫 SN 二维码 + 邮箱即可绑定为拥有者。", en: "Unclaimed — no owner. A user scans the SN QR + email to bind as Owner." }} /></div>
          )}

          {/* resale fallback: physical factory reset */}
          {isFactory && dev.owner ? (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-2.5">
              <div className="text-[11px] text-red-700 mb-1.5"><Bi v={{ zh: "出售兜底：买家拿到机器，长按机身复位键即可清除绑定（无需原主配合）。", en: "Resale fallback: the buyer holds the device's reset button to clear the binding (no seller needed)." }} /></div>
              <button onClick={() => { if (confirm(`模拟机身物理恢复出厂 ${dev.sn}？将释放拥有者+成员，设备退回未认领。`)) { if (factoryResetBinding(dev.sn)) onReset(); } }} className="rounded-md bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium">
                🔧 <Bi v={{ zh: "模拟机身恢复出厂", en: "Simulate physical factory reset" }} />
              </button>
            </div>
          ) : null}
        </Section>

        <Section step="5" title={{ zh: "种植", en: "Grow" }} born={{ zh: "首次种植任务", en: "First grow task" }}>
          {recipe ? (
            <IdRow label={{ zh: "当前配方", en: "Recipe" }} value={`${recipe.id} · ${recipe.name.en}`} meaning={{ zh: "recipe_id 把这台设备的一次生长串起来", en: "recipe_id ties together one grow cycle on this device" }} />
          ) : (
            <div className="text-xs text-gray-400 py-2"><Bi v={{ zh: "暂无种植任务。", en: "No grow task yet." }} /></div>
          )}
        </Section>
      </div>

      <div className="xl:sticky xl:top-16 space-y-4">
        <WorkflowDiagram wf={wfDeviceLifecycle} />
        <Card className="p-3">
          <p className="text-[11px] text-gray-400">
            <Bi v={{ zh: "想看每个 ID 的「何时生 · 谁用 · 怎么传」总图？", en: "Want the full map of every ID — born / used / passed?" }} />
          </p>
          <Link href="/manufacturing/id-lineage" className="text-xs text-green-700 hover:text-green-800 font-medium">
            <Bi v={{ zh: "→ 设备 ID 谱系图", en: "→ Device ID lineage" }} />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function DeviceDetail() {
  const params = useSearchParams();
  const sn = decodeURIComponent(String(params.get("sn") ?? ""));
  const { bySn, refresh } = useRegistry();
  const dev = bySn(sn);

  return (
    <div>
      <div className="mb-4">
        <Link href="/devices" className="text-sm text-gray-500 hover:text-gray-800">← <Bi v={{ zh: "返回设备", en: "Back to Devices" }} /></Link>
      </div>

      {!dev ? (
        <Card className="p-8 text-center text-sm text-gray-500">
          <Bi v={{ zh: `未找到设备 ${sn}。可能不在当前批次（产线批次存在浏览器本地）。`, en: `Device ${sn} not found. It may not be in the current batch (line batch lives in browser storage).` }} />
        </Card>
      ) : (
        <>
          <header className="mb-6">
            <div className="text-xs font-medium text-green-700 mb-1"><Bi v={{ zh: "Luya Cloud · 设备详情", en: "Luya Cloud · Device detail" }} /></div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 font-mono">{dev.sn}</h1>
              <StatusBadge value={dev.cloud_status} />
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                <Bi v={dev.source === "factory" ? { zh: "产线批次", en: "Factory batch" } : { zh: "示例数据", en: "Seed data" }} />
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500"><Bi v={{ zh: "下面按生成顺序展示这台设备的完整 ID 链——每个 ID 何处生成、什么含义。", en: "The full ID chain for this device in birth order — where each ID is generated and what it means." }} /></p>
          </header>
          <DetailBody dev={dev} onReset={refresh} />
        </>
      )}
    </div>
  );
}

export default function DeviceDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">…</div>}>
      <DeviceDetail />
    </Suspense>
  );
}
