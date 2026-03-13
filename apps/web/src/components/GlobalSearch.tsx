"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../trpc/client";
import { Search, X, TrendingUp, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_LINKS = [
  { label: "Road Bikes", href: "/bikes/road", hot: true },
  { label: "Gravel Bikes", href: "/bikes/gravel" },
  { label: "Mountain Bikes", href: "/bikes/mountain" },
  { label: "AI Fit Finder", href: "/ai-recommendation", hot: true },
  { label: "Dealers", href: "/dealers" },
];

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [history, setHistory] = useState<{label: string, href: string}[]>([]);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("search-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addToHistory = (item: {label: string, href: string}) => {
    const newHistory = [item, ...history.filter((h: any) => h.href !== item.href)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("search-history", JSON.stringify(newHistory));
  };

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQ("");
      setDebouncedQ("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const { data, isFetching } = trpc.search.query.useQuery(
    { q: debouncedQ, category: category !== "all" ? category : undefined, limit: 6 },
    { enabled: debouncedQ.length >= 2, keepPreviousData: true }
  );

  const navigate = (href: string, label?: string) => {
    if (label) addToHistory({ label, href });
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  const CATEGORY_COLOR: Record<string, string> = {
    Road: "bg-blue-100 text-blue-700",
    Gravel: "bg-green-100 text-green-700",
    Mountain: "bg-orange-100 text-orange-700",
    Cyclocross: "bg-purple-100 text-purple-700",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-surface-border text-white shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-border bg-black">
              {isFetching ? (
                <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-[#666] shrink-0" strokeWidth={2.5} />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search bikes, components, categories..."
                className="flex-1 bg-transparent outline-none text-xl font-medium tracking-tight placeholder:text-[#444]"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-[#666] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              <kbd className="hidden sm:block text-[9px] tracking-[0.2em] font-bold px-2 py-1 bg-surface-border rounded text-[#666]">ESC</kbd>
            </div>

            {/* Category facets when query active */}
            {debouncedQ.length >= 2 && data?.facets && (
              <div className="flex gap-2 px-6 py-3 border-b border-surface-border overflow-x-auto custom-scrollbar">
                <button
                  onClick={() => setCategory("all")}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${category === "all" ? "bg-white text-black" : "bg-surface border border-surface-border hover:border-[#444] text-[#888]"}`}
                >
                  All
                </button>
                {data.facets.categories.filter((f: any) => f.count > 0).map((f: any) => (
                  <button
                    key={f.name}
                    onClick={() => setCategory(category === f.name ? "all" : f.name)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${category === f.name ? "bg-white text-black" : "bg-surface border border-surface-border hover:border-[#444] text-[#888]"}`}
                  >
                    {f.name} <span className="text-[#666] opacity-75">({f.count})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar bg-black">
              {debouncedQ.length >= 2 ? (
                data?.results && data.results.length > 0 ? (
                  <div className="py-2">
                    <div className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#666]">
                      {data.total} results for &ldquo;{debouncedQ}&rdquo;
                    </div>
                    {data.results.map((r: any, i: number) => (
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={r.id}
                        onClick={() => navigate(`/bikes/${r.category.toLowerCase()}/${r.slug}`, r.name)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors text-left group border-b border-surface-border/50 last:border-0"
                      >
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="font-bold text-lg tracking-tight group-hover:text-accent transition-colors">{r.name}</div>
                          <div className="text-xs text-[#666] truncate font-light mt-1">{r.description}</div>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <span className={`text-[9px] tracking-[0.2em] font-bold uppercase px-3 py-1 bg-surface border border-surface-border text-[#888]`}>
                            {r.category}
                          </span>
                          <span className="text-lg font-medium">${r.price.toLocaleString()}</span>
                          <ArrowRight className="w-5 h-5 text-[#333] group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : !isFetching ? (
                  <div className="px-6 py-16 text-center text-[#666]">
                    <p className="font-medium text-lg text-white mb-2">No results for &ldquo;{debouncedQ}&rdquo;</p>
                    <p className="text-sm font-light">Try exploring by category or tweak your search term.</p>
                  </div>
                ) : null
              ) : (
                <div className="py-2">
                  {/* Recent Searches */}
                  {history.length > 0 && (
                    <div className="mb-4">
                      <div className="px-6 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#666] flex items-center justify-between">
                        <span className="flex items-center gap-2 underline underline-offset-4 decoration-accent/30">Recent Searches</span>
                        <button 
                          onClick={() => { setHistory([]); localStorage.removeItem("search-history"); }}
                          className="hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      {history.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => navigate(h.href)}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors group border-b border-surface-border/50 last:border-0"
                        >
                          <span className="text-sm font-light text-[#ccc] group-hover:text-white transition-colors">{h.label}</span>
                          <ArrowRight className="w-4 h-4 text-[#222] group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="px-6 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#666] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Quick Links
                  </div>
                  {QUICK_LINKS.map(link => (
                    <button
                      key={link.href}
                      onClick={() => navigate(link.href, link.label)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface transition-colors group border-b border-surface-border/50 last:border-0"
                    >
                      <span className="font-medium tracking-wide group-hover:text-accent transition-colors">{link.label}</span>
                      <div className="flex items-center gap-4">
                        {link.hot && <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 bg-accent/20 text-accent outline outline-1 outline-accent/50">HOT</span>}
                        <ArrowRight className="w-5 h-5 text-[#333] group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-surface-border bg-[#050505] flex items-center justify-between text-[10px] tracking-wide text-[#666] uppercase font-bold">
              <span>Type at least 2 characters to search</span>
              <span className="flex gap-4">
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-surface rounded tracking-normal">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-surface rounded tracking-normal">↵</kbd> select</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
