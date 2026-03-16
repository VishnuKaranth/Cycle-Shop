"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../src/store/useCart";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../../src/components/AuthProvider";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white pt-32 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-8 mx-auto border border-surface-border">
              <ShoppingBag className="w-10 h-10 text-[#666]" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-10 max-w-md mx-auto font-light leading-relaxed">
              Looks like you haven't added any luxury performance machines to your collection yet.
            </p>
            <Link
              href="/bikes/road"
              className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-all duration-300"
            >
              Explore Bikes <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link href="/bikes/road" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666] hover:text-white transition-colors flex items-center gap-2 mb-4">
              <ChevronLeft className="w-3 h-3" /> Continue Shopping
            </Link>
            <h1 className="text-5xl font-black uppercase tracking-[-0.05em]">Your Cart</h1>
            <p className="text-gray-400 mt-2 font-light">
              Review your selection of premium performance cycles.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666]">Items</span>
            <div className="text-2xl font-black">{getTotalItems()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface border border-surface-border p-6 flex flex-col md:flex-row gap-8 relative group"
                >
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 bg-black border border-surface-border overflow-hidden relative shrink-0">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-125"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-1 group-hover:text-accent transition-colors">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-400 font-light">{item.variantName}</p>
                      </div>
                      <div className="text-2xl font-black">${item.price.toLocaleString()}</div>
                    </div>

                    {/* Configured Options */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {Object.values(item.selections).map((selection) => (
                        <div key={selection.categoryId} className="flex items-center gap-2 px-3 py-1 bg-black/50 border border-surface-border text-[9px] font-bold uppercase tracking-widest text-gray-400">
                           <span className="text-[#666]">{selection.categoryName}:</span> {selection.optionName}
                           {selection.price > 0 && <span className="text-accent"> +${selection.price}</span>}
                        </div>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-border/50">
                      <div className="flex items-center gap-4 bg-black border border-surface-border p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:text-accent transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:text-accent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#444] hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <div className="bg-surface border border-surface-border p-8">
              <h2 className="text-xl font-black uppercase tracking-tight mb-8">Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[#888] font-light italic">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#888] font-light italic">
                  <span>Shipping</span>
                  <span className="text-accent uppercase tracking-widest text-[10px] font-bold">Complimentary</span>
                </div>
                <div className="flex justify-between text-[#888] font-light italic">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="h-px bg-surface-border mb-8" />

              <div className="flex justify-between items-end mb-10">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666]">Total</span>
                <span className="text-4xl font-black tracking-tighter">${getTotalPrice().toLocaleString()}</span>
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    router.push("/login?redirect=/checkout");
                  } else {
                    router.push("/checkout");
                  }
                }}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-5 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-accent/40"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-8 space-y-4">
                <p className="text-[9px] text-[#444] text-center font-bold uppercase tracking-widest leading-relaxed">
                  Secured Transaction • Worldwide Express Delivery • 0% Finance Available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
