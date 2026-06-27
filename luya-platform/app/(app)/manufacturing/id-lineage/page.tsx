"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Bi, Card } from "@/components/ui";
import { L } from "@/lib/i18n";
import { Actor, ACTOR_META } from "@/lib/types";
import { TONE_CHIP, Tone } from "@/lib/tone";

type Vis = "public" | "secret" | "internal" | "semi";
const VIS: Record<Vis, { label: L; cls: string }> = {
  public: { label: { zh: "公开", en: "Public" }, cls: "bg-blue-100 text-blue-700" },
  secret: { label: { zh: "私密", en: "Secret" }, cls: "bg-red-100 text-red-700" },
  internal: { label: { zh: "内部", en: "Internal" }, cls: "bg-gray-100 text-gray-600" },
  semi: { label: { zh: "半公开", en: "Semi" }, cls: "bg-amber-100 text-amber-800" },
};

type IdDef = { id: string; meaning: L; vis: Vis };
type Stage = { step: string; actor: Actor; title: L; ids: IdDef[] };

const LINEAGE: Stage[] = [
  {
    step: "0", actor: "ops", title: { zh: "开单（运营/主管）", en: "Open work order (Ops)" },
    ids: [{ id: "work_order_number", meaning: { zh: "批次号 WO-CHINA-004，质量追溯到生产批", en: "Batch no. WO-CHINA-004 — traceable to the production batch" }, vis: "internal" }],
  },
  {
    step: "1", actor: "system", title: { zh: "工位 A · 批量生成（系统）", en: "Station A · batch generate (system)" },
    ids: [
      { id: "serial_number (SN)", meaning: { zh: "人读主键 LYX-YYMM-######，印标签+二维码，全链路查它", en: "Human-readable key LYX-YYMM-######, on label + QR, the lookup key everywhere" }, vis: "public" },
      { id: "device_uuid", meaning: { zh: "永不变的云端真身，证书/MQTT 认它", en: "Immutable cloud identity; certs / MQTT bind to it" }, vis: "internal" },
      { id: "device_secret", meaning: { zh: "设备↔云端通信凭证（TLS/证书），内部用，不印卡、不给客户", en: "Device↔cloud credential (TLS/cert), internal — not printed, not customer-facing" }, vis: "internal" },
      { id: "qr_url", meaning: { zh: "https://luya.ai/app/{SN}，引导下载 App / 蓝牙认领", en: "Leads to App download / Bluetooth claim, embeds the SN" }, vis: "public" },
    ],
  },
  {
    step: "2", actor: "factory_cn", title: { zh: "工位 A · 绑定部件（工人扫枪）", en: "Station A · bind components (operator)" },
    ids: [
      { id: "pcb / camera / pump / led / power SN", meaning: { zh: "部件级追溯，RMA / 批次召回靠它", en: "Component-level traceability for RMA / recall" }, vis: "internal" },
      { id: "wifi_mac / bt_mac", meaning: { zh: "网络身份，配网 / 识别", en: "Network identity for pairing / discovery" }, vis: "semi" },
      { id: "mcu_id", meaning: { zh: "主控芯片唯一号，防伪 / 绑定校验", en: "MCU unique id — anti-counterfeit / binding check" }, vis: "internal" },
    ],
  },
  {
    step: "3", actor: "factory_cn", title: { zh: "工位 A · 烧录固件", en: "Station A · flash firmware" },
    ids: [{ id: "firmware_version", meaning: { zh: "来自工单目标版本，后续可 OTA 更新", en: "From the work-order target; updatable later via OTA" }, vis: "internal" }],
  },
  {
    step: "4", actor: "system", title: { zh: "入云（数据库）", en: "Enters cloud (database)" },
    ids: [{ id: "id (dev_xxx)", meaning: { zh: "系统内部记录主键", en: "Internal record primary key" }, vis: "internal" }],
  },
  {
    step: "5", actor: "customer", title: { zh: "客户绑定（邮箱 + 蓝牙就近）", en: "Customer binds (email + Bluetooth)" },
    ids: [{ id: "owner (email) ↔ SN", meaning: { zh: "设备↔邮箱账户绑定；蓝牙就近证明占有后写入；解绑即恢复出厂、可转让", en: "Device↔email binding; written after Bluetooth proximity proves possession; unbind = factory reset, transferable" }, vis: "internal" }],
  },
  {
    step: "6", actor: "system", title: { zh: "首次种植", en: "First grow" },
    ids: [{ id: "grow_task_id / recipe_id / tray_id", meaning: { zh: "把这台设备的一次生长串起来", en: "Tie together one grow cycle on this device" }, vis: "internal" }],
  },
];

