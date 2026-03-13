"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Search, Users, ChevronLeft, ChevronRight, TrendingUp, Crown, Medal } from "lucide-react";

const TIER_STYLES: Record<string, string> = {
  Platinum: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  Gold: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  Silver: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  Bronze: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
};

const TIER_ICONS: Record<string, React.ReactNode> = {
  Platinum: <Crown className="w-3 h-3" />,
  Gold: <Medal className="w-3 h-3" />,
  Silver: <Medal className="w-3 h-3" />,
  Bronze: <Medal className="w-3 h-3" />,
};

const COUNTRY_FLAG: Record<string, string> = {
  US: "🇺🇸", DE: "🇩🇪", IT: "🇮🇹", GH: "🇬🇭", CN: "🇨🇳", IN: "🇮🇳", ES: "🇪🇸", GB: "🇬🇧",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: stats } = trpc.admin.customers.getStats.useQuery();
  const { data, isLoading } = trpc.admin.customers.list.useQuery({ search, tier: tierFilter, page, limit: 10 });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">Manage customer accounts and lifecycle value.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Revenue</div>
          <div className="text-2xl font-black">${(stats?.totalRevenue ?? 0).toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">Avg. ${(stats?.avgOrderValue ?? 0).toLocaleString()} / customer</div>
        </div>
        {[
          { label: "Total Customers", value: stats?.total, icon: <Users className="w-4 h-4" /> },
          { label: "Platinum / Gold", value: `${stats?.platinum ?? "—"} / ${stats?.gold ?? "—"}`, icon: <Crown className="w-4 h-4" /> },
          { label: "Silver / Bronze", value: `${stats?.silver ?? "—"} / ${stats?.bronze ?? "—"}`, icon: <TrendingUp className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">{s.icon}</div>
            <div>
              <div className="text-lg font-black">{s.value ?? "—"}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tier filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "Platinum", "Gold", "Silver", "Bronze"].map(t => (
          <button
            key={t}
            onClick={() => { setTierFilter(t); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border ${tierFilter === t ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-800 hover:border-accent"}`}
          >
            {t === "all" ? "All Tiers" : t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800">
            <tr className="text-left text-xs font-bold uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4 text-center">Orders</th>
              <th className="px-6 py-4 text-right">Total Spent</th>
              <th className="px-6 py-4">Last Order</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(6)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>)}</tr>)
            ) : data?.customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-3">
                  <div className="font-semibold">{customer.name}</div>
                  <div className="text-xs text-gray-400">{customer.email}</div>
                </td>
                <td className="px-6 py-3 text-lg">{COUNTRY_FLAG[customer.country] ?? customer.country}</td>
                <td className="px-6 py-3 text-center font-bold">{customer.orders}</td>
                <td className="px-6 py-3 text-right font-mono font-bold">${customer.totalSpent.toLocaleString()}</td>
                <td className="px-6 py-3 text-gray-500 text-xs">{customer.lastOrder}</td>
                <td className="px-6 py-3 text-gray-500 text-xs">{customer.joinedAt}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${TIER_STYLES[customer.tier] ?? ""}`}>
                    {TIER_ICONS[customer.tier]}
                    {customer.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500">Page {page} of {data.totalPages} · {data.total} customers</div>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:border-accent">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:border-accent">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
