"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ProfessionalLinks from "@/components/ui/ProfessionalLinks";
import { 
  ShieldCheck, MapPin, Building2,
  ExternalLink, Edit, Save, X, Globe, FileText, Phone, Briefcase
} from "lucide-react";

export default function ClientProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { user: loggedInUser, isLoggedIn } = useTheme();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [phone, setPhone] = useState("");

  const isOwner = isLoggedIn && loggedInUser && loggedInUser.id === id;

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch(`/api/client/profile/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setClient(data);
      setNotFound(false);

      setCompanyName(data.companyName || "");
      setCompanyDescription(data.companyDescription || "");
      setIndustry(data.industry || "");
      setLocation(data.location || "");
      setCompanyWebsite(data.companyWebsite || "");
      setPhone(data.phone || "");
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  async function handleSave() {
    try {
      setSaving(true);
      const payload = {
        companyName,
        companyDescription,
        industry,
        location,
        phone,
        companyWebsite,
      };

      const res = await fetch(`/api/client/profile/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditing(false);
        await fetchProfile();
      } else {
        alert("Failed to save profile. Please check validation rules.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center text-xs text-muted-foreground bg-background">
        <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
        Loading client profile...
      </div>
    );
  }

  if (notFound || !client) {
    return (
      <div className="relative min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-6 py-20 text-center relative z-10">
          <Building2 className="h-16 w-16 text-destructive mb-6 animate-pulse" />
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Client Profile Not Found</h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            The profile you are looking for does not exist or has been removed.
          </p>
          <button 
            onClick={() => router.push("/projects")}
            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition shadow-sm cursor-pointer"
          >
            Browse Marketplace
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-10 z-10 relative pt-24 text-left">
        {/* Cover Banner */}
        <div className="w-full h-44 rounded-2xl bg-gradient-to-r from-primary via-indigo-900 to-secondary border border-border/60 relative overflow-hidden flex items-end p-6 mb-8 shadow-sm">
          <div className="absolute inset-0 bg-black/10" />
          {isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-background/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-foreground hover:bg-background transition shadow-md cursor-pointer"
            >
              <Edit className="h-4 w-4" /> Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Details column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="glass-card-premium rounded-2xl p-6 border border-border/80 text-center flex flex-col items-center gap-4 relative -mt-20 z-10 bg-card">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-md flex items-center justify-center">
                <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-2xl font-bold text-foreground uppercase border border-background">
                  {client.avatar ? client.avatar.substring(0, 2) : (client.companyName || "C").substring(0, 2)}
                </div>
              </div>

              {isEditing ? (
                <div className="w-full space-y-3 text-left">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company Name</label>
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                    <input 
                      type="text" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Industry</label>
                    <input 
                      type="text" 
                      value={industry} 
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company Website</label>
                    <input 
                      type="url" 
                      value={companyWebsite} 
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5 justify-center">
                    {client.companyName || client.name}
                    {client.verifiedPro && (
                      <ShieldCheck className="h-4.5 w-4.5 text-success" />
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">{client.industry || "Technology & Business"}</p>
                  {client.location && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1 justify-center font-medium">
                      <MapPin className="h-3 w-3" /> {client.location}
                    </p>
                  )}
                </div>
              )}

              {/* Trust Score */}
              <div className="border-t border-border/60 w-full pt-4 mt-1 flex flex-col items-center justify-center gap-2">
                <div className="text-sm font-extrabold text-primary flex items-center gap-1">
                  Trust Score: {client.trustScore || 80}%
                </div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider bg-muted px-2.5 py-1 rounded-full">
                  Verified Client Account
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <ProfessionalLinks
              links={client.socialLinks || { github: client.github, linkedin: client.linkedin }}
              isEditable={Boolean(isOwner)}
              role={client.role}
              onSave={async (updatedLinks) => {
                await fetch(`/api/client/profile/${client.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ socialLinks: updatedLinks }),
                });
                fetchProfile();
              }}
            />
          </div>

          {/* Right Core Details Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card-premium rounded-2xl p-6 sm:p-7 border border-border/80 text-left flex flex-col gap-4 bg-card">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
                <FileText className="h-4.5 w-4.5 text-primary" /> Company Overview
              </h3>
              {isEditing ? (
                <div>
                  <textarea 
                    value={companyDescription}
                    rows={6}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none shadow-sm"
                  />
                </div>
              ) : (
                <p className="text-xs.5 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {client.companyDescription || "No detailed company overview provided yet."}
                </p>
              )}
            </div>
            
            {!isEditing && client.companyWebsite && (
              <div className="glass-card-premium rounded-2xl p-6 border border-border/80 text-left flex flex-col gap-3 bg-card">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-emerald-500" /> Official Website
                </h3>
                <a 
                  href={client.companyWebsite.startsWith("http") ? client.companyWebsite : `https://${client.companyWebsite}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  {client.companyWebsite} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Save bar when editing */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {saving ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
