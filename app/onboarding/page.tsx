"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import { Upload, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import DevBridgeLogo from "@/components/ui/DevBridgeLogo";

export default function OnboardingPage() {
  const { user, isLoggedIn } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Developer fields
  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [resumeBase64, setResumeBase64] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [portfolio, setPortfolio] = useState("");
  
  // Client fields
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  
  // Shared fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
    } else if (user) {
      setName(user.name || "");
      if (user.profileCompleted) {
        router.replace(user.role === "DEVELOPER" ? "/developer/dashboard" : "/client/dashboard");
      }
    }
  }, [isLoggedIn, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, DOC, or DOCX.");
      return;
    }

    setResumeFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      setResumeBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        name,
        location,
        phone,
        linkedin,
        avatar
      };

      if (user?.role === "DEVELOPER") {
        payload.title = title;
        payload.skills = skills;
        payload.experience = experience;
        payload.bio = bio;
        payload.github = github;
        payload.portfolio = portfolio;
        payload.resumeUrl = resumeBase64;
      } else {
        payload.companyName = companyName;
        payload.companyDescription = companyDescription;
        payload.industry = industry;
        payload.companyWebsite = companyWebsite;
        payload.github = github; // optional for client
      }

      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      window.location.href = user?.role === "DEVELOPER" ? "/developer/dashboard" : "/client/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.profileCompleted) {
    return null;
  }

  const isDev = user.role === "DEVELOPER";

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 relative flex flex-col justify-center">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto w-full relative z-10">
        <div className="flex justify-center mb-8">
          <DevBridgeLogo size="md" />
        </div>

        <div className="glass-card-premium rounded-3xl overflow-hidden shadow-2xl border border-border/80 bg-card">
          <div className="bg-gradient-to-r from-primary to-secondary py-10 px-8 sm:px-10 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white mb-3">
                <Sparkles className="h-3 w-3" /> Step 2: Custom Profile
              </span>
              <h2 className="text-2.5xl font-extrabold tracking-tight">Complete Your Profile</h2>
              <p className="mt-1.5 text-xs text-white/80 leading-relaxed font-normal">
                Tell us more about yourself to get started as a {isDev ? "Developer" : "Client"} on the DevBridge network.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8 text-left">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4.5 rounded-2xl flex items-center text-xs.5 font-semibold">
                <AlertCircle className="h-4.5 w-4.5 mr-3 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b pb-2 border-border/60">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Full Name *</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number *</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Location *</label>
                  <input required type="text" placeholder="e.g. Bangalore, India or San Francisco, CA" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                </div>
              </div>
            </div>

            {isDev ? (
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b pb-2 border-border/60">
                  Professional Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Professional Title *</label>
                    <input required type="text" placeholder="e.g. Senior Frontend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Skills (comma separated) *</label>
                    <input required type="text" placeholder="React, Node.js, TypeScript, PostgreSQL" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Experience Summary *</label>
                    <input required type="text" placeholder="e.g. 5+ years building SaaS interfaces" value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Bio *</label>
                    <textarea required rows={4} placeholder="Brief description of your background, tech stacks, and domain expertise..." value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-3 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground resize-none shadow-sm" />
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b pb-2 border-border/60 mt-8">
                  Links & Resume
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">LinkedIn Profile (HTTPS) *</label>
                    <input required type="url" placeholder="https://linkedin.com/in/username" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">GitHub Profile (HTTPS) *</label>
                    <input required type="url" placeholder="https://github.com/username" value={github} onChange={(e) => setGithub(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Portfolio Website (Optional)</label>
                    <input type="url" placeholder="https://yourportfolio.com" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Resume Upload (PDF/DOC/DOCX, Max 10MB) *</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border/80 border-dashed rounded-2xl cursor-pointer bg-background hover:bg-muted/40 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {resumeFileName ? (
                            <>
                              <CheckCircle className="w-8 h-8 mb-2 text-success" />
                              <p className="text-xs text-foreground font-bold">{resumeFileName}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground font-medium"><span className="text-primary font-bold">Click to upload</span> or drag and drop</p>
                            </>
                          )}
                        </div>
                        <input required={!resumeBase64} type="file" className="hidden" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b pb-2 border-border/60">
                  Company Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Company Name *</label>
                    <input required type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Industry *</label>
                    <input required type="text" placeholder="e.g. Fintech, E-commerce" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Company Description *</label>
                    <textarea required rows={4} placeholder="Describe your company, products, and tech initiatives..." value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} className="w-full px-4 py-3 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground resize-none shadow-sm" />
                  </div>
                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground border-b pb-2 border-border/60 mt-8">
                  Links
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Company Website (HTTPS) *</label>
                    <input required type="url" placeholder="https://yourcompany.com" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">LinkedIn Company Page (HTTPS) *</label>
                    <input required type="url" placeholder="https://linkedin.com/company/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">GitHub Organization (HTTPS, Optional)</label>
                    <input type="url" placeholder="https://github.com/your-org" value={github} onChange={(e) => setGithub(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-xs.5 text-foreground shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-border/60">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-xs"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Complete Profile Setup"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
