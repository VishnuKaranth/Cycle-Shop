"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, LogOut, ShoppingBag, ChevronDown } from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearch";
import { trpc } from "../trpc/client";
import { useAuth } from "./AuthProvider";
import { useCart } from "../store/useCart";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, signOut } = useAuth();
  const { data: categories } = trpc.category.getAll.useQuery();
  const { getTotalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const userInitial = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 flex items-center justify-between px-8 py-5 transition-all duration-300 ${
          isHome
            ? "bg-gradient-to-b from-black/80 to-transparent text-white"
            : "bg-surface/80 backdrop-blur-md border-b border-surface-border text-foreground"
        }`}
      >
        <Link href="/" className="text-2xl font-black tracking-[-0.05em] uppercase">
          CANYON
        </Link>
        <nav className="hidden md:flex gap-10 text-[11px] font-bold tracking-[0.2em] uppercase">
          {categories?.map((cat: any) => (
            <Link key={cat.id} href={`/bikes/${cat.slug}`} className="hover:text-accent transition-colors">
              {cat.name}
            </Link>
          ))}
          <Link href="/dealers" className="hover:text-accent transition-colors">Dealers</Link>
        </nav>
        <div className="flex gap-6 items-center">
          {/* Search */}
          <button
            onClick={openSearch}
            aria-label="Open search"
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] hover:text-accent transition-colors uppercase group"
          >
            <Search className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden md:block">Search</span>
            <kbd className="hidden lg:block text-[9px] px-1.5 py-0.5 bg-white/10 rounded font-mono tracking-normal border border-white/20">
              ⌘K
            </kbd>
          </button>

          {/* Auth */}
          {!isLoading && (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] hover:text-accent transition-colors uppercase"
                  >
                    <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[11px] font-bold">
                      {userInitial}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-black border border-surface-border shadow-2xl z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-surface-border">
                        <p className="text-[11px] font-bold truncate">{user.user_metadata?.full_name || "User"}</p>
                        <p className="text-[10px] text-[#666] truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-[0.1em] uppercase text-[#888] hover:text-white hover:bg-surface transition-colors"
                        >
                          <User className="w-3.5 h-3.5" /> My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-[0.1em] uppercase text-[#888] hover:text-white hover:bg-surface transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> My Orders
                        </Link>
                        <button
                          onClick={() => { setUserMenuOpen(false); signOut(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold tracking-[0.1em] uppercase text-red-400 hover:text-red-300 hover:bg-surface transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-[11px] font-bold tracking-[0.2em] hover:text-accent transition-colors uppercase"
                >
                  Login
                </Link>
              )}
            </>
          )}

          {/* Cart */}
          <Link 
            href="/cart"
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] hover:text-accent transition-colors uppercase relative group"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden md:block">Cart</span>
            {mounted && getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-black animate-in fade-in zoom-in duration-300">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={closeSearch} />
    </>
  );
}
