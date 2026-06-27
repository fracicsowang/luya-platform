import { L } from "./i18n";

/* ----------------------------------------------------------------------------
 * Workflow model — the heart of this mock. Every module renders a flow that
 * shows WHO does WHAT, so product managers and engineers share one picture.
 * -------------------------------------------------------------------------- */

/** Who performs a step. Drives the colour of the actor chip. */
export type Actor =
  | "factory_cn" // 中国硬件工厂工人
  | "factory_us" // 美国种子盘工厂 / 履约
  | "ops" // 运营经理
  | "support" // 客服
  | "rnd" // 研发工程师
  | "customer" // 终端客户
  | "system"; // Luya 平台自动处理

export const ACTOR_META: Record<Actor, { label: L; color: string }> = {
  factory_cn: { label: { zh: "中国硬件工厂", en: "China HW Factory" }, color: "sky" },
  factory_us: { label: { zh: "美国种子盘工厂", en: "US Seed-Tray Factory" }, color: "emerald" },
  ops: { label: { zh: "运营经理", en: "Ops Manager" }, color: "amber" },
  support: { label: { zh: "客服", en: "Support Agent" }, color: "violet" },
  rnd: { label: { zh: "研发工程师", en: "R&D Engineer" }, color: "indigo" },
  customer: { label: { zh: "终端客户", en: "Customer" }, color: "teal" },
  system: { label: { zh: "Luya 平台（自动）", en: "Luya Platform (auto)" }, color: "slate" },
};

export type StepKind = "start" | "process" | "decision" | "end" | "system";

/** A single node in a flow. */
export type FlowStep = {
  actor: Actor;
  title: L;
  detail?: L;
  kind?: StepKind;
};

/** A fan-out node: one trigger splits into several parallel lanes. */
export type FlowSplit = {
  type: "split";
  title: L;
  detail?: L;
  branches: { label: L; actor: Actor; steps: FlowStep[] }[];
};

export type FlowNode = ({ type?: "step" } & FlowStep) | FlowSplit;

export type Workflow = {
  id: string;
  title: L;
  subtitle?: L;
  nodes: FlowNode[];
};

/* ----------------------------------------------------------------------------
 * Domain entities (mock). Kept intentionally close to the spec field lists so
 * the data shape is obvious and swappable for a real API later.
 * -------------------------------------------------------------------------- */

export type DeviceStatus =
  | "not_provisioned"
  | "provisioned"
  | "in_production"
  | "tested"
  | "qc_passed"
  | "packed"
  | "shipped"
  | "activated"
  | "online"
  | "offline"
  | "maintenance"
  | "retired";

export type Device = {
  id: string;
  serial_number: string;
  device_uuid: string;
  model: string;
  hardware_version: string;
  firmware_version: string;
  cloud_status: DeviceStatus;
  activated: boolean;
  owner_customer_id?: string;
  factory: string;
  work_order_id?: string;
  wifi_mac: string;
  last_heartbeat_at?: string;
  created_at: string;
};

export type OrderSource = "shopify" | "amazon" | "manual" | "kickstarter_future" | "b2b_future";
export type OrderStatus = "new" | "paid" | "partially_fulfilled" | "fulfilled" | "cancelled" | "refunded";
export type ProductType = "device" | "seed_tray" | "nutrient" | "bundle" | "subscription";
export type FulfillLocation = "china_factory" | "us_seed_factory" | "us_warehouse" | "amazon_fba" | "manual";

export type OrderItem = {
  sku: string;
  product_name: L;
  product_type: ProductType;
  quantity: number;
  unit_price: number;
  fulfillment_location: FulfillLocation;
};

export type Order = {
  id: string;
  order_number: string;
  source: OrderSource;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  created_at: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  country: string;
  city: string;
  source: "shopify" | "amazon" | "manual" | "app";
  created_at: string;
};

export type WorkOrderStatus = "draft" | "released" | "in_progress" | "completed" | "cancelled";
export type WorkOrder = {
  id: string;
  work_order_number: string;
  product_model: string;
  planned_quantity: number;
  produced_quantity: number;
  factory_name: string;
  hardware_version: string;
  target_firmware_version: string;
  status: WorkOrderStatus;
  created_at: string;
};

export type FulfillType = "hardware_device" | "seed_tray" | "nutrient" | "replacement";
export type FulfillStatus = "pending" | "allocated" | "packed" | "shipped" | "delivered" | "failed";
export type Fulfillment = {
  id: string;
  order_number: string;
  customer_id: string;
  fulfillment_type: FulfillType;
  fulfillment_location: FulfillLocation;
  status: FulfillStatus;
  carrier?: string;
  tracking_number?: string;
  created_at: string;
};

export type GrowStatus = "planned" | "active" | "paused" | "completed" | "failed" | "cancelled";
export type GrowTask = {
  id: string;
  device_id: string;
  customer_id: string;
  seed_type: L;
  recipe_id: string;
  status: GrowStatus;
  current_day: number;
  duration_days: number;
  health_score: number;
  start_date: string;
};

export type RecipeStatus = "draft" | "testing" | "active" | "deprecated";
export type Recipe = {
  id: string;
  name: L;
  seed_type: L;
  version: string;
  status: RecipeStatus;
  duration_days: number;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: L;
  product_type: ProductType;
  location: FulfillLocation;
  quantity_available: number;
  quantity_reserved: number;
  reorder_threshold: number;
};

export type SubStatus = "active" | "paused" | "cancelled" | "past_due";
export type Subscription = {
  id: string;
  customer_id: string;
  plan_name: L;
  plan_type: "seed_tray_monthly" | "nutrient_monthly" | "app_premium" | "bundle";
  status: SubStatus;
  monthly_price: number;
  next_billing_date: string;
  next_fulfillment_date: string;
};

export type TicketType =
  | "device_issue"
  | "growing_issue"
  | "shipping_issue"
  | "subscription_issue"
  | "refund"
  | "replacement"
  | "other";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
export type Ticket = {
  id: string;
  ticket_number: string;
  customer_id: string;
  device_id?: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  subject: L;
  created_at: string;
};

export type OtaStatus = "draft" | "testing" | "released" | "deprecated";
export type OtaPackage = {
  id: string;
  name: string;
  version: string;
  target_model: string;
  package_type: "firmware" | "recipe" | "ai_model" | "configuration";
  status: OtaStatus;
  created_at: string;
};
export type OtaDeployment = {
  id: string;
  package_name: string;
  target_scope: "single_device" | "device_group" | "all_devices";
  status: "scheduled" | "in_progress" | "completed" | "failed" | "rolled_back";
  device_count: number;
  started_at: string;
};
