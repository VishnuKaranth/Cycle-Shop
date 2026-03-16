"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { trpc } from "../src/trpc/client";

export default function Home() {
  const { data: allProducts } = trpc.product.getAll.useQuery();
  const { data: categories } = trpc.category.getAll.useQuery();

  const featured = allProducts?.filter((p: any) => p.isFeatured) || [];

  // Mapping of category slug to Unsplash ID for dynamic categories
  const categoryImages: Record<string, string> = {
    road: "photo-1532298229144-0ec0c57515c7",
    gravel: "photo-1643039686503-d3d6adb4e18a",
    mountain: "photo-1506316940527-4d1c138978a0",
    electric: "photo-1620802051782-725fa33db067",
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=2022&auto=format&fit=crop"
            alt="Aeroad CFR Premium Bicycle"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 w-full max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-9xl font-black tracking-[-0.05em] text-white mb-6 uppercase leading-none"
          >
            Shape Your Ride
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-2xl text-[#e0e0e0] max-w-2xl mb-12 font-light tracking-wide"
          >
            The ultimate racing machine, engineered for pure speed. Discover the new Aeroad CFR.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/bikes/road"
              className="group flex items-center gap-4 bg-white text-black px-10 py-5 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-all duration-300"
            >
              Shop Road Bikes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Brand Stats Strip ─────────────────────────────────────── */}
      <section className="relative z-20 bg-surface border-y border-surface-border py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-16 gap-y-6 text-[11px] font-bold tracking-[0.2em] uppercase text-[#888]">
          <span>Engineered in Germany</span>
          <span className="hidden sm:block w-1 h-1 bg-[#444] rounded-full" />
          <span>150+ Design Awards</span>
          <span className="hidden sm:block w-1 h-1 bg-[#444] rounded-full" />
          <span>Carbon Experts Since 2002</span>
          <span className="hidden sm:block w-1 h-1 bg-[#444] rounded-full" />
          <span>Direct-to-Rider</span>
        </div>
      </section>

      {/* ─── Featured Bikes ────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-32 px-8 max-w-7xl mx-auto relative z-20 bg-black">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-[-0.05em] uppercase">Featured Machines</h2>
              <p className="text-[#888] mt-4 font-light tracking-wide max-w-xl">
                Hand-picked performance. Our most advanced bikes, built to dominate.
              </p>
            </div>
            <Link href="/bikes/all" className="hidden md:flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase hover:text-accent transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.slice(0, 4).map((bike: any, i: number) => {
              const price = bike.variants[0]?.price
                ? `$${Number(bike.variants[0].price).toLocaleString()}`
                : "$0";
              const imgUrl =
                bike.variants[0]?.images[0]?.url ||
                "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=800&auto=format&fit=crop";

              return (
                <motion.div
                  key={bike.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="group block"
                >
                  <Link href={`/bikes/${bike.category?.name.toLowerCase()}/${bike.slug}`}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface border border-surface-border mb-6">
                      <Image
                        src={imgUrl}
                        alt={bike.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover object-center transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      {/* Category badge */}
                      <span className="absolute top-4 left-4 text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/10">
                        {bike.category?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-start pt-2 border-t border-surface-border/50">
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-[-0.02em] group-hover:text-accent transition-colors">
                          {bike.name}
                        </h3>
                        <p className="text-[#666] text-[11px] font-light mt-1 line-clamp-1">
                          {bike.description?.slice(0, 60)}...
                        </p>
                      </div>
                      <div className="text-lg font-bold tracking-tight shrink-0 ml-4">{price}</div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Explore Categories ────────────────────────────────────── */}
      {categories && categories.length > 0 && (
        <section className="py-32 px-8 max-w-7xl mx-auto border-t border-surface-border relative z-20 bg-black">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-[-0.05em] uppercase">Explore Categories</h2>
            <Link href="/bikes/all" className="hidden md:flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase hover:text-accent transition-colors">
              View All Bikes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat: any, i: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer block"
              >
                <Link href={`/bikes/${cat.slug}`}>
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface mb-6">
                    <Image
                      src={`https://images.unsplash.com/${categoryImages[cat.slug] || "photo-1485965120184-e220f721d03e"}?q=80&w=800&auto=format&fit=crop`}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover object-center transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-2xl font-black uppercase tracking-tight">{cat.name}</h3>
                      <p className="text-[#ccc] text-sm font-light mt-1 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Newsletter CTA ────────────────────────────────────────── */}
      <section className="py-32 px-8 border-t border-surface-border relative z-20 bg-surface">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.05em] uppercase mb-6">Stay In The Draft</h2>
            <p className="text-[#888] font-light tracking-wide mb-10 max-w-lg mx-auto">
              Be the first to know about new drops, limited editions, and exclusive engineering insights.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-black border border-surface-border px-6 py-4 w-full focus:outline-none focus:border-white transition-colors text-sm"
              />
              <button className="bg-white text-black px-8 py-4 font-bold hover:bg-accent hover:text-white transition-colors text-[11px] uppercase tracking-[0.2em] shrink-0">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
