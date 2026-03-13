"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import {
  Search, ShoppingBag, Clock, CreditCard, Truck, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, RefreshCw, X, Package,
} from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  PAID: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  SHIPPED: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  DELIVERED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock className="w-3 h-3" />,
  PAID: <CreditCard className="w-3 h-3" />,
  SHIPPED: <Truck className="w-3 h-3" />,
  DELIVERED: <CheckCircle className="w-3 h-3" />,
  CANCELLED: <XCircle className="w-3 h-3" />,
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [actionOrder, setActionOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [newStatus, setNewStatus] = useState<OrderStatus>("SHIPPED");

  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.orders.getStats.useQuery();
  const { data, isLoading } = trpc.admin.orders.list.useQuery({ search, status: statusFilter, page, limit: 10 });

  const updateMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => { utils.admin.orders.list.invalidate(); utils.admin.orders.getStats.invalidate(); setActionOrder(null); },
  });
  const refundMutation = trpc.admin.orders.refund.useMutation({
    onSuccess: () => { utils.admin.orders.list.invalidate(); utils.admin.orders.getStats.invalidate(); setActionOrder(null); },
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage fulfillment, tracking, and refunds.</p>
      </div>

      {/* Revenue + Status strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-accent to-red-700 text-white rounded-xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Confirmed Revenue</div>
          <div className="text-2xl font-black">${(stats?.revenue ?? 0).toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">Excluding pending & cancelled</div>
        </div>
        {[
          { label: "Pending", value: stats?.pending, color: "text-yellow-500" },
          { label: "To Ship", value: stats?.paid, color: "text-blue-500" },
          { label: "Shipped", value: stats?.shipped, color: "text-purple-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Status tab filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border ${statusFilter === s ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-800 hover:border-accent"}`}
          >
            {s === "all" ? "All Orders" : s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search order ID, customer name, or email..."
          className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800">
            <tr className="text-left text-xs font-bold uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(6)].map((_, i) => <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>)}</tr>)
            ) : data?.orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <td className="px-6 py-3 font-mono font-bold text-xs">{order.id}</td>
                <td className="px-6 py-3">
                  <div className="font-medium">{order.customer}</div>
                  <div className="text-xs text-gray-400">{order.email}</div>
                </td>
                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 max-w-[160px] truncate">{order.product}</td>
                <td className="px-6 py-3 text-gray-500 text-xs">{order.date}</td>
                <td className="px-6 py-3 text-right font-bold font-mono">${order.total.toLocaleString()}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[order.status as OrderStatus] ?? ""}`}>
                    {STATUS_ICONS[order.status as OrderStatus]}
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => { setActionOrder(order); setNewStatus(order.status as OrderStatus); setTrackingInput(order.trackingNo ?? ""); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-800 hover:border-accent transition-colors"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500">Page {page} of {data.totalPages} · {data.total} orders</div>
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

      {/* Order Action Modal */}
      {actionOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{actionOrder.id}</h3>
                <p className="text-sm text-gray-500">{actionOrder.customer} · ${actionOrder.total.toLocaleString()}</p>
              </div>
              <button onClick={() => setActionOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Update Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as OrderStatus)}
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              >
                {(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as OrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {(newStatus === "SHIPPED" || actionOrder.trackingNo) && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-500">Tracking Number</label>
                <input
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                  placeholder="e.g. DHL-4829103"
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors font-mono"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => updateMutation.mutate({ id: actionOrder.id, status: newStatus, trackingNo: trackingInput || undefined })}
                disabled={updateMutation.isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {updateMutation.isLoading ? "Saving..." : "Update Status"}
              </button>
              {!["CANCELLED", "PENDING"].includes(actionOrder.status) && (
                <button
                  onClick={() => refundMutation.mutate({ id: actionOrder.id })}
                  disabled={refundMutation.isLoading}
                  className="px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {refundMutation.isLoading ? "Refunding..." : "Refund"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
