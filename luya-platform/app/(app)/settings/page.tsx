"use client";

import { PageHeader } from "@/components/PageHeader";
import { Bi, Card, SectionTitle } from "@/components/ui";
import { L } from "@/lib/i18n";
import { ALL_WORKFLOWS } from "@/lib/workflows";

const ROLES: { name: L; access: L }[] = [
  { name: { zh: "管理员 Admin", en: "Admin" }, access: { zh: "可访问全部模块", en: "Access to everything" } },
  { name: { zh: "工厂操作员 Factory Operator", en: "Factory Operator" }, access: { zh: "仅制造门户：工单、开通、测试、标签、装箱", en: "Manufacturing only: work orders, provisioning, test, label, packing" } },
  { name: { zh: "客服 Support Agent", en: "Support Agent" }, access: { zh: "客户、设备、日志、种植任务、工单、换货", en: "Customers, devices, logs, grow tasks, tickets, replacements" } },
  { name: { zh: "运营经理 Ops Manager", en: "Ops Manager" }, access: { zh: "订单、库存、履约、订阅、仪表盘", en: "Orders, inventory, fulfillment, subscriptions, dashboard" } },
  { name: { zh: "研发工程师 R&D Engineer", en: "R&D Engineer" }, access: { zh: "设备、固件、OTA、配方、传感器、测试日志、AI 数据", en: "Devices, firmware, OTA, recipe, sensor data, test logs, AI data" } },
];

const NOT_ERP: L[] = [
  { zh: "会计 / 总账", en: "Accounting / general ledger" },
  { zh: "税务", en: "Tax" },
  { zh: "薪酬", en: "Payroll" },
  { zh: "复杂采购审批", en: "Complex procurement approval" },
  { zh: "复杂 MRP", en: "Complex MRP" },
];

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        pillar={{ zh: "系统", en: "System" }}
        title={{ zh: "设置与角色", en: "Settings & Roles" }}
        desc={{ zh: "角色权限（概念级）、平台定位、以及全部工作流程图索引。", en: "Role-based access (conceptual), platform positioning, and an index of all workflow diagrams." }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <SectionTitle title={{ zh: "角色与权限", en: "Roles & Access" }} hint={{ zh: "V1 概念级别，登录可简化或跳过", en: "Conceptual for V1; login may be simplified or skipped" }} />
          <div className="space-y-2">
            {ROLES.map((r, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/50 p-2.5">
                <div className="text-sm font-medium text-gray-900"><Bi v={r.name} /></div>
                <div className="text-xs text-gray-500 mt-0.5"><Bi v={r.access} /></div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-4 border-green-200 bg-green-50/40">
            <SectionTitle title={{ zh: "核心原则：不是传统 ERP", en: "Core principle: not a traditional ERP" }} />
            <p className="text-sm text-gray-700">
              <Bi v={{ zh: "Luya Platform 是一个 IoT 产品运营平台 + 轻量业务运营，管理设备、用户、种植、消耗品、订单、订阅与支持。", en: "Luya Platform is an IoT product-operations platform with light business ops — managing devices, users, grow cycles, consumables, orders, subscriptions and support." }} />
            </p>
            <div className="mt-2 text-xs text-gray-500">
              <Bi v={{ zh: "本系统不构建：", en: "This system does NOT build:" }} />
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {NOT_ERP.map((x, i) => (
                <span key={i} className="rounded-md bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-500 line-through">
                  <Bi v={x} />
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle title={{ zh: "工作流程图索引", en: "Workflow Index" }} hint={{ zh: "每个模块旁都配有对应流程图", en: "Each module shows its matching flow" }} />
            <ul className="space-y-1 text-sm text-gray-700">
              {ALL_WORKFLOWS.map((wf) => (
                <li key={wf.id} className="flex items-center gap-2">
                  <span className="text-green-600">▸</span>
                  <Bi v={wf.title} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="p-4 mt-6">
        <p className="text-xs text-gray-400">
          <Bi v={{ zh: "这是一个模拟 / 原型系统，使用假数据。未来真实集成：Shopify API、Amazon Seller Central、Stripe、ShipStation、MQTT/AWS IoT、OTA 流水线、镜像存储、AI 推理、ERPNext/Odoo。", en: "This is a mock / prototype with fake data. Future real integrations: Shopify API, Amazon Seller Central, Stripe, ShipStation, MQTT/AWS IoT, OTA pipeline, image storage, AI inference, ERPNext/Odoo." }} />
        </p>
      </Card>
    </div>
  );
}
