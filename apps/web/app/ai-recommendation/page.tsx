"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bike, Loader2, PlayCircle, Settings2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { trpc } from "../../src/trpc/client";

export default function AIRecommendationPage() {
  const [step, setStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    experience: "",
    terrain: "",
  });

  const recommend = trpc.product.recommend.useMutation({
    onSuccess: (data) => {
      setRecommendation(data);
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
      alert("Analysis failed. Please try again.");
    }
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else analyzeData();
  };

  const analyzeData = () => {
    setIsAnalyzing(true);
    recommend.mutate({
      height: formData.height,
      weight: formData.weight,
      experience: formData.experience,
      terrain: formData.terrain,
    });
  };

  return (
    <main className="min-h-screen bg-background pt-32 px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Perfect Ride AI</h1>
          <p className="text-gray-400">Let our advanced algorithm find the exact bike geometry and spec for your body and riding style.</p>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 p-8 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            {/* Step 1: Body Metrics */}
            {step === 0 && !isAnalyzing && !recommendation && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6 tracking-wide">Step 1: Body Metrics</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 tracking-widest uppercase mb-2">Height (cm)</label>
                    <input type="number" className="w-full bg-transparent border-b border-gray-700 py-2 focus:border-accent outline-none transition-colors text-xl" placeholder="180" onChange={e => setFormData({...formData, height: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 tracking-widest uppercase mb-2">Weight (kg)</label>
                    <input type="number" className="w-full bg-transparent border-b border-gray-700 py-2 focus:border-accent outline-none transition-colors text-xl" placeholder="75" onChange={e => setFormData({...formData, weight: e.target.value})} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Experience */}
            {step === 1 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6 tracking-wide">Step 2: Experience Level</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Beginner", "Intermediate", "Pro"].map(level => (
                    <button 
                      key={level} 
                      onClick={() => setFormData({...formData, experience: level.toLowerCase()})}
                      className={`p-6 border text-center transition-colors ${formData.experience === level.toLowerCase() ? "border-accent bg-accent/10" : "border-gray-800 hover:border-gray-500"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Terrain */}
            {step === 2 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6 tracking-wide">Step 3: Primary Terrain</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Road", "Gravel", "Mountain"].map(terrain => (
                    <button 
                      key={terrain} 
                      onClick={() => setFormData({...formData, terrain: terrain.toLowerCase()})}
                      className={`p-6 border text-center transition-colors ${formData.terrain === terrain.toLowerCase() ? "border-accent bg-accent/10" : "border-gray-800 hover:border-gray-500"}`}
                    >
                      {terrain}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analyzing State */}
            {isAnalyzing && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center space-y-6">
                <Loader2 className="w-16 h-16 text-accent animate-spin" />
                <div>
                  <h3 className="text-xl font-bold tracking-widest uppercase mb-2">Analyzing Metrics</h3>
                  <p className="text-gray-400 font-mono text-xs">Querying Python AI Microservice...</p>
                </div>
              </motion.div>
            )}

            {/* Result State */}
            {recommendation && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 text-accent mb-6">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-sm tracking-widest uppercase text-gray-400 mb-2">Your Perfect Match</h2>
                <h3 className="text-4xl font-black uppercase tracking-tight mb-6">{recommendation.name}</h3>
                <div className="bg-[#111] p-6 text-left border border-gray-800 mb-8 inline-block max-w-lg">
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <Zap className="w-4 h-4" /> <span className="font-bold font-mono tracking-widest">MATCH SCORE: {recommendation.score}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {recommendation.reason}
                  </p>
                </div>
                <div>
                   <Link href={`/bikes/${recommendation.type}/${recommendation.name.toLowerCase().replace(' ', '-')}`} className="bg-white text-black px-8 py-4 font-bold tracking-widest uppercase hover:bg-accent hover:text-white transition-colors">
                     View Bike
                   </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Controls */}
          {!isAnalyzing && !recommendation && (
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-800">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-8 h-1 transition-colors ${step >= i ? "bg-accent" : "bg-gray-800"}`} />
                ))}
              </div>
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase hover:text-accent transition-colors"
              >
                {step === 2 ? "Analyze" : "Next"} <PlayCircle className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
