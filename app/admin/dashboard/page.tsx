"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import { useTheme } from "@/components/ThemeContext";
import { useRouter } from "next/navigation";
import Footer from "@/components/ui/Footer";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { 
  ShieldAlert, ShieldCheck, Users, Briefcase, 
  Trash2, CheckCircle2, AlertTriangle, Search, 
  BarChart3, CreditCard, Settings, UserX, UserCheck,
  TrendingUp, IndianRupee, Crown, FolderOpen, LogOut,
  X, AlertCircle, RefreshCw
} from "lucide-react";

interface ManagedUser {
  id: string; name: string; email: string; role: string;
  createdAt: string; isActive: boolean; trustScore: number; verificationBadge: boolean;
}

export default function AdminDashboard() {
  const { user, isLoggedIn, setUser, setIsLoggedIn } = useTheme();
  const router = useRouter();

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "projects" | "payments" | "subscriptions" | "settings">("analytics");
  const [userSubTab, setUserSubTab] = useState<"DEVELOPER" | "CLIENT" | "ALL">("DEVELOPER");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Metrics from DB
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [ongoingProjects, setOngoingProjects] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [activeSubscriptionsCount, setActiveSubscriptionsCount] = useState(0);
  const [pendingPaymentTotal, setPendingPaymentTotal] = useState(0);
  const [activeDevelopersCount, setActiveDevelopersCount] = useState(0);
  const [activeClientsCount, setActiveClientsCount] = useState(0);
  const [allUsers, setAllUsers] = useState<ManagedUser[]>([]);
  const [flaggedProjects, setFlaggedProjects] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatINR = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amt);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ADMIN AUTHORIZATION GUARD: Strict session & role check
  useEffect(() => {
    async function verifyAdminAccess() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const sessionData = await res.json();
          if (sessionData?.user && sessionData.user.role === "ADMIN") {
            setAuthorized(true);
            return;
          }
        }
      } catch (err) {
        console.error("Session verify failed:", err);
      }

      // Check localStorage fallback
      const storedUser = localStorage.getItem("user");
      const storedLogin = localStorage.getItem("isLoggedIn") === "true";
      if (storedLogin && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === "ADMIN") {
            setAuthorized(true);
            return;
          }
        } catch (_) {}
      }

      // Access Denied for Non-Admin
      setAuthorized(false);
    }

    verifyAdminAccess();
  }, [user, isLoggedIn]);

  async function loadAdminData() {
    try {
      const res = await fetchWithRetry("/api/admin/dashboard");
      if (res.ok) {
        const data = await res.json();
        setTotalUsers(data.totalUsers || 0);
        setTotalProjects(data.totalProjects || 0);
        setCompletedProjects(data.completedProjects || 0);
        setOngoingProjects(data.ongoingProjects || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setMonthlyIncome(data.monthlyIncome || 0);
        setActiveSubscriptionsCount(data.activeSubscriptions || 0);
        setPendingPaymentTotal(data.pendingPaymentTotal || 0);
        setActiveDevelopersCount(data.activeDevelopersCount || 0);
        setActiveClientsCount(data.activeClientsCount || 0);
        setAllUsers(data.allUsers || []);
        setFlaggedProjects(data.flaggedProjects || []);
        setPendingPayments(data.pendingPayments || []);
        setPaymentHistory(data.paymentHistory || []);
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) { 
      console.error("Failed to load admin stats:", err); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => {
    if (authorized) {
      loadAdminData();
    }
  }, [authorized]);

  // SECURE ADMIN LOGOUT
  const handleAdminLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API error:", err);
    }
    // Destroy local session
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("user");
    localStorage.setItem("isLoggedIn", "false");
    setLogoutModalOpen(false);
    setLoggingOut(false);
    router.replace("/admin/login");
  };

  const handleToggleUserActive = async (targetId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? "Deactivate" : "Activate"} this user?`)) return;
    try { 
      const res = await fetch("/api/admin/dashboard", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ action: "TOGGLE_ACTIVE", targetId }) 
      }); 
      if (res.ok) {
        showToast(`User status ${currentStatus ? "deactivated" : "activated"}.`);
        loadAdminData(); 
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (targetId: string, email: string) => {
    if (!confirm(`Permanently delete "${email}"? This action cannot be undone.`)) return;
    try { 
      const res = await fetch("/api/admin/dashboard", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ action: "DELETE_USER", targetId }) 
      }); 
      if (res.ok) { 
        showToast("User deleted permanently."); 
        loadAdminData(); 
      } 
    } catch (err) { console.error(err); }
  };

  const handleUnflagProject = async (targetId: string) => {
    try { 
      const res = await fetch("/api/admin/dashboard", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ action: "UNFLAG_PROJECT", targetId }) 
      }); 
      if (res.ok) { 
        showToast("Project unflagged successfully."); 
        loadAdminData(); 
      } 
    } catch (err) { console.error(err); }
  };

  const handleApprovePayment = async (targetId: string) => {
    try { 
      const res = await fetch("/api/admin/dashboard", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ action: "APPROVE_PAYMENT", targetId }) 
      }); 
      if (res.ok) { 
        showToast("Payment approved & subscription activated!"); 
        loadAdminData(); 
      } 
    } catch (err) { console.error(err); }
  };

  const handleRejectPayment = async (targetId: string) => {
    try { 
      const res = await fetch("/api/admin/dashboard", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ action: "REJECT_PAYMENT", targetId }) 
      }); 
      if (res.ok) { 
        showToast("Payment submission rejected."); 
        loadAdminData(); 
      } 
    } catch (err) { console.error(err); }
  };

  // Filtered Users
  const filteredUsers = allUsers.filter((u) => {
    const matchesSubTab = userSubTab === "ALL" || u.role === userSubTab;
    const matchesQuery = !userSearchQuery || u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesSubTab && matchesQuery;
  });

  // Render Access Denied state if authorization failed
  if (authorized === false) {
    return (
      <div className="relative min-h-screen flex flex-col justify-center bg-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4 z-10 text-center">
          <div className="w-full max-w-sm glass-card-premium rounded-3xl p-8 border border-rose-500/20 bg-card shadow-2xl flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-rose-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Administrative credentials required. You do not have permission to view the Admin Console.
            </p>
            <div className="flex flex-col gap-2.5 w-full mt-2">
              <button
                onClick={() => router.push("/admin/login")}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 py-3 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Sign In as Administrator
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (authorized === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-6 w-6 border-2 border-rose-500 border-t-transparent rounded-full" />
          <span className="font-semibold">Verifying Admin Authorization...</span>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: formatINR(totalRevenue), icon: IndianRupee, color: "text-emerald-500", change: "Real Platform Income" },
    { label: "Monthly Income", value: formatINR(monthlyIncome), icon: TrendingUp, color: "text-cyan-500", change: "Current Period" },
    { label: "Subscriptions", value: activeSubscriptionsCount.toString(), icon: Crown, color: "text-violet-500", change: "Active Users" },
    { label: "Developers Vetted", value: activeDevelopersCount.toString(), icon: Users, color: "text-violet-500", change: "Talent Roster" },
    { label: "Verified Clients", value: activeClientsCount.toString(), icon: Briefcase, color: "text-cyan-500", change: "Postings active" },
    { label: "Delivered Jobs", value: completedProjects.toString(), icon: CheckCircle2, color: "text-emerald-500", change: "Completed Cycles" },
    { label: "Ongoing Projects", value: ongoingProjects.toString(), icon: FolderOpen, color: "text-blue-500", change: "In Progress" },
    { label: "Pending Payments", value: formatINR(pendingPaymentTotal), icon: CreditCard, color: "text-amber-500", change: "UPI Verifications" },
  ];

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-55 rounded-xl bg-success/15 border border-success/25 p-4.5 shadow-2xl text-xs font-bold text-success flex items-center gap-2 animate-slide-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-8 py-10 z-10 relative pt-28 text-left">
        <div className="absolute top-[10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-rose-500/5 blur-[130px] pointer-events-none" />

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Admin Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3.5xl font-extrabold text-foreground tracking-tight">
              Platform Analytics & Security
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Logged in as <span className="font-semibold text-rose-500">{user?.email || "Admin User"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              onClick={() => loadAdminData()}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <LogOut className="h-4 w-4" /> Admin Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 flex flex-col gap-1.5 bg-card border border-border/80 p-3 rounded-2xl">
            <div className="px-3 py-1.5 text-[9px] uppercase font-bold text-muted-foreground tracking-wider border-b border-border/50 mb-1">Moderation Modules</div>
            {[
              { id: "analytics", label: "Revenue Analytics", icon: BarChart3 },
              { id: "users", label: `User Accounts (${allUsers.length})`, icon: Users },
              { id: "projects", label: "Flagged Content", icon: Briefcase },
              { id: "payments", label: "UPI Payments Verify", icon: CreditCard },
              { id: "subscriptions", label: `Subscriptions (${activeSubscriptionsCount})`, icon: Crown },
              { id: "settings", label: "Platform Parameters", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="flex flex-col gap-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="glass-card-premium rounded-2xl p-5 text-left flex flex-col justify-between gap-3 bg-card border border-border/80">
                      <div>
                        <stat.icon className={`h-5 w-5 ${stat.color} mb-2.5`} />
                        <div className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{stat.value}</div>
                        <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{stat.label}</div>
                      </div>
                      <span className="text-[8px] text-muted-foreground font-mono">{stat.change}</span>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Revenue Distribution Chart */}
                  <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80">
                    <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-4 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-500" /> Revenue Breakdown
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-foreground">Pro Subscriptions (₹299/mo)</span>
                          <span className="text-emerald-500">{formatINR(totalRevenue)}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-foreground">Project Escrows</span>
                          <span className="text-cyan-500">₹0 (Zero commission)</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: "0%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Distribution Chart */}
                  <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80">
                    <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-4 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-violet-500" /> User Breakdown
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-foreground">Developers ({activeDevelopersCount})</span>
                          <span className="text-violet-500">{totalUsers > 0 ? Math.round((activeDevelopersCount / totalUsers) * 100) : 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${totalUsers > 0 ? (activeDevelopersCount / totalUsers) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-foreground">Clients ({activeClientsCount})</span>
                          <span className="text-cyan-500">{totalUsers > 0 ? Math.round((activeClientsCount / totalUsers) * 100) : 0}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${totalUsers > 0 ? (activeClientsCount / totalUsers) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Payment History Table */}
                <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80">
                  <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-4 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-violet-500" /> Payment History Logs
                  </h3>
                  {paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto border border-border/60 rounded-xl">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-muted/80 text-muted-foreground text-[10px] uppercase font-bold tracking-wider border-b border-border/70">
                          <tr>
                            <th className="p-3">Date</th>
                            <th className="p-3">Plan</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Transaction ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {paymentHistory.slice(0, 10).map((p) => (
                            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-3 text-foreground font-semibold">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[9px] font-bold">{p.plan}</span></td>
                              <td className="p-3 font-extrabold text-foreground">{formatINR(p.amount)}</td>
                              <td className="p-3"><span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${p.status === "SUCCESS" || p.status === "APPROVED" ? "bg-success/10 text-success border border-success/20" : "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>{p.status}</span></td>
                              <td className="p-3 text-muted-foreground font-mono text-[10px]">{p.transactionId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground">No transactions recorded.</div>
                  )}
                </div>
              </div>
            )}

            {/* USERS */}
            {activeTab === "users" && (
              <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-cyan-500" /> Account Governance & Actions
                    </h3>
                  </div>
                  <div className="flex bg-muted/65 p-1 rounded-full border border-border/80 text-[10px] font-bold w-full sm:w-auto">
                    <button onClick={() => setUserSubTab("DEVELOPER")} className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${userSubTab === "DEVELOPER" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Devs ({activeDevelopersCount})</button>
                    <button onClick={() => setUserSubTab("CLIENT")} className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${userSubTab === "CLIENT" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Clients ({activeClientsCount})</button>
                    <button onClick={() => setUserSubTab("ALL")} className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${userSubTab === "ALL" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>All ({allUsers.length})</button>
                  </div>
                </div>

                <div className="flex items-center bg-background border border-border/70 rounded-xl px-3.5 py-2.5 text-xs">
                  <Search className="h-4 w-4 text-muted-foreground mr-2.5" />
                  <input type="text" placeholder="Search accounts by name or email..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className="w-full bg-transparent text-foreground focus:outline-none placeholder-muted-foreground" />
                </div>

                <div className="overflow-x-auto border border-border/60 rounded-xl">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider border-b border-border/70">
                      <tr>
                        <th className="p-3">User Profile</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Joined Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-foreground text-xs">{u.name}</div>
                            <div className="text-[10px] text-muted-foreground">{u.email}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase ${u.role === "DEVELOPER" ? "bg-violet-500/10 border border-violet-500/20 text-violet-500" : u.role === "CLIENT" ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-500" : "bg-rose-500/10 border border-rose-500/20 text-rose-500"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground font-semibold">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${u.isActive ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-gray-500/10 border border-gray-500/20 text-gray-500"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleToggleUserActive(u.id, u.isActive)} className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${u.isActive ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"}`} title={u.isActive ? "Deactivate User" : "Activate User"}>
                                {u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                              </button>
                              <button onClick={() => handleDeleteUser(u.id, u.email)} className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer" title="Delete User">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-xs font-semibold">No matching user accounts found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80 flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-500" /> Flagged Marketplace Content
                  </h3>
                </div>
                {flaggedProjects.length > 0 ? flaggedProjects.map((item) => (
                  <div key={item.id} className="bg-background border border-border/80 p-4 rounded-xl flex flex-col gap-3">
                    <div>
                      <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[8px] text-rose-500 font-bold uppercase">Content Flagged</span>
                      <h4 className="text-xs.5 font-bold text-foreground mt-1.5">{item.title}</h4>
                      <span className="text-[10px] text-muted-foreground">Client: {item.clientName} • Outlay: {formatINR(item.budget)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted p-2.5 rounded-lg border border-border/60">Reason: {item.scamReason}</p>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleUnflagProject(item.id)} className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md cursor-pointer">
                        Unflag Project
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border border-dashed border-border/80 rounded-xl text-muted-foreground text-xs font-semibold">
                    No flagged projects detected on the network.
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab === "payments" && (
              <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80 text-left flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-emerald-500" /> Pending UPI Manual Verifications
                  </h3>
                </div>
                {pendingPayments.length > 0 ? pendingPayments.map((pay) => (
                  <div key={pay.id} className="bg-background border border-border/85 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[8px] text-emerald-500 font-bold uppercase">{pay.plan} Tier • {formatINR(pay.amount)}</span>
                        <h4 className="text-xs.5 font-bold text-foreground mt-1.5">{pay.userName}</h4>
                        <span className="text-[10px] text-muted-foreground">{pay.userEmail}</span>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="font-mono text-[9px] text-cyan-500 bg-muted px-2.5 py-1 rounded font-bold border border-cyan-500/25">Txn ID: {pay.transactionId}</span>
                        <div className="text-[9px] text-muted-foreground mt-1.5">{new Date(pay.createdAt).toLocaleString("en-IN")}</div>
                      </div>
                    </div>

                    {/* Screenshot proof preview if uploaded */}
                    {pay.screenshot && (
                      <div className="bg-muted p-2 rounded-xl border border-border/70 flex items-center gap-3">
                        <img src={pay.screenshot} alt="Payment Proof" className="h-14 w-14 object-cover rounded-lg border border-border/80" />
                        <div className="text-xs text-muted-foreground">
                          <span className="font-bold text-foreground block">Proof Attachment Uploaded</span>
                          <a href={pay.screenshot} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 underline text-[9px] font-bold">View full attachment</a>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end pt-2 border-t border-border/60 mt-1">
                      <button onClick={() => handleRejectPayment(pay.id)} className="rounded-lg border border-rose-500/20 px-4 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer">Reject</button>
                      <button onClick={() => handleApprovePayment(pay.id)} className="rounded-lg bg-emerald-600 px-5 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-500 shadow-md cursor-pointer">Approve & Activate</button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 border border-dashed border-border/80 rounded-xl text-muted-foreground text-xs font-semibold">
                    No pending UPI manual validation requests.
                  </div>
                )}
              </div>
            )}

            {/* SUBSCRIPTIONS */}
            {activeTab === "subscriptions" && (
              <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80 flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-violet-500" /> Active Roster Subscriptions
                  </h3>
                </div>
                {subscriptions.length > 0 ? (
                  <div className="overflow-x-auto border border-border/60 rounded-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider border-b border-border/70">
                        <tr>
                          <th className="p-3">User Profile</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Renewal Period</th>
                          <th className="p-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {subscriptions.map((s) => (
                          <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-foreground">{s.userName}</div>
                              <div className="text-[10px] text-muted-foreground">{s.userEmail}</div>
                            </td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-500 text-[9px] font-bold">{s.plan}</span></td>
                            <td className="p-3"><span className={`px-2.5 py-0.5 rounded text-[8px] font-bold uppercase border ${s.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : s.status === "CANCELLED" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>{s.status}</span></td>
                            <td className="p-3 text-foreground font-semibold">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("en-IN") : "—"}</td>
                            <td className="p-3 text-muted-foreground font-semibold">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border/80 rounded-xl text-muted-foreground text-xs font-semibold">
                    No active membership subscriptions.
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === "settings" && (
              <div className="glass-card-premium rounded-2xl p-6 bg-card border border-border/80 flex flex-col gap-6">
                <div>
                  <h3 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Platform Core Parameters
                  </h3>
                </div>
                <div className="bg-background border border-border/80 p-4 rounded-xl flex flex-col gap-3 text-xs">
                  {[
                    { label: "Administrator ID", value: user?.email || "kawinnath08@gmail.com", color: "text-violet-500" },
                    { label: "Platform Database", value: "PostgreSQL Database Engine", color: "text-emerald-500" },
                    { label: "Token Cryptography", value: "HS256 HMAC Signatures", color: "text-cyan-500" },
                    { label: "Merchant Gateway", value: "Razorpay Sandbox Integration", color: "text-amber-500" },
                    { label: "Outlay Currency", value: "₹ INR (Indian Rupee)", color: "text-foreground font-bold" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border/60 last:border-none">
                      <span className="text-foreground font-bold">{item.label}</span>
                      <span className={`${item.color} font-mono font-semibold`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CONFIRMATION LOGOUT MODAL OVERLAY */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl border border-border/80 bg-card p-6.5 text-center shadow-2xl relative">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <LogOut className="h-6 w-6 text-rose-500" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-2">Confirm Admin Logout</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-normal">
              Are you sure you want to end your administrative console session? You will need to log back in to review analytics.
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                disabled={loggingOut}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdminLogoutConfirm}
                disabled={loggingOut}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                {loggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
