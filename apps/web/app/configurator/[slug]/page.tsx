"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "../../../src/trpc/client";
import { Check, Info, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "../../../src/store/useCart";

export default function ConfiguratorPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  // tRPC Queries
  const { data, isLoading: optionsLoading } = trpc.configurator.getOptions.useQuery({ slug });
  
  // State for selections
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Initialize selections with first available options
  useEffect(() => {
    if (data?.options && Object.keys(selections).length === 0) {
      const initial: Record<string, string> = {};
      data.options.forEach((cat: any) => {
        if (cat.options.length > 0) {
          initial[cat.id] = cat.options[0].id;
        }
      });
      setSelections(initial);
    }
  }, [data, selections]);

  // Derived Values
  const basePrice = useMemo(() => {
    if (!data || !(data.product as any)?.variants?.[0]) return 0;
    return Number((data.product as any).variants[0].price);
  }, [data]);

  const totalPrice = useMemo(() => {
    if (!data?.options) return basePrice;
    
    const optionsCost = Object.entries(selections).reduce((acc, [catId, optId]) => {
      const category = data.options.find((c: any) => c.id === catId);
      const option = category?.options.find((o: any) => o.id === optId);
      return acc + (option?.price || 0);
    }, 0);

    return basePrice + optionsCost;
  }, [basePrice, selections, data]);

  const currentVisual = useMemo(() => {
    // Try to find an image from selections
    const imageOption = Object.values(selections).map(id => {
        for (const cat of data?.options || []) {
            const opt = (cat as any).options.find((o: any) => o.id === id);
            if (opt?.image) return opt.image;
        }
        return null;
    }).find(img => img !== null);

    // Fallback to product primary image
    return imageOption || (data?.product as any)?.variants?.[0]?.images?.[0]?.url || "";
  }, [selections, data]);

  const handleSelect = (categoryId: string, optionId: string) => {
    setSelections(prev => ({ ...prev, [categoryId]: optionId }));
  };

  if (optionsLoading || !data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">Synchronizing Components...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-[72px] text-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* Visual Area (Left) */}
      <div className="w-full lg:w-[65%] h-[50vh] lg:h-[calc(100vh-72px)] sticky top-[72px] bg-[#050505] flex items-center justify-center p-12 overflow-hidden border-r border-surface-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentVisual}
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl aspect-[16/9] relative z-10"
          >
            <div 
                className="absolute inset-0 bg-contain bg-no-repeat bg-center drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                style={{ backgroundImage: `url('${currentVisual}')` }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-10 left-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#444] mb-2">Selected Configuration</p>
            <h2 className="text-xl font-black uppercase tracking-tighter">{data.product.name}</h2>
        </div>

        <div className="absolute bottom-10 text-center text-[10px] font-bold tracking-[0.3em] uppercase text-[#666]">
          Interactive 3D Stage <span className="text-[#333] ml-2">Active</span>
        </div>
      </div>

      {/* Configurator Controls (Right) */}
      <div className="w-full lg:w-[35%] min-h-screen lg:h-[calc(100vh-72px)] bg-black flex flex-col relative">
        
        <div className="p-10 pb-8 border-b border-surface-border shrink-0 bg-black/95 backdrop-blur-md sticky top-0 z-20">
          <h1 className="text-4xl font-black uppercase tracking-[-0.05em] mb-2 leading-none">Customize <br/> Your Machine</h1>
          <p className="text-sm font-light text-[#888] tracking-wide">Select your components to achieve maximum performance.</p>
        </div>

        {/* Scrollable Options */}
        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-12 pb-32">
          {data.options.map((category: any) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                  {category.name}
                </h3>
                <button className="text-[#666] hover:text-white transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {category.options.map((opt: any) => {
                  const isSelected = selections[category.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(category.id, opt.id)}
                      className={`w-full flex justify-between items-center p-5 border transition-all duration-300 group ${
                        isSelected 
                          ? "border-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                          : "border-surface-border bg-surface hover:border-[#444]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${isSelected ? "border-white bg-white text-black" : "border-[#444] group-hover:border-[#666]"}`}>
                          {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                        </div>
                        <span className={`text-[13px] font-medium tracking-wide ${isSelected ? "text-white font-bold" : "text-[#888] group-hover:text-[#ccc]"}`}>
                          {opt.name}
                        </span>
                      </div>
                      <span className={`text-[11px] font-mono tracking-wider ${isSelected ? "text-white" : "text-[#666]"}`}>
                        {opt.price > 0 ? `+$${opt.price}` : "INCLUDED"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fixed Footer Summary */}
        <div className="p-10 bg-black border-t border-surface-border mt-auto shrink-0 relative z-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] font-bold text-[#666] uppercase tracking-[0.2em] mb-2">Total Build Price</p>
              <h2 className="text-5xl font-black tracking-tighter">${totalPrice.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888] mb-1">Estimated Delivery</p>
              <p className="text-sm font-medium text-white">2-4 Weeks</p>
            </div>
          </div>
          <button
            disabled={isAdding}
            onClick={() => {
              setIsAdding(true);
              const selectionDetails: any = {};
              Object.entries(selections).forEach(([catId, optId]) => {
                const cat = data.options.find((c: any) => c.id === catId);
                const opt = cat?.options.find((o: any) => o.id === optId);
                if (cat && opt) {
                  selectionDetails[catId] = {
                    categoryId: cat.id,
                    categoryName: cat.name,
                    optionId: opt.id,
                    optionName: opt.name,
                    price: opt.price
                  };
                }
              });

              const configHash = Object.values(selections).sort().join('-');
              const cartItem = {
                id: `${data.product.slug}-config-${configHash}`,
                productId: data.product.id,
                productName: data.product.name,
                productSlug: data.product.slug,
                variantId: (data.product as any).variants[0]?.id || 'custom',
                variantName: "Custom Build",
                price: totalPrice,
                quantity: 1,
                image: currentVisual,
                selections: selectionDetails,
              };

              addItem(cartItem);
              setTimeout(() => {
                setIsAdding(false);
                router.push('/cart');
              }, 800);
            }}
            className="w-full bg-white text-black py-5 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(227,61,61,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Confirm & Add to Cart
              </>
            )}
          </button>
        </div>

      </div>

    </main>
  );
}
