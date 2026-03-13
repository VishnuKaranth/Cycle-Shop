"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "../../src/trpc/client";
import { Search, MapPin, Phone, Mail, Loader2 } from "lucide-react";

export default function DealerLocatorPage() {
  const [zipCode, setZipCode] = useState("");
  const { data: dealers, isLoading } = trpc.dealer.list.useQuery();

  const filteredDealers = dealers?.filter((d: any) => 
    !zipCode || 
    d.zipCode.includes(zipCode) || 
    d.city.toLowerCase().includes(zipCode.toLowerCase()) ||
    d.name.toLowerCase().includes(zipCode.toLowerCase())
  ) || [];

  return (
    <main className="min-h-screen bg-background pt-32 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar / Search */}
      <div className="w-full md:w-1/3 flex flex-col h-[calc(100vh-10rem)] pr-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Find a Dealer</h1>
          <p className="text-gray-400 mb-8 font-light tracking-wide">Test ride our latest models at a certified premium dealer near you.</p>

          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Zip Code or City" 
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="w-full bg-transparent border border-gray-800 py-4 px-6 focus:outline-none focus:border-white transition-colors text-white uppercase tracking-widest placeholder-gray-700 text-sm"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600 uppercase tracking-widest text-[10px] font-bold">
              <Loader2 className="w-6 h-6 animate-spin mb-4" />
              Scanning for centers
            </div>
          )}

          {!isLoading && filteredDealers.length === 0 && (
            <div className="text-center py-20 text-gray-600 uppercase tracking-widest text-[10px] font-bold border border-dashed border-gray-800">
              No dealers found in this region
            </div>
          )}

          {filteredDealers.map((dealer: any, i: number) => (
            <motion.div 
              key={dealer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 border border-gray-900 hover:border-gray-500 transition-all duration-300 cursor-pointer group bg-[#050505]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg uppercase tracking-tight group-hover:text-accent transition-colors">
                  {dealer.name}
                </h3>
                <span className="text-[10px] font-mono text-gray-600 px-2 py-0.5 border border-gray-800 rounded uppercase">
                  {dealer.country}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4 font-light">
                {dealer.address}<br />
                {dealer.city}, {dealer.state} {dealer.zipCode}
              </p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <Phone className="w-3 h-3 text-accent" /> {dealer.phone}
                </div>
                <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                  <MapPin className="w-3 h-3 text-accent" /> Directions
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mapbox Area Placeholder */}
      <div className="w-full md:w-2/3 h-64 md:h-[calc(100vh-10rem)] bg-zinc-900 overflow-hidden relative border border-gray-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
        <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500">
          <MapPin className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-mono text-sm tracking-widest">MAPBOX INTEGRATION PENDING</p>
        </div>
      </div>
    </main>
  );
}
