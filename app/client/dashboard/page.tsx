"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, ArrowUpRight, 
  Send, User, FileText, Award, BarChart3, Plus, 
  Clock, ListCollapse, MessageSquare, 
  IndianRupee, Target, AlertCircle, ChevronRight, Briefcase
} from "lucide-react";

export default function ClientDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "create" | "proposals" | "contracts" | "payments">("overview");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Database Client State
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<any[]>([]);
  const [activeContracts, setActiveContracts] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Project Creator Form State
  const [projTitle, setProjTitle] = useState("");
  const [projCategory, setProjCategory] = useState("Website Development");
  const [projSkills, setProjSkills] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [customDeadline, setCustomDeadline] = useState("");
  const [postingProject, setPostingProject] = useState(false);

  // Project detail state
  const [projectMessages, setProjectMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  async function loadDashboard() {
    try {
      const res = await fetch("/api/client/dashboard");
      if (res.ok) {
        const data = await res.json();
        setActiveProjects(data.activeProjects || []);
        setReceivedProposals(data.receivedProposals || []);
        setActiveContracts(data.activeContracts || []);
        setPaymentHistory(data.paymentHistory || []);
      }
    } catch (err) {
      console.error("Failed to load client dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projDesc || !customBudget || !customDeadline) return;
    setPostingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projTitle, description: projDesc, category: projCategory,
          skills: projSkills, budget: Number(customBudget), deadline: customDeadline,
        }),
      });
      if (res.ok) {
        setProjTitle(""); setProjSkills(""); setProjDesc(""); setCustomBudget(""); setCustomDeadline("");
        await loadDashboard();
        setActiveSubTab("overview");
      } else { alert("Failed to post project."); }
    } catch (err) { console.error(err); }
    finally { setPostingProject(false); }
  };

  const handleProposalAction = async (proposalId: string, action: "SHORTLIST" | "HIRE") => {
    try {
      const res = await fetch("/api/proposals/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, action }),
      });
      if (res.ok) {
        await loadDashboard();
        if (action === "HIRE") setActiveSubTab("contracts");
      } else { alert("Failed to update proposal status."); }
    } catch (err) { console.error(err); }
  };

  const loadProjectMessages = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`);
      if (res.ok) {
        const msgs = await res.json();
        setProjectMessages(msgs);
      }
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!selectedProject || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        await loadProjectMessages(selectedProject.id);
      }
    } catch (err) { console.error(err); }
    finally { setSendingMessage(false); }
  };

  const createTask = async () => {
    if (!selectedProject || !newTaskName.trim()) return;
    setCreatingTask(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTaskName, deadline: newTaskDeadline || null }),
      });
      if (res.ok) {
        setNewTaskName(""); setNewTaskDeadline("");
        await loadDashboard();
        const updated = activeProjects.find((p) => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    } catch (err) { console.error(err); }
    finally { setCreatingTask(false); }
  };

  const openProjectDetail = (contract: any) => {
    setSelectedProject(contract);
    loadProjectMessages(contract.id);
  };

  const formatINR = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amt);

  const taskStatusColor: Record<string, string> = {
    PENDING: "bg-muted text-muted-foreground border border-border/80",
    IN_PROGRESS: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    UNDER_REVIEW: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    COMPLETED: "bg-success/10 text-success border border-success/20",
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-8 py-10 z-10 relative pt-28 text-left">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
              <Briefcase className="h-7 w-7 text-primary" /> Client Workspace
            </h1>
            <p className="text-xs.5 text-muted-foreground mt-1.5">Publish projects, review application proposals, and check active contracts.</p>
          </div>
          <button 
            onClick={() => setActiveSubTab("create")} 
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Post New Project
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-3 bg-card rounded-2xl p-4 border border-border/80 shadow-sm flex flex-col gap-1.5 sticky top-28">
            <div className="px-3 py-1.5 text-[9px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border/50 mb-1">Navigation</div>
            {[
              { id: "overview", icon: BarChart3, label: "Overview & Postings" },
              { id: "create", icon: Plus, label: "Create Project Post" },
              { id: "proposals", icon: ListCollapse, label: "Proposals Inbox" },
              { id: "contracts", icon: Award, label: "Active Contracts" },
              { id: "payments", icon: IndianRupee, label: "Payment History" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveSubTab(tab.id as any); setSelectedProject(null); }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeSubTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-4" />
                <p className="text-xs font-semibold">Loading Client data...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSubTab + (selectedProject ? "detail" : "list")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  
                  {/* OVERVIEW */}
                  {activeSubTab === "overview" && (
                    <div className="flex flex-col gap-6 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: "Total Projects", value: activeProjects.length, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
                          { label: "In Progress", value: activeProjects.filter((p) => p.status === "IN_PROGRESS").length, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
                          { label: "Bids Inbox", value: receivedProposals.length, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
                          { label: "Outlay Value", value: formatINR(activeProjects.reduce((s, p) => s + p.budget, 0)), icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        ].map((stat, i) => (
                          <div key={i} className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-3.5">
                              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                              </div>
                            </div>
                            <div className="text-2xl font-black text-foreground mb-0.5">{stat.value}</div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-6">
                          <h3 className="text-base font-bold text-foreground">Your Project Listings</h3>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{activeProjects.length} Total</span>
                        </div>
                        
                        {activeProjects.length > 0 ? (
                          <div className="flex flex-col gap-4">
                            {activeProjects.map((proj) => (
                              <div key={proj.id} className="group border border-border/85 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/25 hover:shadow-md transition-all bg-background">
                                <div className="flex-1 w-full">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-xs.5 font-bold text-foreground">{proj.title}</h4>
                                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary">{proj.status}</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                                    <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {formatINR(proj.budget)}</span>
                                    {proj.developer && <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {proj.developer.name}</span>}
                                  </div>
                                  
                                  {proj.progress > 0 && (
                                    <div className="mt-4">
                                      <div className="flex items-center justify-between text-[8px] font-bold text-muted-foreground mb-1.5">
                                        <span>Progress metric</span>
                                        <span className="text-primary">{proj.progress}%</span>
                                      </div>
                                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end">
                                  <div className="text-center px-4 py-2 rounded-xl bg-muted/65 border border-border/80">
                                    <div className="text-base font-bold text-foreground">{proj.proposalsCount}</div>
                                    <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Bids</div>
                                  </div>
                                  
                                  {proj.status === "IN_PROGRESS" && (
                                    <button onClick={() => openProjectDetail(proj)} className="rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                                      Manage
                                    </button>
                                  )}
                                  {proj.status === "OPEN" && (
                                    <button onClick={() => setActiveSubTab("proposals")} className="rounded-xl bg-foreground px-4 py-3 text-xs font-bold text-background hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
                                      View Bids
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center gap-3 bg-muted/20">
                            <Briefcase className="h-8 w-8 text-muted-foreground/45" />
                            <p className="text-xs font-semibold text-muted-foreground">No active project listings found.</p>
                            <button onClick={() => setActiveSubTab("create")} className="text-xs font-bold text-primary hover:underline cursor-pointer">Post your first project</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CREATE PROJECT */}
                  {activeSubTab === "create" && (
                    <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm text-left">
                      <div className="mb-6 border-b border-border/60 pb-3">
                        <h3 className="text-lg font-bold text-foreground">Create New Project Listing</h3>
                        <p className="text-xs text-muted-foreground mt-1">Provide technical specifications to matches optimal engineers.</p>
                      </div>
                      
                      <form onSubmit={handlePostProject} className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Project Title</label>
                            <input type="text" required placeholder="e.g. Next.js Developer Marketplace Portal" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Category</label>
                            <select value={projCategory} onChange={(e) => setProjCategory(e.target.value)} className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm">
                              <option value="Website Development">Website Development</option>
                              <option value="Mobile Apps">Mobile Apps</option>
                              <option value="UI/UX">UI/UX Layout</option>
                              <option value="AI Automation">AI Automation</option>
                              <option value="Custom Software">Custom Software</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Required Skills (comma separated)</label>
                          <input type="text" required placeholder="React, PostgreSQL, REST APIs..." value={projSkills} onChange={(e) => setProjSkills(e.target.value)} className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Technical Scope / Description</label>
                          <textarea rows={5} required placeholder="Describe project deliverables, timelines, expected quality, and matching tech stacks..." value={projDesc} onChange={(e) => setProjDesc(e.target.value)} className="w-full bg-background border border-border/80 rounded-xl p-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none shadow-sm" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Budget Outlay (₹)</label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input type="number" required placeholder="75000" value={customBudget} onChange={(e) => setCustomBudget(e.target.value)} className="w-full bg-background border border-border/80 rounded-xl py-3 pl-10 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Delivery Timeline</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input type="text" required placeholder="e.g. 2 Months" value={customDeadline} onChange={(e) => setCustomDeadline(e.target.value)} className="w-full bg-background border border-border/80 rounded-xl py-3 pl-10 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-border/60 mt-2">
                          <button type="submit" disabled={postingProject} className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground hover:scale-[1.01] active:scale-[0.99] shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                            {postingProject ? "Publishing..." : <><CheckCircle2 className="h-4 w-4" /> Publish Project</>}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* PROPOSALS */}
                  {activeSubTab === "proposals" && (
                    <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm text-left">
                      <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
                        <h3 className="text-lg font-bold text-foreground">Received Proposals Inbox</h3>
                        <span className="text-[10px] font-bold bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">{receivedProposals.length} Bids</span>
                      </div>
                      
                      {receivedProposals.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {receivedProposals.map((prop) => (
                            <div key={prop.id} className="bg-background border border-border/80 p-5 rounded-2xl flex flex-col gap-4 transition-all hover:border-primary/25 hover:shadow-md">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3.5">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1.5px] shadow-sm">
                                    <div className="h-full w-full bg-card rounded-full flex items-center justify-center font-bold text-foreground uppercase border-2 border-background text-xs">{prop.avatar ? prop.avatar.substring(0,2) : prop.devName.substring(0,2)}</div>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-foreground text-xs.5">{prop.devName}</h4>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">Applied: <span className="font-semibold text-primary">{prop.projTitle}</span></div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-extrabold text-foreground text-sm.5">{formatINR(prop.bidAmount)}</div>
                                  <div className="text-[8px] text-success font-bold mt-0.5 bg-success/10 px-2 py-0.5 rounded-full inline-block border border-success/15">{prop.trustScore}% Trust Match</div>
                                </div>
                              </div>
                              
                              <div className="bg-muted/30 p-4 rounded-xl border border-border/60 text-xs.5 text-muted-foreground leading-relaxed">
                                {prop.coverLetter}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-border/60 pt-4 mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${prop.matchPercentage}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-muted-foreground">{prop.matchPercentage}% Skill Fit</span>
                                </div>
                                
                                <div className="flex gap-2.5 w-full sm:w-auto">
                                  {prop.status === "PENDING" && (
                                    <>
                                      <button onClick={() => handleProposalAction(prop.id, "SHORTLIST")} className="flex-1 sm:flex-none rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer">Shortlist</button>
                                      <button onClick={() => handleProposalAction(prop.id, "HIRE")} className="flex-1 sm:flex-none rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 shadow-md transition-colors cursor-pointer">Hire Developer</button>
                                    </>
                                  )}
                                  {prop.status !== "PENDING" && (
                                    <span className="px-3.5 py-1.5 rounded-xl bg-muted border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{prop.status}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center gap-3 bg-muted/20">
                          <ListCollapse className="h-8 w-8 text-muted-foreground/45" />
                          <p className="text-xs font-semibold text-muted-foreground">No matching proposals inbox.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CONTRACTS — Project Detail View */}
                  {activeSubTab === "contracts" && !selectedProject && (
                    <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm text-left">
                      <div className="mb-6 border-b border-border/60 pb-3">
                        <h3 className="text-lg font-bold text-foreground">Active Client Contracts</h3>
                      </div>
                      
                      {activeContracts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {activeContracts.map((cnt) => (
                            <div key={cnt.id} className="bg-background border border-border/80 p-5 rounded-2xl flex flex-col gap-4 cursor-pointer hover:border-primary/25 hover:shadow-md transition-all group" onClick={() => openProjectDetail(cnt)}>
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="font-bold text-foreground text-sm.5 group-hover:text-primary transition-colors">{cnt.projectTitle}</h4>
                                  <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {cnt.developerName}</div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${cnt.status === "COMPLETED" ? "bg-success/10 text-success border border-success/20" : "bg-primary/10 text-primary border border-primary/20"}`}>{cnt.status}</span>
                              </div>
                              
                              {/* Progress Bar */}
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                                  <span>Overall Completion</span>
                                  <span className="text-foreground">{cnt.progress || 0}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${cnt.progress || 0}%` }} />
                                </div>
                              </div>
                              
                              {/* Finances */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl border border-border/60">
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Outlay</div>
                                  <div className="text-xs.5 font-bold text-foreground">{formatINR(cnt.budget)}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Milestone Escrow</div>
                                  <div className="text-xs.5 font-bold text-blue-500">{formatINR(cnt.advancePaid || 0)}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Remaining</div>
                                  <div className="text-xs.5 font-bold text-amber-500">{formatINR(cnt.remainingBalance || cnt.budget)}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Direct Payout</div>
                                  <div className="text-xs.5 font-bold text-success">{formatINR(cnt.acceptedAmount || 0)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center gap-3 bg-muted/20">
                          <Award className="h-8 w-8 text-muted-foreground/45" />
                          <p className="text-xs font-semibold text-muted-foreground">No active developer contracts found.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROJECT DETAIL VIEW */}
                  {activeSubTab === "contracts" && selectedProject && (
                    <div className="flex flex-col gap-6 text-left">
                      <button onClick={() => setSelectedProject(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 self-start bg-card border border-border px-3.5 py-2 rounded-xl hover:shadow-sm cursor-pointer">
                        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Contracts
                      </button>

                      {/* Project Header */}
                      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm flex flex-col gap-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-4">
                          <div>
                            <h3 className="text-lg.5 font-bold text-foreground">{selectedProject.projectTitle || selectedProject.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-4">
                              <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {selectedProject.developerName || selectedProject.developer?.name}</span>
                              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {selectedProject.deadline}</span>
                            </p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${selectedProject.status === "COMPLETED" ? "bg-success/10 text-success border border-success/20" : "bg-primary/10 text-primary border border-primary/20"}`}>{selectedProject.status}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-muted/20 p-5 rounded-xl border border-border/60">
                          <div className="flex items-center justify-between text-xs font-bold mb-2">
                            <span className="text-muted-foreground">Project Completion</span>
                            <span className="text-primary text-base font-extrabold">{selectedProject.progress || 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${selectedProject.progress || 0}%` }} />
                          </div>
                        </div>

                        {/* Finances */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {[
                            { label: "Contract", value: formatINR(selectedProject.budget), color: "text-foreground" },
                            { label: "Advance", value: formatINR(selectedProject.advancePaid || 0), color: "text-blue-500" },
                            { label: "Remaining", value: formatINR(selectedProject.remainingBalance || selectedProject.budget), color: "text-amber-500" },
                            { label: "Released", value: formatINR(selectedProject.acceptedAmount || 0), color: "text-success" },
                            { label: "Pending Payment", value: formatINR((selectedProject.budget || 0) - (selectedProject.advancePaid || 0)), color: "text-destructive" },
                          ].map((f, i) => (
                            <div key={i} className="bg-background p-3 rounded-xl text-center border border-border/80">
                              <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{f.label}</div>
                              <div className={`text-xs.5 font-bold ${f.color}`}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Tasks */}
                        <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-5 border-b border-border/50 pb-3">
                            <Target className="h-4.5 w-4.5 text-primary" />
                            <h4 className="text-xs.5 font-bold text-foreground">Milestones Dashboard</h4>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-2.5 max-h-[300px]">
                            {(selectedProject.tasks || []).length > 0 ? (
                              selectedProject.tasks.map((task: any) => (
                                <div key={task.id} className="flex justify-between items-center bg-background border border-border/75 px-4 py-3 rounded-xl hover:border-primary/25 transition-colors">
                                  <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className={`h-4.5 w-4.5 ${task.status === "COMPLETED" ? "text-success" : "text-muted-foreground"}`} />
                                    <span className={`text-xs font-semibold ${task.status === "COMPLETED" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.name}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border ${taskStatusColor[task.status] || ""}`}>{task.status.replace("_", " ")}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border/80">
                                <p className="text-xs font-semibold text-muted-foreground">No milestones created yet.</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-3.5 pt-4 border-t border-border/60 mt-auto">
                            <input type="text" placeholder="New milestone name..." value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} className="w-full bg-background border border-border/80 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                            <div className="flex gap-2.5">
                              <input type="date" value={newTaskDeadline} onChange={(e) => setNewTaskDeadline(e.target.value)} className="flex-1 bg-background border border-border/80 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                              <button onClick={createTask} disabled={creatingTask || !newTaskName.trim()} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-colors shadow-md whitespace-nowrap cursor-pointer">
                                {creatingTask ? "..." : "Add"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-5 border-b border-border/50 pb-3">
                            <MessageSquare className="h-4.5 w-4.5 text-secondary" />
                            <h4 className="text-xs.5 font-bold text-foreground">Developer Work Chat</h4>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto pr-1 mb-4 max-h-[300px]">
                            {projectMessages.length > 0 ? projectMessages.map((msg) => {
                              const isDev = msg.senderId === (selectedProject.developerId || selectedProject.developer?.id);
                              return (
                                <div key={msg.id} className={`flex flex-col max-w-[85%] ${isDev ? "self-start" : "self-end"}`}>
                                  <div className={`px-4 py-2.5 rounded-2xl text-xs.5 shadow-sm ${isDev ? "bg-muted text-foreground rounded-tl-none border border-border/80" : "bg-primary text-primary-foreground rounded-tr-none"}`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    {msg.fileUrl && <a href={msg.fileUrl} className="underline text-[10px] mt-1.5 block font-bold opacity-90 hover:opacity-100">{msg.fileName || "Download Attachment"}</a>}
                                  </div>
                                  <div className={`text-[8px] font-bold text-muted-foreground mt-1 px-1.5 ${isDev ? "text-left" : "text-right"}`}>
                                    {isDev ? msg.senderName : "You"} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="flex-1 flex items-center justify-center text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border/80 h-full">
                                <p className="text-xs font-semibold text-muted-foreground">Type below to message your developer.</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2.5 pt-3.5 border-t border-border/60 mt-auto">
                            <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1 bg-background border border-border/70 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                            <button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} className="rounded-xl bg-primary px-4.5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                              <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Send</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAYMENT HISTORY */}
                  {activeSubTab === "payments" && (
                    <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm text-left">
                      <div className="mb-6 border-b border-border/60 pb-3">
                        <h3 className="text-lg font-bold text-foreground">Billing & Invoice Records</h3>
                        <p className="text-xs text-muted-foreground mt-1">Review your payment history for membership subscriptions and escrow invoices.</p>
                      </div>
                      
                      {paymentHistory.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-border/80 bg-background">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-muted/80 text-muted-foreground text-[10px] uppercase font-bold tracking-wider border-b border-border/70">
                              <tr>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Description</th>
                                <th className="p-4 font-semibold">Amount</th>
                                <th className="p-4 font-semibold">Invoice Ref</th>
                                <th className="p-4 font-semibold text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {paymentHistory.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="p-4 text-foreground font-semibold">{new Date(p.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                  <td className="p-4">
                                    <span className="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">{p.plan} Subscription</span>
                                  </td>
                                  <td className="p-4 font-extrabold text-foreground">{formatINR(p.amount)}</td>
                                  <td className="p-4 text-muted-foreground font-mono text-xs">{p.invoiceNumber || "—"}</td>
                                  <td className="p-4 text-right">
                                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider border ${p.status === "SUCCESS" || p.status === "APPROVED" ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground border border-border/80"}`}>{p.status}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-16 border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center gap-3 bg-muted/20">
                          <IndianRupee className="h-8 w-8 text-muted-foreground/45" />
                          <p className="text-xs font-semibold text-muted-foreground">No invoicing history records found.</p>
                        </div>
                      )}
                    </div>
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
