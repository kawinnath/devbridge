"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineNotice() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof window !== "undefined" ? !navigator.onLine : false
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true);
      setShowReconnected(false);
    }

    function handleOnline() {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4000);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      {isOffline ? (
        <div className="rounded-xl bg-slate-900 border border-rose-500/40 p-4 shadow-2xl text-xs font-bold text-rose-400 flex items-center gap-2.5">
          <WifiOff className="h-4 w-4 text-rose-400 flex-shrink-0 animate-pulse" />
          No internet connection. Retrying...
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900 border border-emerald-500/40 p-4 shadow-2xl text-xs font-bold text-emerald-400 flex items-center gap-2.5">
          <Wifi className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          Internet connection restored!
        </div>
      )}
    </div>
  );
}
