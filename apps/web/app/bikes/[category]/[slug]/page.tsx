"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { trpc } from "../../../../src/trpc/client";
import { ChevronDown, ChevronUp, Check, ShoppingCart, Box, Image as ImageIcon } from "lucide-react";
import { useCart } from "../../../../src/store/useCart";
import { ThreeBikeViewer } from "../../../../src/components/ThreeBikeViewer";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = params.category as string;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [openSpec, setOpenSpec] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const { addItem } = useCart();

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-[#666] font-mono text-sm tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-black uppercase tracking-tight">Product Not Found</h1>
        <p className="text-[#888] font-light">The bike you're looking for doesn't exist.</p>
        <Link
          href={`/bikes/${category}`}
          className="bg-white text-black px-8 py-4 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-colors"
        >
          Browse {category} bikes
        </Link>
      </main>
    );
  }

  const variant = product.variants[selectedVariantIdx];
  const price = variant?.price ? `$${Number(variant.price).toLocaleString()}` : "$0";
  const imgUrl = variant?.images?.[0]?.url || "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=2000&auto=format&fit=crop";
  const sizes = [...new Set(product.variants.map((v: any) => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants.map((v: any) => v.color).filter(Boolean))];
  const inStock = variant?.inventory ? variant.inventory.quantity - variant.inventory.reserved > 0 : true;

  // Group specs by group name
  const specGroups = product.specifications?.reduce((acc: Record<string, any[]>, spec: any) => {
    if (!acc[spec.group]) acc[spec.group] = [];
    acc[spec.group]!.push(spec);
    return acc;
  }, {} as Record<string, any[]>) || {};

  // Select variant by size + color
  const selectVariantByAttrs = (size: string) => {
    setSelectedSize(size);
    const idx = product.variants.findIndex((v: any) => v.size === size);
    if (idx >= 0) setSelectedVariantIdx(idx);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-[72px]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-8 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#666]">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/bikes/${category}`} className="hover:text-white transition-colors">{category}</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)]">
        {/* ─── Image Gallery (Left) ──────────────────────────────── */}
        <div className="w-full lg:w-[60%] bg-[#050505] relative flex flex-col border-r border-surface-border overflow-hidden">
          <div className="sticky top-[72px] h-[calc(100vh-72px)] flex items-center justify-center p-8 lg:p-16">
            <AnimatePresence mode="wait">
              {!show3D ? (
                <motion.div
                  key="image-gallery"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full max-h-[700px]"
                >
                  <Image
                    src={imgUrl}
                    alt={product.name}
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="3d-viewer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <ThreeBikeViewer />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggles */}
            <div className="absolute top-8 left-8 flex items-center gap-2 z-30">
              <button 
                onClick={() => setShow3D(false)}
                className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${!show3D ? "bg-white text-black border-white" : "bg-black/40 text-white/40 border-white/10 hover:border-white/20"}`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Gallery
              </button>
              <button 
                onClick={() => setShow3D(true)}
                className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${show3D ? "bg-white text-black border-white" : "bg-black/40 text-white/40 border-white/10 hover:border-white/20"}`}
              >
                <Box className="w-3.5 h-3.5" /> 3D Studio
              </button>
            </div>

            {/* Color swatches under image */}
            {!show3D && colors.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                {product.variants
                  .filter((v: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.color === v.color) === i)
                  .map((v: any, i: number) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantIdx(product.variants.indexOf(v))}
                      className={`w-3 h-3 rounded-full transition-all ${selectedVariantIdx === product.variants.indexOf(v) ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-125" : "opacity-60 hover:opacity-100"}`}
                      style={{ backgroundColor: v.color?.toLowerCase().includes("black") ? "#111" : v.color?.toLowerCase().includes("white") ? "#fff" : v.color?.toLowerCase().includes("red") || v.color?.toLowerCase().includes("infrared") ? "#e33d3d" : v.color?.toLowerCase().includes("green") || v.color?.toLowerCase().includes("forest") ? "#2d6a4f" : v.color?.toLowerCase().includes("blue") ? "#2563eb" : v.color?.toLowerCase().includes("grey") || v.color?.toLowerCase().includes("gray") ? "#888" : v.color?.toLowerCase().includes("sand") || v.color?.toLowerCase().includes("olive") ? "#8B8000" : "#666" }}
                      title={v.color || ""}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Product Details Sidebar (Right) ────────────────────── */}
        <div className="w-full lg:w-[40%] bg-black relative">
          <div className="px-8 lg:px-12 py-12 lg:py-20 max-w-lg mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Badges */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666] border border-surface-border px-3 py-1 bg-surface">
                  {product.category?.name || category}
                </span>
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 border ${inStock ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"}`}>
                  {inStock ? "In Stock" : "Sold Out"}
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-[-0.05em] mb-4 leading-[0.9]">
                {product.name}
              </h1>
              <p className="text-base text-[#888] font-light tracking-wide mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="text-4xl font-bold tracking-tight mb-10">
                {price}
                <span className="text-sm font-light text-[#666] tracking-normal ml-2">USD</span>
              </div>

              {/* Variant info */}
              {variant?.color && (
                <div className="mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] mb-2">Color</h3>
                  <p className="text-sm font-medium">{variant.color}</p>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888]">Select Size</h3>
                    <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#666] hover:text-white transition-colors border-b border-[#333] hover:border-white pb-0.5">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => selectVariantByAttrs(size)}
                        className={`py-3.5 border transition-all duration-300 text-sm font-bold uppercase ${
                          selectedSize === size
                            ? "border-white bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            : "border-surface-border bg-surface text-[#888] hover:border-[#666] hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight */}
              {variant?.weight && (
                <div className="flex items-center gap-6 mb-10 py-4 border-y border-surface-border text-sm">
                  <span className="text-[#666] font-bold tracking-[0.2em] text-[10px] uppercase">Weight</span>
                  <span className="font-medium">{Number(variant.weight)} kg</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-4 mb-14">
                <button
                  disabled={!variant || !inStock || isAdding}
                  onClick={() => {
                    if (!variant) return;
                    setIsAdding(true);
                    const cartItem = {
                      id: `${product.slug}-${variant.id}`,
                      productId: product.id,
                      productName: product.name,
                      productSlug: product.slug,
                      variantId: variant.id,
                      variantName: `${variant.color || ""} ${variant.size || ""}`.trim(),
                      price: Number(variant.price),
                      quantity: 1,
                      image: imgUrl,
                      selections: {},
                    };
                    addItem(cartItem);
                    setTimeout(() => setIsAdding(false), 2000);
                  }}
                  className="w-full bg-white text-black py-5 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(227,61,61,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isAdding ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart
                    </>
                  ) : !inStock ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>
                <Link
                  href={`/configurator/${slug}`}
                  className="w-full bg-surface border border-surface-border text-white text-center flex items-center justify-center py-5 font-bold uppercase tracking-[0.2em] text-[11px] hover:border-white transition-colors"
                >
                  Open Configurator
                </Link>
              </div>

              {/* Specifications Accordion */}
              {Object.keys(specGroups).length > 0 && (
                <div className="divide-y divide-surface-border border-t border-surface-border">
                  {Object.entries(specGroups).map(([group, specs]) => (
                    <div key={group} className="group">
                      <button
                        onClick={() => setOpenSpec(openSpec === group ? null : group)}
                        className="w-full py-5 flex justify-between items-center text-left"
                      >
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] group-hover:text-white transition-colors">
                          {group}
                        </span>
                        {openSpec === group ? (
                          <ChevronUp className="w-4 h-4 text-[#666]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#666]" />
                        )}
                      </button>
                      {openSpec === group && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pb-5 space-y-3"
                        >
                          {(specs as any[]).map((spec: any) => (
                            <div key={spec.id} className="flex justify-between items-start text-sm">
                              <span className="text-[#666] font-light">{spec.name}</span>
                              <span className="text-right font-medium max-w-[60%]">{spec.value}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
