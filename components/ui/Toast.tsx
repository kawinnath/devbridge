"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface ToastProps {
  message: string | null;
  type: "success" | "error" | "info";
  onClose: () => void;
  durationMs?: number;
}

export default function Toast({ message, type, onClose, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [message, durationMs, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl max-w-sm w-full"
          style={{
            backgroundColor: type === "success" 
              ? "rgba(16, 185, 129, 0.1)" 
              : type === "error" 
              ? "rgba(239, 68, 68, 0.1)" 
              : "rgba(99, 102, 241, 0.1)",
            borderColor: type === "success" 
              ? "rgba(16, 185, 129, 0.25)" 
              : type === "error" 
              ? "rgba(239, 68, 68, 0.25)" 
              : "rgba(99, 102, 241, 0.25)",
            color: "var(--foreground)"
          }}
        >
          <div className="shrink-0">
            {type === "success" && <CheckCircle2 className="h-5 w-5 text-success" />}
            {type === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
            {type === "info" && <Info className="h-5 w-5 text-primary" />}
          </div>
          
          <div className="flex-1 text-sm font-semibold leading-snug">
            {message}
          </div>
          
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
