"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import {
  Search, Package, AlertTriangle, TrendingDown, Truck,
  ChevronDown, Edit3, Plus, Minus, X, Warehouse,
} from "lucide-react";

type StockModalData = { id: string; sku: string; product: string; quantity: number } | null;

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const [alertOnly, setAlertOnly] = useState(false);
  const [editItem, setEditItem] = useState<StockModalData>(null);
  const [newQty, setNewQty] = useState(0);
  const [adjustDelta, setAdjustDelta] = useState(0);

  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.inventory.getStats.useQuery();
  const { data: warehouses } = trpc.admin.inventory.getWarehouses.useQuery();
  const { data: items, isLoading } = trpc.admin.inventory.list.useQuery({ search, warehouse, alert: alertOnly || undefined });

  const updateMutation = trpc.admin.inventory.updateStock.useMutation({
    onSuccess: () => { utils.admin.inventory.list.invalidate(); utils.admin.inventory.getStats.invalidate(); setEditItem(null); },
  });
  const adjustMutation = trpc.admin.inventory.adjustStock.useMutation({
    onSuccess: () => { utils.admin.inventory.list.invalidate(); utils.admin.inventory.getStats.invalidate(); setEditItem(null); },
  });

  const openEdit = (item: { id: string; sku: string; product: string; quantity: number }) => {
    setEditItem(item);
    setNewQty(item.quantity);
    setAdjustDelta(0);
  };

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">Track stock levels across all warehouses.</p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total SKUs", value: stats?.totalSKUs ?? "—", icon: <Package className="w-4 h-4" />, accent: false },
          { label: "Total Units", value: stats?.totalUnits ?? "—", icon: <Warehouse className="w-4 h-4" />, accent: false },
          { label: "Out of Stock", value: stats?.outOfStock ?? "—", icon: <TrendingDown className="w-4 h-4" />, accent: true },
          { label: "Low Stock", value: stats?.lowStock ?? "—", icon: <AlertTriangle className="w-4 h-4" />, accent: true },
          { label: "Incoming", value: stats?.incomingShipments ?? "—", icon: <Truck className="w-4 h-4" />, accent: false },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.accent ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-accent/10 text-accent"}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Warehouses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses?.map(wh => (
          <div key={wh.id} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold">{wh.name}</div>
                <div className="text-xs text-gray-500">{wh.city}, {wh.country} · {wh.skuCount} SKUs</div>
              </div>
              <span className={`text-sm font-black ${wh.utilization > 80 ? "text-red-500" : "text-emerald-500"}`}>{wh.utilization}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${wh.utilization > 80 ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${wh.utilization}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1.5">{wh.used} / {wh.capacity} units</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU or product..."
            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
          />
        </div>
        <select
          value={warehouse}
          onChange={e => setWarehouse(e.target.value)}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        >
          <option value="all">All Warehouses</option>
          {warehouses?.map(wh => <option key={wh.id} value={wh.name}>{wh.name}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-sm font-medium">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={alertOnly} onChange={e => setAlertOnly(e.target.checked)} />
            <div className={`w-9 h-5 rounded-full transition-colors ${alertOnly ? "bg-red-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${alertOnly ? "translate-x-4" : ""}`} />
          </div>
          Alerts only
        </label>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800">
            <tr className="text-left text-xs font-bold uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Product / Variant</th>
              <th className="px-6 py-4">Warehouse</th>
              <th className="px-6 py-4 text-center">On Hand</th>
              <th className="px-6 py-4 text-center">Reserved</th>
              <th className="px-6 py-4 text-center">Available</th>
              <th className="px-6 py-4 text-center">Incoming</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : items?.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <td className="px-6 py-3 font-mono text-xs font-bold text-gray-600 dark:text-gray-400">{item.sku}</td>
                <td className="px-6 py-3">
                  <div className="font-semibold text-sm">{item.product}</div>
                  <div className="text-xs text-gray-400">{item.variant}</div>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">{item.warehouse}</td>
                <td className="px-6 py-3 text-center font-bold">{item.quantity}</td>
                <td className="px-6 py-3 text-center text-gray-500">{item.reserved}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`font-bold ${item.available <= 0 ? "text-red-500" : item.isLowStock ? "text-amber-500" : "text-emerald-600"}`}>
                    {item.available}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">
                  {item.incoming > 0 ? (
                    <span className="flex items-center justify-center gap-1 text-blue-500 font-bold">
                      <Truck className="w-3.5 h-3.5" />{item.incoming}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-6 py-3 text-center">
                  {item.isOutOfStock ? (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">Out of Stock</span>
                  ) : item.isLowStock ? (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full">Low Stock</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg">{editItem.sku}</h3>
                <p className="text-sm text-gray-500">{editItem.product}</p>
              </div>
              <button onClick={() => setEditItem(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick adjust */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-gray-500">Quick Adjust</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setAdjustDelta(d => d - 1)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-red-400 text-red-500 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className={`text-2xl font-black ${adjustDelta > 0 ? "text-emerald-500" : adjustDelta < 0 ? "text-red-500" : "text-gray-400"}`}>
                    {adjustDelta > 0 ? "+" : ""}{adjustDelta}
                  </span>
                </div>
                <button onClick={() => setAdjustDelta(d => d + 1)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-400 text-emerald-500 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => { if (adjustDelta !== 0) adjustMutation.mutate({ id: editItem.id, delta: adjustDelta }); }}
                disabled={adjustDelta === 0 || adjustMutation.isLoading}
                className="w-full mt-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-bold hover:border-accent transition-colors disabled:opacity-40"
              >
                Apply Adjustment
              </button>
            </div>

            {/* Set absolute stock */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3 text-gray-500">Set Absolute Quantity</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={0}
                  value={newQty}
                  onChange={e => setNewQty(Number(e.target.value))}
                  className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors font-mono"
                />
                <button
                  onClick={() => updateMutation.mutate({ id: editItem.id, quantity: newQty })}
                  disabled={updateMutation.isLoading}
                  className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
