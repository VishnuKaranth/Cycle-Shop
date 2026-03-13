"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../src/lib/supabase/client";
import { ArrowRight, Eye, EyeOff, Mail, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (success) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="text-5xl mb-6">✉️</div>
          <h1 className="text-3xl font-black uppercase tracking-[-0.05em] mb-4">Check Your Email</h1>
          <p className="text-[#888] font-light tracking-wide mb-8 leading-relaxed">
            We&apos;ve sent a confirmation link to <span className="text-white font-medium">{email}</span>. 
            Click the link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-colors"
          >
            Back to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-black tracking-[-0.05em] uppercase inline-block mb-8">
            CANYON
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-[-0.05em] mb-3">Create Account</h1>
          <p className="text-[#888] font-light tracking-wide">Join the Canyon community.</p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-3 bg-surface border border-surface-border py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:border-[#666] transition-colors mb-8"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-surface-border" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666]">Or</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] block mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full bg-surface border border-surface-border px-4 py-4 pr-10 focus:outline-none focus:border-white transition-colors text-sm placeholder:text-[#444]"
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] block mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-surface border border-surface-border px-4 py-4 pr-10 focus:outline-none focus:border-white transition-colors text-sm placeholder:text-[#444]"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888] block mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full bg-surface border border-surface-border px-4 py-4 pr-10 focus:outline-none focus:border-white transition-colors text-sm placeholder:text-[#444]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-5 font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-accent hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[#666] text-sm mt-10">
          Already have an account?{" "}
          <Link href="/login" className="text-white font-bold hover:text-accent transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
