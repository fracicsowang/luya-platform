# Luya Platform Mock System — Product & Architecture Prompt for Claude Code

Version: 0.1  
Purpose: Use this document as the main context prompt for Claude Code / Cursor / Codex to build a first mock version of the Luya Platform.

---

## 0. Important Instruction for Claude Code

You are building a **mock system / internal prototype**, not a production-grade enterprise system.

The goal is to create a working web application that demonstrates Luya's future platform architecture, main workflows, pages, data model, and business logic.

Do not over-engineer.  
Do not build a full ERP.  
Do not build a full MES.  
Do not build full IoT infrastructure.  
Do not build real payment, real Shopify integration, real Amazon integration, or real device communication in V1.

Build a clear, modular, realistic mock system with fake data, editable records, dashboards, and workflow pages.

The mock system should help the Luya team, investors, engineers, and factory partners understand how the future system will work.

---

# 1. Company and Product Context

Luya is building an intelligent indoor microgreens growing system.

The product includes:

1. **Luya hardware device**
   - A smart indoor microgreens growing machine.
   - Includes sensors, cameras, LED lights, water pump, valves, fan, Wi-Fi, firmware, and cloud connection.
   - Hardware is currently manufactured by an external factory in China.

2. **Seed trays / consumables**
   - Pre-seeded microgreens trays.
   - Produced in the United States.
   - Fulfillment and shipping of seed trays are handled by the US seed tray factory or US fulfillment partner.

3. **Nutrient liquids**
   - Multiple nutrient bottles or cartridges, such as A/B/C/D.
   - May be sold together with seed trays as consumables.

4. **Luya App**
   - Used by end users to bind devices, start growing cycles, see plant progress, receive notifications, and manage subscriptions.

5. **Luya Cloud**
   - Manages device identity, device status, OTA, recipe, grow tasks, image data, AI data, and remote support.

6. **Luya Business Platform**
   - A light business operations system.
   - Manages orders, basic inventory, production tracking, fulfillment tracking, subscriptions, customer service, and dashboards.
   - It is not a full ERP.

7. **Manufacturing Portal**
   - Used by external factories to provision devices, generate IDs, print labels, upload test results, mark devices as packed, and prepare shipment.
   - Important because Luya's external factory in China may not have a reliable MES system.

---

# 2. Current Business Setup

## 2.1 Hardware Manufacturing

- Luya hardware devices are manufactured in China by an external factory.
- Luya may not control the factory's MES system.
- The factory may or may not have its own MES.
- Luya must own the device identity system:
  - Device UUID
  - Serial Number
  - Activation Key
  - Device Certificate placeholder
  - Hardware version
  - Firmware version
  - Production and test records

Therefore, the mock system must include a simple **Manufacturing Portal**.

## 2.2 Seed Tray Production and Fulfillment

- Seed trays are produced in the United States.
- The US seed tray factory is responsible for producing and shipping seed trays to customers.
- The platform should track:
  - Seed tray SKU
  - Seed type
  - Batch / lot number
  - Expiration date
  - Inventory quantity
  - Orders needing tray fulfillment
  - Shipment status

## 2.3 Sales Channels

Luya currently plans to sell through:

1. **Shopify**
   - Main DTC website.
   - Used for selling machines, seed trays, nutrients, bundles, and subscriptions.

2. **Amazon**
   - Future sales channel.
   - May sell machines and consumables.

The mock system does not need real Shopify or Amazon APIs in V1.  
Instead, create mock imported orders with source fields:

- `shopify`
- `amazon`
- `manual`
- `kickstarter_future`
- `b2b_future`

---

# 3. Platform Vision

The system should be called:

# Luya Platform

Luya Platform includes three major areas:

1. **Luya Cloud**
   - Device, user, grow, recipe, AI, OTA, remote service.

2. **Luya Business**
   - Orders, inventory, fulfillment, subscription, customer service, dashboard.

3. **Luya Manufacturing**
   - Device provisioning, production record, test record, label data, packaging, shipment-ready status.

This mock system should show all three areas in one admin web portal.

---

# 4. Core Principle

The most important architecture principle:

> Luya Platform is not a traditional ERP.  
> Luya Platform is an IoT product operations platform with light business operations functions.

ERP manages company accounting, finance, procurement, and complex inventory.  
Luya Platform manages devices, users, grow cycles, consumables, orders, subscriptions, and support.

