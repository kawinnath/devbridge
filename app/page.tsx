"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import GlobalWorldMap from "@/components/ui/GlobalWorldMap";
import NetworkBackground from "@/components/ui/NetworkBackground";
import StatCounter from "@/components/ui/StatCounter";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { 
  Code2, Users, Briefcase, CheckCircle2, Sparkles, 
  ArrowRight, ShieldCheck, CreditCard, Award, ArrowUpRight
} from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    totalClients: 0,
    totalProjects: 0,
    totalCompletedProjects: 0,
    totalProMembers: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(false);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoadingStats(true);
        setErrorStats(false);
        const res = await fetchWithRetry("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalDevelopers: Number(data.totalDevelopers) || 0,
            totalClients: Number(data.totalClients) || 0,
            totalProjects: Number(data.totalProjects) || 0,
            totalCompletedProjects: Number(data.totalCompletedProjects) || 0,
            totalProMembers: Number(data.totalProMembers) || 0,
          });
          setRecentProjects(data.recentProjects || []);
        } else {
          setErrorStats(true);
        }
      } catch (e) {
        setErrorStats(true);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  // Display only real stats
  const statItems = [
    { label: "Verified Developers", value: stats.totalDevelopers, icon: Code2 },
    { label: "Active Clients", value: stats.totalClients, icon: Users },
    { label: "Total Projects", value: stats.totalProjects, icon: Briefcase },
    { label: "Completed Projects", value: stats.totalCompletedProjects, icon: CheckCircle2 },
  ].filter(item => item.value > 0);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-background">
      {/* Interactive Global Network Background */}
      <NetworkBackground />
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      <Navbar />

      <main className="mx-auto max-w-7xl w-full px-6 lg:px-8 pt-36 pb-20 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20 mt-2">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Direct-to-Developer Global Network</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-6.5xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6"
          >
            Connect Talent.<br />
            <span className="gradient-text">Build What&apos;s Next.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed font-normal"
          >
            DevBridge connects skilled developers with real-world projects from clients around the world.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
          >
            <Link 
              href="/projects?tab=developers" 
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Find a Developer
            </Link>
            <Link 
              href="/client/dashboard" 
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-card px-8 py-3.5 text-xs font-bold text-foreground hover:bg-muted hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Post a Project
            </Link>
            <Link
              href="/projects?tab=developers"
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-2 sm:mt-0 sm:ml-2"
            >
              Explore Developers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-14 text-xs font-semibold text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" /> Verified Developers
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-success" /> Direct Client Connections
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-success" /> Transparent Pricing
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" /> Zero Platform Commission
            </div>
          </motion.div>
        </section>

        {/* REAL METRICS & STATS SECTION */}
        {loadingStats ? (
          <section className="mb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-2xl p-6 bg-card border border-border/70 flex flex-col items-center justify-center gap-3 animate-pulse">
                  <div className="h-6 w-6 rounded-full bg-muted" />
                  <div className="h-8 w-20 rounded-lg bg-muted" />
                  <div className="h-3 w-28 rounded bg-muted" />
                </div>
              ))}
            </div>
          </section>
        ) : errorStats ? (
          <section className="mb-20 text-center">
            <div className="rounded-2xl p-4 bg-muted/30 border border-border/70 text-xs font-semibold text-muted-foreground max-w-sm mx-auto">
              Unable to load statistics
            </div>
          </section>
        ) : statItems.length > 0 ? (
          <section className="mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`grid grid-cols-2 ${statItems.length >= 4 ? "lg:grid-cols-4" : statItems.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-4 sm:gap-6 max-w-5xl mx-auto`}
            >
              {statItems.map((stat, i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl p-6 bg-card border border-border/80 shadow-sm flex flex-col items-center text-center">
                  <stat.icon className="h-6 w-6 text-primary mb-3.5" />
                  <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-1">
                    <StatCounter target={stat.value} suffix="" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </section>
        ) : null}

        {/* INTERACTIVE GLOBAL NETWORK STORY */}
        <section className="mb-24 relative h-[380px] sm:h-[450px] rounded-3xl border border-border/70 overflow-hidden bg-card/45 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <GlobalWorldMap />
          
          <div className="absolute top-6 left-6 text-left max-w-xs z-10">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Global Connection</span>
            <h3 className="text-lg font-bold text-foreground">Developer ➔ Project ➔ Client</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Connecting talented software engineers directly with client mandates across borders.
            </p>
          </div>
        </section>

        {/* HOW DEVBRIDGE WORKS */}
        <section className="mb-24">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">How DevBridge Works</h2>
            <p className="text-muted-foreground text-xs.5">Transparent direct collaboration between businesses and top software engineers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Direct Transactions", desc: "Developers receive 100% of project payouts directly to their bank accounts. No platform cuts or hidden commission.", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10" },
              { title: "Transparent Profiles", desc: "View real verified GitHub, LinkedIn, portfolio links, and skill backgrounds before collaborating.", icon: Award, color: "text-purple-500", bg: "bg-purple-500/10" },
              { title: "Flat Predictable Pricing", desc: "Access the network with flat, transparent subscription plans in Indian Rupees. Zero surprise fees.", icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="glass-card-premium rounded-3xl p-6 flex flex-col text-left"
              >
                <div className={`h-11 w-11 rounded-xl ${feat.bg} flex items-center justify-center mb-5`}>
                  <feat.icon className={`h-5.5 w-5.5 ${feat.color}`} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LIVE PROJECTS FEED */}
        <section className="mb-20">
          <div className="rounded-3xl bg-card border border-border/80 shadow-sm overflow-hidden flex flex-col md:flex-row text-left">
            <div className="p-8 sm:p-10 md:w-1/2 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Live Network Feed
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">Real-time Opportunities</h2>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Browse active project postings across web development, mobile apps, and custom software.</p>
              <Link 
                href="/projects" 
                className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:gap-2.5 transition-all"
              >
                Explore all projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-muted/30 p-6 sm:p-8 md:w-1/2 border-t md:border-t-0 md:border-l border-border/80 relative flex flex-col justify-center">
              <div className="flex flex-col gap-3">
                {recentProjects.length > 0 ? (
                  recentProjects.slice(0, 3).map((item) => (
                    <Link key={item.id} href="/projects" className="bg-card border border-border/70 p-4.5 rounded-2xl shadow-sm flex justify-between items-center transform transition-all hover:-translate-y-0.5 hover:border-primary/20">
                      <div className="truncate">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{item.category}</span>
                        <h4 className="font-bold text-foreground text-xs.5 mt-0.5 truncate">{item.title}</h4>
                      </div>
                      <div className="text-right ml-4 shrink-0 font-extrabold text-foreground text-xs">
                        ₹{item.budget?.toLocaleString("en-IN")}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs font-semibold text-muted-foreground">
                    Explore active project listings in the marketplace.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-8 py-12 sm:p-14 text-center text-primary-foreground shadow-xl border border-indigo-900/40">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 tracking-tight">Build your next project with DevBridge.</h2>
              <p className="text-primary-foreground/75 text-xs sm:text-sm mb-8 leading-relaxed font-normal">
                Connect directly with skilled developers and real clients worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/auth?signup=true"
                  className="rounded-full bg-white text-indigo-950 px-7 py-3 text-xs font-bold shadow-md hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/projects"
                  className="rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-7 py-3 text-xs font-bold text-white hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Browse Directory
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
