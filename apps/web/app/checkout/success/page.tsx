"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { trpc } from "../../../src/trpc/client";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-8">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 border border-accent/20"
        >
          <CheckCircle2 className="w-12 h-12 text-accent" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black text-white uppercase tracking-tighter mb-6"
        >
          Thank You for Your Order
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#666] text-sm leading-relaxed mb-12 uppercase tracking-widest"
        >
          Your order <span className="text-white font-bold ml-1">#{orderId?.slice(-8) || "N/A"}</span> has been placed successfully. 
          We've sent a confirmation email to your billing address.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Link 
            href="/account/orders"
            className="flex items-center justify-center gap-3 bg-[#0a0a0a] border border-[#1a1a1a] text-white px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-surface transition-all group"
          >
            <Package className="w-4 h-4 text-accent" />
            Track Order
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </Link>
          <Link 
            href="/bikes"
            className="flex items-center justify-center gap-3 bg-accent text-white px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-accent/90 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 pt-8 border-t border-[#1a1a1a]"
        >
          <p className="text-[10px] text-[#444] uppercase tracking-[0.3em]">
            Elite Performance. Engineered in Germany.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
