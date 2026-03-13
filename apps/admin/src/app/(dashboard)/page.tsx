"use client";

import { Activity, DollarSign, Package, Users, TrendingUp } from "lucide-react";
import { trpc } from "@/trpc/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-xl text-sm">
      <div className="font-bold mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboardPage() {
  const { data: orderStats } = trpc.admin.orders.getStats.useQuery();
  const { data: customerStats } = trpc.admin.customers.getStats.useQuery();
  const { data: analyticsData } = trpc.admin.orders.getAnalyticsData.useQuery();
  const { data: recentOrdersData } = trpc.admin.orders.list.useQuery({ page: 1, limit: 5 });

  const stats = [
    { title: "Total Revenue", value: orderStats?.revenue ? `$${orderStats.revenue.toLocaleString()}` : "$0", desc: "Lifetime confirmed", icon: <DollarSign className="w-4 h-4 text-gray-400" /> },
    { title: "Customers", value: customerStats?.total.toString() || "0", desc: `${customerStats?.recent || 0} joined recently`, icon: <Users className="w-4 h-4 text-gray-400" /> },
    { title: "Total Orders", value: orderStats?.totalOrders.toString() || "0", desc: `${orderStats?.paid || 0} confirmed paid`, icon: <Activity className="w-4 h-4 text-gray-400" /> },
    { title: "Pending Fulfillment", value: orderStats?.pending.toString() || "0", desc: "Awaiting shipment", icon: <Package className="w-4 h-4 text-gray-400" /> },
  ];

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back. Here is what is happening with the store today.</p>
        </div>
        <div className="text-right">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Store Status</div>
             <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-tighter text-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live & Operational
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, i: number) => (
          <div key={i} className="bg-white border border-gray-200 dark:bg-[#111] dark:border-gray-800 rounded-xl p-6 shadow-sm group hover:border-accent transition-colors">
            <div className="flex justify-between items-center mb-4 text-sm font-medium">
              <h3 className="tracking-widest uppercase text-gray-500 group-hover:text-accent transition-colors">{stat.title}</h3>
              {stat.icon}
            </div>
            <div className="text-2xl font-black mb-1 font-mono">{stat.value}</div>
            <p className="text-xs text-gray-500">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold">Revenue Trends</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Monthly business performance</p>
            </div>
            <Link href="/analytics" className="text-[10px] font-bold uppercase tracking-widest text-[#666] hover:text-accent flex items-center gap-1.5 transition-colors">
                   Detailed Report <TrendingUp className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.revenueHistory || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: "bold" }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: "bold" }}
                    tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ef4444" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link href="/orders" className="text-[10px] font-bold uppercase tracking-widest text-[#666] hover:text-accent transition-colors">View All</Link>
          </div>
          <div className="space-y-6">
            {recentOrdersData?.orders.map((o: any) => (
              <div key={o.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{o.customer}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{o.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black font-mono">${o.total.toLocaleString()}</div>
                  <div className={`text-[9px] font-black uppercase tracking-widest ${o.status === "PAID" ? "text-emerald-500" : "text-yellow-500"}`}>
                    {o.status}
                  </div>
                </div>
              </div>
            ))}
            {!recentOrdersData?.orders.length && (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                    <Package className="w-10 h-10 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No recent activity</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