Do not build accounting, tax, general ledger, payroll, full purchase approval, or complex MRP in this mock system.

---

# 5. Main User Roles

The mock system should support role-based navigation and permissions conceptually.

For V1, implement simple roles:

## 5.1 Admin
Can access everything.

## 5.2 Factory Operator
Can access Manufacturing Portal only:
- Work orders
- Device provisioning
- Device test
- Label data
- Packaging status

## 5.3 Support Agent
Can access:
- Customers
- Devices
- Device logs
- Grow tasks
- Tickets
- Replacement requests

## 5.4 Operations Manager
Can access:
- Orders
- Inventory
- Fulfillment
- Subscriptions
- Dashboard

## 5.5 R&D Engineer
Can access:
- Devices
- Firmware
- OTA
- Recipe
- Sensor data
- Test logs
- AI data placeholder

For mock system, login can be simple or skipped. If login is implemented, use mock users.

---

# 6. Main Navigation

The admin portal should have a sidebar with these sections:

1. Dashboard
2. Devices
3. Manufacturing
4. Customers
5. Grow Tasks
6. Recipes
7. Orders
8. Inventory
9. Fulfillment
10. Subscriptions
11. Support
12. OTA
13. Analytics
14. Settings

---

# 7. Module Definitions

## 7.1 Dashboard

The dashboard should show high-level KPIs:

### Device KPIs
- Total devices
- Activated devices
- Online devices
- Offline devices
- Devices with alerts
- Devices shipped but not activated

### Business KPIs
- Total orders
- Orders from Shopify
- Orders from Amazon
- Open fulfillment orders
- Open seed tray orders
- Subscription customers
- Monthly recurring revenue mock number

### Grow KPIs
- Active grow cycles
- Completed grow cycles
- Failed grow cycles
- Average grow success rate
- Most popular seed type

### Manufacturing KPIs
- Devices provisioned
- Devices tested
- Devices passed QC
- Devices failed QC
- Devices packed
- Devices shipped from China

---

## 7.2 Device Management

Each Luya hardware device should have a digital identity.

### Device Fields

- `id`
- `device_uuid`
- `serial_number`
- `model`
- `hardware_version`
- `firmware_version`
- `cloud_status`
  - `not_provisioned`
  - `provisioned`
  - `in_production`
  - `tested`
  - `qc_passed`
  - `packed`
  - `shipped`
  - `activated`
  - `online`
  - `offline`
  - `maintenance`
  - `retired`
- `activation_status`
  - `not_activated`
  - `activated`
- `owner_customer_id`
- `factory_id`
- `production_work_order_id`
- `wifi_mac`
- `bt_mac`
- `mcu_id`
- `camera_sn`
- `pcb_sn`
- `activation_key`
- `last_heartbeat_at`
- `created_at`
- `updated_at`

### Device Detail Page

A device detail page should show:

1. Basic identity
2. Manufacturing record
3. Hardware component binding
4. Firmware version
5. Activation status
6. Current customer
7. Current grow task
8. Recent logs
9. Alerts
10. OTA history
11. Test records
12. Support tickets

### Mock Actions

- Generate device
- Mark as tested
- Mark QC pass/fail
- Mark as packed
- Mark as shipped
- Mark as activated
- Simulate online/offline
- Add device log
- Create support ticket

---

## 7.3 Manufacturing Portal

This is one of the most important modules.

It is used by external factories in China.

The goal is to let Luya control device identity even if the factory has no MES.

### Key Concept

Every Luya device must be "born" in Luya Manufacturing Portal before it can be shipped, activated, or connected to Luya Cloud.

### Manufacturing Workflow

1. Create work order
2. Generate device identities
3. Bind hardware components
4. Program firmware placeholder
5. Print label data
6. Run factory test
7. Save calibration placeholder
8. Mark QC result
9. Pack device
10. Mark shipment-ready

### Work Order Fields

- `id`
- `work_order_number`
- `product_model`
- `planned_quantity`
- `factory_name`
- `hardware_version`
- `target_firmware_version`
- `status`
  - `draft`
  - `released`
  - `in_progress`
  - `completed`
  - `cancelled`
- `created_by`
- `created_at`
- `completed_at`

### Device Provisioning

When operator clicks "Generate Device":

The system should create:

- Device UUID
- Serial Number
- Activation Key
- QR code URL placeholder

Suggested serial number format:

`LYX-YYMM-000001`

Example:

`LYX-2607-000001`

