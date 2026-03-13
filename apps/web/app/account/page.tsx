"use client";

import { useAuth } from "../../src/components/AuthProvider";
import { trpc } from "../../src/trpc/client";
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  LogOut, 
  ChevronRight,
  Shield,
  Clock,
  Settings
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    {
      title: "My Orders",
      description: "View, track, and manage your purchases",
      icon: Package,
      href: "/account/orders",
      color: "text-blue-400"
    },
    {
      title: "Saved Addresses",
      description: "Manage your shipping and billing addresses",
      icon: MapPin,
      href: "/account/addresses",
      color: "text-green-400"
    },
    {
      title: "Payment Methods",
      description: "Securely manage your saved cards",
      icon: CreditCard,
      href: "/account/payment",
      color: "text-purple-400"
    },
    {
      title: "Security & Privacy",
      description: "Update your password and account settings",
      icon: Shield,
      href: "/account/security",
      color: "text-amber-400"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-white text-3xl font-black">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                Hello, {profile?.name || user?.email?.split('@')[0]}
              </h1>
              <p className="text-[#666] text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 bg-[#0a0a0a] border border-[#1a1a1a] text-red-400 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all rounded-full"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Grid */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.map((section, idx: number) => (
                <Link 
                  key={idx}
                  href={section.href}
                  className="group p-8 bg-[#0a0a0a] border border-[#1a1a1a] hover:border-accent/40 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 transition-colors group-hover:bg-accent/10`}>
                    <section.icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center justify-between">
                    {section.title}
                    <ChevronRight className="w-4 h-4 text-[#222] group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-[#666] text-xs leading-relaxed">{section.description}</p>
                </Link>
              ))}
            </div>

            {/* Recent Orders Table Skeleton */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Recent Orders</h2>
                <Link href="/account/orders" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">
                  View All
                </Link>
              </div>

              {profile?.orders && profile.orders.length > 0 ? (
                <div className="space-y-4">
                   {profile.orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <Package className="w-4 h-4 text-[#444]" />
                          <div>
                            <p className="text-xs font-bold text-white">Order #{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-[10px] text-[#666] uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">${Number(order.totalAmount).toLocaleString()}</p>
                          <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' : 'bg-accent/20 text-accent'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                   ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-[#1a1a1a]">
                  <Clock className="w-8 h-8 text-[#222] mx-auto mb-4" />
                  <p className="text-[#444] text-[10px] font-bold uppercase tracking-widest">No orders found</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666] mb-8">Personal Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">Display Name</label>
                  <p className="text-sm text-white font-medium">{profile?.name || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">Email Address</label>
                  <p className="text-sm text-white font-medium">{user?.email}</p>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                  <Settings className="w-3 h-3" /> Edit Profile
                </button>
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/20 p-8 rounded-lg">
              <h3 className="text-accent font-bold uppercase tracking-widest text-xs mb-3">Premium Support</h3>
              <p className="text-[#888] text-xs mb-6 leading-relaxed">
                As a priority customer, you have 24/7 access to our engineering team for technical support.
              </p>
              <button className="text-white text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2">
                Contact Support <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
