"use client";

import React, { useState } from "react";
import { 
  FileText, Upload, Download, Eye, Trash2, CheckCircle2, 
  AlertCircle, Lock, RefreshCw 
} from "lucide-react";

interface ResumeManagerProps {
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  isOwner?: boolean;
  userRole?: string | null;
  onUpload?: (resumeBase64: string, fileName: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function ResumeManager({
  resumeUrl,
  resumeFileName,
  isOwner = false,
  userRole,
  onUpload,
  onDelete,
}: ResumeManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canAccessResume = isOwner || userRole === "CLIENT" || userRole === "ADMIN";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Validate size (10MB Max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Resume file size must be less than 10 MB.");
      return;
    }

    // Validate format (.pdf, .doc, .docx)
    const validExtensions = [".pdf", ".doc", ".docx"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError("Supported file formats are PDF, DOC, and DOCX.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (onUpload) {
          await onUpload(base64, file.name);
          setSuccess("Resume uploaded successfully!");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to upload resume.");
      } else {
        setError("Failed to upload resume.");
      }
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      setSuccess("Resume deleted.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to delete resume.");
      } else {
        setError("Failed to delete resume.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (!resumeUrl) return;
    const a = document.createElement("a");
    a.href = resumeUrl;
    a.download = resumeFileName || "Developer-Resume.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 bg-slate-950/40 text-left backdrop-blur-xl shadow-xl">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-gray-300 flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" /> Developer Resume & CV
        </h3>
        {resumeUrl && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Resume Uploaded ✓
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {resumeUrl ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block line-clamp-1">
                  {resumeFileName || "Developer Resume Document"}
                </span>
                <span className="text-[10px] text-gray-400">Verified Professional CV</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {canAccessResume ? (
              <div className="flex items-center gap-2">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 transition flex items-center gap-1 shadow"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </a>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition flex items-center gap-1 shadow"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            ) : (
              <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                <Lock className="h-3 w-3" /> Client-Only Access
              </div>
            )}
          </div>

          {/* Owner controls: Replace / Delete */}
          {isOwner && (
            <div className="flex items-center gap-3 border-t border-white/5 pt-3">
              <label className="text-xs text-gray-300 font-bold cursor-pointer hover:text-white flex items-center gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${uploading ? "animate-spin" : ""}`} />
                <span>Replace Resume</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-rose-400 font-bold hover:text-rose-300 transition flex items-center gap-1 ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting..." : "Delete Resume"}
              </button>
            </div>
          )}
        </div>
      ) : isOwner ? (
        <div className="border border-dashed border-white/20 rounded-xl p-6 text-center bg-white/5 hover:bg-white/10 transition cursor-pointer relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center gap-2 text-xs text-gray-300">
            <Upload className={`h-6 w-6 text-emerald-400 ${uploading ? "animate-bounce" : ""}`} />
            <span className="font-bold">{uploading ? "Uploading Resume..." : "Upload Resume (PDF, DOC, DOCX)"}</span>
            <span className="text-[10px] text-gray-500">Maximum file size: 10 MB</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">No resume uploaded yet by this developer.</p>
      )}
    </div>
  );
}
