"use client";

import { trpc } from "../../../src/trpc/client";
import { 
  Package, 
  ChevronRight, 
  ArrowLeft, 
  Search,
  ExternalLink,
  RotateCcw,
  Truck
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OrderHistoryPage() {
  const { data: orders, isLoading } = trpc.order.getMyOrders.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-8">
        
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <Link 
            href="/account" 
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#666] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Order History</h1>
              <p className="text-[#666] text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                Manage and track your performance machine orders
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
              <input 
                placeholder="Search orders..."
                className="bg-[#0a0a0a] border border-[#1a1a1a] pl-12 pr-6 py-3 text-white text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-accent transition-colors w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders && orders.length > 0 ? (
            orders.map((order: any, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden group"
              >
                {/* Order Meta Header */}
                <div className="px-8 py-6 bg-white/5 border-b border-[#1a1a1a] flex flex-wrap items-center justify-between gap-6">
                  <div className="flex gap-10">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#444] mb-1">Order Placed</p>
                      <p className="text-xs text-white font-bold">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#444] mb-1">Total</p>
                      <p className="text-xs text-white font-bold">${Number(order.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#444] mb-1">Order #</p>
                      <p className="text-xs text-white font-bold">{order.id.slice(-12).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link 
                      href={`/account/orders/${order.id}`}
                      className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-accent transition-colors flex items-center gap-2"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-8 flex flex-col md:flex-row gap-8 justify-between">
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 'bg-accent/20 text-accent'
                       }`}>
                          {order.status === 'DELIVERED' ? <CheckCircle2 className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                       </div>
                       <h3 className="text-sm font-black text-white uppercase tracking-tighter">
                          {order.status === 'PENDING' ? 'Processing Order' : 
                           order.status === 'SHIPPED' ? 'In Transit' : 
                           order.status === 'DELIVERED' ? 'Delivered' : 
                           order.status}
                       </h3>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 bg-[#111] rounded border border-white/5 p-1 shrink-0">
                             <img 
                                src={item.variant.images?.[0]?.url || "/placeholder-bike.png"} 
                                alt={item.variant.product.name} 
                                className="w-full h-full object-contain"
                             />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">{item.variant.product.name}</p>
                            <p className="text-[10px] text-[#666] uppercase mt-1">Qty: {item.quantity} · {item.variant.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 justify-center min-w-[200px]">
                     <button className="w-full bg-white text-black py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all">
                        Buy it again
                     </button>
                     <button className="w-full bg-transparent border border-[#1a1a1a] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                        Return Item
                     </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center bg-[#0a0a0a] border border-[#1a1a1a] border-dashed rounded-xl">
              <ShoppingBag className="w-12 h-12 text-[#1a1a1a] mx-auto mb-6" />
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter mb-2">No orders found</h2>
              <p className="text-[#666] text-xs uppercase tracking-widest mb-8">Ready to start your journey?</p>
              <Link 
                href="/bikes"
                className="inline-flex bg-accent text-white px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-all rounded-full"
              >
                Browse Cycles
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import { CheckCircle2, ShoppingBag } from "lucide-react";
