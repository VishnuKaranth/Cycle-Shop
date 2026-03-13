import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Middleware handles auth and redirection based on Supabase session
  return (
    <>
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 shrink-0 text-white p-6 flex flex-col">
        <div className="text-xl font-bold tracking-widest uppercase mb-12">Admin Panel</div>
        <nav className="space-y-4 flex-1">
          <Link href="/" className="block text-sm font-medium hover:text-accent transition-colors">Dashboard</Link>
          <Link href="/products" className="block text-sm font-medium hover:text-accent transition-colors">Products</Link>
          <Link href="/inventory" className="block text-sm font-medium hover:text-accent transition-colors">Inventory</Link>
          <Link href="/orders" className="block text-sm font-medium hover:text-accent transition-colors">Orders</Link>
          <Link href="/customers" className="block text-sm font-medium hover:text-accent transition-colors">Customers</Link>
          <Link href="/analytics" className="block text-sm font-medium hover:text-accent transition-colors">Analytics</Link>
        </nav>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </form>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 shrink-0 flex items-center px-8 bg-white dark:bg-[#111]">
          <div className="text-sm font-bold ml-auto text-green-600 dark:text-green-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Store Manager Mode Active
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </div>
    </>
  );
}
