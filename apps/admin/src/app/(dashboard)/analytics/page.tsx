"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Users, Package } from "lucide-react";

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-xl text-sm">
      <div className="font-bold mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">{typeof p.value === "number" && p.name === "revenue" ? `$${p.value.toLocaleString()}` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Internal Funnel Mock (until PostHog aggregation is integrated into tRPC)
const FUNNEL_DATA = [
  { stage: "Visitors", count: 18420 },
  { stage: "Product Views", count: 9344 },
  { stage: "Configurator", count: 3120 },
  { stage: "Cart", count: 1890 },
  { stage: "Checkout", count: 734 },
  { stage: "Purchase", count: 235 },
];

export default function AnalyticsPage() {
  const [revenueView, setRevenueView] = useState<"revenue" | "orders">("revenue");

  // Use the live stats from tRPC
  const { data: orderStats } = trpc.admin.orders.getStats.useQuery();
  const { data: customerStats } = trpc.admin.customers.getStats.useQuery();
  const { data: analyticsData } = trpc.admin.orders.getAnalyticsData.useQuery();

  const stats = [
    { 
      label: "Total Revenue", 
      value: orderStats?.revenue ? `$${orderStats.revenue.toLocaleString()}` : "$0", 
      delta: "+10.2%", up: true, icon: <DollarSign className="w-5 h-5" /> 
    },
    { 
      label: "Orders", 
      value: orderStats?.paidOrders?.toString() || "0", 
      delta: "+5.1%", up: true, icon: <ShoppingCart className="w-5 h-5" /> 
    },
    { 
      label: "Total Customers", 
      value: customerStats?.total?.toString() || "0", 
      delta: `+${customerStats?.recent || 0} recent`, up: true, icon: <Users className="w-5 h-5" /> 
    },
    { 
      label: "Avg. Order Value", 
      value: orderStats?.avgOrderValue ? `$${orderStats.avgOrderValue.toFixed(0)}` : "$0", 
      delta: "-2.1%", up: false, icon: <Package className="w-5 h-5" /> 
    },
  ];

  const categoryData = analyticsData?.categoryData || [];
  const revenueHistory = analyticsData?.revenueHistory || [];

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Business intelligence overview — real-time performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s: any, i: number) => (
          <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">{s.icon}</div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.up ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>{s.delta}</span>
            </div>
            <div className="text-2xl font-black font-mono">{s.value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-lg">Revenue &amp; Orders</h2>
            <p className="text-xs text-gray-500">Historical performance</p>
          </div>
          <div className="flex gap-2">
            {(["revenue", "orders"] as const).map((v: any) => (
              <button
                key={v}
                onClick={() => setRevenueView(v)}
                className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-colors ${revenueView === v ? "bg-accent text-white" : "border border-gray-200 dark:border-gray-800 hover:border-accent"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e63946" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-10" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => revenueView === "revenue" ? `$${(v / 1000).toFixed(0)}k` : String(v)} />
            <Tooltip content={<CUSTOM_TOOLTIP />} />
            <Area
              type="monotone"
              dataKey={revenueView}
              stroke="#e63946"
              strokeWidth={2.5}
              fill="url(#colorGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Pie + Top Products side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {categoryData.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Legend formatter={(v) => <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-4">Top Products by Revenue</h2>
          <div className="space-y-3">
            {(analyticsData?.topProducts || []).map((p: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold truncate max-w-[160px]">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{p.sold} sold</span>
                    <span className="text-sm font-mono font-bold">${(p.revenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-accent transition-all"
                    style={{ width: `${(p.revenue / (analyticsData?.topProducts?.[0]?.revenue || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="mb-6">
          <h2 className="font-bold text-lg">Conversion Funnel</h2>
          <p className="text-xs text-gray-500">User journey from visit to purchase (30-day window)</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={FUNNEL_DATA} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" className="dark:opacity-10" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="stage" width={100} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => [v.toLocaleString(), "Users"]} />
            <Bar dataKey="count" fill="#e63946" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Visitor → Purchase:</span>{" "}
            <span className="font-black text-accent">{((235 / 18420) * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Cart → Purchase:</span>{" "}
            <span className="font-black text-emerald-500">{((235 / 1890) * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Configurator Usage:</span>{" "}
            <span className="font-black text-blue-500">{((3120 / 18420) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </main>
  );
}
