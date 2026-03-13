"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../src/store/useCart";
import { trpc } from "../../src/trpc/client";
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  Package, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

type Step = "information" | "shipping" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>("information");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "United States",
    zip: "",
    shippingMethod: "standard",
  });

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/checkout/success?orderId=${data.orderId}`);
      }
    },
    onError: (err) => {
      alert("Error creating order: " + err.message);
      setIsSubmitting(false);
    }
  });

  if (items.length === 0 && currentStep !== "payment") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
        <Link 
          href="/bikes"
          className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep === "information") setCurrentStep("shipping");
    else if (currentStep === "shipping") setCurrentStep("payment");
  };

  const handleBack = () => {
    if (currentStep === "shipping") setCurrentStep("information");
    else if (currentStep === "payment") setCurrentStep("shipping");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== "payment") {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    createOrder.mutate({
      items: items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: getTotalPrice() + (formData.shippingMethod === "express" ? 50 : 0),
      shippingAddress: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        zip: formData.zip,
      }
    });
  };

  const steps = [
    { id: "information", label: "Info", icon: MapPin },
    { id: "shipping", label: "Shipping", icon: Package },
    { id: "payment", label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Side: Checkout Form */}
        <div className="lg:col-span-7">
          {/* Header & Steps */}
          <div className="mb-12">
            <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#666] hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-3 h-3" /> Back to Cart
            </Link>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-10">Checkout</h1>
            
            <div className="flex items-center gap-4">
              {steps.map((step, idx: number) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > idx;
                
                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${isActive ? "text-white" : isCompleted ? "text-accent" : "text-[#333]"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? "border-white bg-white text-black" : isCompleted ? "border-accent bg-accent text-white" : "border-[#333]"}`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{step.label}</span>
                    </div>
                    {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-[#222]" />}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <AnimatePresence mode="wait">
              {currentStep === "information" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <section>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666] mb-6">Contact Information</h2>
                    <input 
                      required
                      type="email"
                      placeholder="Email Address"
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </section>

                  <section>
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666] mb-6">Shipping Address</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input 
                        required
                        placeholder="First Name"
                        className="bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                      <input 
                        required
                        placeholder="Last Name"
                        className="bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <input 
                      required
                      placeholder="Address"
                      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 text-white text-sm focus:outline-none focus:border-accent transition-colors mb-4"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        required
                        placeholder="City"
                        className="bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                      />
                      <input 
                        required
                        placeholder="ZIP / Postal Code"
                        className="bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        value={formData.zip}
                        onChange={e => setFormData({...formData, zip: e.target.value})}
                      />
                    </div>
                  </section>
                </motion.div>
              )}

              {currentStep === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666] mb-6">Shipping Method</h2>
                  <div className="space-y-4">
                    <label className={`flex items-center justify-between p-6 border cursor-pointer transition-all ${formData.shippingMethod === "standard" ? "bg-accent/5 border-accent" : "bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]"}`}>
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          className="hidden" 
                          checked={formData.shippingMethod === "standard"} 
                          onChange={() => setFormData({...formData, shippingMethod: "standard"})}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.shippingMethod === "standard" ? "border-accent" : "border-[#333]"}`}>
                          {formData.shippingMethod === "standard" && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-wider">Standard Delivery</p>
                          <p className="text-xs text-[#666]">3-5 Business Days</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Free</span>
                    </label>

                    <label className={`flex items-center justify-between p-6 border cursor-pointer transition-all ${formData.shippingMethod === "express" ? "bg-accent/5 border-accent" : "bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]"}`}>
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          className="hidden" 
                          checked={formData.shippingMethod === "express"} 
                          onChange={() => setFormData({...formData, shippingMethod: "express"})}
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.shippingMethod === "express" ? "border-accent" : "border-[#333]"}`}>
                          {formData.shippingMethod === "express" && <div className="w-2 h-2 rounded-full bg-accent" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-wider">Express Delivery</p>
                          <p className="text-xs text-[#666]">1-2 Business Days</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white uppercase tracking-wider">$50.00</span>
                    </label>
                  </div>
                </motion.div>
              )}

              {currentStep === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="bg-accent/5 border border-accent/20 p-8 rounded-lg flex gap-6">
                    <ShieldCheck className="w-10 h-10 text-accent shrink-0" />
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Secure Checkout Simulation</h3>
                      <p className="text-[#888] text-xs leading-relaxed">
                        This is a demonstration store. Clicking "Complete Purchase" will process a test order. No real payment will be charged.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666]">Payment Method</h2>
                     <div className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <CreditCard className="w-5 h-5 text-accent" />
                           <span className="text-sm text-white font-bold uppercase tracking-widest">Test Credit Card</span>
                        </div>
                        <span className="text-[10px] text-[#666] font-bold uppercase tracking-widest">Ending in 4242</span>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-8 border-t border-[#1a1a1a]">
              {currentStep !== "information" ? (
                <button 
                  type="button"
                  onClick={handleBack}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#666] hover:text-white transition-colors"
                >
                  Back
                </button>
              ) : <div />}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all disabled:opacity-50 flex items-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : currentStep === "payment" ? (
                  "Complete Purchase"
                ) : (
                  "Continue to " + (currentStep === "information" ? "Shipping" : "Payment")
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5">
           <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-10 sticky top-32">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#666] mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-[#111] border border-[#1a1a1a] relative shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.productName} 
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute -top-2 -right-2 bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-xs font-bold uppercase tracking-wider truncate">{item.productName}</h3>
                      <p className="text-[#666] text-[10px] uppercase tracking-widest mt-1">{item.variantName}</p>
                      {item.selections && (
                        <div className="mt-2 space-y-0.5">
                           {Object.values(item.selections).map((sel: any, i: number) => (
                              <p key={i} className="text-[9px] text-[#444] uppercase tracking-tighter">
                                 {sel.categoryName}: {sel.optionName}
                              </p>
                           ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                       <p className="text-white font-bold text-xs">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-[#1a1a1a] pt-8">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  <span>Subtotal</span>
                  <span className="text-white">${getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  <span>Shipping</span>
                  <span className="text-white">
                    {formData.shippingMethod === "express" ? "$50.00" : "Calculated in next step"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#1a1a1a]">
                  <span className="text-xs font-black uppercase tracking-widest text-white">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tighter">
                      ${(getTotalPrice() + (formData.shippingMethod === "express" ? 50 : 0)).toLocaleString()}
                    </p>
                    <p className="text-[9px] text-[#444] uppercase tracking-widest">Including taxes</p>
                  </div>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