Device UUID should be standard UUID.

Activation Key can be random string.

QR code URL placeholder:

`https://device.luya.ai/activate/{serial_number}`

### Label Data

Show printable label information:

- Brand: LUYA
- Model: LYX-01
- Serial Number
- QR code URL
- Input power placeholder
- FCC / CE / UL placeholder
- Made in China
- Hardware version

Do not implement real printing in V1.  
Show a "Print Label" button and display label preview.

### Component Binding

Allow operator to input or scan:

- PCB SN
- Camera SN
- Pump SN
- LED board SN
- Power adapter SN
- Wi-Fi MAC
- Bluetooth MAC
- MCU ID

### Factory Test

Mock test checklist:

- Power on test
- Wi-Fi test
- Camera test
- Pump test
- Valve test
- LED white test
- LED red test
- LED blue test
- LED NIR test
- LED UV-B test
- Fan test
- Water level sensor test
- Temperature sensor test
- Humidity sensor test
- Door sensor test
- Final QC

Each item can be:
- pending
- pass
- fail
- skipped

### Calibration Placeholder

Allow uploading or entering:
- Camera calibration result
- Sensor offset
- Pump flow calibration
- LED calibration
- Notes

For mock system, text fields are enough.

---

## 7.4 Customer Management

Customers come from:

- Shopify
- Amazon
- Manual entry
- App registration future

### Customer Fields

- `id`
- `name`
- `email`
- `phone`
- `country`
- `state`
- `city`
- `address`
- `source`
  - `shopify`
  - `amazon`
  - `manual`
  - `app`
- `created_at`

### Customer Detail Page

Show:

- Basic profile
- Orders
- Devices
- Subscriptions
- Grow tasks
- Support tickets
- Replacement history

---

## 7.5 Grow Task Management

A Grow Task is one growing cycle.

### Grow Task Fields

- `id`
- `device_id`
- `customer_id`
- `tray_id`
- `seed_type`
- `recipe_id`
- `status`
  - `planned`
  - `active`
  - `paused`
  - `completed`
  - `failed`
  - `cancelled`
- `start_date`
- `expected_harvest_date`
- `actual_harvest_date`
- `current_day`
- `health_score`
- `notes`

### Grow Task Detail Page

Show:

- Device
- Customer
- Seed type
- Recipe
- Timeline
- Sensor data placeholder
- Image timeline placeholder
- AI analysis placeholder
- Final result

### Mock AI Fields

- Greenness index
- Coverage percentage
- Growth speed
- Yellowing detected
- Mold risk
- Health score

---

## 7.6 Recipe Management

Recipe is a plant-growing program.

### Recipe Fields

- `id`
- `name`
- `seed_type`
- `version`
- `status`
  - `draft`
  - `testing`
  - `active`
  - `deprecated`
- `duration_days`
- `description`
- `created_at`

### Recipe Parameters

Use JSON-like editable structure:

- LED schedule
  - white
  - red
  - blue
  - NIR
  - UV-B
- Watering schedule
- Fan schedule
- Temperature target
- Humidity target
- Growth stages

Example stages:

1. Germination
2. Early growth
3. Canopy expansion
4. Harvest preparation

V1 can store recipe parameters as JSON text.

---

## 7.7 Orders

Orders come from sales channels.

### Order Sources

- Shopify
- Amazon
- Manual
- Kickstarter future
- B2B future

### Order Fields

- `id`
- `order_number`
- `source`
- `customer_id`
- `status`
  - `new`
  - `paid`
  - `partially_fulfilled`
  - `fulfilled`
  - `cancelled`
  - `refunded`
- `total_amount`
- `currency`
- `created_at`

### Order Items

Each order item:

- `sku`
- `product_name`
- `product_type`
  - `device`
  - `seed_tray`
  - `nutrient`
  - `bundle`
  - `subscription`
- `quantity`
- `unit_price`
- `fulfillment_location`
  - `china_factory`
  - `us_seed_factory`
  - `amazon_fba`
  - `manual`

### Important Fulfillment Logic

Hardware device orders may be fulfilled from China factory or US warehouse.

Seed tray orders are fulfilled by the US seed tray factory.

Amazon orders may be fulfilled by Amazon FBA in the future.

Shopify orders may need split fulfillment:
- Machine from hardware inventory
- Seed trays from US seed tray factory

The mock system should show this split clearly.

---

## 7.8 Inventory

This is light inventory, not full ERP.

