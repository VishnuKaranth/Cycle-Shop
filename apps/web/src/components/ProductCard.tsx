"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: string;
  weight?: string;
  imageUrl: string;
  index?: number;
}

export function ProductCard({ id, name, slug, category, price, weight, imageUrl, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="group block"
    >
      <Link href={`/bikes/${category.toLowerCase()}/${slug}`}>
        <div className="bg-surface border border-surface-border aspect-[4/3] overflow-hidden mb-6 relative">
          <Image 
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle vignette for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
        <div className="flex justify-between items-start pt-2 border-t border-surface-border/50">
          <div>
            <h3 className="text-xl font-black uppercase tracking-[-0.02em] group-hover:text-accent transition-colors">{name}</h3>
            {weight && <p className="text-[#666] font-light text-[11px] tracking-wide mt-1 uppercase">{weight}</p>}
          </div>
          <div className="text-lg font-bold tracking-tight">{price}</div>
        </div>
      </Link>
    </motion.div>
  );
}
