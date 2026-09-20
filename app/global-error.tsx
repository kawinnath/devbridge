"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("==================================================");
    console.error("[NEXT.JS GLOBAL ROOT LAYOUT EXCEPTION]");
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error(`Message: ${error.message}`);
    console.error(`Digest ID: ${error.digest || "N/A"}`);
    console.error(`Stack Trace:\n${error.stack}`);
    console.error("==================================================");
  }, [error]);

  return (
    <html lang="en">
      <body className="text-white min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl border border-rose-500/20 bg-slate-950 shadow-2xl flex flex-col items-center gap-6">
          <img src="/logo.png" alt="DevBridge Logo" className="h-10 w-auto object-contain" />
          <h2 className="text-xl font-extrabold text-white">We're having trouble loading this page.</h2>
          <p className="text-xs text-gray-400">
            An unexpected error occurred in the root layout.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => reset()}
              className="flex-1 rounded-xl bg-violet-600 py-3 text-xs font-bold text-white hover:bg-violet-500 transition"
            >
              Retry
            </button>
            <a
              href="/"
              className="flex-1 rounded-xl border border-white/10 py-3 text-xs font-bold text-gray-300 hover:glass-panel transition"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
