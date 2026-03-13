"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { ArrowLeft, Save } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const utils = trpc.useUtils();
  const { data: product, isLoading } = trpc.admin.products.getById.useQuery({ id: productId });
  const updateMutation = trpc.admin.products.update.useMutation({
    onSuccess: () => {
      utils.admin.products.list.invalidate();
      router.push("/products");
    },
  });

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "cat-road",
    isFeatured: false,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        categoryId: product.categoryId,
        isFeatured: product.isFeatured,
      });
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>Product not found.</p>
        <Link href="/products" className="text-accent hover:underline mt-2 inline-block">Back to Products</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: productId, data: form });
  };

  return (
    <main className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products" className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-gray-500 text-sm font-mono">{product.slug}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-widest text-gray-500">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600 dark:text-gray-400">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600 dark:text-gray-400">Slug *</label>
              <input
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                required
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600 dark:text-gray-400">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600 dark:text-gray-400">Category</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              >
                <option value="cat-road">Road</option>
                <option value="cat-gravel">Gravel</option>
                <option value="cat-mountain">Mountain</option>
                <option value="cat-urban">Urban</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer mt-5">
              <div className="relative">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} className="sr-only" />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.isFeatured ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isFeatured ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm font-medium">Featured on homepage</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/products" className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-bold hover:border-gray-400 transition-colors">Cancel</Link>
          <button type="submit" disabled={updateMutation.isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {updateMutation.isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
