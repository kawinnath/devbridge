"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Moon, Menu, X, ChevronDown, User, LogOut, 
  MessageSquare, Shield, CreditCard, LayoutDashboard,
  Briefcase, Code2, ArrowRight
} from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme, role, isLoggedIn, setIsLoggedIn, user } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const isAdminUser = user?.role === "ADMIN" || role === "ADMIN";

  const getDashboardLink = () => {
    if (user?.role === "ADMIN" || role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "CLIENT" || role === "CLIENT") return "/client/dashboard";
    return "/developer/dashboard";
  };

  const getProfileLink = () => {
    if (user?.id) {
      if (user?.role === "CLIENT") return `/client/profile/${user.id}`;
      return `/developer/profile/${user.id}`;
    }
    return getDashboardLink();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsLoggedIn(false);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.setItem("isLoggedIn", "false");
    } catch (_) {}
    window.location.href = "/";
  };

  const searchParamsGet = (key: string) => {
    if (typeof window === "undefined") return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  };

  const isLinkActive = (path: string) => {
    if (path === "/projects" && pathname === "/projects" && !searchParamsGet("tab")) return true;
    if (path === "/projects?tab=developers" && pathname === "/projects" && searchParamsGet("tab") === "developers") return true;
    if (path === "/pricing" && pathname === "/pricing") return true;
    if (path === "/chat" && pathname === "/chat") return true;
    return false;
  };

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 flex justify-center">
      <motion.nav 
        ref={navRef}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`w-full max-w-7xl rounded-full transition-all duration-300 ${
          scrolled 
            ? "glass-nav shadow-lg shadow-black/[0.03] py-2 sm:py-2.5" 
            : "bg-card/70 dark:bg-card/60 backdrop-blur-md border border-border/80 py-3 sm:py-3.5"
        }`}
      >
        <div className="px-4 sm:px-6 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <DevBridgeLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {[
              { label: "Find Projects", href: "/projects" },
              { label: "Developers", href: "/projects?tab=developers" },
              { label: "Pricing", href: "/pricing" },
              ...(isLoggedIn ? [{ label: "Chat", href: "/chat" }] : []),
              ...(isLoggedIn ? [{ label: "Dashboard", href: getDashboardLink() }] : []),
            ].map((link) => {
              const active = isLinkActive(link.href) || pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-1 py-1 text-xs font-semibold tracking-wide transition-colors ${
                    active ? "text-primary dark:text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span 
                      layoutId="activeNavIndicator"
                      className="absolute left-0 bottom-0 h-[2px] w-full bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isLoggedIn && isAdminUser ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                >
                  <Shield className="h-3.5 w-3.5" /> Admin Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-muted p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/chat"
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-colors relative"
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
                
                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-secondary p-[1.5px] shadow-sm hover:scale-105 transition-all cursor-pointer"
                    aria-label="User menu"
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-xs font-bold text-foreground uppercase border border-background">
                      {user?.name ? user.name.substring(0, 2) : (user?.role || "U").substring(0, 1)}
                    </div>
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 text-left"
                      >
                        <div className="border-b border-border/60 px-3 py-2.5 mb-1">
                          <div className="text-xs font-bold text-foreground truncate">{user?.name || "Verified Member"}</div>
                          <div className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-extrabold text-primary uppercase tracking-wider">
                              {user?.role || role}
                            </span>
                            <span className="text-[8px] font-bold text-success uppercase">
                              {user?.subscription || "Free Tier"}
                            </span>
                          </div>
                        </div>
                        
                        <Link
                          href={getDashboardLink()}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 text-primary" /> Workspace Dashboard
                        </Link>

                        <Link
                          href={getProfileLink()}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="h-3.5 w-3.5 text-secondary" /> My Public Profile
                        </Link>

                        <Link
                          href="/pricing"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <CreditCard className="h-3.5 w-3.5 text-accent" /> Manage Subscription
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors mt-1 border-t border-border/50 pt-2 cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth"
                  className="text-xs font-semibold text-foreground px-3.5 py-1.5 hover:text-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth?signup=true"
                  className="group flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Get Started <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Theme Controls */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Dedicated Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-3 right-3 z-40 rounded-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-2xl md:hidden flex flex-col gap-3 text-left"
          >
            <Link 
              href="/projects" 
              className="text-xs font-semibold text-foreground py-2.5 px-3 rounded-xl hover:bg-muted flex items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Briefcase className="h-4 w-4 text-primary" /> Find Projects
            </Link>
            <Link 
              href="/projects?tab=developers" 
              className="text-xs font-semibold text-foreground py-2.5 px-3 rounded-xl hover:bg-muted flex items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Code2 className="h-4 w-4 text-secondary" /> Hire Developers
            </Link>
            <Link 
              href="/pricing" 
              className="text-xs font-semibold text-foreground py-2.5 px-3 rounded-xl hover:bg-muted flex items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CreditCard className="h-4 w-4 text-accent" /> Pricing
            </Link>

            {isLoggedIn && (
              <>
                <Link 
                  href="/chat" 
                  className="text-xs font-semibold text-foreground py-2.5 px-3 rounded-xl hover:bg-muted flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4 text-primary" /> Chat Messages
                </Link>
                <Link 
                  href={getDashboardLink()} 
                  className="text-xs font-semibold text-foreground py-2.5 px-3 rounded-xl hover:bg-muted flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 text-secondary" /> Workspace Dashboard
                </Link>
                <Link 
                  href={getProfileLink()} 
                  className="text-xs font-semibold text-foreground py-2.5 px-3 rounded-xl hover:bg-muted flex items-center gap-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-accent" /> Public Profile
                </Link>
                
                <div className="pt-2 border-t border-border/60 mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            )}

            {!isLoggedIn && (
              <div className="flex flex-col gap-2 pt-3 border-t border-border/60 mt-1">
                <Link
                  href="/auth"
                  className="flex w-full items-center justify-center rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?signup=true"
                  className="flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
