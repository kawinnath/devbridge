"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { ProjectListSkeleton } from "@/components/ui/Skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, SlidersHorizontal, Sparkles, ShieldCheck, 
  MapPin, Clock, IndianRupee, BrainCircuit, Star, 
  ArrowUpDown, MessageSquare, Briefcase, User, CheckCircle2,
  ExternalLink
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";

function SearchDirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Tab state: "projects" or "developers"
  const [activeTab, setActiveTab] = useState<"projects" | "developers">("projects");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minTrustScore, setMinTrustScore] = useState(70);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [smartRanking, setSmartRanking] = useState(true);

  // Database lists
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [developersList, setDevelopersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Read URL query params on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "developers") {
      setActiveTab("developers");
    } else {
      setActiveTab("projects");
    }
  }, [searchParams]);

  // Fetch listings from DB
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          type: activeTab,
          search: searchQuery,
          category: selectedCategory,
          minTrust: minTrustScore.toString(),
          onlyVerified: onlyVerified.toString(),
        });
        const res = await fetchWithRetry(`/api/projects?${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          if (activeTab === "projects") {
            const sorted = data.sort((a: any, b: any) => smartRanking ? (b.trustScore || 80) - (a.trustScore || 80) : 0);
            setProjectsList(sorted);
          } else {
            const sorted = data.sort((a: any, b: any) => smartRanking ? (b.trustScore || 80) - (a.trustScore || 80) : (b.rating || 5) - (a.rating || 5));
            setDevelopersList(sorted);
          }
        }
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      } finally {
        setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      loadData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [activeTab, searchQuery, selectedCategory, minTrustScore, onlyVerified, smartRanking]);

  const handleTabChange = (tab: "projects" | "developers") => {
    setActiveTab(tab);
    router.push(`/projects?tab=${tab}`);
  };

  const formatINR = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amt);

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-8 py-10 z-10 relative pt-28 text-left">
        
        {/* Directory Head */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {activeTab === "projects" ? "Discover Projects" : "Verified Developer Directory"}
            </h1>
            <p className="text-xs.5 text-muted-foreground mt-1.5 max-w-xl">
              {activeTab === "projects" 
                ? "Find authentic technology projects matching your specific experience and stack."
                : "Browse professional software developers and agencies with verified profiles and project histories."}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-muted/65 p-1 rounded-full border border-border/80 shadow-sm w-full md:w-auto">
            <button
              onClick={() => handleTabChange("projects")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "projects" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="h-4 w-4" /> Find Projects
            </button>
            <button
              onClick={() => handleTabChange("developers")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "developers" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BrainCircuit className="h-4 w-4" /> Hire Developers
            </button>
          </div>
        </div>

        {/* Search Input Panel */}
        <div className="bg-card rounded-2xl p-4 border border-border/80 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center w-full md:max-w-md lg:max-w-lg bg-background border border-border/70 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground mr-3" />
            <input
              type="text"
              placeholder={activeTab === "projects" ? "Search by project keywords, tech stack, skills..." : "Search developers by name, skills, title..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none placeholder-muted-foreground"
            />
          </div>

          <div className="flex items-center w-full md:w-auto justify-between md:justify-end border-t border-border/60 pt-3 md:border-none md:pt-0 gap-4">
            {/* Smart Ranking */}
            <div className="flex items-center gap-3 bg-muted/20 px-3.5 py-1.5 rounded-xl border border-border/60">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Trust Rank
              </span>
              <button
                onClick={() => setSmartRanking(!smartRanking)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${smartRanking ? "bg-primary" : "bg-muted-foreground/30"}`}
                aria-label="Toggle Smart Ranking"
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${smartRanking ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3 bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col gap-6 sticky top-28">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              </span>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setMinTrustScore(50);
                  setOnlyVerified(false);
                }}
                className="text-[10px] text-muted-foreground font-bold hover:text-foreground transition-colors hover:underline cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter (For Projects) */}
            {activeTab === "projects" && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block">Category</label>
                <div className="flex flex-col gap-1">
                  {["All", "Website Development", "Mobile Apps", "UI/UX", "AI Automation", "Custom Software"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left text-xs py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        selectedCategory === cat 
                          ? "bg-primary/10 text-primary font-bold shadow-sm" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground font-semibold"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Min Trust Score Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Min Trust Rating</label>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{minTrustScore}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={minTrustScore}
                onChange={(e) => setMinTrustScore(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-muted rounded-lg appearance-none"
              />
            </div>

            {/* Verified Badge Checkbox */}
            <div className="border-t border-border/60 pt-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 block">Verification</label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${onlyVerified ? 'bg-primary border-primary' : 'bg-background border-border/80 group-hover:border-primary/50'}`}>
                  {onlyVerified && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="hidden"
                />
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  {activeTab === "projects" ? "Verified Clients Only" : "Verified Pros Only"}
                </span>
              </label>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-9 flex flex-col gap-5">
            {loading ? (
              <ProjectListSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + selectedCategory + searchQuery}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-5"
                >
                  {/* PROJECT CARDS */}
                  {activeTab === "projects" && (
                    projectsList.length > 0 ? (
                      projectsList.map((proj) => (
                        <div key={proj.id} className="glass-card-premium rounded-2xl p-6 flex flex-col gap-4 text-left group">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-3 mb-2">
                                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">{proj.category}</span>
                                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Posted {new Date(proj.createdAt).toLocaleDateString("en-IN")}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                {proj.title}
                              </h3>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                              <div className="text-lg font-extrabold text-foreground flex items-center gap-0.5">
                                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                {proj.budget ? proj.budget.toLocaleString("en-IN") : "Flexible"}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-bold mt-0.5">Est. {proj.deadline}</div>
                            </div>
                          </div>

                          <p className="text-xs.5 text-muted-foreground leading-relaxed line-clamp-2">
                            {proj.description}
                          </p>

                          {/* Skill pills */}
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {proj.skills && proj.skills.split(",").map((skill: string, sIdx: number) => {
                              const trimmed = skill.trim();
                              if (!trimmed) return null;
                              return (
                                <span key={sIdx} className="rounded-lg bg-muted border border-border/60 px-2.5 py-1 text-xs text-muted-foreground font-semibold">
                                  {trimmed}
                                </span>
                              );
                            })}
                          </div>

                          {/* Metadata & Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border/60 pt-4 mt-1">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                <User className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">{proj.clientName || "Client"}</span>
                                {proj.clientVerified ? (
                                  <span className="flex items-center text-[9px] font-bold text-success">
                                    <ShieldCheck className="h-3 w-3 mr-0.5" /> Verified Client
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold text-muted-foreground">Standard Client</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => router.push(`/auth?redirect=proposal&projectId=${proj.id}`)}
                              className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              Apply Now <ArrowUpDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="glass-card-premium rounded-2xl text-center py-20 text-muted-foreground flex flex-col items-center justify-center gap-4">
                        <Briefcase className="h-10 w-10 text-muted-foreground/45" />
                        <div>
                          <p className="text-sm font-bold text-foreground">No matching projects found</p>
                          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria.</p>
                        </div>
                      </div>
                    )
                  )}

                  {/* DEVELOPER DIRECTORY CARDS */}
                  {activeTab === "developers" && (
                    developersList.length > 0 ? (
                      developersList.map((dev) => (
                        <div key={dev.id} className="glass-card-premium rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row gap-6 text-left">
                          {/* Dev Info Column 1 */}
                          <div className="flex sm:flex-col items-center sm:items-center gap-4 shrink-0 sm:w-32">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-sm flex items-center justify-center">
                              <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-lg font-bold text-foreground uppercase border border-background">
                                {dev.avatar ? dev.avatar.substring(0, 2) : (dev.name || "D").substring(0, 2)}
                              </div>
                            </div>

                            <div className="sm:mt-2 text-left sm:text-center w-full">
                              <div className="text-[10px] font-bold text-primary flex items-center sm:justify-center gap-1 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                {dev.trustScore || 80}% Trust
                              </div>
                              <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider mt-1.5 bg-muted px-2 py-0.5 rounded-md text-center">
                                {dev.completedProjects || 0} Jobs Done
                              </div>
                            </div>
                          </div>

                          {/* Main Dev Details Column 2 */}
                          <div className="flex-1 flex flex-col gap-3.5">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                              <div>
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                  {dev.name}
                                  {dev.verifiedPro && (
                                    <span className="flex items-center text-[8px] font-bold text-success border border-success/20 bg-success/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      <ShieldCheck className="h-2.5 w-2.5 mr-0.5" /> Verified Pro
                                    </span>
                                  )}
                                </h3>
                                <div className="text-xs text-muted-foreground font-semibold mt-0.5 flex items-center gap-2">
                                  <span>{dev.title || "Software Developer"}</span>
                                  <span className="text-muted-foreground/30">•</span>
                                  <span className="flex items-center text-amber-500 font-bold"><Star className="h-3 w-3 mr-0.5 fill-amber-500" /> {dev.rating || 5.0}</span>
                                </div>
                              </div>

                              <div className="text-left md:text-right w-full md:w-auto bg-muted/40 p-2.5 px-3.5 rounded-xl border border-border/80">
                                <div className="text-sm font-bold text-foreground">₹{dev.hourlyRate || 500}/hr</div>
                                <div className="text-[10px] text-success font-bold mt-0.5 capitalize">{dev.availability || "Full Time"}</div>
                              </div>
                            </div>

                            <p className="text-xs.5 text-muted-foreground leading-relaxed line-clamp-2">
                              {dev.bio || "Professional software engineer delivering performant web and mobile applications."}
                            </p>

                            {/* Skill Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {dev.skills ? dev.skills.split(",").map((skill: string, sIdx: number) => {
                                const trimmed = skill.trim();
                                if (!trimmed) return null;
                                return (
                                  <span key={sIdx} className="rounded-lg bg-muted border border-border/60 px-2.5 py-0.5 text-xs text-muted-foreground font-semibold">
                                    {trimmed}
                                  </span>
                                );
                              }) : null}
                            </div>

                            {/* Social & Action Links */}
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/60 pt-4 mt-1 gap-4">
                              <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground w-full sm:w-auto">
                                {dev.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" /> {dev.location}
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2.5 w-full sm:w-auto">
                                <button
                                  onClick={() => router.push(`/developer/profile/${dev.id}`)}
                                  className="flex-1 sm:flex-none rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                  View Profile
                                </button>
                                <button
                                  onClick={() => router.push(`/chat?userId=${dev.id}`)}
                                  className="flex-1 sm:flex-none rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" /> Message
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="glass-card-premium rounded-2xl text-center py-20 text-muted-foreground flex flex-col items-center justify-center gap-4">
                        <BrainCircuit className="h-10 w-10 text-muted-foreground/45" />
                        <div>
                          <p className="text-sm font-bold text-foreground">No developers found</p>
                          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
                        </div>
                      </div>
                    )
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchDirectory() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-bold text-muted-foreground bg-background">Loading Directory...</div>}>
      <SearchDirectoryContent />
    </Suspense>
  );
}
