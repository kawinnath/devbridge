"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { DashboardSkeleton } from "@/components/ui/Skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, ShieldCheck, Cpu, ArrowUpRight, 
  Send, User, FileText, Award, BarChart3, Users, Building, 
  Plus, Trash2, Brain, AlertCircle, Play, Clock, IndianRupee,
  FolderOpen, MessageSquare, ChevronRight, Target, Crown
} from "lucide-react";

function DeveloperDashboardContent() {
  const { role, user } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "myprojects" | "agency">("overview");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Database dashboard metrics
  const [darkGaugeOffset, setDarkGaugeOffset] = useState(339);
  const [trustScore, setTrustScore] = useState(80);
  const [verificationBadge, setVerificationBadge] = useState(false);
  const [subscription, setSubscription] = useState("BASIC");
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<string | null>(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [proposalsCount, setProposalsCount] = useState(0);
  const [proposals, setProposals] = useState<any[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal Submission
  const [applyProject, setApplyProject] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Project work state
  const [projectMessages, setProjectMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [newProgress, setNewProgress] = useState(0);

  // Team
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const formatINR = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amt);

  const [pendingPaymentBadge, setPendingPaymentBadge] = useState(false);

  async function loadDashboard() {
    try {
      const res = await fetchWithRetry("/api/developer/dashboard");
      if (res.ok) {
        const data = await res.json();
        setTrustScore(data.trustScore || 80);
        setVerificationBadge(data.verificationBadge || false);
        setSubscription(data.subscription || "BASIC");
        setSubscriptionActive(data.subscriptionActive || false);
        setSubscriptionEndDate(data.subscriptionEndDate || null);
        setSubscriptionStartDate(data.subscriptionStartDate || null);
        setProposalsCount(data.proposalsCount || 0);
        setProposals(data.proposals || []);
        setAssignedProjects(data.assignedProjects || []);
        setRecommendedProjects(data.recommendedProjects || []);
        setTeamMembers(data.teamMembers || []);
        setPaymentHistory(data.paymentHistory || []);
      }

      const pRes = await fetch("/api/payments/status");
      if (pRes.ok) {
        const pData = await pRes.json();
        setPendingPaymentBadge(Boolean(pData?.isPending));
      }
    } catch (err) { console.error("Failed to load developer dashboard:", err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  const loadProjectMessages = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`);
      if (res.ok) setProjectMessages(await res.json());
    } catch (err) { console.error(err); }
  };

  const sendProjectMessage = async () => {
    if (!selectedProject || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) { setNewMessage(""); await loadProjectMessages(selectedProject.id); }
    } catch (err) { console.error(err); }
    finally { setSendingMessage(false); }
  };

  const updateProjectProgress = async (progress: number, status?: string) => {
    if (!selectedProject) return;
    setUpdatingProgress(true);
    try {
      const body: any = { progress };
      if (status) body.status = status;
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { await loadDashboard(); setSelectedProject((prev: any) => prev ? { ...prev, progress, status: status || prev.status } : null); }
    } catch (err) { console.error(err); }
    finally { setUpdatingProgress(false); }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    if (!selectedProject) return;
    try {
      await fetch(`/api/projects/${selectedProject.id}/tasks/${taskId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadDashboard();
      const updated = assignedProjects.find((p) => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    } catch (err) { console.error(err); }
  };

  const addTeamMember = async () => {
    if (!newMemberName || !newMemberRole) return;
    setAddingMember(true);
    try {
      const res = await fetch("/api/developer/team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD", name: newMemberName, role: newMemberRole }),
      });
      if (res.ok) { setTeamMembers(await res.json()); setNewMemberName(""); setNewMemberRole(""); }
    } catch (err) { console.error(err); }
    finally { setAddingMember(false); }
  };

  const removeTeamMember = async (index: number) => {
    try {
      const res = await fetch("/api/developer/team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REMOVE", index }),
      });
      if (res.ok) setTeamMembers(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyProject || !bidAmount || !coverLetter) return;
    setSubmittingProposal(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: applyProject.id, coverLetter, bidAmount: Number(bidAmount) }),
      });
      if (res.ok) {
        setSubmissionSuccess(true);
        setTimeout(() => { setApplyProject(null); setBidAmount(""); setCoverLetter(""); setSubmissionSuccess(false); loadDashboard(); }, 1500);
      } else { alert("Failed to submit proposal."); }
    } catch (err) { console.error(err); }
    finally { setSubmittingProposal(false); }
  };

  const openProjectWork = (project: any) => {
    setSelectedProject(project);
    setNewProgress(project.progress || 0);
    loadProjectMessages(project.id);
  };

  const taskStatusColor: Record<string, string> = {
    PENDING: "bg-muted text-muted-foreground border-border",
    IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    UNDER_REVIEW: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    COMPLETED: "bg-success/10 text-success border-success/20",
  };

  const nextTaskStatus: Record<string, string> = {
    PENDING: "IN_PROGRESS", IN_PROGRESS: "UNDER_REVIEW", UNDER_REVIEW: "COMPLETED",
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-8 py-10 z-10 relative pt-28 text-left">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
              <Cpu className="h-7 w-7 text-primary" /> Developer Workspace
            </h1>
            <p className="text-xs.5 text-muted-foreground mt-1.5">Manage active project cycles, track covers/bids, and submit proposals.</p>
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            {pendingPaymentBadge ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 rounded-full animate-pulse shadow-sm">
                <AlertCircle className="h-4 w-4" /> Pending Payment Verification
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full shadow-sm">
                <ShieldCheck className="h-4 w-4 text-success" />
                {subscriptionActive ? `${subscription} Active` : `${subscription} Free Plan`}
              </span>
            )}
            {subscriptionEndDate && !pendingPaymentBadge && (
              <span className="text-xs text-muted-foreground bg-card border border-border px-3.5 py-1.5 rounded-full font-mono shadow-sm">
                Ends: {new Date(subscriptionEndDate).toLocaleDateString("en-IN")}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-3 bg-card rounded-2xl p-4 border border-border/80 shadow-sm flex flex-col gap-1.5 sticky top-28">
            <div className="px-3 py-1.5 text-[9px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border/50 mb-1">Navigation</div>
            {[
              { id: "overview", icon: BarChart3, label: "Overview & Bids" },
              { id: "myprojects", icon: FolderOpen, label: `Active Work (${assignedProjects.length})` },
              { id: "agency", icon: Users, label: "Agency Team" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => { setActiveSubTab(tab.id as any); setSelectedProject(null); }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeSubTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
            {!subscriptionActive && (
              <button onClick={() => router.push("/pricing")} className="mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-xs font-bold text-white hover:from-amber-400 hover:to-orange-400 transition-all text-center shadow-md cursor-pointer">
                ⚡ Upgrade to Pro — ₹1
              </button>
            )}
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-4" />
                <p className="text-xs font-semibold">Loading Workspace data...</p>
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
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Trust Score */}
                        <div className="glass-card-premium rounded-2xl p-6 text-center flex flex-col justify-center items-center gap-3 relative overflow-hidden bg-card">
                          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                          <div className="relative h-28 w-28 flex items-center justify-center">
                            <svg className="absolute w-full h-full transform -rotate-90">
                              <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-muted/15" strokeWidth="6" fill="transparent" />
                              <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-primary transition-all duration-1000 ease-out" strokeWidth="6" strokeDasharray="301" strokeDashoffset={301 - (301 * trustScore) / 100} fill="transparent" />
                            </svg>
                            <div className="text-center">
                              <div className="text-2.5xl font-extrabold text-foreground">{trustScore}%</div>
                              <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Trust Score</div>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold flex items-center gap-1.5 mt-2">
                            {verificationBadge ? (<><ShieldCheck className="h-4 w-4 text-success" /> <span className="text-foreground">Verified Member</span></>) : (<span className="text-muted-foreground bg-muted px-2.5 py-1 rounded-full text-[9px] font-bold">Standard Member</span>)}
                          </div>
                        </div>

                        <div className="glass-card-premium rounded-2xl p-6 flex flex-col gap-4 bg-card">
                          <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"><BarChart3 className="h-4 w-4 text-primary" /> Analytics</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background border border-border/70 rounded-xl p-3">
                              <div className="text-2xl font-black text-foreground">{proposalsCount}</div>
                              <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Proposals</div>
                            </div>
                            <div className="bg-background border border-border/70 rounded-xl p-3">
                              <div className="text-2xl font-black text-foreground">{assignedProjects.length}</div>
                              <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mt-0.5">Active Work</div>
                            </div>
                            <div className="bg-background border border-border/70 rounded-xl p-3">
                              <div className="text-sm font-bold text-primary truncate">{subscription}</div>
                              <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Tier</div>
                            </div>
                            <div className="bg-background border border-border/70 rounded-xl p-3">
                              <div className="text-sm font-bold text-success">0%</div>
                              <div className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground mt-1">Fees</div>
                            </div>
                          </div>
                        </div>

                        <div className="glass-card-premium rounded-2xl p-6 flex flex-col gap-4 bg-card">
                          <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"><FolderOpen className="h-4 w-4 text-primary" /> Integrations</h3>
                          <div className="flex flex-col gap-2">
                            {[
                              { platform: "GitHub", status: user ? "Linked" : "Pending", color: user ? "text-success" : "text-amber-500" },
                              { platform: "Website", status: "Audited", color: "text-success" },
                              { platform: "LinkedIn", status: user ? "Linked" : "Pending", color: user ? "text-success" : "text-amber-500" },
                            ].map((link, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-background border border-border/80 px-3.5 py-2 rounded-xl text-xs transition-colors hover:border-primary/25">
                                <span className="font-bold text-foreground">{link.platform}</span>
                                <span className={`text-[8px] uppercase tracking-wider font-bold ${link.color} flex items-center gap-0.5 bg-muted px-2 py-0.5 rounded-full`}><CheckCircle2 className="h-3 w-3" /> {link.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Subscription Status & Payment History */}
                      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm text-left flex flex-col gap-6">
                        <div className="flex justify-between items-center border-b border-border/60 pb-3">
                          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            <Crown className="h-4.5 w-4.5 text-primary" /> Subscription Status
                          </h3>
                          <button onClick={() => router.push("/pricing")} className="text-[10px] font-bold text-primary hover:underline bg-primary/10 px-3.5 py-1.5 rounded-full cursor-pointer">
                            Manage / Upgrade →
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Current Plan</span>
                            <span className="text-base font-bold text-foreground">{subscription}</span>
                          </div>
                          <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Status</span>
                            <span className={`text-base font-bold ${subscriptionActive ? "text-success" : "text-muted-foreground"}`}>
                              {subscriptionActive ? "Active" : "Basic Free"}
                            </span>
                          </div>
                          <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Start Date</span>
                            <span className="text-xs font-mono font-semibold text-foreground">
                              {subscriptionStartDate ? new Date(subscriptionStartDate).toLocaleDateString("en-IN") : "N/A"}
                            </span>
                          </div>
                          <div className="bg-background p-4 rounded-xl border border-border shadow-sm">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Expiration Date</span>
                            <span className="text-xs font-mono font-semibold text-primary">
                              {subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString("en-IN") : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Payment History Table */}
                        <div className="mt-2 text-left">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-3">Recent Invoices</h4>
                          {paymentHistory.length > 0 ? (
                            <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
                              <table className="w-full text-left text-xs whitespace-nowrap">
                                <tbody className="divide-y divide-border/60">
                                  {paymentHistory.map((pay: any) => (
                                    <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                                      <td className="p-3.5">
                                        <div className="font-bold text-foreground">{pay.plan} Plan</div>
                                        <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{new Date(pay.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                      </td>
                                      <td className="p-3.5 font-bold text-foreground">{formatINR(pay.amount)}</td>
                                      <td className="p-3.5 text-right">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                          pay.status === "APPROVED" || pay.status === "SUCCESS"
                                            ? "bg-success/10 border border-success/20 text-success"
                                            : pay.status === "PENDING"
                                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse"
                                            : "bg-destructive/10 border border-destructive/20 text-destructive"
                                        }`}>
                                          {pay.status === "PENDING" ? "Verifying..." : pay.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="bg-muted/20 border border-dashed border-border/80 rounded-xl p-6 text-center">
                              <p className="text-xs font-semibold text-muted-foreground">No transaction history found.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                        {/* Proposals */}
                        <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col">
                          <h3 className="text-base font-bold text-foreground border-b border-border/60 pb-3 mb-4">Active Proposals / Bids</h3>
                          {proposals.length > 0 ? (
                            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">
                              {proposals.map((prop) => (
                                <div key={prop.id} className="bg-background border border-border/80 px-4.5 py-3.5 rounded-xl flex flex-col gap-2.5 transition-colors hover:border-primary/25">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-bold text-foreground text-xs.5 leading-snug">{prop.projectTitle}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-bold shrink-0 ${prop.status === "HIRED" ? "bg-success/10 text-success border border-success/20" : prop.status === "SHORTLISTED" ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-border/80"}`}>
                                      {prop.status}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-extrabold text-foreground">{formatINR(prop.bidAmount)}</span>
                                    <span className="text-[9px] font-mono text-muted-foreground bg-muted/65 px-2 py-0.5 rounded-md">{new Date(prop.createdAt).toLocaleDateString("en-IN")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (<div className="flex-1 flex items-center justify-center text-center py-12 text-xs text-muted-foreground border-2 border-dashed border-border/80 rounded-xl bg-muted/20">No active proposal cycles. Apply now!</div>)}
                        </div>

                        {/* Recommended Projects */}
                        <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                              <Target className="h-4.5 w-4.5 text-primary" /> Match Recommendations
                            </h3>
                            <span className="text-[8px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">AI Boosted</span>
                          </div>
                          {recommendedProjects.length > 0 ? (
                            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">
                              {recommendedProjects.map((item) => (
                                <div key={item.id} className="bg-background border border-border/80 p-4 rounded-xl flex flex-col gap-3 transition-colors hover:border-primary/25">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[8px] uppercase tracking-wider text-primary font-bold">{item.category}</span>
                                      <span className="text-[9px] font-semibold text-muted-foreground">{item.clientName} ({item.trustScore}% Match)</span>
                                    </div>
                                    <h4 className="text-xs.5 font-bold text-foreground">{item.title}</h4>
                                  </div>
                                  <div className="flex items-center justify-between border-t border-border/60 pt-2.5 mt-0.5">
                                    <span className="text-xs.5 font-bold text-foreground">{formatINR(item.budget)}</span>
                                    <button onClick={() => setApplyProject(item)} className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground hover:bg-primary/95 transition-all flex items-center gap-1 shadow-sm cursor-pointer">
                                      Apply <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (<div className="flex-1 flex items-center justify-center text-center py-12 text-xs text-muted-foreground border-2 border-dashed border-border/80 rounded-xl bg-muted/20">No matching projects found.</div>)}
                        </div>
                      </div>
                    </>
                  )}

                  {/* MY PROJECTS */}
                  {activeSubTab === "myprojects" && !selectedProject && (
                    <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm text-left">
                      <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
                        <h3 className="text-lg font-bold text-foreground">Active Project Deliveries</h3>
                        <span className="text-[10px] font-bold bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">{assignedProjects.length} Projects</span>
                      </div>
                      
                      {assignedProjects.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {assignedProjects.map((proj) => (
                            <div key={proj.id} className="bg-background border border-border/80 p-5 rounded-2xl flex flex-col gap-4 cursor-pointer hover:border-primary/25 hover:shadow-md transition-all group" onClick={() => openProjectWork(proj)}>
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="font-bold text-foreground text-sm.5 group-hover:text-primary transition-colors">{proj.title}</h4>
                                  <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-3">
                                    <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {proj.client.name}</span>
                                    <span className="flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Priority: <span className={`font-bold ${proj.priority === "URGENT" ? "text-destructive" : proj.priority === "HIGH" ? "text-amber-500" : "text-foreground"}`}>{proj.priority}</span></span>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${proj.status === "COMPLETED" ? "bg-success/10 text-success border border-success/20" : "bg-primary/10 text-primary border border-primary/20"}`}>{proj.status}</span>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                                  <span>Progress Checklist</span>
                                  <span className="text-foreground">{proj.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${proj.progress}%` }} />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3 rounded-xl border border-border/60">
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Total Contract</div>
                                  <div className="text-xs.5 font-bold text-foreground">{formatINR(proj.budget)}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Advance Paid</div>
                                  <div className="text-xs.5 font-bold text-success">{formatINR(proj.advancePaid || 0)}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Milestones</div>
                                  <div className="text-xs.5 font-bold text-foreground">{proj.tasks?.length || 0}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (<div className="text-center py-16 border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center gap-3 bg-muted/20"><FolderOpen className="h-8 w-8 text-muted-foreground" /><p className="text-xs font-semibold text-muted-foreground">No active client contracts assigned.</p></div>)}
                    </div>
                  )}

                  {/* PROJECT WORK VIEW */}
                  {activeSubTab === "myprojects" && selectedProject && (
                    <div className="flex flex-col gap-6 text-left">
                      <button onClick={() => setSelectedProject(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 self-start bg-card border border-border px-3.5 py-2 rounded-xl hover:shadow-sm cursor-pointer">
                        <ChevronRight className="h-4 w-4 rotate-180" /> Back to Workspace
                      </button>

                      {/* Header + Progress */}
                      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{selectedProject.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-4">
                              <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5" /> {selectedProject.client?.name}</span>
                              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {selectedProject.deadline}</span>
                            </p>
                          </div>
                          {selectedProject.status === "IN_PROGRESS" && (
                            <button onClick={() => updateProjectProgress(100, "COMPLETED")} className="rounded-xl bg-success px-4 py-2 text-xs font-bold text-success-foreground hover:bg-success/90 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                              <CheckCircle2 className="h-4 w-4" /> Final Completion
                            </button>
                          )}
                        </div>

                        {/* Progress Slider */}
                        <div className="bg-muted/20 p-5 rounded-xl border border-border/60">
                          <div className="flex items-center justify-between text-xs font-bold mb-3.5">
                            <span className="text-foreground">Update Progress Metric</span>
                            <span className="text-primary text-base font-extrabold">{newProgress}%</span>
                          </div>
                          <input type="range" min="0" max="100" step="5" value={newProgress} onChange={(e) => setNewProgress(Number(e.target.value))} className="w-full accent-primary h-1.5 cursor-pointer mb-2" />
                          <div className="flex justify-between text-[8px] text-muted-foreground font-bold px-1">
                            {[0, 25, 50, 75, 100].map((v) => (<span key={v} className={newProgress >= v ? "text-primary" : ""}>{v}%</span>))}
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button onClick={() => updateProjectProgress(newProgress)} disabled={updatingProgress || newProgress === selectedProject.progress} className="rounded-xl bg-foreground px-5 py-2 text-xs font-bold text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-sm cursor-pointer">
                              {updatingProgress ? "Saving..." : "Save Progress"}
                            </button>
                          </div>
                        </div>

                        {/* Finances */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Total Budget", value: formatINR(selectedProject.budget), color: "text-foreground" },
                            { label: "Escrow Advance", value: formatINR(selectedProject.advancePaid || 0), color: "text-blue-500" },
                            { label: "Remaining", value: formatINR(selectedProject.remainingBalance || selectedProject.budget), color: "text-amber-500" },
                            { label: "Hired Amount", value: formatINR(selectedProject.acceptedAmount || 0), color: "text-success" },
                          ].map((f, i) => (
                            <div key={i} className="bg-background p-3 rounded-xl border border-border text-center shadow-sm">
                              <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider mb-1">{f.label}</div>
                              <div className={`text-sm font-extrabold ${f.color}`}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                        {/* Tasks */}
                        <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-5 border-b border-border/50 pb-3">
                            <Target className="h-4.5 w-4.5 text-primary" />
                            <h4 className="text-xs.5 font-bold text-foreground">Task Milestones</h4>
                          </div>
                          <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-2.5 max-h-[300px]">
                            {(selectedProject.tasks || []).length > 0 ? (
                              <div className="flex flex-col gap-2.5">
                                {selectedProject.tasks.map((task: any) => (
                                  <div key={task.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background border border-border/70 px-4 py-3 rounded-xl gap-3">
                                    <div className="flex items-start gap-2.5">
                                      <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${task.status === "COMPLETED" ? "text-success" : "text-muted-foreground"}`} />
                                      <div>
                                        <span className={`text-xs font-bold block ${task.status === "COMPLETED" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.name}</span>
                                        {task.deadline && <span className="text-[8px] font-mono text-muted-foreground mt-0.5 block">Due: {new Date(task.deadline).toLocaleDateString("en-IN")}</span>}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0 pl-7 sm:pl-0">
                                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border ${taskStatusColor[task.status] || ""}`}>{task.status.replace("_", " ")}</span>
                                      {nextTaskStatus[task.status] && (
                                        <button onClick={() => updateTaskStatus(task.id, nextTaskStatus[task.status])} className="rounded-lg bg-primary px-2.5 py-1 text-[9px] font-bold text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm cursor-pointer">
                                          → {nextTaskStatus[task.status].replace("_", " ")}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (<div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border/80"><p className="text-xs font-semibold text-muted-foreground">No milestones set by client.</p></div>)}
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="bg-card rounded-2xl p-6 border border-border/80 shadow-sm flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-5 border-b border-border/50 pb-3">
                            <MessageSquare className="h-4.5 w-4.5 text-secondary" />
                            <h4 className="text-xs.5 font-bold text-foreground">Client Workspace Chat</h4>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto pr-1 mb-4 max-h-[300px]">
                            {projectMessages.length > 0 ? projectMessages.map((msg) => {
                              const isMe = msg.senderId !== selectedProject.client?.id;
                              return (
                                <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? "self-end" : "self-start"}`}>
                                  <div className={`px-4 py-2.5 rounded-2xl text-xs.5 shadow-sm ${!isMe ? "bg-muted text-foreground rounded-tl-none border border-border/80" : "bg-primary text-primary-foreground rounded-tr-none"}`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    {msg.fileUrl && <a href={msg.fileUrl} className="underline text-[10px] mt-1.5 block font-bold opacity-90 hover:opacity-100">{msg.fileName || "Download Attachment"}</a>}
                                  </div>
                                  <div className={`text-[8px] font-bold text-muted-foreground mt-1 px-1.5 ${!isMe ? "text-left" : "text-right"}`}>
                                    {!isMe ? msg.senderName : "You"} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="flex-1 flex items-center justify-center text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border/80 h-full">
                                <p className="text-xs font-semibold text-muted-foreground">Type below to message your client.</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2.5 pt-3.5 border-t border-border/60 mt-auto">
                            <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendProjectMessage()} className="flex-1 bg-background border border-border/70 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                            <button onClick={sendProjectMessage} disabled={sendingMessage || !newMessage.trim()} className="rounded-xl bg-primary px-4.5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer">
                              <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Send</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AGENCY TEAM */}
                  {activeSubTab === "agency" && (
                    <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border/80 shadow-sm text-left">
                      <div className="mb-6 border-b border-border/60 pb-3">
                        <h3 className="text-lg font-bold text-foreground">Agency Team Management</h3>
                        <p className="text-xs text-muted-foreground mt-1">Scale your deliverable output by listing agency team profiles.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 flex flex-col gap-4">
                          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Active Agency Rosters</h4>
                          {teamMembers.length > 0 ? (
                            <div className="flex flex-col gap-2.5">
                              {teamMembers.map((member, idx) => (
                                <div key={idx} className="bg-background border border-border/80 p-3.5 rounded-xl flex justify-between items-center transition-colors hover:border-primary/25">
                                  <div className="flex items-center gap-3.5">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">{member.name.charAt(0)}</div>
                                    <div>
                                      <div className="font-bold text-foreground text-xs.5">{member.name}</div>
                                      <div className="text-muted-foreground text-[10px] font-semibold">{member.role}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-0.5 rounded-md bg-success/10 border border-success/20 text-[8px] uppercase font-bold tracking-wider text-success">{member.status}</span>
                                    <button onClick={() => removeTeamMember(idx)} className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (<div className="text-center py-16 border-2 border-dashed border-border/80 rounded-xl bg-muted/20"><Users className="h-8 w-8 text-muted-foreground/45 mx-auto mb-3" /><p className="text-xs font-semibold text-muted-foreground">No agency roster listed.</p></div>)}
                        </div>
                        
                        <div className="bg-background p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-4 h-fit">
                          <div className="flex items-center gap-1.5 border-b border-border/50 pb-2">
                            <Plus className="h-4 w-4 text-primary" />
                            <h4 className="text-xs.5 font-bold text-foreground">Add Member</h4>
                          </div>
                          <div className="space-y-3.5">
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                              <input type="text" placeholder="e.g. Alex Johnson" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full bg-card border border-border/80 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Role / Title</label>
                              <input type="text" placeholder="e.g. Lead Designer" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} className="w-full bg-card border border-border/80 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <button onClick={addTeamMember} disabled={addingMember || !newMemberName || !newMemberRole} className="w-full rounded-xl bg-primary py-3 mt-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                              {addingMember ? "Adding..." : <><Plus className="h-4 w-4" /> Add to Team</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* PROPOSAL MODAL */}
      {applyProject && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6.5 text-left shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-foreground mb-1">Apply for Project</h3>
              <p className="text-xs text-muted-foreground mb-5 pb-3 border-b border-border/50">Post proposal to <span className="text-primary font-bold">{applyProject.title}</span></p>
              
              {submissionSuccess ? (
                <div className="py-10 text-center flex flex-col items-center gap-3.5">
                  <div className="h-14 w-14 bg-success/10 rounded-full flex items-center justify-center mb-1">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">Proposal Submitted!</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">The client has been notified and will review details shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Your Bid Bid (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="number" required placeholder="80000" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/60 flex items-center justify-between">
                      <span>Maximum Budget:</span>
                      <span className="font-extrabold text-foreground">{formatINR(applyProject.budget)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Pitch / Cover Letter</label>
                    <textarea rows={5} required placeholder="Why are you a fit? Detail your experience and stack approach..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  
                  <div className="flex gap-2.5 mt-4 pt-3.5 border-t border-border/60">
                    <button type="button" onClick={() => setApplyProject(null)} className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" disabled={submittingProposal} className="flex-[2] rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                      {submittingProposal ? "Submitting..." : <><Send className="h-3.5 w-3.5" /> Submit Proposal</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function DeveloperDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><DashboardSkeleton /></div>}>
      <DeveloperDashboardContent />
    </Suspense>
  );
}
