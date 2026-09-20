"use client";

import React, { useState } from "react";
import { 
  Globe, ExternalLink, Copy, Check, Link2, 
  Code2, FileText, Share2, AlertCircle
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";

interface ProfessionalLinksProps {
  links: Record<string, string>;
  isEditable?: boolean;
  onSave?: (updatedLinks: Record<string, string>) => Promise<void>;
  role?: "DEVELOPER" | "CLIENT";
}

const PLATFORM_CONFIGS: Record<string, { label: string; placeholder: string; icon: React.ElementType; color: string }> = {
  linkedin: { label: "LinkedIn", placeholder: "https://linkedin.com/in/username", icon: LinkedinIcon, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  github: { label: "GitHub", placeholder: "https://github.com/username", icon: GithubIcon, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  gitlab: { label: "GitLab", placeholder: "https://gitlab.com/username", icon: Code2, color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
  stackoverflow: { label: "Stack Overflow", placeholder: "https://stackoverflow.com/users/id", icon: Code2, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  portfolio: { label: "Portfolio Website", placeholder: "https://myportfolio.com", icon: Globe, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  website: { label: "Company / Personal Website", placeholder: "https://mywebsite.com", icon: Globe, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  behance: { label: "Behance", placeholder: "https://behance.net/username", icon: Globe, color: "text-blue-300 border-blue-400/30 bg-blue-400/10" },
  dribbble: { label: "Dribbble", placeholder: "https://dribbble.com/username", icon: Globe, color: "text-pink-400 border-pink-500/30 bg-pink-500/10" },
  medium: { label: "Medium", placeholder: "https://medium.com/@username", icon: FileText, color: "text-gray-300 border-gray-500/30 bg-gray-500/10" },
  twitter: { label: "X (Twitter)", placeholder: "https://x.com/username", icon: Share2, color: "text-sky-400 border-sky-500/30 bg-sky-500/10" },
  instagram: { label: "Instagram", placeholder: "https://instagram.com/username", icon: Share2, color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  youtube: { label: "YouTube", placeholder: "https://youtube.com/@channel", icon: Share2, color: "text-red-400 border-red-500/30 bg-red-500/10" },
};

export default function ProfessionalLinks({
  links = {},
  isEditable = false,
  onSave,
  role = "DEVELOPER",
}: ProfessionalLinksProps) {
  const [editing, setEditing] = useState(false);
  const [formLinks, setFormLinks] = useState<Record<string, string>>(links);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const activePlatformKeys = role === "DEVELOPER"
    ? ["linkedin", "github", "gitlab", "stackoverflow", "portfolio", "website", "behance", "dribbble", "medium", "twitter"]
    : ["website", "linkedin", "github", "portfolio", "twitter", "instagram", "youtube"];

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPlatform(key);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate HTTPS URLs
    for (const [key, url] of Object.entries(formLinks)) {
      if (url && url.trim() !== "") {
        const trimmed = url.trim();
        if (!trimmed.startsWith("https://")) {
          setError(`Invalid URL for ${PLATFORM_CONFIGS[key]?.label || key}. URL must start with https://`);
          return;
        }
      }
    }

    if (onSave) {
      setSaving(true);
      try {
        await onSave(formLinks);
        setEditing(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Failed to save links.");
        } else {
          setError("Failed to save links.");
        }
      } finally {
        setSaving(false);
      }
    }
  };

  const hasAnyLink = activePlatformKeys.some((k) => links[k] && links[k].trim() !== "");

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 text-left backdrop-blur-xl shadow-xl">
      <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-gray-300 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-violet-400" /> Professional Links
        </h3>
        {isEditable && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 transition"
          >
            {editing ? "Cancel" : "Edit Links"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlatformKeys.map((key) => {
              const conf = PLATFORM_CONFIGS[key];
              if (!conf) return null;
              const Icon = conf.icon;
              return (
                <div key={key}>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-gray-300" /> {conf.label}
                  </label>
                  <input
                    type="url"
                    placeholder={conf.placeholder}
                    value={formLinks[key] || ""}
                    onChange={(e) => setFormLinks({ ...formLinks, [key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 placeholder-gray-500 font-mono"
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white hover:from-violet-500 hover:to-indigo-500 transition shadow-lg mt-2 disabled:opacity-50"
          >
            {saving ? "Saving Links..." : "Save Professional Links"}
          </button>
        </form>
      ) : hasAnyLink ? (
        <div className="flex flex-wrap gap-3">
          {activePlatformKeys.map((key) => {
            const url = links[key];
            if (!url || !url.trim()) return null;
            const conf = PLATFORM_CONFIGS[key] || { label: key, icon: Globe, color: "text-gray-300 border-white/10 bg-white/5" };
            const Icon = conf.icon;

            return (
              <div
                key={key}
                className={`flex items-center gap-2 border px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow ${conf.color}`}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <Icon className="h-4 w-4" />
                  <span>{conf.label}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                <button
                  onClick={() => handleCopy(url, key)}
                  className="ml-1 text-gray-400 hover:text-white transition p-0.5"
                  title="Copy URL"
                >
                  {copiedPlatform === key ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">No professional links added yet.</p>
      )}
    </div>
  );
}
