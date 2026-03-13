"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

import { trpc } from "../../../src/trpc/client";
import { ProductCard } from "../../../src/components/ProductCard";

export default function CategoryPage() {
  const params = useParams();
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  
  const { data: allBikes, isLoading } = trpc.product.getAll.useQuery();

  const filteredBikes = allBikes?.filter((b: any) => 
    category === "all" || b.category?.slug === category
  ) || [];

  return (
    <main className="min-h-screen bg-black pt-32 px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 border-b border-surface-border pb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[-0.05em]">{category} Bikes</h1>
            {!isLoading && (
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666] border border-surface-border px-3 py-1 bg-surface mt-3">
                {filteredBikes.length} {filteredBikes.length === 1 ? "bike" : "bikes"}
              </span>
            )}
          </div>
          <p className="text-[#888] mt-4 font-light tracking-wide text-sm md:text-base max-w-xl">
            Discover the perfect ride. Engineered for maximum performance and unparalleled speed on any terrain.
          </p>
        </div>
        <div className="hidden md:flex gap-6 mt-6 md:mt-0">
          <select className="bg-transparent border-b border-surface-border text-[11px] px-2 py-3 uppercase tracking-[0.2em] outline-none hover:border-white transition-colors cursor-pointer text-[#888] focus:text-white">
            <option>Featured</option>
            <option>Price: Low High</option>
            <option>Price: High Low</option>
          </select>
          <button className="bg-white text-black text-[11px] px-8 py-3 uppercase tracking-[0.2em] font-bold hover:bg-accent hover:text-white transition-colors">
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 pb-32">
        {isLoading && (
          <div className="col-span-full h-64 flex items-center justify-center text-[#666] font-mono text-sm tracking-widest uppercase animate-pulse">
            Loading Fleet...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredBikes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-6">🚲</div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">No bikes found</h2>
            <p className="text-[#888] font-light max-w-md mb-8">
              We don&apos;t have any {category} bikes at the moment. Check back soon or explore other categories.
            </p>
            <Link
              href="/bikes/all"
              className="bg-white text-black px-8 py-4 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-colors"
            >
              Browse All Bikes
            </Link>
          </div>
        )}

        {filteredBikes.map((bike: any, idx: number) => {
          const price = bike.variants[0]?.price ? `$${Number(bike.variants[0].price).toLocaleString()}` : "$0";
          const imgUrl = bike.variants[0]?.images[0]?.url || "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=800&auto=format&fit=crop";

          return (
            <ProductCard
              key={bike.id}
              id={bike.id}
              name={bike.name}
              slug={bike.slug}
              category={bike.category?.name || "bike"}
              price={price}
              weight={bike.variants[0]?.weight ? `${Number(bike.variants[0].weight)} kg` : undefined}
              imageUrl={imgUrl}
              index={idx}
            />
          );
        })}
      </div>
    </main>
  );

}
