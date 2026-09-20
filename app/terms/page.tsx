"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { FileText, UserCheck, AlertTriangle, RefreshCw } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-violet-600/10 border border-violet-500/20 rounded-2xl mb-4 text-violet-400">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: 2026
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            
            <div className="space-y-8 text-gray-300 leading-relaxed text-sm sm:text-base">
              <p>
                By using <strong>DevBridge</strong>, you agree to the following terms.
              </p>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-violet-400" /> User Responsibilities
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-sm">Users agree to:</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400 text-xs sm:text-sm">
                      <li>Provide accurate information.</li>
                      <li>Keep login credentials secure.</li>
                      <li>Use the platform legally.</li>
                      <li>Respect other users.</li>
                      <li>Not upload harmful or illegal content.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white text-sm">Clients agree to:</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400 text-xs sm:text-sm">
                      <li>Post genuine projects.</li>
                      <li>Make payments honestly.</li>
                      <li>Treat developers professionally.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white text-sm">Developers & Agencies agree to:</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400 text-xs sm:text-sm">
                      <li>Provide genuine skills.</li>
                      <li>Complete accepted work professionally.</li>
                      <li>Avoid fraudulent activities.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Subscriptions</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs sm:text-sm">
                  <li>Pro memberships are billed according to the selected plan.</li>
                  <li>Subscription benefits are available only after successful payment verification.</li>
                  <li>Refunds are handled according to the Refund Policy.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="h-4.5 w-4.5" /> Account Suspension
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  DevBridge reserves the right to suspend or permanently remove accounts involved in fraud, abuse, spam, fake profiles, or illegal activities.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Limitation of Liability</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  DevBridge acts as a platform connecting clients and professionals and is not responsible for disputes arising from individual projects.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin-slow" /> Changes
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  These Terms may be updated periodically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
