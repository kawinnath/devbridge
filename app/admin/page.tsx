"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AdminRootPage() {
  const { user, isLoggedIn } = useTheme();
  const router = useRouter();
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user && data.user.role === "ADMIN") {
            router.replace("/admin/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Admin check failed:", err);
      }
      
      // Fallback: check local storage / theme context
      const storedUser = localStorage.getItem("user");
      const storedLogin = localStorage.getItem("isLoggedIn") === "true";
      if (storedLogin && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.role === "ADMIN") {
          router.replace("/admin/dashboard");
          return;
        }
      }

      // If not logged in at all, redirect to admin login
      if (!isLoggedIn && !storedLogin) {
        router.replace("/admin/login");
        return;
      }

      // Otherwise, access denied for non-admin user
      setAccessDenied(true);
      setLoading(false);
    }

    checkAdminAuth();
  }, [user, isLoggedIn, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-rose-500 border-t-transparent rounded-full" />
          Verifying administrative authorization...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-grid-pattern flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4 z-10">
        <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-rose-500/30 bg-slate-950/60 shadow-2xl text-center flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Access Denied</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            You do not have administrative privileges to access this area. Authorized personnel only.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:from-violet-500 hover:to-indigo-500 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Homepage
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
