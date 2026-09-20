"use client";

import React from "react";
import Link from "next/link";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";
import { ShieldCheck, Globe, ArrowRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border/80 relative z-10 text-left">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
          
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <DevBridgeLogo size="md" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              The premium global network connecting world-class talent with forward-thinking businesses. Flat subscription pricing, verified portfolios, and direct payouts.
            </p>
            <div className="flex items-center gap-3 text-muted-foreground mt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-9 w-9 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300" 
                aria-label="GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-9 w-9 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300" 
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a 
                href="https://google.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-9 w-9 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300" 
                aria-label="Website"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Platform</h4>
            <Link href="/projects" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">Browse Projects <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link>
            <Link href="/projects?tab=developers" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">Hire Developers <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link>
            <Link href="/pricing" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">Pricing Plans <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link>
            <Link href="/auth?signup=true" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">Join Network <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link>
          </div>

          {/* Col 3: Company */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Company</h4>
            <Link href="/support" className="text-xs text-muted-foreground hover:text-primary transition-colors">Support Center</Link>
            <Link href="/pricing" className="text-xs text-muted-foreground hover:text-primary transition-colors">Pricing Info</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>

          {/* Col 4: Legal & Security */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Legal</h4>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="/copyright" className="text-xs text-muted-foreground hover:text-primary transition-colors">Copyright Claim</Link>
            <Link href="/support" className="text-xs text-muted-foreground hover:text-primary transition-colors">Help Desk</Link>
          </div>
        </div>

        <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} DevBridge Technologies. All rights reserved.</div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/5 border border-success/15">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span className="text-[10px] font-bold text-success uppercase tracking-wider">Verified Secure Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
