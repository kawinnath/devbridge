"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Shield, Lock, FileText, Mail } from "lucide-react";

export default function CopyrightPage() {
  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-violet-600/10 border border-violet-500/20 rounded-2xl mb-4 text-violet-400">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Copyright Notice
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: July 2026
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            
            <div className="space-y-6 text-gray-300 leading-relaxed text-sm sm:text-base">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <FileText className="h-6 w-6 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Ownership of Materials</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    &copy; {new Date().getFullYear()} DevBridge. All Rights Reserved.
                  </p>
                  <p className="text-gray-400 mt-2 text-xs sm:text-sm">
                    The DevBridge website, including its source code, user interface, design, branding, logo, graphics, databases, and all custom-developed features, is the intellectual property of DevBridge unless otherwise stated.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <Lock className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Restrictions on Use</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Unauthorized copying, reproduction, modification, distribution, reverse engineering, or commercial use of any part of this website without prior written permission from DevBridge is strictly prohibited.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                <Shield className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">Trademarks</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    All trademarks, logos, and brand names belong to their respective owners.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-600/10 border border-violet-500/20 rounded-xl text-violet-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Copyright-related inquiries:</p>
                    <a href="mailto:kawinnath08@gmail.com" className="text-sm font-semibold text-white hover:text-violet-400 transition">
                      kawinnath08@gmail.com
                    </a>
                  </div>
                </div>

                <Link
                  href="/"
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/15"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
