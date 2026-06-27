# Luya Platform — Mock System

A bilingual (中/EN) **mock / prototype** of Luya's future platform for an intelligent indoor
microgreens grower. It demonstrates the architecture, workflows, data model, and ID lineage —
built to align product managers and engineers on one shared picture.

> Not a production system, not an ERP. It is an **IoT product-operations platform** (device
> cloud + manufacturing portal + light customer/subscription ops). Sales run in external
> Shopify/Amazon backends and sync in read-only.

## Live demo

GitHub Pages: **https://fracicsowang.github.io/luya-platform/**

## What's inside

- **Luya Cloud** — Devices, Grow Tasks, Recipes, OTA, and a unified device registry.
- **Luya Manufacturing** — multi-station production line (scan-driven), factory test, label
  preview, packaging label spec, and a device **ID lineage** explainer.
- **Customers & Subscriptions** — Customers, Subscriptions, Support, Product master
  (SKU↔UPC↔ASIN), and **Channel Sync** (order → device → customer, read-only).
- **Activation / ownership** — Luya-App simulator: scan SN QR + email → Owner; invite family
  **members** with permissions; **unbind = factory reset** for transfer/resale.
- Every module shows a **bilingual workflow diagram** next to its data.

Each major flow (China factory worker, US seed-tray fulfillment, customer activation,
order sync, …) is rendered as an actor-coded diagram.

## Run locally

```bash
cd luya-platform
npm install
npm run dev      # http://localhost:3000
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4. No database — mock data lives in
`luya-platform/lib/` and interactive state in `localStorage`, designed to be swapped for real
APIs later.

## Build the static site (GitHub Pages)

```bash
cd luya-platform
NEXT_PUBLIC_BASE_PATH=/luya-platform npm run build   # outputs ./out
```

The product/architecture spec is in [`docs/`](docs/).