### Inventory Types

1. Finished hardware devices
2. Seed trays
3. Nutrient bottles
4. Replacement parts
5. Packaging materials placeholder

### Inventory Locations

- China hardware factory
- US seed tray factory
- US warehouse future
- Amazon FBA future
- R&D lab
- In transit

### Inventory Item Fields

- `id`
- `sku`
- `name`
- `product_type`
- `location`
- `quantity_available`
- `quantity_reserved`
- `quantity_inbound`
- `reorder_threshold`
- `updated_at`

### SKU Examples

- `LYX-01-BLK-US`
- `TRAY-BROCCOLI-4PK`
- `TRAY-RADISH-4PK`
- `TRAY-PEA-4PK`
- `NUTRIENT-A`
- `NUTRIENT-B`
- `NUTRIENT-C`
- `NUTRIENT-D`

---

## 7.9 Fulfillment

Fulfillment is the bridge between orders and shipping.

### Fulfillment Record Fields

- `id`
- `order_id`
- `customer_id`
- `fulfillment_type`
  - `hardware_device`
  - `seed_tray`
  - `nutrient`
  - `replacement`
- `fulfillment_location`
  - `china_factory`
  - `us_seed_factory`
  - `us_warehouse`
  - `amazon_fba`
- `status`
  - `pending`
  - `allocated`
  - `packed`
  - `shipped`
  - `delivered`
  - `failed`
- `tracking_number`
- `carrier`
- `created_at`
- `shipped_at`
- `delivered_at`

### Fulfillment Page

Show:

- Pending hardware shipments
- Pending seed tray shipments
- Split shipments
- Orders waiting for inventory
- Shipment tracking placeholder

---

## 7.10 Subscriptions

Luya has consumable subscription potential.

Subscription may include:
- Monthly seed tray refill
- Nutrient refill
- Premium app / AI features future

### Subscription Fields

- `id`
- `customer_id`
- `status`
  - `active`
  - `paused`
  - `cancelled`
  - `past_due`
- `plan_name`
- `plan_type`
  - `seed_tray_monthly`
  - `nutrient_monthly`
  - `app_premium`
  - `bundle`
- `monthly_price`
- `next_billing_date`
- `next_fulfillment_date`
- `preferred_seed_types`
- `created_at`

### Subscription Dashboard

Show:
- Active subscriptions
- Paused subscriptions
- Cancelled subscriptions
- Upcoming refill shipments
- MRR mock number
- Churn placeholder

---

## 7.11 Support / Customer Service

Support should connect customers, devices, orders, and grow tasks.

### Ticket Fields

- `id`
- `ticket_number`
- `customer_id`
- `device_id`
- `order_id`
- `grow_task_id`
- `type`
  - `device_issue`
  - `growing_issue`
  - `shipping_issue`
  - `subscription_issue`
  - `refund`
  - `replacement`
  - `other`
- `priority`
  - `low`
  - `medium`
  - `high`
  - `urgent`
- `status`
  - `open`
  - `in_progress`
  - `waiting_customer`
  - `resolved`
  - `closed`
- `subject`
- `description`
- `created_at`
- `updated_at`

### Support Agent Needs

When opening a ticket, support agent should see:

- Customer info
- Device info
- Device status
- Recent device logs
- Current grow task
- Order history
- Fulfillment history
- Subscription status

---

## 7.12 OTA

OTA is part of Luya Cloud.

### OTA Package Fields

- `id`
- `name`
- `version`
- `target_model`
- `package_type`
  - `firmware`
  - `recipe`
  - `ai_model`
  - `configuration`
- `status`
  - `draft`
  - `testing`
  - `released`
  - `deprecated`
- `release_notes`
- `created_at`

### OTA Deployment Fields

- `id`
- `ota_package_id`
- `target_scope`
  - `single_device`
  - `device_group`
  - `all_devices`
- `status`
  - `scheduled`
  - `in_progress`
  - `completed`
  - `failed`
  - `rolled_back`
- `started_at`
- `completed_at`

For V1, no real OTA. Just create mock records.

---

## 7.13 Analytics

Analytics should combine Cloud and Business data.

Example analytics pages:

1. Device activation funnel
   - Produced
   - Shipped
   - Delivered
   - Activated
   - Online

2. Order to activation funnel
   - Order created
   - Fulfilled
   - Delivered
   - Device activated
   - First grow started