function ActorTag({ actor }: { actor: Actor }) {
  const m = ACTOR_META[actor];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE_CHIP[m.color as Tone]}`}><Bi v={m.label} /></span>;
}

const KEYS: { id: string; tone: string; title: L; desc: L }[] = [
  { id: "SN", tone: "bg-blue-50 border-blue-200", title: { zh: "SN · 公开身份", en: "SN · public identity" }, desc: { zh: "印在机身/箱外+二维码，到处用来查（公开，不含密钥）", en: "On device/box + QR, used everywhere to look up (public, no secret)" } },
  { id: "BT", tone: "bg-teal-50 border-teal-200", title: { zh: "蓝牙就近 · 认领权", en: "Bluetooth proximity · claim right" }, desc: { zh: "无激活码卡：谁能蓝牙就近连上未认领的设备，谁就能绑定（证明物理占有）", en: "No key card: whoever can reach the unclaimed device over Bluetooth may bind it (proves possession)" } },
  { id: "UUID", tone: "bg-gray-50 border-gray-200", title: { zh: "UUID · 云端真身", en: "UUID · cloud identity" }, desc: { zh: "永不变、不外露，换标签也改不了身份", en: "Immutable, never exposed; relabeling can't change identity" } },
];

export default function IdLineagePage() {
  return (
    <div>
      <PageHeader
        pillar={{ zh: "Luya Manufacturing · 制造", en: "Luya Manufacturing" }}
        title={{ zh: "设备 ID 谱系图", en: "Device ID Lineage" }}
        desc={{ zh: "每个与设备相关的 ID：何时生成、什么含义、如何一棒接一棒传下去。这是「Luya 掌控设备身份」的核心。", en: "Every device-related ID: when it's born, what it means, how it's handed off. The heart of 'Luya owns device identity'." }}
      />
      <div className="mb-4">
        <Link href="/manufacturing" className="text-sm text-gray-500 hover:text-gray-800">← <Bi v={{ zh: "返回制造门户", en: "Back to Manufacturing" }} /></Link>
      </div>

      {/* three keys */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {KEYS.map((k) => (
          <Card key={k.id} className={`p-4 border ${k.tone}`}>
            <div className="text-sm font-semibold text-gray-900"><Bi v={k.title} /></div>
            <div className="text-xs text-gray-600 mt-1"><Bi v={k.desc} /></div>
          </Card>
        ))}
      </div>

      {/* birth timeline */}
      <div className="space-y-3">
        {LINEAGE.map((s, i) => (
          <div key={s.step}>
            {i > 0 ? <div className="flex justify-center py-0.5 text-gray-300">↓</div> : null}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white text-[11px] font-semibold">{s.step}</span>
                <ActorTag actor={s.actor} />
                <span className="text-sm font-semibold text-gray-900"><Bi v={s.title} /></span>
              </div>
              <div className="space-y-1.5">
                {s.ids.map((idDef) => (
                  <div key={idDef.id} className="grid grid-cols-1 sm:grid-cols-[260px_minmax(0,1fr)_auto] gap-1 sm:gap-3 items-start rounded-md border border-gray-100 bg-gray-50/50 px-2.5 py-1.5">
                    <code className="text-xs text-gray-900 font-mono">{idDef.id}</code>
                    <span className="text-xs text-gray-500"><Bi v={idDef.meaning} /></span>
                    <span className={`justify-self-start sm:justify-self-end rounded px-1.5 py-0.5 text-[10px] ${VIS[idDef.vis].cls}`}><Bi v={VIS[idDef.vis].label} /></span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* passing chain */}
      <Card className="p-4 mt-6 bg-green-50/40 border-green-200">
        <div className="text-sm font-semibold text-gray-900 mb-1"><Bi v={{ zh: "传递主线：SN 是贯穿全程的钥匙", en: "The through-line: SN ties it all together" }} /></div>
        <p className="text-xs text-gray-600">
          <Bi v={{ zh: "工单 → 生成 SN/UUID → 部件 SN 挂到 SN 名下 → 印标签发货（外部只有 SN+二维码）→ 客户邮箱登录 + 蓝牙就近认领 → 写 owner(email) → 云端用 UUID 作真身 → 种植/客服都用 SN 反查全部上下文。解绑即恢复出厂、可转让。", en: "Work order → generate SN/UUID → component SNs attach under the SN → label & ship (only SN+QR outside) → customer logs in by email + claims via Bluetooth proximity → owner(email) written → cloud uses UUID as identity → grow/support look everything up by SN. Unbind = factory reset, transferable." }} />
        </p>
      </Card>
    </div>
  );
}
