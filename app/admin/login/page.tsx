"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";
import { Mail, Lock, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const { setUser } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Admin email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Invalid administrative credentials.");
      } else {
        setUser(data);
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-grid-pattern flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-rose-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-rose-500/20 relative z-10 bg-slate-950/60 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <div className="mb-2">
              <DevBridgeLogo size="md" />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <ShieldCheck className="h-5 w-5 text-rose-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Admin Portal Sign In
            </h2>
            <p className="text-xs text-gray-400">
              Authorized administrative access only.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5 text-left">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Admin Email Address
              </label>
              <div className="flex items-center border border-white/10 rounded-xl glass-panel p-3 focus-within:border-rose-500 transition">
                <Mail className="h-4 w-4 text-gray-400 mr-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@devbridge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Admin Password
              </label>
              <div className="flex items-center border border-white/10 rounded-xl glass-panel p-3 focus-within:border-rose-500 transition">
                <Lock className="h-4 w-4 text-gray-400 mr-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-violet-500 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Dashboard"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 mt-6 border-t border-white/5 pt-4">
            Non-administrative users should return to the{" "}
            <Link href="/" className="text-violet-400 font-bold hover:underline">
              Homepage
            </Link>
            .
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
