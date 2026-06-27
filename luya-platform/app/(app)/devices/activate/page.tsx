"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";
import { Bi, Card } from "@/components/ui";
import { wfActivation } from "@/lib/workflows";
import { recipes } from "@/lib/mock";
import { L } from "@/lib/i18n";
import { ActivationProvider, Binding, ROLE_LABEL, myDevices, unclaimed, useActivation } from "@/lib/activationStore";
import { availableTrays, useTray, SEEDS } from "@/lib/seedTrayStore";

function Btn({ onClick, children, tone = "green", disabled, full, sm }: { onClick: () => void; children: React.ReactNode; tone?: "green" | "gray" | "blue" | "red"; disabled?: boolean; full?: boolean; sm?: boolean }) {
  const map = { green: "bg-green-600 hover:bg-green-700 text-white", blue: "bg-blue-600 hover:bg-blue-700 text-white", gray: "bg-gray-100 hover:bg-gray-200 text-gray-700", red: "bg-red-600 hover:bg-red-700 text-white" };
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${map[tone]} ${sm ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm"} ${full ? "w-full" : ""}`}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: L; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500"><Bi v={label} /></span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
    </label>
  );
}

function LoginView() {
  const { dispatch } = useActivation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-900">① <Bi v={{ zh: "用邮箱登录 / 注册", en: "Log in / sign up with email" }} /></div>
      <p className="text-xs text-gray-500"><Bi v={{ zh: "无需激活码。第一个添加设备的人成为「拥有者」。", en: "No activation code. The first to add a device becomes the Owner." }} /></p>
      <Field label={{ zh: "邮箱", en: "Email" }} value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
      <Field label={{ zh: "昵称（可选）", en: "Name (optional)" }} value={name} onChange={setName} placeholder="Maria" />
      <Btn full disabled={!email.includes("@")} onClick={() => dispatch({ type: "login", email: email.trim(), name: name.trim() })}><Bi v={{ zh: "登录", en: "Log in" }} /></Btn>
    </div>
  );
}

