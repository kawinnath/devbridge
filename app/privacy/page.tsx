"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { ShieldCheck, Eye, Database, Share2, Info } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-violet-600/10 border border-violet-500/20 rounded-2xl mb-4 text-violet-400">
              <Eye className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: 2026
            </p>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            
            <div className="space-y-8 text-gray-300 leading-relaxed text-sm sm:text-base">
              <p>
                Welcome to <strong>DevBridge</strong>. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
              </p>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-violet-400" /> Information We Collect
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-400 text-xs sm:text-sm">
                  <li>Name</li>
                  <li>Email Address</li>
                  <li>Phone Number (if provided)</li>
                  <li>Profile Information</li>
                  <li>Resume and Portfolio</li>
                  <li>Payment Information (processed securely through our payment provider)</li>
                  <li>Usage and Analytics Data</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" /> How We Use Your Information
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-400 text-xs sm:text-sm">
                  <li>Create and manage your account</li>
                  <li>Connect clients with developers and agencies</li>
                  <li>Process subscriptions and payments</li>
                  <li>Improve platform performance</li>
                  <li>Prevent fraud and misuse</li>
                  <li>Provide customer support</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Data Protection</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  We use secure authentication, encrypted connections (HTTPS), and industry-standard security practices to protect user information.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Third-Party Services</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  DevBridge may use trusted third-party services for authentication, hosting, analytics, and payment processing.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Cookies</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  We may use cookies to improve user experience and remember login sessions.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">User Rights</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Users may request to update or delete their account information by contacting support.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Policy Updates</h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  This Privacy Policy may be updated periodically.
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
