import React from "react";
import Link from "next/link";

interface DevBridgeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function DevBridgeLogo({
  className = "",
  size = "md",
  showText = true,
}: DevBridgeLogoProps) {
  const logoDimensions = {
    sm: "h-7 w-auto",
    md: "h-9 w-auto",
    lg: "h-14 w-auto",
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <img
        src="/logo.png"
        alt="DevBridge Original Logo"
        className={`${logoDimensions} object-contain transition-transform duration-300 group-hover:scale-105`}
      />
    </Link>
  );
}
