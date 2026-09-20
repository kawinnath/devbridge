"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Sparkles, ArrowRight, CheckCircle2, KeyRound, Building2, Code2, ShieldCheck
} from "lucide-react";

function AuthForm() {
  const { setUser, user, isLoggedIn } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<"role" | "form">("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRoleState] = useState<"CLIENT" | "DEVELOPER">("DEVELOPER");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password flow
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotOtpHint, setForgotOtpHint] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Handle ?signup=true query param
  useEffect(() => {
    if (searchParams.get("signup") === "true") {
      setIsSignUp(true);
      setSignUpStep("role");
    }
  }, [searchParams]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      const target = user.profileCompleted === false
        ? "/onboarding"
        : user.role === "CLIENT"
        ? "/client/dashboard"
        : user.role === "ADMIN"
        ? "/admin/dashboard"
        : "/developer/dashboard";
      router.replace(target);
    }
  }, [isLoggedIn, user, router]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Email address and password are required.");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);
      setError("");
      setSuccessMsg("Creating your account...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name || email.split("@")[0],
            email: email.trim(),
            password,
            confirmPassword,
            role: selectedRole,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const regData = await regRes.json();

        if (!regRes.ok) {
          setSuccessMsg("");
          setError(regData.error || "Registration failed. Please try again.");
          setLoading(false);
          return;
        }

        setUser(regData);
        setSuccessMsg("Account created successfully! Redirecting to complete your profile...");
        
        setTimeout(() => {
          window.location.href = "/onboarding";
        }, 350);
      } catch (err: any) {
        clearTimeout(timeoutId);
        setSuccessMsg("");
        if (err.name === "AbortError") {
          setError("Account creation timed out. Please check your connection.");
        } else {
          setError("Network error connecting to registration server. Please try again.");
        }
        setLoading(false);
      }
    } else {
      setLoading(true);
      setError("");
      setSuccessMsg("Processing sign in...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json();
        
        if (!res.ok) {
          setSuccessMsg("");
          setError(data.error || "Invalid email or password. Please try again.");
          setLoading(false);
        } else {
          setUser(data);
          
          let targetUrl: string;
          if (data.profileCompleted === false) {
            targetUrl = "/onboarding";
            setSuccessMsg("Login Successful! Redirecting to complete your profile...");
          } else if (data.role === "CLIENT") {
            targetUrl = "/client/dashboard";
            setSuccessMsg("Login Successful! Redirecting to client dashboard...");
          } else if (data.role === "ADMIN") {
            targetUrl = "/admin/dashboard";
            setSuccessMsg("Login Successful! Redirecting to admin console...");
          } else {
            targetUrl = "/developer/dashboard";
            setSuccessMsg("Login Successful! Redirecting to developer workspace...");
          }

          setTimeout(() => {
            window.location.href = targetUrl;
          }, 400);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        setSuccessMsg("");
        if (err.name === "AbortError") {
          setError("Authentication timed out. Please check your connection.");
        } else {
          setError("Network error connecting to authentication server. Please try again.");
        }
        setLoading(false);
      }
    }
  };

  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND", email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset code.");
      } else {
        setSuccessMsg("Reset code sent! Check your inbox.");
        if (data.devOtp) setForgotOtpHint(data.devOtp);
        setForgotStep("reset");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !forgotOtp || !newPassword || !confirmNewPassword) return;

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET",
          email,
          code: forgotOtp,
          password: newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setSuccessMsg("Password reset successfully! Please sign in with your new password.");
        setIsForgotPassword(false);
        setForgotStep("email");
        setPassword("");
        setConfirmPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setForgotOtp("");
      }
    } catch (err) {
      setError("Failed to verify reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Left Marketing Panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-50 dark:bg-[#070b16] p-12 lg:p-16 relative overflow-hidden border-r border-border/60">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-2 mb-16 cursor-pointer" onClick={() => router.push('/')}>
            <DevBridgeLogo size="md" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md"
          >
            <h1 className="text-3xl lg:text-4.5xl font-extrabold text-foreground leading-tight tracking-tight mb-5">
              Build the future of technology <br />
              <span className="gradient-text">together.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-10">
              DevBridge connects skilled developers with real-world projects from clients around the world.
            </p>

            <div className="space-y-5">
              {[
                { icon: ShieldCheck, title: "Verified Professional Profiles", desc: "Showcase real work, skills, and portfolio history." },
                { icon: Sparkles, title: "Direct Client Connections", desc: "Collaborate directly without intermediaries." },
                { icon: KeyRound, title: "Zero Platform Commission", desc: "Developers receive 100% of their project payout." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-xl bg-card border border-border/80 flex items-center justify-center shrink-0 shadow-sm">
                    <item.icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs.5 font-bold text-foreground mb-0.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-12">
          <span>© DevBridge Technologies</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 bg-background relative z-10">
        <div className="w-full max-w-sm mx-auto text-left">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8 cursor-pointer" onClick={() => router.push('/')}>
            <DevBridgeLogo size="md" />
          </div>
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-2.5xl font-extrabold text-foreground tracking-tight mb-1.5">
              {isForgotPassword
                ? "Reset password"
                : isSignUp
                ? "Create an account"
                : "Welcome back"}
            </h2>
            <p className="text-xs text-muted-foreground font-normal">
              {isSignUp ? "Select your role to get started." : "Enter your credentials to access your account."}
            </p>
          </div>

          {/* Alert messages */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2.5"
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold flex items-center gap-2.5"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={isForgotPassword ? "forgot" : isSignUp ? (signUpStep === "role" ? "signup-role" : "signup-form") : "login"}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {isForgotPassword ? (
                /* Forgot Password flow */
                forgotStep === "email" ? (
                  <form onSubmit={handleForgotSendOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email address</label>
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 mt-2 cursor-pointer"
                    >
                      {loading ? "Sending..." : "Send reset code"}
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="text-center text-xs text-muted-foreground mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        Back to sign in
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleForgotReset} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">6-Digit OTP Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="123456"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                      {forgotOtpHint && (
                        <span className="text-[10px] text-warning mt-1.5 block font-bold">
                          Verification OTP: {forgotOtpHint}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm new password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 mt-2 cursor-pointer"
                    >
                      {loading ? "Updating..." : "Reset password"}
                    </button>
                  </form>
                )
              ) : isSignUp && signUpStep === "role" ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    {[
                      { 
                        value: "DEVELOPER", 
                        title: "I'm a Software Developer", 
                        desc: "Apply to real client projects & build software",
                        icon: Code2
                      },
                      { 
                        value: "CLIENT", 
                        title: "I'm a Project Client", 
                        desc: "Post technology projects & hire talent",
                        icon: Building2
                      },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setSelectedRoleState(item.value as any);
                          setSignUpStep("form");
                        }}
                        className="w-full text-left p-4 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all group flex items-start gap-3.5 cursor-pointer"
                      >
                        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <item.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="text-xs.5 font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                            {item.title}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="text-center text-xs text-muted-foreground mt-4">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotStep("email");
                            setError("");
                            setSuccessMsg("");
                          }}
                          className="text-[11px] text-primary font-bold hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {isSignUp && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {loading ? "Processing..." : (isSignUp ? "Create account" : "Sign in")}
                  </button>

                  <div className="text-center text-xs text-muted-foreground mt-6">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        if (isSignUp) {
                          setIsSignUp(false);
                        } else {
                          setIsSignUp(true);
                          setSignUpStep("role");
                        }
                        setError("");
                        setSuccessMsg("");
                      }}
                      className="text-primary font-bold hover:underline cursor-pointer"
                    >
                      {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="animate-pulse text-xs text-muted-foreground">Loading authentication...</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
