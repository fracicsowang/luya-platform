import { L } from "./i18n";
import { Tone } from "./tone";

/** Central bilingual + tone dictionary for every status/enum value used in tables. */
export const STATUS: Record<string, { label: L; tone: Tone }> = {
  // Device cloud_status
  not_provisioned: { label: { zh: "未开通", en: "Not provisioned" }, tone: "gray" },
  provisioned: { label: { zh: "已开通", en: "Provisioned" }, tone: "slate" },
  in_production: { label: { zh: "生产中", en: "In production" }, tone: "blue" },
  tested: { label: { zh: "已测试", en: "Tested" }, tone: "indigo" },
  qc_passed: { label: { zh: "QC 通过", en: "QC passed" }, tone: "teal" },
  packed: { label: { zh: "已装箱", en: "Packed" }, tone: "violet" },
  shipped: { label: { zh: "已发货", en: "Shipped" }, tone: "purple" },
  activated: { label: { zh: "已激活", en: "Activated" }, tone: "green" },
  online: { label: { zh: "在线", en: "Online" }, tone: "green" },
  offline: { label: { zh: "离线", en: "Offline" }, tone: "gray" },
  maintenance: { label: { zh: "维护中", en: "Maintenance" }, tone: "amber" },
  retired: { label: { zh: "已退役", en: "Retired" }, tone: "red" },

  // Order
  new: { label: { zh: "新订单", en: "New" }, tone: "blue" },
  paid: { label: { zh: "已付款", en: "Paid" }, tone: "teal" },
  partially_fulfilled: { label: { zh: "部分发货", en: "Partially fulfilled" }, tone: "amber" },
  fulfilled: { label: { zh: "已履约", en: "Fulfilled" }, tone: "green" },
  cancelled: { label: { zh: "已取消", en: "Cancelled" }, tone: "gray" },
  refunded: { label: { zh: "已退款", en: "Refunded" }, tone: "red" },

  // Fulfillment
  pending: { label: { zh: "待处理", en: "Pending" }, tone: "gray" },
  allocated: { label: { zh: "已分配", en: "Allocated" }, tone: "blue" },
  delivered: { label: { zh: "已送达", en: "Delivered" }, tone: "green" },
  failed: { label: { zh: "失败", en: "Failed" }, tone: "red" },

  // Work order
  draft: { label: { zh: "草稿", en: "Draft" }, tone: "gray" },
  released: { label: { zh: "已下发", en: "Released" }, tone: "blue" },
  in_progress: { label: { zh: "进行中", en: "In progress" }, tone: "amber" },
  completed: { label: { zh: "已完成", en: "Completed" }, tone: "green" },

  // Grow
  planned: { label: { zh: "计划中", en: "Planned" }, tone: "slate" },
  active: { label: { zh: "进行中", en: "Active" }, tone: "green" },
  paused: { label: { zh: "已暂停", en: "Paused" }, tone: "amber" },

  // Recipe / OTA
  testing: { label: { zh: "测试中", en: "Testing" }, tone: "amber" },
  deprecated: { label: { zh: "已弃用", en: "Deprecated" }, tone: "gray" },

  // Subscription
  past_due: { label: { zh: "逾期", en: "Past due" }, tone: "red" },

  // Ticket status
  open: { label: { zh: "待处理", en: "Open" }, tone: "blue" },
  waiting_customer: { label: { zh: "等待客户", en: "Waiting customer" }, tone: "amber" },
  resolved: { label: { zh: "已解决", en: "Resolved" }, tone: "green" },
  closed: { label: { zh: "已关闭", en: "Closed" }, tone: "gray" },

  // OTA deployment
  scheduled: { label: { zh: "已排期", en: "Scheduled" }, tone: "blue" },
  rolled_back: { label: { zh: "已回滚", en: "Rolled back" }, tone: "red" },

  // Priority
  low: { label: { zh: "低", en: "Low" }, tone: "gray" },
  medium: { label: { zh: "中", en: "Medium" }, tone: "blue" },
  high: { label: { zh: "高", en: "High" }, tone: "orange" },
  urgent: { label: { zh: "紧急", en: "Urgent" }, tone: "red" },
};

/** Enum value labels that aren't statuses (sources, locations, types). */
export const ENUM: Record<string, L> = {
  // order/customer source
  shopify: { zh: "Shopify", en: "Shopify" },
  amazon: { zh: "Amazon", en: "Amazon" },
  manual: { zh: "手动", en: "Manual" },
  app: { zh: "App 注册", en: "App" },
  kickstarter_future: { zh: "Kickstarter（未来）", en: "Kickstarter (future)" },
  b2b_future: { zh: "B2B（未来）", en: "B2B (future)" },
  // fulfillment location
  china_factory: { zh: "中国硬件工厂", en: "China factory" },
  us_seed_factory: { zh: "美国种子盘工厂", en: "US seed factory" },
  us_warehouse: { zh: "美国仓库", en: "US warehouse" },
  amazon_fba: { zh: "Amazon FBA", en: "Amazon FBA" },
  // product / fulfillment type
  device: { zh: "设备", en: "Device" },
  seed_tray: { zh: "种子盘", en: "Seed tray" },
  nutrient: { zh: "营养液", en: "Nutrient" },
  bundle: { zh: "套装", en: "Bundle" },
  subscription: { zh: "订阅", en: "Subscription" },
  hardware_device: { zh: "硬件设备", en: "Hardware device" },
  replacement: { zh: "换货", en: "Replacement" },
  // ticket types
  device_issue: { zh: "设备问题", en: "Device issue" },
  growing_issue: { zh: "种植问题", en: "Growing issue" },
  shipping_issue: { zh: "物流问题", en: "Shipping issue" },
  subscription_issue: { zh: "订阅问题", en: "Subscription issue" },
  refund: { zh: "退款", en: "Refund" },
  other: { zh: "其他", en: "Other" },
  // ota package/scope
  firmware: { zh: "固件", en: "Firmware" },
  recipe: { zh: "配方", en: "Recipe" },
  ai_model: { zh: "AI 模型", en: "AI model" },
  configuration: { zh: "配置", en: "Configuration" },
  single_device: { zh: "单台设备", en: "Single device" },
  device_group: { zh: "设备分组", en: "Device group" },
  all_devices: { zh: "全部设备", en: "All devices" },
  // sub plan types
  seed_tray_monthly: { zh: "种子盘月度", en: "Seed-tray monthly" },
  nutrient_monthly: { zh: "营养液月度", en: "Nutrient monthly" },
  app_premium: { zh: "App 高级版", en: "App premium" },
};

export const enumLabel = (key?: string): L => ENUM[key ?? ""] ?? { zh: key ?? "—", en: key ?? "—" };
export const statusOf = (key?: string) => STATUS[key ?? ""] ?? { label: { zh: key ?? "—", en: key ?? "—" }, tone: "gray" as Tone };
