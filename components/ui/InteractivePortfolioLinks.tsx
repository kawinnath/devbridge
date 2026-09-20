"use client";

import React, { useState } from "react";
import { 
  Globe, ExternalLink, Plus, Edit2, Save, X, RotateCcw, 
  AlertCircle, CheckCircle2 
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";

interface InteractivePortfolioLinksProps {
  userId?: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  isOwner?: boolean;
  onUpdate?: () => void;
}

export default function InteractivePortfolioLinks({
  userId,
  githubUrl = "",
  linkedinUrl = "",
  websiteUrl = "",
  isOwner = false,
  onUpdate,
}: InteractivePortfolioLinksProps) {
  const [editing, setEditing] = useState(false);
  const [github, setGithub] = useState(githubUrl || "");
  const [linkedin, setLinkedin] = useState(linkedinUrl || "");
  const [website, setWebsite] = useState(websiteUrl || "");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractGithubUser = (url: string) => {
    try {
      const clean = url.replace(/\/$/, "");
      const parts = clean.split("/");
      return parts[parts.length - 1] || "github";
    } catch (_) { return "github"; }
  };

  const extractLinkedinUser = (url: string) => {
    try {
      const clean = url.replace(/\/$/, "");
      const parts = clean.split("/");
      return parts[parts.length - 1] || "linkedin";
    } catch (_) { return "linkedin"; }
  };

  const extractDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch (_) { return url.replace(/^https?:\/\//, ""); }
  };

  const validateUrl = (url: string, fieldName: string) => {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();
    if (!trimmed.startsWith("https://")) {
      return `${fieldName} must be a valid HTTPS URL starting with https://`;
    }
    try {
      new URL(trimmed);
    } catch (_) {
      return `Invalid ${fieldName} URL format.`;
    }
    return null;
  };

  const handleReset = () => {
    setGithub(githubUrl || "");
    setLinkedin(linkedinUrl || "");
    setWebsite(websiteUrl || "");
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ghErr = validateUrl(github, "GitHub URL");
    if (ghErr) { setError(ghErr); return; }

    const liErr = validateUrl(linkedin, "LinkedIn URL");
    if (liErr) { setError(liErr); return; }

    const webErr = validateUrl(website, "Portfolio Website URL");
    if (webErr) { setError(webErr); return; }

    if (!userId) {
      setError("User profile ID missing.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/developer/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialLinks: {
            github: github.trim(),
            linkedin: linkedin.trim(),
            portfolio: website.trim(),
            website: website.trim(),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save portfolio links.");
      }

      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const items = [
    {
      id: "github",
      name: "GitHub",
      url: githubUrl,
      icon: GithubIcon,
      accent: "text-purple-400 border-purple-500/20 bg-purple-500/5",
      btnText: "Open Profile",
      username: githubUrl ? `@${extractGithubUser(githubUrl)}` : null,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      url: linkedinUrl,
      icon: LinkedinIcon,
      accent: "text-blue-400 border-blue-500/20 bg-blue-500/5",
      btnText: "View LinkedIn Profile",
      username: linkedinUrl ? extractLinkedinUser(linkedinUrl) : null,
    },
    {
      id: "website",
      name: "Personal Website",
      url: websiteUrl,
      icon: Globe,
      accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      btnText: "Visit Website",
      username: websiteUrl ? extractDomain(websiteUrl) : null,
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 text-left backdrop-blur-xl shadow-xl flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-white/10 pb-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-gray-300 flex items-center gap-2">
          <Globe className="h-4 w-4 text-violet-400" /> Professional Portfolio & Links
        </h3>
        {isOwner && (
          <button
            onClick={() => {
              if (editing) handleReset();
              setEditing(!editing);
            }}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 transition flex items-center gap-1"
          >
            {editing ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Edit2 className="h-3.5 w-3.5" /> Edit Links</>}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-gray-300" /> GitHub URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/username"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block flex items-center gap-1.5">
                <LinkedinIcon className="h-3.5 w-3.5 text-blue-400" /> LinkedIn URL
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-400" /> Portfolio Website URL
              </label>
              <input
                type="url"
                placeholder="https://username.dev"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            const hasUrl = Boolean(item.url && item.url.trim() !== "");

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  hasUrl ? item.accent : "border-white/5 bg-white/5 opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    {hasUrl ? (
                      <span className="text-[10px] text-gray-400 font-mono block line-clamp-1">
                        {item.username}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 italic block">
                        Not Added
                      </span>
                    )}
                  </div>
                </div>

                {hasUrl ? (
                  <a
                    href={item.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-bold text-white hover:bg-white/20 transition flex items-center gap-1 flex-shrink-0"
                  >
                    <span>{item.btnText}</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                ) : isOwner ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-xs font-bold text-violet-300 hover:bg-violet-600/30 transition flex items-center gap-1 flex-shrink-0"
                  >
                    <Plus className="h-3 w-3" /> Add Link
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-600 font-semibold px-2 py-1 bg-white/5 rounded-md">
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