function AddDeviceView() {
  const { state, dispatch } = useActivation();
  const ob = state.onboarding!;
  const list = unclaimed(state);
  const [scanned, setScanned] = useState(false);
  const [manualSn, setManualSn] = useState("");
  const [err, setErr] = useState<L | null>(null);

  if (!ob.sn) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">② <Bi v={{ zh: "添加设备（扫 SN 二维码）", en: "Add device (scan SN QR)" }} /></div>
          <button onClick={() => dispatch({ type: "cancelAdd" })} className="text-xs text-gray-400 hover:text-gray-700"><Bi v={{ zh: "取消", en: "Cancel" }} /></button>
        </div>
        {!scanned ? (
          <Btn full tone="blue" onClick={() => setScanned(true)}>📷 <Bi v={{ zh: "扫描设备二维码", en: "Scan device QR" }} /></Btn>
        ) : list.length === 0 ? (
          <div className="rounded-lg bg-amber-50 text-amber-800 text-xs px-3 py-2"><Bi v={{ zh: "附近没有未认领的设备。去产线发货一批。", en: "No unclaimed devices. Ship a batch from the line." }} /></div>
        ) : (
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            <div className="text-[11px] text-gray-400"><Bi v={{ zh: `扫到 ${list.length} 台未认领设备（二维码含 token）`, en: `${list.length} unclaimed devices (QR carries a token)` }} /></div>
            {list.slice(0, 12).map((d) => (
              <button key={d.sn} onClick={() => dispatch({ type: "pick", sn: d.sn })} className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left hover:bg-green-50">
                <span className="font-mono text-sm text-gray-800">▣ {d.sn}</span>
                <span className="text-green-600 text-xs"><Bi v={{ zh: "添加", en: "Add" }} /></span>
              </button>
            ))}
          </div>
        )}
        {/* anti-jacking demo: SN alone is rejected */}
        <div className="border-t border-gray-100 pt-2">
          <div className="text-[11px] text-gray-400 mb-1"><Bi v={{ zh: "手输序列号试试：", en: "Try typing a serial:" }} /></div>
          <div className="flex gap-2">
            <input value={manualSn} onChange={(e) => { setManualSn(e.target.value); setErr(null); }} placeholder="LYX-2607-000001" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-mono" />
            <Btn sm tone="gray" onClick={() => setErr({ zh: "仅凭 SN 无法绑定——SN 是公开的、还连续可枚举。请扫描二维码（内含校验 token），防止他人凭序列号抢注。", en: "SN alone can't bind — it's public and enumerable. Scan the QR (it carries a token) to prevent claim-jacking." })}><Bi v={{ zh: "绑定", en: "Bind" }} /></Btn>
          </div>
          {err ? <div className="mt-1 text-[11px] text-red-600"><Bi v={err} /></div> : null}
        </div>
      </div>
    );
  }

  // wifi + bind
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-900">③ <Bi v={{ zh: "连接 Wi-Fi 并成为拥有者", en: "Connect Wi-Fi & become Owner" }} /></div>
      <div className="rounded-md bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 font-mono">▣ {ob.sn}</div>
      <p className="text-[11px] text-gray-400"><Bi v={{ zh: "配网时 App 需连上设备（蓝牙/局域网）——这一步也证明你在机器旁，防远程顶替。", en: "Setup connects the app to the device (BT/LAN) — this also proves you're next to it, blocking remote takeover." }} /></p>
      <Field label={{ zh: "Wi-Fi 名称", en: "Wi-Fi SSID" }} value={ob.wifiSsid} onChange={(v) => dispatch({ type: "setWifi", ssid: v })} />
      {!ob.wifiConnected ? (
        <Btn full onClick={() => dispatch({ type: "connectWifi" })} disabled={!ob.wifiSsid}>📶 <Bi v={{ zh: "连接", en: "Connect" }} /></Btn>
      ) : (
        <Btn full onClick={() => dispatch({ type: "bindOwner", at: new Date().toISOString().slice(0, 16).replace("T", " ") })}>✅ <Bi v={{ zh: "绑定为拥有者", en: "Bind as Owner" }} /></Btn>
      )}
    </div>
  );
}

function TrayPicker({ sn, me, onDone, onCancel }: { sn: string; me: string; onDone: (recipeId: string | null) => void; onCancel: () => void }) {
  const trays = availableTrays();
  return (
    <div className="rounded-lg border border-gray-200 p-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-600"><Bi v={{ zh: "扫码添加种子盘", en: "Scan a seed tray" }} /></span>
        <button onClick={onCancel} className="text-[11px] text-gray-400 hover:text-gray-700"><Bi v={{ zh: "取消", en: "Cancel" }} /></button>
      </div>
      {trays.length === 0 ? (
        <div className="text-[11px] text-amber-800 bg-amber-50 rounded px-2 py-1.5"><Bi v={{ zh: "无可用种子盘。去「种子盘生产线」生产一批。仅支持 Luya 自产托盘。", en: "No trays available. Produce a batch on the Seed-Tray Line. Only Luya-made trays work." }} /></div>
      ) : (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {trays.slice(0, 12).map((t) => (
            <button key={t.id} onClick={() => onDone(useTray(t.id, { email: me, sn, at: new Date().toISOString().slice(0, 16).replace("T", " ") }))} className="w-full flex items-center justify-between rounded border border-gray-200 px-2 py-1.5 text-left hover:bg-green-50">
              <span className="font-mono text-xs">▣ {t.id}</span>
              <span className="text-[11px] text-green-600"><Bi v={SEEDS[t.seedKey].name} /> · <Bi v={{ zh: "添加", en: "Add" }} /></span>
            </button>
          ))}
        </div>
      )}
      <div className="text-[10px] text-gray-400"><Bi v={{ zh: "二维码一次性：添加后该托盘即失效，任何账户都不能再添加。", en: "Single-use QR: once added, the tray is invalid and no account can add it again." }} /></div>
    </div>
  );
}

