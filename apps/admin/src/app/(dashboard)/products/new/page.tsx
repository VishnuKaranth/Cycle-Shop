"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

interface Variant {
  sku: string;
  name: string;
  price: number;
  color: string;
  size: string;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "cat-road",
    isFeatured: false,
  });
  const [variants, setVariants] = useState<Variant[]>([
    { sku: "", name: "", price: 0, color: "", size: "M", stock: 0 }
  ]);
  const [error, setError] = useState("");

  const createMutation = trpc.admin.products.create.useMutation({
    onSuccess: () => router.push("/products"),
    onError: (err) => setError(err.message),
  });

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { sku: "", name: "", price: 0, color: "", size: "M", stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) { setError("Name and slug are required."); return; }
    createMutation.mutate({ ...form, variants });
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    }));
  };

  return (
    <main className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/products" className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
          <p className="text-gray-500 text-sm">Add a new bike to the catalog.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-widest text-gray-500">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600 dark:text-gray-400">Name *</label>
              <input
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Aeroad CFR"
                required
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600 dark:text-gray-400">Slug *</label>
              <input
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="aeroad-cfr"
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
              placeholder="The ultimate racing machine..."
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
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.isFeatured ? "bg-accent" : "bg-gray-200 dark:bg-gray-700"}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isFeatured ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm font-medium">Featured on homepage</span>
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm uppercase tracking-widest text-gray-500">Variants & SKUs</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-red-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-3 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg items-end">
                {[
                  { label: "SKU", field: "sku", type: "text", placeholder: "ACF-M-BLK", colSpan: "col-span-1" },
                  { label: "Name", field: "name", type: "text", placeholder: "Aeroad CFR Di2 - M", colSpan: "col-span-2" },
                  { label: "Price ($)", field: "price", type: "number", placeholder: "8999", colSpan: "col-span-1" },
                  { label: "Color", field: "color", type: "text", placeholder: "Black", colSpan: "col-span-1" },
                ].map(({ label, field, type, placeholder, colSpan }) => (
                  <div key={field} className={colSpan}>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-gray-500">{label}</label>
                    <input
                      type={type}
                      value={v[field as keyof Variant]}
                      onChange={e => updateVariant(idx, field as keyof Variant, type === "number" ? Number(e.target.value) : e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 text-gray-500">Size</label>
                  <select
                    value={v.size}
                    onChange={e => updateVariant(idx, "size", e.target.value)}
                    className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent transition-colors"
                  >
                    {["2XS", "XS", "S", "M", "L", "XL", "2XL"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(idx)} className="absolute right-2 top-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/products" className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-bold hover:border-gray-400 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {createMutation.isLoading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </main>
  );
}
