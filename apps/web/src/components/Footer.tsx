"use client";

import Link from "next/link";
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  Facebook, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  Globe
} from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const footerLinks = [
    {
      title: "Performance",
      links: [
        { label: "Road Bikes", href: "/bikes/road" },
        { label: "Mountain Bikes", href: "/bikes/mountain" },
        { label: "Gravel Bikes", href: "/bikes/gravel" },
        { label: "E-Bikes", href: "/bikes/ebikes" },
        { label: "AI Fit Finder", href: "/ai-recommendation" }
      ]
    },
    {
      title: "Experience",
      links: [
        { label: "Service & Support", href: "/support" },
        { label: "Customer Reviews", href: "/reviews" },
        { label: "Dealer Locator", href: "/dealers" },
        { label: "Warranty", href: "/warranty" },
        { label: "Return Policy", href: "/returns" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Canyon", href: "/about" },
        { label: "Engineered in Germany", href: "/heritage" },
        { label: "Careers", href: "/careers" },
        { label: "Sustainability", href: "/impact" },
        { label: "In-Store Experience", href: "/stores" }
      ]
    }
  ];

  return (
    <footer className="bg-[#050505] text-white pt-32 pb-16 px-8 border-t border-[#111] mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4 space-y-10">
            <div>
              <h3 className="text-4xl font-black tracking-[-0.08em] mb-6">CANYON</h3>
              <p className="text-[#666] text-sm leading-relaxed max-w-sm font-light">
                Engineering excellence since 1985. We build the most advanced performance machines on the planet, 
                delivered directly to your door.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Join the Collective</h4>
              <form onSubmit={handleSubscribe} className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS" 
                  className="w-full bg-transparent border-b border-[#222] group-hover:border-[#444] focus:border-white py-4 text-xs font-bold uppercase tracking-widest outline-none transition-all placeholder:text-[#333]"
                  required
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:text-accent transition-colors"
                >
                  {subscribed ? <span className="text-accent text-[10px] uppercase font-black">Subscribed</span> : <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </div>

            <div className="flex gap-6">
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <Instagram className="w-4 h-4 text-[#888] hover:text-white" />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <Twitter className="w-4 h-4 text-[#888] hover:text-white" />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <Youtube className="w-4 h-4 text-[#888] hover:text-white" />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <Facebook className="w-4 h-4 text-[#888] hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#333] mb-8">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="text-xs text-[#666] hover:text-white font-medium tracking-wide transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Global Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[#111] items-center">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[#444]">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Global / EN</span>
                </div>
                <div className="flex items-center gap-2 text-[#444]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Dealer Locator</span>
                </div>
            </div>

            <div className="text-center md:text-right md:col-span-2">
                 <p className="text-[9px] font-medium text-[#222] uppercase tracking-[0.4em] mb-4">
                    The Ultimate Ride Engine. &copy; {new Date().getFullYear()} Canyon Bicycles.
                 </p>
                 <div className="flex justify-center md:justify-end gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#444]">
                    <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Privacy Settings</Link>
                    <Link href="#" className="hover:text-white transition-colors">Legal Disclosure</Link>
                 </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