function DeviceCard({ binding, role, me }: { binding: Binding; role: "owner" | "member"; me: string }) {
  const { dispatch } = useActivation();
  const [invEmail, setInvEmail] = useState("");
  const [invOp, setInvOp] = useState(true);
  const [scanTrays, setScanTrays] = useState(false);
  const recipe = binding.recipeId ? recipes.find((r) => r.id === binding.recipeId) : null;

  return (
    <div className="rounded-xl border border-gray-200 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold">{binding.sn}</span>
        <span className="flex items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${role === "owner" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}><Bi v={ROLE_LABEL[role]} /></span>
          <span className="inline-flex items-center gap-1 text-green-700 text-[11px]"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />在线</span>
        </span>
      </div>
      <div className="text-[11px] text-gray-500"><Bi v={{ zh: "拥有者", en: "Owner" }} />: {binding.ownerName} <span className="text-gray-300">·</span> {binding.ownerEmail}</div>

      {/* grow — started by scanning a single-use seed-tray QR */}
      {recipe ? (
        <div className="text-xs text-green-700">🪴 <Bi v={{ zh: "种植中：", en: "Growing: " }} /><Bi v={recipe.seed_type} /></div>
      ) : role === "owner" ? (
        !scanTrays ? (
          <button onClick={() => setScanTrays(true)} className="rounded-lg bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs font-medium">🏷️ <Bi v={{ zh: "扫码添加种子盘 · 开始种植", en: "Scan seed tray · start grow" }} /></button>
        ) : (
          <TrayPicker sn={binding.sn} me={me} onCancel={() => setScanTrays(false)} onDone={(rid) => { if (rid) dispatch({ type: "startGrow", sn: binding.sn, recipeId: rid }); setScanTrays(false); }} />
        )
      ) : null}

      {/* members */}
      <div className="border-t border-gray-100 pt-2">
        <div className="text-[11px] font-medium text-gray-600 mb-1"><Bi v={{ zh: "家庭成员", en: "Members" }} /> ({binding.members.length})</div>
        {binding.members.length === 0 ? <div className="text-[11px] text-gray-400"><Bi v={{ zh: "暂无成员", en: "No members yet" }} /></div> : null}
        <div className="space-y-1">
          {binding.members.map((m) => (
            <div key={m.email} className="flex items-center justify-between gap-2 text-[11px] bg-gray-50/60 rounded px-2 py-1">
              <span className="truncate flex-1">{m.name} <span className="text-gray-400">· {m.email}</span></span>
              <button disabled={role !== "owner"} onClick={() => dispatch({ type: "togglePerm", sn: binding.sn, email: m.email })} className={`rounded px-1.5 py-0.5 ${m.canOperate ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"} disabled:opacity-60`}>
                <Bi v={m.canOperate ? { zh: "可操作", en: "Operate" } : { zh: "只读", en: "View" }} />
              </button>
              {role === "owner" || m.email.toLowerCase() === me.toLowerCase() ? (
                <button onClick={() => dispatch({ type: "removeMember", sn: binding.sn, email: m.email })} className="text-red-500 hover:text-red-700"><Bi v={{ zh: "移除", en: "Remove" }} /></button>
              ) : null}
            </div>
          ))}
        </div>
        {role === "owner" ? (
          <div className="mt-2 flex items-center gap-1.5">
            <input value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="family@example.com" className="flex-1 rounded border border-gray-300 px-2 py-1 text-[11px] font-mono" />
            <button onClick={() => setInvOp((v) => !v)} className={`rounded px-1.5 py-1 text-[10px] ${invOp ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}><Bi v={invOp ? { zh: "可操作", en: "Operate" } : { zh: "只读", en: "View" }} /></button>
            <Btn sm disabled={!invEmail.includes("@")} onClick={() => { dispatch({ type: "invite", sn: binding.sn, email: invEmail.trim(), name: "", canOperate: invOp }); setInvEmail(""); }}><Bi v={{ zh: "邀请", en: "Invite" }} /></Btn>
          </div>
        ) : null}
      </div>

      {/* danger zone */}
      <div className="border-t border-gray-100 pt-2">
        {role === "owner" ? (
          <button onClick={() => { if (confirm("解绑并恢复出厂？将释放拥有者+所有成员、抹除 Wi-Fi/种植数据，设备退回「未认领」，可被他人扫码重新绑定（转让/出售）。")) dispatch({ type: "unbind", sn: binding.sn }); }} className="w-full rounded-lg bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 text-xs font-medium">
            🔁 <Bi v={{ zh: "解绑·恢复出厂（转让 / 出售）", en: "Unbind · factory reset (transfer / sell)" }} />
          </button>
        ) : (
          <button onClick={() => dispatch({ type: "removeMember", sn: binding.sn, email: me })} className="w-full rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 text-xs font-medium">
            <Bi v={{ zh: "退出该设备", en: "Leave this device" }} />
          </button>
        )}
      </div>
    </div>
  );
}

function HomeView() {
  const { state, dispatch } = useActivation();
  const mine = myDevices(state);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900"><Bi v={{ zh: "我的设备", en: "My devices" }} /></div>
        <Btn sm onClick={() => dispatch({ type: "startAdd" })}>＋ <Bi v={{ zh: "添加设备", en: "Add device" }} /></Btn>
      </div>
      {mine.length === 0 ? (
        <div className="rounded-lg bg-gray-50 text-gray-500 text-xs px-3 py-4 text-center"><Bi v={{ zh: "还没有设备。点「添加设备」扫码绑定。", en: "No devices yet. Tap Add device to scan & bind." }} /></div>
      ) : (
        <div className="space-y-2">
          {mine.map(({ binding, role }) => (
            <DeviceCard key={binding.sn} binding={binding} role={role} me={state.account!.email} />
          ))}
        </div>
      )}
    </div>
  );
}

function Phone() {
  const { state, dispatch } = useActivation();
  return (
    <div className="mx-auto w-full max-w-sm rounded-[28px] border border-gray-200 bg-white shadow-lg overflow-hidden">
      <div className="bg-green-600 text-white px-4 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Luya App</span>
          {state.account ? (
            <button onClick={() => dispatch({ type: "logout" })} className="text-[11px] text-white/90 underline-offset-2 hover:underline">{state.account.email} · <Bi v={{ zh: "切换", en: "Switch" }} /></button>
          ) : (
            <span className="text-[11px] text-white/80"><Bi v={{ zh: "未登录", en: "Logged out" }} /></span>
          )}
        </div>
      </div>
      <div className="p-4 min-h-[340px]">
        {!state.account ? <LoginView /> : state.onboarding ? <AddDeviceView /> : <HomeView />}
      </div>
    </div>
  );
}

function ActivationScreen() {
  return (
    <div>
      <PageHeader
        pillar={{ zh: "Luya Cloud · 设备云", en: "Luya Cloud" }}
        title={{ zh: "绑定 · 分享 · 转让（模拟 Luya App）", en: "Bind · Share · Transfer (Luya App mock)" }}
        desc={{ zh: "无激活码：邮箱登录 + 扫 SN 二维码 → 第一个绑定的成「拥有者」；拥有者可邀请家庭成员（权限可设）；解绑=恢复出厂，释放全部账户、设备退回未认领，新人扫码即成新拥有者（转让/出售）。切换账户可扮演不同用户。", en: "No code: email login + scan SN QR → first binder = Owner; Owner invites members (with permissions); unbind = factory reset, releases everyone, next person scans to become new Owner (transfer/sell). Switch account to play different users." }}
      />
      <div className="mb-4">
        <Link href="/devices" className="text-sm text-gray-500 hover:text-gray-800">← <Bi v={{ zh: "返回设备", en: "Back to Devices" }} /></Link>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6 items-start">
        <Phone />
        <div className="xl:sticky xl:top-16"><WorkflowDiagram wf={wfActivation} /></div>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <ActivationProvider>
      <ActivationScreen />
    </ActivationProvider>
  );
}
