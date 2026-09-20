"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, HelpCircle, X, Check, Crown, 
  ShieldAlert, Copy, Download, Upload, Sparkles, UserCheck, ExternalLink, Zap
} from "lucide-react";

export default function PricingPage() {
  const { isLoggedIn, user } = useTheme();
  const router = useRouter();
  
  const currentSubscription = isLoggedIn && user ? user.subscription : "BASIC";
  const hasUsedIntro = user?.hasUsedIntroOffer || false;

  // Selected Plan State
  const [selectedPlan, setSelectedPlan] = useState<{
    id: "FREE" | "INTRO" | "PRO_MONTHLY" | "PRO_YEARLY";
    name: string;
    amount: number;
    billingText: string;
  } | null>(null);

  // Modals state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  
  // Payment Proof Form state
  const [transactionId, setTransactionId] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [submittingProof, setSubmittingProof] = useState(false);

  // Toast State
  const [toastError, setToastError] = useState<string | null>(null);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<any>(null);

  useEffect(() => {
    async function checkPendingPayment() {
      try {
        const res = await fetch("/api/payments/status");
        if (res.ok) {
          const data = await res.json();
          if (data?.isPending) {
            setPendingPayment(data.payment);
          } else {
            setPendingPayment(null);
          }
        }
      } catch (_) {}
    }
    if (isLoggedIn) {
      checkPendingPayment();
    }
  }, [isLoggedIn]);

  const RECEIVER_NAME = "Kawin";
  const UPI_ID = "kawinnath08@okhdfcbank";

  // Dynamic UPI URL & QR Code Image Generator
  const getUpiUrl = (amount: number) => {
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(RECEIVER_NAME)}&am=${amount}&cu=INR`;
  };

  const getDynamicQrUrl = (amount: number) => {
    const upiUrl = getUpiUrl(amount);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
  };

  const showToastErr = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(null), 4000);
  };

  const showToastSucc = (msg: string) => {
    setToastSuccess(msg);
    setTimeout(() => setToastSuccess(null), 4000);
  };

  const handleSelectPlan = (plan: {
    id: "FREE" | "INTRO" | "PRO_MONTHLY" | "PRO_YEARLY";
    name: string;
    amount: number;
    billingText: string;
  }) => {
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }

    if (pendingPayment) {
      showToastErr("Your payment is currently pending verification. You cannot purchase another plan while verification is pending.");
      return;
    }

    if (plan.id === "FREE") {
      showToastSucc("You are currently on the Free Plan.");
      return;
    }

    if (plan.id === "INTRO" && hasUsedIntro) {
      showToastErr("You have already used your one-time ₹1 introductory offer.");
      return;
    }

    setSelectedPlan(plan);
    setQrModalOpen(true);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!selectedPlan) return;
    const link = document.createElement("a");
    link.href = getDynamicQrUrl(selectedPlan.amount);
    link.download = `DevBridge-UPI-QR-₹${selectedPlan.amount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToastErr("Screenshot size must be less than 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !transactionId.trim()) {
      showToastErr("Please enter your UPI Transaction ID.");
      return;
    }

    setSubmittingProof(true);
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan.id,
          amount: selectedPlan.amount,
          transactionId: transactionId.trim(),
          screenshot: screenshotBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToastErr(data.error || "Payment submission failed.");
      } else {
        showToastSucc("Payment proof submitted! Verification usually takes 1–6 hours.");
        setProofModalOpen(false);
        setQrModalOpen(false);
        setTransactionId("");
        setScreenshotBase64(null);
        setPendingPayment({ amount: selectedPlan.amount, transactionId: transactionId.trim() });
      }
    } catch (err) {
      console.error("Submission error:", err);
      showToastErr("Failed to submit payment proof. Please try again.");
    } finally {
      setSubmittingProof(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Floating Toast Error */}
      <AnimatePresence>
        {toastError && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-6 z-50 rounded-xl bg-destructive/10 border border-destructive/20 p-4 shadow-lg text-xs font-semibold text-destructive flex items-center gap-3"
          >
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{toastError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Success */}
      <AnimatePresence>
        {toastSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-24 right-6 z-50 rounded-xl bg-success/10 border border-success/20 p-4 shadow-lg text-xs font-semibold text-success flex items-center gap-3"
          >
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>{toastSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-16 lg:py-20 z-10 relative pt-32 text-center">
        {/* Background gradient decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Heading */}
        <div className="text-center flex flex-col items-center gap-3 mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" /> Transparent Pricing in Indian Rupee (₹)
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-black text-foreground tracking-tight leading-tight">
            Invest in your career. <br />
            <span className="gradient-text">Zero hidden fees.</span>
          </h1>
          <p className="text-xs.5 sm:text-sm text-muted-foreground max-w-xl mt-2 leading-relaxed">
            Scan dynamic pre-filled UPI QR codes via GPay, PhonePe, Paytm, or BHIM. Instant activation upon verification.
          </p>
        </div>

        {/* Pending Verification Banner */}
        {pendingPayment && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-14 bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20 shadow-sm text-left"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <span className="text-xl">⏳</span>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-foreground">
                    Payment Verification Pending
                  </h3>
                  <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/15 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    Under Review
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Payment submitted. Verification usually takes 1–6 hours. You will receive access once approved by administration.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* PRICING CARDS GRID */}
        <div className={`grid grid-cols-1 ${hasUsedIntro ? "lg:grid-cols-3 max-w-5xl" : "md:grid-cols-2 lg:grid-cols-4 max-w-7xl"} gap-6 md:gap-6 items-stretch mb-20 mx-auto text-left`}>
          
          {/* PLAN 1: FREE */}
          <div className="bg-card rounded-3xl p-7 border border-border/80 flex flex-col justify-between hover:border-primary/30 transition-all shadow-sm">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Free Tier</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-foreground">₹0</span>
                <span className="text-xs text-muted-foreground font-medium">/ forever</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6 min-h-[32px]">Explore project directory and standard listings.</p>
              
              <ul className="flex flex-col gap-3 text-xs mb-8 text-foreground">
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Browse Project Catalog</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Basic Profile Listing</li>
                <li className="flex items-center gap-2.5 text-muted-foreground"><X className="h-4 w-4 text-muted-foreground/50 shrink-0" /> Verified Pro Badge</li>
                <li className="flex items-center gap-2.5 text-muted-foreground"><X className="h-4 w-4 text-muted-foreground/50 shrink-0" /> Direct Client Messaging</li>
              </ul>
            </div>

            <button
              disabled={currentSubscription === "BASIC"}
              className={`w-full rounded-xl py-3 text-xs font-bold transition-all border ${
                currentSubscription === "BASIC" 
                  ? "border-primary text-primary bg-primary/10" 
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {currentSubscription === "BASIC" ? "Current Plan" : "Free Plan"}
            </button>
          </div>

          {/* PLAN 2: INTRO OFFER (₹1 - Hidden permanently if used) */}
          {!hasUsedIntro && (
            <div className="bg-gradient-to-b from-amber-500/10 to-card rounded-3xl p-7 border border-amber-500/30 flex flex-col justify-between relative shadow-sm hover:border-amber-500/50 transition-all">
              <span className="absolute top-4 right-4 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[8px] font-bold text-amber-500 uppercase tracking-wider">
                First Month
              </span>
              
              <div className="mt-1">
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> ₹1 Intro Offer
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-foreground">₹1</span>
                  <span className="text-xs text-amber-500 font-semibold">/ 30 Days</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6 min-h-[32px]">₹1 First-Month Introduction Offer to test all Pro features.</p>
                
                <ul className="flex flex-col gap-3 text-xs mb-8 text-foreground">
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Full 30-Day Pro Access</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Unlimited Project Bids</li>
                  <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Verified Pro Badge</li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan({
                  id: "INTRO",
                  name: "₹1 First-Month Intro Offer",
                  amount: 1,
                  billingText: "₹1.00 one-time",
                })}
                className="w-full rounded-xl py-3 text-xs font-bold transition-all bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm cursor-pointer"
              >
                Claim ₹1 Offer
              </button>
            </div>
          )}

          {/* PLAN 3: PRO MONTHLY (₹299) */}
          <div className="bg-card rounded-3xl p-7 border-2 border-primary relative flex flex-col justify-between shadow-lg transform md:-translate-y-2">
            <div className="absolute -top-3.5 inset-x-0 flex justify-center">
              <span className="rounded-full bg-primary px-3.5 py-1 text-[9px] font-bold text-primary-foreground uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            </div>
            
            <div className="mt-2">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1">
                <Crown className="h-3.5 w-3.5" /> Pro Monthly
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-foreground">₹299</span>
                <span className="text-xs text-muted-foreground font-medium">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6 min-h-[32px]">Full Pro privileges for active freelance developers.</p>
              
              <ul className="flex flex-col gap-3 text-xs mb-8 text-foreground">
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-primary shrink-0" /> Unlimited Project Proposals</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-primary shrink-0" /> Verified Pro Badge</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-primary shrink-0" /> Direct Client Messaging</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-primary shrink-0" /> Zero Platform Commission</li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan({
                id: "PRO_MONTHLY",
                name: "Pro Monthly",
                amount: 299,
                billingText: "₹299.00 / month",
              })}
              className="w-full rounded-xl py-3 text-xs font-bold transition-all bg-primary text-primary-foreground hover:bg-primary/95 shadow-md cursor-pointer"
            >
              Subscribe ₹299/mo
            </button>
          </div>

          {/* PLAN 4: PRO YEARLY (₹2500) */}
          <div className="bg-card rounded-3xl p-7 border border-secondary/30 flex flex-col justify-between hover:border-secondary transition-all shadow-sm">
            <span className="absolute top-4 right-4 rounded-full bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 text-[8px] font-bold text-secondary uppercase tracking-wider">
              Save ₹1,088
            </span>
            
            <div className="mt-1">
              <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Pro Annual
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-foreground">₹2,500</span>
                <span className="text-xs text-muted-foreground font-medium">/ year</span>
              </div>
              <p className="text-xs text-success font-bold mb-6 min-h-[32px]">Best long-term value for serious software developers.</p>
              
              <ul className="flex flex-col gap-3 text-xs mb-8 text-foreground">
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Everything in Pro Monthly</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Full 1-Year Membership</li>
                <li className="flex items-center gap-2.5"><Check className="h-4 w-4 text-success shrink-0" /> Priority Support</li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan({
                id: "PRO_YEARLY",
                name: "Pro Annual",
                amount: 2500,
                billingText: "₹2,500.00 / year",
              })}
              className="w-full rounded-xl py-3 text-xs font-bold transition-all bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm cursor-pointer"
            >
              Subscribe ₹2,500/yr
            </button>
          </div>

        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16 text-left">
          <h2 className="text-xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {[
              { q: "How does the pre-filled UPI QR code work?", a: "When you choose a plan, our system renders a QR code encoded with the exact plan amount in Indian Rupees (₹). Scanning via any UPI app pre-fills the amount with zero typing errors." },
              { q: "How long does manual verification take?", a: "After you submit your 12-digit UPI Transaction ID / UTR, verification typically takes between 1 and 6 hours." },
              { q: "Can I use the ₹1 Intro offer more than once?", a: "No. The ₹1 introductory offer is strictly limited to one time per account." },
            ].map((faq, i) => (
              <div key={i} className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm">
                <h4 className="text-xs.5 font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* DYNAMIC UPI QR CODE PAYMENT MODAL */}
      <AnimatePresence>
        {qrModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setQrModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 md:p-8 text-center shadow-2xl relative z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setQrModalOpen(false)}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1 bg-muted rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center border-b border-border/60 pb-3 flex flex-col items-center gap-1">
                <DevBridgeLogo size="sm" />
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Step 1 of 2</span>
                <h3 className="text-xl font-bold text-foreground">Scan UPI & Pay</h3>
              </div>

              {/* Dynamic Amount Card */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex justify-between items-center text-left">
                <div>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider block">Selected Plan</span>
                  <span className="text-sm font-bold text-foreground">{selectedPlan.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-muted-foreground block font-bold uppercase tracking-wider">Amount</span>
                  <span className="text-2xl font-black text-primary">₹{selectedPlan.amount}</span>
                </div>
              </div>

              {/* Dynamic QR */}
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 w-fit mx-auto shadow-sm border border-border">
                <img 
                  src={getDynamicQrUrl(selectedPlan.amount)} 
                  alt={`DevBridge UPI QR Code ₹${selectedPlan.amount}`} 
                  className="w-44 h-44 rounded-xl object-contain"
                />
                <span className="text-[9px] font-bold text-success bg-success/10 border border-success/20 px-3 py-0.5 rounded-full">
                  ✓ Pre-filled with ₹{selectedPlan.amount}
                </span>
              </div>

              {/* 1-Click Deep Link */}
              <a 
                href={getUpiUrl(selectedPlan.amount)}
                className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Pay in UPI App (₹{selectedPlan.amount})
              </a>

              {/* Receiver Info */}
              <div className="bg-muted/40 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs text-left border border-border/70">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-primary" /> Receiver
                  </span>
                  <span className="font-bold text-foreground">{RECEIVER_NAME}</span>
                </div>

                <div className="flex justify-between items-center pt-0.5">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">UPI ID</span>
                    <span className="font-mono text-foreground font-bold text-xs">{UPI_ID}</span>
                  </div>
                  <button 
                    onClick={handleCopyUpi} 
                    className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground font-bold hover:bg-muted transition-colors flex items-center gap-1.5 text-xs shadow-sm cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedUpi ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  onClick={handleDownloadQr}
                  className="rounded-xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download QR
                </button>
                
                <button
                  onClick={() => {
                    setQrModalOpen(false);
                    setProofModalOpen(true);
                  }}
                  className="rounded-xl bg-foreground text-background py-3 text-xs font-bold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  I&apos;ve Paid →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAYMENT PROOF FORM MODAL */}
      <AnimatePresence>
        {proofModalOpen && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setProofModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 md:p-8 text-left shadow-2xl relative z-10 flex flex-col gap-5"
            >
              <button 
                onClick={() => setProofModalOpen(false)}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors p-1 bg-muted rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pr-6">
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Step 2 of 2</span>
                <h3 className="text-xl font-bold text-foreground mt-1 mb-1">Confirm Payment</h3>
                <p className="text-xs text-muted-foreground">
                  Confirm your payment for <strong className="text-foreground">{selectedPlan.name} (₹{selectedPlan.amount})</strong>.
                </p>
              </div>

              <form onSubmit={handleSubmitPaymentProof} className="flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                    UPI Transaction ID / UTR <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 420192837192"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-sm"
                  />
                  <span className="text-[10px] text-muted-foreground block">Enter the 12-digit UTR/Txn number from your payment receipt.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                    Payment Screenshot (Optional)
                  </label>
                  <div className="border-2 border-dashed border-border/80 rounded-xl p-5 text-center hover:bg-muted/40 transition-colors cursor-pointer relative bg-background">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                      <Upload className="h-5 w-5 text-primary mb-0.5" />
                      <span className="font-semibold">{screenshotBase64 ? "Screenshot attached! Click to change." : "Upload payment screenshot"}</span>
                    </div>
                  </div>
                  {screenshotBase64 && (
                    <div className="mt-2 text-center">
                      <img src={screenshotBase64} alt="Screenshot Preview" className="h-20 w-auto rounded-lg mx-auto border border-border shadow-sm object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProofModalOpen(false);
                      setQrModalOpen(true);
                    }}
                    className="flex-1 rounded-xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {submittingProof ? "Submitting..." : "Submit Proof"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