3. Grow success analytics
   - Success rate by seed type
   - Failure reason
   - Average harvest days

4. Subscription analytics
   - Subscription attach rate
   - Monthly refill shipments
   - Churn mock number

5. Manufacturing quality analytics
   - QC pass rate
   - Failure by component
   - Failure by factory
   - Firmware version distribution

---

# 8. Suggested Data Model

Use a relational database. SQLite is acceptable for mock system. PostgreSQL is better if easy.

Core tables:

- users
- roles
- customers
- devices
- device_components
- device_logs
- factories
- work_orders
- factory_tests
- test_items
- calibration_records
- recipes
- grow_tasks
- grow_images
- sensor_readings
- orders
- order_items
- inventory_items
- inventory_movements
- fulfillments
- subscriptions
- support_tickets
- ota_packages
- ota_deployments

For mock system, implement a reasonable subset first.

---

# 9. Recommended Tech Stack

Claude Code should choose a simple modern full-stack architecture.

Preferred option:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- SQLite for local mock
- Recharts for charts
- Zod for validation
- React Hook Form for forms

If using another stack, keep it simple.

---

# 10. UI Style

The UI should feel like a modern SaaS admin dashboard.

Design direction:

- Clean
- Minimal
- Enterprise but friendly
- Not too colorful
- Data tables
- Detail pages
- Status badges
- Timeline components
- Cards for KPI metrics

Use Luya brand feeling:
- Green accents
- White / light background
- Dark charcoal text
- Optional plant-related soft visuals

---

# 11. MVP Development Order

Build in this order:

## Phase 1: Skeleton
1. App layout
2. Sidebar navigation
3. Dashboard page
4. Mock seed data
5. Basic tables

## Phase 2: Manufacturing
1. Work orders
2. Device provisioning
3. Label preview
4. Component binding
5. Factory test checklist
6. Device lifecycle status

## Phase 3: Device Cloud
1. Device list
2. Device detail
3. Device logs
4. Activation status
5. Online/offline simulation

## Phase 4: Business
1. Customers
2. Orders
3. Inventory
4. Fulfillment
5. Split fulfillment view

## Phase 5: Grow / Recipe
1. Recipe list
2. Grow task list
3. Grow task detail
4. Mock AI health fields

## Phase 6: Support / Subscription / OTA
1. Support tickets
2. Subscriptions
3. OTA packages
4. OTA deployments

## Phase 7: Analytics
1. Activation funnel
2. Manufacturing QC charts
3. Grow success charts
4. Subscription dashboard

---

# 12. Key Workflows to Implement

## Workflow A: China Factory Creates a Device

1. Factory operator opens Manufacturing > Work Orders.
2. Opens work order `WO-CHINA-001`.
3. Clicks "Generate Device".
4. System creates:
   - Device UUID
   - SN
   - Activation Key
   - QR code URL
5. Operator binds component SNs.
6. Operator runs test checklist.
7. Operator marks QC pass.
8. Operator previews label.
9. Operator marks device packed.
10. Device appears in Device Management.

## Workflow B: Shopify Order with Machine + Seed Trays

1. Mock order imported from Shopify.
2. Order has:
   - 1 Luya machine
   - 1 broccoli tray 4-pack
   - 1 nutrient set
3. System creates split fulfillments:
   - Hardware fulfillment from China hardware factory or US warehouse
   - Seed tray fulfillment from US seed tray factory
   - Nutrient fulfillment from US seed tray factory or US warehouse
4. Operations manager can mark each fulfillment shipped separately.

## Workflow C: Customer Activates Device

1. Customer receives machine.
2. In mock system, admin clicks "Activate Device".
3. Device is bound to customer.
4. Device status changes to activated.
5. Device appears in customer's device list.
6. First grow task can be created.

## Workflow D: Seed Tray Subscription

1. Customer subscribes to monthly seed trays.
2. Subscription creates monthly fulfillment placeholder.
3. Next fulfillment date is shown.
4. US seed tray factory location is assigned as fulfillment location.

## Workflow E: Support Ticket

1. Customer reports mold issue.
2. Support agent creates ticket.
3. Ticket links:
   - Customer
   - Device
   - Grow task
   - Order
4. Agent sees recent grow task, health score, and device logs.

---

# 13. Important Boundaries

Do not build:

- Full ERP
- Full accounting
- Tax
- Payroll
- Complex procurement approval
- Complex MRP
- Real Shopify API
- Real Amazon API
- Real payment
- Real device MQTT
- Real firmware OTA
- Real AI model inference
- Real image upload pipeline

