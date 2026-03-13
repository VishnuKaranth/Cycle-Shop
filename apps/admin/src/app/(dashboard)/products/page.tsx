"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import {
  Search, Plus, Filter, MoreVertical, Edit, Trash2,
  Package, TrendingUp, AlertCircle, Star,
  ChevronLeft, ChevronRight
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "Active": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Out of Stock": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Draft": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.products.getStats.useQuery();
  const { data, isLoading } = trpc.admin.products.list.useQuery({ page, limit: 10, search, category, status });
  const deleteMutation = trpc.admin.products.delete.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      utils.admin.products.getStats.invalidate();
      setDeleteId(null);
    },
  });

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your bicycle catalog and variants.</p>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats?.total ?? "—", icon: <Package className="w-4 h-4" /> },
          { label: "Active", value: stats?.active ?? "—", icon: <TrendingUp className="w-4 h-4" /> },
          { label: "Out of Stock", value: stats?.outOfStock ?? "—", icon: <AlertCircle className="w-4 h-4" /> },
          { label: "Featured", value: stats?.featured ?? "—", icon: <Star className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">{s.icon}</div>
            <div>
              <div className="text-xl font-black">{s.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        >
          <option value="all">All Categories</option>
          <option value="road">Road</option>
          <option value="gravel">Gravel</option>
          <option value="mountain">Mountain</option>
        </select>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="out of stock">Out of Stock</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800">
            <tr className="text-left text-xs font-bold uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Variants</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{product.slug}</div>
                </td>
                <td className="px-6 py-4 text-gray-500">{product.productCategory}</td>
                <td className="px-6 py-4 font-mono font-bold">${product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={product.stock === 0 ? "text-red-500 font-bold" : "text-gray-700 dark:text-gray-300"}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{product.variants.length}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[product.status] ?? ""}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.total)} of {data.total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:border-accent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold px-2">{page} / {data.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:border-accent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-center mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-bold hover:border-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: deleteId })}
                disabled={deleteMutation.isLoading}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
