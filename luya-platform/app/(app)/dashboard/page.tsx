import { PageHeader } from "@/components/PageHeader";
import { KpiCard, KpiGrid } from "@/components/Kpi";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";
import { Bi, Card, SectionTitle } from "@/components/ui";
import { PILLAR_META } from "@/lib/nav";
import { wfDeviceLifecycle } from "@/lib/workflows";
import { devices, orders, growTasks, workOrders, subscriptions } from "@/lib/mock";

export default function DashboardPage() {
  const d = devices;
  const onlineCount = d.filter((x) => x.cloud_status === "online").length;
  const offlineCount = d.filter((x) => x.cloud_status === "offline").length;
  const activated = d.filter((x) => x.activated).length;
  const shippedNotActivated = d.filter((x) => x.cloud_status === "shipped").length;

  const shopify = orders.filter((o) => o.source === "shopify").length;
  const amazon = orders.filter((o) => o.source === "amazon").length;
  const mrr = subscriptions.filter((s) => s.status === "active").reduce((s2, s) => s2 + s.monthly_price, 0);

  const activeGrow = growTasks.filter((g) => g.status === "active").length;
  const doneGrow = growTasks.filter((g) => g.status === "completed").length;
  const failGrow = growTasks.filter((g) => g.status === "failed").length;
  const successRate = Math.round((doneGrow / Math.max(1, doneGrow + failGrow)) * 100);

  const provisioned = d.length;
  const qcPassed = d.filter((x) => ["qc_passed", "packed", "shipped", "activated", "online", "offline", "maintenance"].includes(x.cloud_status)).length;
  const packed = d.filter((x) => ["packed", "shipped", "activated", "online", "offline", "maintenance"].includes(x.cloud_status)).length;
  const woInProgress = workOrders.filter((w) => w.status === "in_progress").length;

  return (
    <div>
      <PageHeader
        title={{ zh: "仪表盘", en: "Dashboard" }}
        desc={{ zh: "Luya 平台 = 设备云 + 制造门户（+ 轻量客户/订阅/客服）。销售在 Shopify / Amazon 外部后台运营，订单/客户同步进来对接设备。", en: "Luya Platform = Device Cloud + Manufacturing (+ light customer/subscription/support). Sales runs in external Shopify / Amazon backends; orders/customers sync in to link devices." }}
      />

      {/* Three pillars — reinforces the architecture story */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {(["cloud", "manufacturing", "channels"] as const).map((p) => (
          <Card key={p} className="p-4">
            <div className="text-xs font-semibold text-green-700">
              <Bi v={PILLAR_META[p].label} />
            </div>
            <div className="mt-1 text-sm text-gray-600">
              <Bi v={PILLAR_META[p].desc} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <section>
            <SectionTitle title={{ zh: "设备指标", en: "Device KPIs" }} />
            <KpiGrid>
              <KpiCard label={{ zh: "设备总数", en: "Total devices" }} value={d.length} />
              <KpiCard label={{ zh: "已激活", en: "Activated" }} value={activated} accent />
              <KpiCard label={{ zh: "在线", en: "Online" }} value={onlineCount} />
              <KpiCard label={{ zh: "离线", en: "Offline" }} value={offlineCount} />
              <KpiCard label={{ zh: "已发货未激活", en: "Shipped, not activated" }} value={shippedNotActivated} />
              <KpiCard label={{ zh: "维护中", en: "In maintenance" }} value={d.filter((x) => x.cloud_status === "maintenance").length} />
            </KpiGrid>
          </section>

          <section>
            <SectionTitle title={{ zh: "渠道与订阅", en: "Channels & Subscriptions" }} hint={{ zh: "订单来自 Shopify/Amazon 外部后台（同步进 Luya）；订阅由 Luya 管理", en: "Orders from external Shopify/Amazon backends (synced in); subscriptions managed by Luya" }} />
            <KpiGrid>
              <KpiCard label={{ zh: "订单总数（外部）", en: "Orders (external)" }} value={orders.length} />
              <KpiCard label={{ zh: "Shopify 订单", en: "Shopify orders" }} value={shopify} />
              <KpiCard label={{ zh: "Amazon 订单", en: "Amazon orders" }} value={amazon} />
              <KpiCard label={{ zh: "活跃订阅", en: "Active subscriptions" }} value={subscriptions.filter((s) => s.status === "active").length} />
              <KpiCard label={{ zh: "MRR（模拟）", en: "MRR (mock)" }} value={`$${mrr}`} accent />
            </KpiGrid>
          </section>

          <section>
            <SectionTitle title={{ zh: "种植指标", en: "Grow KPIs" }} />
            <KpiGrid>
              <KpiCard label={{ zh: "进行中周期", en: "Active cycles" }} value={activeGrow} />
              <KpiCard label={{ zh: "已完成", en: "Completed" }} value={doneGrow} />
              <KpiCard label={{ zh: "失败", en: "Failed" }} value={failGrow} />
              <KpiCard label={{ zh: "成功率", en: "Success rate" }} value={`${successRate}%`} accent />
            </KpiGrid>
          </section>

          <section>
            <SectionTitle title={{ zh: "制造指标", en: "Manufacturing KPIs" }} />
            <KpiGrid>
              <KpiCard label={{ zh: "已开通设备", en: "Provisioned" }} value={provisioned} />
              <KpiCard label={{ zh: "QC 通过", en: "QC passed" }} value={qcPassed} />
              <KpiCard label={{ zh: "已装箱", en: "Packed" }} value={packed} />
              <KpiCard label={{ zh: "进行中工单", en: "WOs in progress" }} value={woInProgress} />
            </KpiGrid>
          </section>
        </div>

        <div className="xl:sticky xl:top-16">
          <WorkflowDiagram wf={wfDeviceLifecycle} />
        </div>
      </div>
    </div>
  );
}
