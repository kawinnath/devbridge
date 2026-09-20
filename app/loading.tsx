import React from "react";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center z-10 relative">
      <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="flex flex-col items-center gap-4 animate-pulse">
        <DevBridgeLogo size="lg" />
        <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-muted-foreground">
          <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          Loading DevBridge...
        </div>
      </div>
    </div>
  );
}
