"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeContext";
import { 
  Globe, ShieldCheck, Cpu, CreditCard
} from "lucide-react";

export default function GlobalWorldMap() {
  const { theme } = useTheme();
  
  // Platform features feed cycling smoothly
  const activities = [
    { type: "network", text: "Global Developer Network", detail: "Connecting clients with verified software engineers", icon: Globe, color: "text-violet-500 dark:text-violet-400 border-violet-500/25" },
    { type: "payouts", text: "Direct 100% Payouts", detail: "Zero platform commission on developer earnings", icon: CreditCard, color: "text-emerald-600 dark:text-emerald-400 border-emerald-500/25" },
    { type: "verification", text: "Vetted Portfolios & Trust Score", detail: "Automated history & skill verification", icon: ShieldCheck, color: "text-cyan-600 dark:text-cyan-400 border-cyan-500/25" },
    { type: "ai", text: "AI Skill Matching Engine", detail: "Instant project matching & proposal generation", icon: Cpu, color: "text-amber-600 dark:text-amber-400 border-amber-500/25" },
  ];

  const [activeActivityIndex, setActiveActivityIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveActivityIndex((prev) => (prev + 1) % activities.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentActivity = activities[activeActivityIndex];

  // International Nodes Coordinates (Percentage relative to 800x450 viewbox)
  const nodes = [
    { name: "India (Bangalore)", x: 530, y: 240, flag: "🇮🇳" },
    { name: "USA (San Francisco)", x: 180, y: 170, flag: "🇺🇸" },
    { name: "UK (London)", x: 380, y: 140, flag: "🇬🇧" },
    { name: "Germany (Berlin)", x: 415, y: 135, flag: "🇩🇪" },
    { name: "Canada (Toronto)", x: 230, y: 150, flag: "🇨🇦" },
    { name: "Australia (Sydney)", x: 670, y: 340, flag: "🇦🇺" },
    { name: "Singapore", x: 585, y: 260, flag: "🇸🇬" },
    { name: "UAE (Dubai)", x: 480, y: 210, flag: "🇦🇪" },
    { name: "Japan (Tokyo)", x: 640, y: 180, flag: "🇯🇵" },
    { name: "South Korea (Seoul)", x: 625, y: 175, flag: "🇰🇷" },
  ];

  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Soft Moving Ambient Light Beams */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[150px]" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 dark:bg-cyan-600/10 blur-[150px]" />

      {/* WORLD MAP SVG CONTAINER */}
      <div className="relative w-full h-full flex items-center justify-center opacity-55 dark:opacity-40">
        <svg 
          className="w-full h-full max-w-6xl max-h-[600px] px-4" 
          viewBox="0 0 800 450" 
          fill="none"
        >
          {/* Latitude & Longitude Grid Lines */}
          {[100, 200, 300, 400, 500, 600, 700].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="450" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(9,13,26,0.015)"} strokeWidth="1" />
          ))}
          {[75, 150, 225, 300, 375].map((y) => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(9,13,26,0.015)"} strokeWidth="1" />
          ))}

          {/* 3D World Continent Outlines */}
          {/* North America */}
          <path d="M120,100 Q180,80 260,110 T300,210 Q220,240 140,180 Z" fill={isDark ? "rgba(139,92,246,0.02)" : "rgba(79,70,229,0.015)"} stroke={isDark ? "rgba(139,92,246,0.12)" : "rgba(79,70,229,0.08)"} strokeWidth="1.5" />
          {/* South America */}
          <path d="M250,250 Q280,260 270,360 T220,380 Q210,300 250,250 Z" fill={isDark ? "rgba(139,92,246,0.02)" : "rgba(79,70,229,0.01)"} stroke={isDark ? "rgba(139,92,246,0.09)" : "rgba(79,70,229,0.06)"} strokeWidth="1.5" />
          {/* Europe */}
          <path d="M360,100 Q430,90 450,140 T400,180 Q360,160 360,100 Z" fill={isDark ? "rgba(6,182,212,0.02)" : "rgba(8,145,178,0.015)"} stroke={isDark ? "rgba(6,182,212,0.12)" : "rgba(8,145,178,0.08)"} strokeWidth="1.5" />
          {/* Africa */}
          <path d="M370,190 Q450,190 460,290 T400,340 Q360,270 370,190 Z" fill={isDark ? "rgba(6,182,212,0.02)" : "rgba(8,145,178,0.01)"} stroke={isDark ? "rgba(6,182,212,0.09)" : "rgba(8,145,178,0.06)"} strokeWidth="1.5" />
          {/* Asia */}
          <path d="M460,90 Q650,80 670,220 T520,270 Q470,180 460,90 Z" fill={isDark ? "rgba(139,92,246,0.03)" : "rgba(79,70,229,0.02)"} stroke={isDark ? "rgba(139,92,246,0.12)" : "rgba(79,70,229,0.08)"} strokeWidth="1.5" />
          {/* Australia */}
          <path d="M630,300 Q690,290 700,360 T630,370 Q610,340 630,300 Z" fill={isDark ? "rgba(6,182,212,0.02)" : "rgba(8,145,178,0.015)"} stroke={isDark ? "rgba(6,182,212,0.12)" : "rgba(8,145,178,0.08)"} strokeWidth="1.5" />

          {/* Animated Connecting Arcs (Data Packets moving between nodes) */}
          {/* USA -> India */}
          <path d="M180,170 Q355,80 530,240" stroke="url(#gradient-arc1)" strokeWidth="1.2" strokeDasharray="6,6" />
          {/* UK -> India */}
          <path d="M380,140 Q455,160 530,240" stroke="url(#gradient-arc2)" strokeWidth="1.2" strokeDasharray="4,4" />
          {/* Germany -> Singapore */}
          <path d="M415,135 Q500,180 585,260" stroke="url(#gradient-arc1)" strokeWidth="1.2" strokeDasharray="5,5" />
          {/* Japan -> Australia */}
          <path d="M640,180 Q655,260 670,340" stroke="url(#gradient-arc2)" strokeWidth="1.2" strokeDasharray="6,6" />

          {/* SVG Gradients for Glowing Arcs */}
          <defs>
            <linearGradient id="gradient-arc1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="gradient-arc2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Glowing Location Nodes & Radar Rings */}
          {nodes.map((node, i) => (
            <g key={i}>
              <circle cx={node.x} cy={node.y} r="8" fill="none" stroke="#06b6d4" strokeWidth="0.8" className="animate-ping opacity-35" />
              <circle cx={node.x} cy={node.y} r="3" fill="#6366f1" />
              <circle cx={node.x} cy={node.y} r="1" fill="#ffffff" />
            </g>
          ))}
        </svg>
      </div>

      {/* FLOATING ACTIVITY CARDS (Fading in & cycling around the map) */}
      <div className="absolute top-24 left-6 sm:left-16 pointer-events-auto hidden sm:block">
        <div className={`glass-card-premium rounded-2xl p-3 border ${currentActivity.color} shadow-lg flex items-center gap-3 transition-all duration-700`}>
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <currentActivity.icon className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-extrabold text-foreground block">{currentActivity.text}</span>
            <span className="text-[9px] text-muted-foreground">{currentActivity.detail}</span>
          </div>
        </div>
      </div>

      {/* FLOATING TECH BADGE ICONS */}
      <div className="absolute bottom-16 left-12 hidden lg:flex items-center gap-2 bg-card/60 dark:bg-slate-900/60 border border-border/80 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-md">
        <Cpu className="h-3.5 w-3.5 text-violet-500" /> AI Matching Engine Active
      </div>

      <div className="absolute bottom-16 right-12 hidden lg:flex items-center gap-2 bg-card/60 dark:bg-slate-900/60 border border-border/80 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-md">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% Vetted Global Talent
      </div>
    </div>
  );
}