Use placeholders and mock data where needed.

---

# 14. What the Mock System Must Demonstrate

The final mock system must clearly demonstrate:

1. Luya owns device identity.
2. External China factory can provision and test devices without MES.
3. US seed tray factory can fulfill consumables.
4. Shopify/Amazon orders can be imported conceptually.
5. Orders can be split into hardware and consumable fulfillment.
6. Devices can be activated and bound to customers.
7. Grow tasks connect device, user, tray, and recipe.
8. Support can see full customer/device/grow/order context.
9. Luya Platform is different from ERP.
10. Luya Cloud + Business + Manufacturing form one operational platform.

---

# 15. Mock Data Requirements

Create realistic mock data:

## Customers
At least 20 customers.

## Devices
At least 50 devices with different statuses:
- provisioned
- in production
- qc passed
- packed
- shipped
- activated
- online
- offline
- maintenance

## Orders
At least 40 orders:
- Shopify orders
- Amazon orders
- Manual orders

## Seed Tray SKUs
At least:
- Broccoli
- Radish
- Pea shoots
- Sunflower
- Basil future

## Recipes
At least:
- Broccoli Microgreens v1.0
- Radish Microgreens v1.0
- Pea Shoots v1.0

## Work Orders
At least:
- China hardware work order
- US seed tray batch mock

## Support Tickets
At least 10 tickets.

---

# 16. Suggested Pages

## Dashboard
`/dashboard`

## Devices
`/devices`
`/devices/[id]`

## Manufacturing
`/manufacturing/work-orders`
`/manufacturing/work-orders/[id]`
`/manufacturing/devices/[id]/test`
`/manufacturing/label-preview/[id]`

## Customers
`/customers`
`/customers/[id]`

## Grow
`/grow-tasks`
`/grow-tasks/[id]`

## Recipes
`/recipes`
`/recipes/[id]`

## Orders
`/orders`
`/orders/[id]`

## Inventory
`/inventory`

## Fulfillment
`/fulfillment`
`/fulfillment/[id]`

## Subscriptions
`/subscriptions`

## Support
`/support`
`/support/[id]`

## OTA
`/ota/packages`
`/ota/deployments`

## Analytics
`/analytics`

## Settings
`/settings`

---

# 17. Status Badge Design

Use clear colored badges for statuses.

Examples:

Device:
- provisioned
- in production
- qc passed
- packed
- shipped
- activated
- online
- offline
- maintenance

Order:
- new
- paid
- partially fulfilled
- fulfilled
- cancelled
- refunded

Fulfillment:
- pending
- allocated
- packed
- shipped
- delivered
- failed

Grow:
- planned
- active
- completed
- failed

Ticket:
- open
- in progress
- waiting customer
- resolved
- closed

---

# 18. Database and Code Quality Rules

- Use TypeScript types.
- Use Prisma schema if using Prisma.
- Use seed script to generate mock data.
- Keep module boundaries clear.
- Use reusable table components.
- Use reusable status badge components.
- Use reusable detail card components.
- Use realistic IDs and timestamps.
- Use fake data only.
- Make it easy to replace mock data with real APIs later.

---

# 19. Final Deliverable

The final deliverable should be a working local web app.

It should allow Luya team to:

1. Open dashboard.
2. See platform KPIs.
3. Create/provision mock devices.
4. View manufacturing workflow.
5. View devices and details.
6. View mock Shopify/Amazon orders.
7. See split fulfillment.
8. Track US seed tray fulfillment.
9. View customers and subscriptions.
10. View grow tasks and recipes.
11. View support tickets.
12. Understand the future Luya Platform architecture.

---

# 20. Future Production Considerations

This mock system may later evolve into a real platform.

Future real integrations may include:

- Shopify API
- Amazon Seller Central API
- Stripe
- ShipStation
- FedEx / UPS
- MQTT broker
- AWS IoT Core
- OTA pipeline
- Image storage
- AI inference service
- ERPNext / Odoo integration
- Real warehouse system
- Real manufacturing test stations

For now, keep all of these as placeholders.

---

# 21. One-Sentence Summary

Build a mock Luya Platform that combines IoT device cloud, light business operations, and manufacturing portal, reflecting Luya's real-world setup: hardware manufactured in China, seed trays produced and shipped in the US, and sales through Shopify and Amazon.

