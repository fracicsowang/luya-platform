import {
  Customer,
  Device,
  DeviceStatus,
  Fulfillment,
  GrowTask,
  InventoryItem,
  Order,
  OtaDeployment,
  OtaPackage,
  Recipe,
  Subscription,
  Ticket,
  WorkOrder,
} from "./types";

/* Deterministic pseudo-random so the mock data is stable across renders. */
let _seed = 1337;
function rnd() {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}
function int(min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
function pad(n: number, w: number) {
  return String(n).padStart(w, "0");
}
function date(daysAgo: number) {
  const ms = Date.UTC(2026, 5, 26) - daysAgo * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

const FIRST = ["James", "Maria", "Wei", "Sofia", "Liam", "Yuki", "Noah", "Emma", "Chen", "Olivia", "Lucas", "Ava", "Hana", "Ethan", "Mia", "Diego", "Lin", "Aria", "Omar", "Zoe"];
const LAST = ["Smith", "Garcia", "Li", "Johnson", "Kim", "Brown", "Wang", "Davis", "Nguyen", "Marttinez", "Wilson", "Zhang", "Lee", "Patel", "Tanaka"];
const CITY = [["USA", "Austin"], ["USA", "Seattle"], ["USA", "Brooklyn"], ["USA", "Denver"], ["Canada", "Toronto"], ["USA", "San Jose"], ["USA", "Portland"], ["USA", "Miami"]];

export const customers: Customer[] = Array.from({ length: 22 }, (_, i) => {
  const [country, city] = pick(CITY);
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  return {
    id: `cus_${pad(i + 1, 3)}`,
    name,
    email: name.toLowerCase().replace(/[^a-z]/g, ".") + "@example.com",
    country,
    city,
    source: pick(["shopify", "shopify", "amazon", "manual", "app"] as const),
    created_at: date(int(2, 320)),
  };
});

const DEV_STATUSES: DeviceStatus[] = [
  "provisioned", "in_production", "tested", "qc_passed", "packed", "shipped",
  "activated", "online", "online", "online", "offline", "maintenance",
];

export const devices: Device[] = Array.from({ length: 56 }, (_, i) => {
  const status = DEV_STATUSES[i % DEV_STATUSES.length];
  const activated = ["activated", "online", "offline", "maintenance"].includes(status);
  // 2607 is reserved for the live production-line batch to avoid SN collisions.
  const month = pick(["2604", "2605", "2606"]);
  return {
    id: `dev_${pad(i + 1, 3)}`,
    serial_number: `LYX-${month}-${pad(i + 1, 6)}`,
    device_uuid: `${pad(int(0, 9999), 4)}aa-bb-cc-${pad(i, 4)}`,
    model: "LYX-01",
    hardware_version: pick(["HW1.0", "HW1.1", "HW1.2"]),
    firmware_version: pick(["1.4.2", "1.5.0", "1.5.1"]),
    cloud_status: status,
    activated,
    owner_customer_id: activated ? `cus_${pad(int(1, 22), 3)}` : undefined,
    factory: "Shenzhen Partner Co.",
    work_order_id: "WO-CHINA-001",
    wifi_mac: `A4:CF:${pad(int(10, 99), 2)}:${pad(int(10, 99), 2)}:${pad(int(10, 99), 2)}:${pad(int(10, 99), 2)}`,
    last_heartbeat_at: status === "online" ? "2026-06-26T09:" + pad(int(10, 59), 2) + ":00Z" : undefined,
    created_at: date(int(1, 120)),
  };
});

export const workOrders: WorkOrder[] = [
  { id: "wo_1", work_order_number: "WO-CHINA-001", product_model: "LYX-01", planned_quantity: 200, produced_quantity: 200, factory_name: "Shenzhen Partner Co.", hardware_version: "HW1.2", target_firmware_version: "1.5.1", status: "completed", created_at: date(40) },
  { id: "wo_2", work_order_number: "WO-CHINA-002", product_model: "LYX-01", planned_quantity: 500, produced_quantity: 180, factory_name: "Shenzhen Partner Co.", hardware_version: "HW1.2", target_firmware_version: "1.5.1", status: "in_progress", created_at: date(12) },
  { id: "wo_3", work_order_number: "WO-CHINA-003", product_model: "LYX-01", planned_quantity: 300, produced_quantity: 0, factory_name: "Shenzhen Partner Co.", hardware_version: "HW1.2", target_firmware_version: "1.5.1", status: "released", created_at: date(3) },
  { id: "wo_4", work_order_number: "WO-US-TRAY-014", product_model: "TRAY-BROCCOLI-4PK", planned_quantity: 1000, produced_quantity: 1000, factory_name: "US Seed-Tray Factory", hardware_version: "-", target_firmware_version: "-", status: "completed", created_at: date(8) },
];

const SEEDS = [
  { zh: "西兰花", en: "Broccoli", sku: "TRAY-BROCCOLI-4PK" },
  { zh: "萝卜苗", en: "Radish", sku: "TRAY-RADISH-4PK" },
  { zh: "豌豆苗", en: "Pea Shoots", sku: "TRAY-PEA-4PK" },
  { zh: "葵花苗", en: "Sunflower", sku: "TRAY-SUNFLOWER-4PK" },
];

export const recipes: Recipe[] = [
  { id: "rec_1", name: { zh: "西兰花微菜 v1.0", en: "Broccoli Microgreens v1.0" }, seed_type: SEEDS[0], version: "1.0", status: "active", duration_days: 10 },
  { id: "rec_2", name: { zh: "萝卜苗 v1.0", en: "Radish Microgreens v1.0" }, seed_type: SEEDS[1], version: "1.0", status: "active", duration_days: 8 },
  { id: "rec_3", name: { zh: "豌豆苗 v1.0", en: "Pea Shoots v1.0" }, seed_type: SEEDS[2], version: "1.0", status: "active", duration_days: 12 },
  { id: "rec_4", name: { zh: "葵花苗 v0.9", en: "Sunflower v0.9" }, seed_type: SEEDS[3], version: "0.9", status: "testing", duration_days: 11 },
  { id: "rec_5", name: { zh: "罗勒（实验）", en: "Basil (experimental)" }, seed_type: { zh: "罗勒", en: "Basil" }, version: "0.2", status: "draft", duration_days: 18 },
];

const activeDevices = devices.filter((d) => d.activated);
export const growTasks: GrowTask[] = Array.from({ length: 18 }, (_, i) => {
  const seed = pick(SEEDS);
  const recipe = recipes.find((r) => r.seed_type.en === seed.en) ?? recipes[0];
  const status = pick(["active", "active", "completed", "completed", "planned", "failed"] as const);
  const dur = recipe.duration_days;
  return {
    id: `grow_${pad(i + 1, 3)}`,
    device_id: pick(activeDevices).id,
    customer_id: `cus_${pad(int(1, 22), 3)}`,
    seed_type: { zh: seed.zh, en: seed.en },
    recipe_id: recipe.id,
    status,
    current_day: status === "completed" ? dur : int(1, dur),
    duration_days: dur,
    health_score: status === "failed" ? int(20, 55) : int(72, 98),
    start_date: date(int(1, 30)),
  };
});

const PRODUCTS = [
  { sku: "LYX-01-BLK-US", name: { zh: "Luya 种植机 黑色", en: "Luya Machine Black" }, type: "device" as const, price: 399, loc: "china_factory" as const },
  { sku: "TRAY-BROCCOLI-4PK", name: { zh: "西兰花种子盘 4连包", en: "Broccoli Tray 4-pack" }, type: "seed_tray" as const, price: 24, loc: "us_seed_factory" as const },
  { sku: "TRAY-RADISH-4PK", name: { zh: "萝卜苗种子盘 4连包", en: "Radish Tray 4-pack" }, type: "seed_tray" as const, price: 24, loc: "us_seed_factory" as const },
  { sku: "NUTRIENT-SET-ABCD", name: { zh: "营养液套装 A/B/C/D", en: "Nutrient Set A/B/C/D" }, type: "nutrient" as const, price: 39, loc: "us_seed_factory" as const },
];

export const orders: Order[] = Array.from({ length: 42 }, (_, i) => {
  const source = pick(["shopify", "shopify", "shopify", "amazon", "amazon", "manual"] as const);
  // ~40% of orders are bundles (machine + tray + nutrient) to showcase split fulfillment.
  const bundle = rnd() < 0.4;
  const items = bundle
    ? [PRODUCTS[0], pick([PRODUCTS[1], PRODUCTS[2]]), PRODUCTS[3]].map((p) => ({
        sku: p.sku, product_name: p.name, product_type: p.type, quantity: 1, unit_price: p.price,
        fulfillment_location: source === "amazon" ? ("amazon_fba" as const) : p.loc,
      }))
    : [(() => { const p = pick(PRODUCTS); return { sku: p.sku, product_name: p.name, product_type: p.type, quantity: int(1, 3), unit_price: p.price, fulfillment_location: source === "amazon" ? ("amazon_fba" as const) : p.loc }; })()];
  const total = items.reduce((s, it) => s + it.unit_price * it.quantity, 0);
  return {
    id: `ord_${pad(i + 1, 3)}`,
    order_number: `${source === "shopify" ? "SHO" : source === "amazon" ? "AMZ" : "MAN"}-${pad(1000 + i, 4)}`,
    source,
    customer_id: `cus_${pad(int(1, 22), 3)}`,
    status: pick(["paid", "paid", "fulfilled", "fulfilled", "partially_fulfilled", "new", "refunded"] as const),
    total_amount: total,
    currency: "USD",
    items,
    created_at: date(int(1, 90)),
  };
});

export const fulfillments: Fulfillment[] = orders.flatMap((o) =>
  o.items.map((it, idx) => {
    const type = it.product_type === "device" ? ("hardware_device" as const) : it.product_type === "nutrient" ? ("nutrient" as const) : ("seed_tray" as const);
    const status = pick(["pending", "allocated", "packed", "shipped", "shipped", "delivered"] as const);
    return {
      id: `ful_${o.id}_${idx}`,
      order_number: o.order_number,
      customer_id: o.customer_id,
      fulfillment_type: type,
      fulfillment_location: it.fulfillment_location,
      status,
      carrier: ["shipped", "delivered"].includes(status) ? pick(["UPS", "FedEx", "USPS"]) : undefined,
      tracking_number: ["shipped", "delivered"].includes(status) ? "1Z" + pad(int(100000, 999999), 6) : undefined,
      created_at: o.created_at,
    };
  })
);

export const inventory: InventoryItem[] = [
  { id: "inv_1", sku: "LYX-01-BLK-US", name: { zh: "Luya 种植机 黑色", en: "Luya Machine Black" }, product_type: "device", location: "china_factory", quantity_available: 320, quantity_reserved: 45, reorder_threshold: 100 },
  { id: "inv_2", sku: "LYX-01-BLK-US", name: { zh: "Luya 种植机 黑色", en: "Luya Machine Black" }, product_type: "device", location: "us_warehouse", quantity_available: 60, quantity_reserved: 12, reorder_threshold: 40 },
  { id: "inv_3", sku: "TRAY-BROCCOLI-4PK", name: { zh: "西兰花种子盘 4连包", en: "Broccoli Tray 4-pack" }, product_type: "seed_tray", location: "us_seed_factory", quantity_available: 540, quantity_reserved: 80, reorder_threshold: 200 },
  { id: "inv_4", sku: "TRAY-RADISH-4PK", name: { zh: "萝卜苗种子盘 4连包", en: "Radish Tray 4-pack" }, product_type: "seed_tray", location: "us_seed_factory", quantity_available: 180, quantity_reserved: 60, reorder_threshold: 200 },
  { id: "inv_5", sku: "TRAY-PEA-4PK", name: { zh: "豌豆苗种子盘 4连包", en: "Pea Tray 4-pack" }, product_type: "seed_tray", location: "us_seed_factory", quantity_available: 410, quantity_reserved: 30, reorder_threshold: 200 },
  { id: "inv_6", sku: "NUTRIENT-SET-ABCD", name: { zh: "营养液套装 A/B/C/D", en: "Nutrient Set A/B/C/D" }, product_type: "nutrient", location: "us_seed_factory", quantity_available: 90, quantity_reserved: 20, reorder_threshold: 120 },
  { id: "inv_7", sku: "TRAY-SUNFLOWER-4PK", name: { zh: "葵花苗种子盘 4连包", en: "Sunflower Tray 4-pack" }, product_type: "seed_tray", location: "amazon_fba", quantity_available: 75, quantity_reserved: 8, reorder_threshold: 50 },
];

export const subscriptions: Subscription[] = Array.from({ length: 14 }, (_, i) => ({
  id: `sub_${pad(i + 1, 3)}`,
  customer_id: `cus_${pad(int(1, 22), 3)}`,
  plan_name: pick([
    { zh: "每月种子盘补货", en: "Monthly Seed-Tray Refill" },
    { zh: "营养液月度补货", en: "Monthly Nutrient Refill" },
    { zh: "种子盘 + 营养液套餐", en: "Tray + Nutrient Bundle" },
  ]),
  plan_type: pick(["seed_tray_monthly", "nutrient_monthly", "bundle"] as const),
  status: pick(["active", "active", "active", "paused", "past_due", "cancelled"] as const),
  monthly_price: pick([19, 24, 39]),
  next_billing_date: date(-int(3, 28)),
  next_fulfillment_date: date(-int(1, 25)),
}));

export const tickets: Ticket[] = [
  { id: "tic_1", ticket_number: "TIC-2001", customer_id: "cus_003", device_id: "dev_007", type: "growing_issue", priority: "high", status: "open", subject: { zh: "西兰花盘出现霉点", en: "Mold spots on broccoli tray" }, created_at: date(1) },
  { id: "tic_2", ticket_number: "TIC-2002", customer_id: "cus_011", device_id: "dev_013", type: "device_issue", priority: "urgent", status: "in_progress", subject: { zh: "设备无法连接 Wi-Fi", en: "Device won't connect to Wi-Fi" }, created_at: date(2) },
  { id: "tic_3", ticket_number: "TIC-2003", customer_id: "cus_006", type: "shipping_issue", priority: "medium", status: "waiting_customer", subject: { zh: "种子盘未送达", en: "Seed tray not delivered" }, created_at: date(3) },
  { id: "tic_4", ticket_number: "TIC-2004", customer_id: "cus_019", device_id: "dev_025", type: "replacement", priority: "high", status: "open", subject: { zh: "水泵异响，申请换货", en: "Pump noise, requesting replacement" }, created_at: date(4) },
  { id: "tic_5", ticket_number: "TIC-2005", customer_id: "cus_002", type: "subscription_issue", priority: "low", status: "resolved", subject: { zh: "想暂停订阅一个月", en: "Want to pause subscription one month" }, created_at: date(6) },
  { id: "tic_6", ticket_number: "TIC-2006", customer_id: "cus_014", device_id: "dev_031", type: "growing_issue", priority: "medium", status: "in_progress", subject: { zh: "豌豆苗发黄", en: "Pea shoots yellowing" }, created_at: date(7) },
  { id: "tic_7", ticket_number: "TIC-2007", customer_id: "cus_008", type: "refund", priority: "medium", status: "closed", subject: { zh: "重复下单，申请退款", en: "Duplicate order, refund requested" }, created_at: date(9) },
  { id: "tic_8", ticket_number: "TIC-2008", customer_id: "cus_021", device_id: "dev_040", type: "device_issue", priority: "high", status: "open", subject: { zh: "相机画面模糊", en: "Camera image is blurry" }, created_at: date(10) },
  { id: "tic_9", ticket_number: "TIC-2009", customer_id: "cus_004", type: "other", priority: "low", status: "resolved", subject: { zh: "咨询配方差异", en: "Question about recipe differences" }, created_at: date(12) },
  { id: "tic_10", ticket_number: "TIC-2010", customer_id: "cus_017", device_id: "dev_046", type: "growing_issue", priority: "low", status: "closed", subject: { zh: "采收时间询问", en: "When to harvest?" }, created_at: date(15) },
];

export const otaPackages: OtaPackage[] = [
  { id: "ota_1", name: "Firmware 1.5.1", version: "1.5.1", target_model: "LYX-01", package_type: "firmware", status: "released", created_at: date(20) },
  { id: "ota_2", name: "Firmware 1.6.0-beta", version: "1.6.0-beta", target_model: "LYX-01", package_type: "firmware", status: "testing", created_at: date(5) },
  { id: "ota_3", name: "Broccoli Recipe 1.1", version: "1.1", target_model: "LYX-01", package_type: "recipe", status: "released", created_at: date(14) },
  { id: "ota_4", name: "Leaf-Health Model 0.3", version: "0.3", target_model: "LYX-01", package_type: "ai_model", status: "draft", created_at: date(2) },
];

export const otaDeployments: OtaDeployment[] = [
  { id: "dep_1", package_name: "Firmware 1.5.1", target_scope: "all_devices", status: "completed", device_count: 1240, started_at: date(18) },
  { id: "dep_2", package_name: "Broccoli Recipe 1.1", target_scope: "device_group", status: "in_progress", device_count: 320, started_at: date(1) },
  { id: "dep_3", package_name: "Firmware 1.6.0-beta", target_scope: "device_group", status: "scheduled", device_count: 50, started_at: date(-2) },
];

/* Small lookups for joins in detail-ish views. */
export const customerName = (id?: string) => customers.find((c) => c.id === id)?.name ?? "—";
