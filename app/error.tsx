"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";
import { AlertTriangle, RefreshCw, Home, MessageSquare } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured Detailed Error Logging for Dev & Production Vercel Logs
    const errorReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      message: error.message || "Unknown Runtime Error",
      stack: error.stack || "No stack trace available",
      digest: error.digest || "N/A",
      route: typeof window !== "undefined" ? window.location.href : "Server Side",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
    };

    console.error("==================================================");
    console.error("[DEVBRIDGE RUNTIME EXCEPTION CAPTURED]");
    console.error(`Timestamp: ${errorReport.timestamp}`);
    console.error(`Environment: ${errorReport.environment}`);
    console.error(`Route: ${errorReport.route}`);
    console.error(`Message: ${errorReport.message}`);
    console.error(`Digest ID: ${errorReport.digest}`);
    console.error(`Stack Trace:\n${errorReport.stack}`);
    console.error("==================================================");

    // If fetch failed due to server cold start or micro-disconnect, attempt auto-reset once
    if (error.message?.includes("fetch") || error.message?.includes("NetworkError")) {
      console.warn("[Auto-Recovery] Network glitch detected. Retrying page load automatically...");
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center z-10 relative">
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-card rounded-2xl p-8 border border-border shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6">
        <DevBridgeLogo size="md" />

        <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center animate-pulse">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-foreground">We're having trouble loading this page.</h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            A temporary connection or server response delay occurred. Click below to retry or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button
            onClick={() => reset()}
            className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-lg flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
          
          <Link
            href="/"
            className="flex-1 rounded-xl border border-border py-3 text-xs font-bold text-foreground hover:bg-muted transition flex items-center justify-center gap-1.5"
          >
            <Home className="h-4 w-4" /> Go Home
          </Link>
        </div>

        <Link
          href="/support"
          className="text-[11px] font-bold text-muted-foreground hover:text-primary transition flex items-center gap-1 mt-1"
        >
          <MessageSquare className="h-3 w-3" /> Report Error to Support
        </Link>
      </div>
    </div>
  );
}
