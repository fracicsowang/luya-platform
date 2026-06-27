import { L } from "./i18n";

export type NavItem = { href: string; label: L; icon: string };
export type NavGroup = { title: L; pillar?: "cloud" | "manufacturing"; items: NavItem[] };

/** Sidebar grouped by the three Luya Platform pillars, so the architecture
 *  message ("Cloud + Business + Manufacturing = one platform") is visible. */
export const NAV: NavGroup[] = [
  {
    title: { zh: "概览", en: "Overview" },
    items: [
      { href: "/dashboard", label: { zh: "仪表盘", en: "Dashboard" }, icon: "📊" },
      { href: "/analytics", label: { zh: "数据分析", en: "Analytics" }, icon: "📈" },
    ],
  },
  {
    title: { zh: "Luya Cloud · 设备云", en: "Luya Cloud" },
    pillar: "cloud",
    items: [
      { href: "/devices", label: { zh: "设备", en: "Devices" }, icon: "🌱" },
      { href: "/grow-tasks", label: { zh: "种植任务", en: "Grow Tasks" }, icon: "🪴" },
      { href: "/recipes", label: { zh: "配方", en: "Recipes" }, icon: "🧪" },
      { href: "/ota", label: { zh: "OTA 升级", en: "OTA" }, icon: "📡" },
    ],
  },
  {
    title: { zh: "Luya Manufacturing · 制造", en: "Luya Manufacturing" },
    pillar: "manufacturing",
    items: [{ href: "/manufacturing", label: { zh: "制造门户", en: "Manufacturing" }, icon: "🏭" }],
  },
  {
    title: { zh: "客户与订阅", en: "Customers & Subscriptions" },
    items: [
      { href: "/customers", label: { zh: "客户", en: "Customers" }, icon: "👤" },
      { href: "/subscriptions", label: { zh: "订阅", en: "Subscriptions" }, icon: "🔁" },
      { href: "/support", label: { zh: "客服支持", en: "Support" }, icon: "🎧" },
      { href: "/products", label: { zh: "商品主数据", en: "Products" }, icon: "🏷️" },
      { href: "/sync", label: { zh: "渠道同步", en: "Channel Sync" }, icon: "🔄" },
    ],
  },
  {
    title: { zh: "系统", en: "System" },
    items: [{ href: "/settings", label: { zh: "设置与角色", en: "Settings & Roles" }, icon: "⚙️" }],
  },
];

export const PILLAR_META: Record<"cloud" | "manufacturing" | "channels", { label: L; desc: L }> = {
  cloud: {
    label: { zh: "Luya Cloud", en: "Luya Cloud" },
    desc: { zh: "设备、用户、种植、配方、AI、OTA、客户、订阅、客服", en: "Device, user, grow, recipe, AI, OTA, customers, subscription, support" },
  },
  manufacturing: {
    label: { zh: "Luya Manufacturing", en: "Luya Manufacturing" },
    desc: { zh: "设备开通、生产/测试记录、标签、装箱、待发货", en: "Provisioning, production & test records, label, packing, ship-ready" },
  },
  channels: {
    label: { zh: "销售渠道（外部）", en: "Sales Channels (external)" },
    desc: { zh: "Shopify + Amazon，各自后台运营；订单/客户同步进 Luya 以对接设备", en: "Shopify + Amazon, run in their own backends; orders/customers sync into Luya to link devices" },
  },
};
