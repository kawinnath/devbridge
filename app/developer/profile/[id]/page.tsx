"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ProfessionalLinks from "@/components/ui/ProfessionalLinks";
import ResumeManager from "@/components/ui/ResumeManager";
import { motion } from "framer-motion";
import { 
  ShieldCheck, MapPin, Clock, IndianRupee, BrainCircuit, 
  ExternalLink, Star, Award, CheckCircle2, Edit, Save, X, Plus, Trash2,
  MessageSquare, Briefcase, GraduationCap, Globe, Mail, FileText
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";

export default function PublicDeveloperProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { user: loggedInUser, isLoggedIn } = useTheme();

  const [dev, setDev] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states for general info
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");
  const [languages, setLanguages] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Form states for lists
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);

  // Add Item Temporary inputs
  const [newExp, setNewExp] = useState({ role: "", company: "", years: "", desc: "" });
  const [newEdu, setNewEdu] = useState({ degree: "", school: "", years: "" });
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "" });
  const [newPort, setNewPort] = useState({ name: "", url: "", type: "Audited Portfolio Check" });

  const isOwner = isLoggedIn && loggedInUser && loggedInUser.id === id;

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch(`/api/developer/profile/${id}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setDev(data);
      setNotFound(false);

      // Populate general form states
      setName(data.name || "");
      setTitle(data.title || "");
      setBio(data.bio || "");
      setSkills(data.skills ? data.skills.join(", ") : "");
      setHourlyRate(String(data.hourlyRate || ""));
      setAvailability(data.availability || "Available Full-Time");
      setLocation(data.location || "");
      setLanguages(data.languages || "");
      setGithub(data.github || "");
      setLinkedin(data.linkedin || "");

      // Populate list states
      setExperience(data.experience || []);
      setEducation(data.education || []);
      setCertifications(data.certifications || []);
      setPortfolio(data.portfolio || []);
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
        name,
        title,
        bio,
        skills,
        hourlyRate: Number(hourlyRate),
        availability,
        location,
        languages,
        github,
        linkedin,
        experience,
        education,
        certifications,
        portfolio,
      };

      const res = await fetch("/api/developer/profile", {
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

  // List modification helper functions
  const addExperience = () => {
    if (!newExp.role || !newExp.company) return;
    setExperience([...experience, newExp]);
    setNewExp({ role: "", company: "", years: "", desc: "" });
  };

  const removeExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const addEducation = () => {
    if (!newEdu.degree || !newEdu.school) return;
    setEducation([...education, newEdu]);
    setNewEdu({ degree: "", school: "", years: "" });
  };

  const removeEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const addCertification = () => {
    if (!newCert.name || !newCert.issuer) return;
    setCertifications([...certifications, newCert]);
    setNewCert({ name: "", issuer: "", date: "" });
  };

  const removeCertification = (idx: number) => {
    setCertifications(certifications.filter((_, i) => i !== idx));
  };

  const addPortfolio = () => {
    if (!newPort.name || !newPort.url) return;
    setPortfolio([...portfolio, newPort]);
    setNewPort({ name: "", url: "", type: "Audited Portfolio Check" });
  };

  const removePortfolio = (idx: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center text-sm font-bold text-muted-foreground bg-background">
        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
        Loading developer profile...
      </div>
    );
  }

  if (notFound || !dev) {
    return (
      <div className="relative min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-6 py-20 text-center relative z-10">
          <Award className="h-16 w-16 text-destructive mb-6 animate-pulse" />
          <h1 className="text-3xl font-black text-foreground tracking-tight">Profile Not Found</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            The profile you are looking for does not exist, has been deactivated, or is undergoing moderation audit.
          </p>
          <button 
            onClick={() => router.push("/projects")}
            className="mt-8 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
          >
            Find Developers
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-6 py-10 z-10 relative pt-24">
        {/* Cover Banner */}
        <div className="w-full h-48 rounded-2xl bg-gradient-to-r from-primary to-secondary relative overflow-hidden flex items-end p-6 mb-8 shadow-sm">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-background/20 bg-background/20 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Checked portfolio links
          </div>
          {isOwner && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-xl bg-background/90 backdrop-blur-md px-5 py-2.5 text-sm font-bold text-foreground hover:bg-background transition-all shadow-md"
            >
              <Edit className="h-4 w-4" /> Edit Profile
            </button>
          )}
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Details column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Main Info Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-center flex flex-col items-center gap-4 relative -mt-24 z-10">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-md flex items-center justify-center">
                <div className="h-full w-full rounded-full bg-card flex items-center justify-center text-3xl font-black text-foreground uppercase border-2 border-background">
                  {dev.avatar}
                </div>
              </div>

              {isEditing ? (
                <div className="w-full space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Professional Title</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-2 justify-center">
                    {dev.name}
                    {dev.verifiedPro && (
                      <ShieldCheck className="h-5 w-5 text-success" />
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground font-semibold mt-1 leading-snug">{dev.title}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 justify-center">
                    <MapPin className="h-4 w-4" /> {dev.location}
                  </p>
                </div>
              )}

              {/* Trust Score Radial gauge */}
              <div className="border-t border-border w-full pt-5 mt-2 flex flex-col items-center justify-center gap-2">
                <div className="text-lg font-black text-primary flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  Trust Score: {dev.trustScore}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider bg-muted px-2 py-1 rounded-md">
                  {dev.completedProjects} Projects Completed
                </div>
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                  <button
                    onClick={() => router.push(`/chat?userId=${dev.id}`)}
                    className="flex-1 rounded-xl border border-border bg-background py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" /> Message
                  </button>
                  <button
                    onClick={() => router.push(`/auth?redirect=hire&developerId=${dev.id}`)}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Hire Now
                  </button>
                </div>
              )}
            </div>

            {/* Profile Statistics Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm text-left flex flex-col gap-5">
              <h3 className="text-xs uppercase font-extrabold text-muted-foreground tracking-wider">Key Details</h3>
              
              {isEditing ? (
                <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Hourly Rate (₹/hr)</label>
                    <input 
                      type="number" 
                      value={hourlyRate} 
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Availability</label>
                    <select 
                      value={availability} 
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Available Full-Time">Available Full-Time</option>
                      <option value="Available Part-Time">Available Part-Time</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Location</label>
                    <input 
                      type="text" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Languages</label>
                    <input 
                      type="text" 
                      value={languages} 
                      onChange={(e) => setLanguages(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-muted-foreground font-semibold">Hourly Rate</span>
                    <span className="font-black text-foreground">₹{dev.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-muted-foreground font-semibold">Availability</span>
                    <span className="font-bold text-success">{dev.availability}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <span className="text-muted-foreground font-semibold">Rating</span>
                    <span className="font-bold text-yellow-500 flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> {dev.rating} / 5.0
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-semibold">Languages</span>
                    <span className="font-bold text-foreground truncate max-w-[150px] text-right">{dev.languages}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Links */}
            <ProfessionalLinks
              links={dev.socialLinks || { github: dev.github, linkedin: dev.linkedin }}
              isEditable={Boolean(isOwner)}
              role={dev.role}
              onSave={async (updatedLinks) => {
                await fetch(`/api/developer/profile/${dev.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ socialLinks: updatedLinks }),
                });
                fetchProfile();
              }}
            />

            {/* Resume Manager (Developers Only) */}
            {dev.role === "DEVELOPER" && (
              <ResumeManager
                resumeUrl={dev.resumeUrl}
                resumeFileName={dev.resumeFileName}
                isOwner={Boolean(isOwner)}
                userRole={loggedInUser?.role}
                onUpload={async (resumeBase64, fileName) => {
                  await fetch(`/api/developer/profile/${dev.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resumeUrl: resumeBase64, resumeFileName: fileName }),
                  });
                  fetchProfile();
                }}
                onDelete={async () => {
                  await fetch(`/api/developer/profile/${dev.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ resumeUrl: null, resumeFileName: null }),
                  });
                  fetchProfile();
                }}
              />
            )}
          </div>

          {/* Right Core Details Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Profile Bio */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm text-left flex flex-col gap-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
                <FileText className="h-5 w-5 text-primary" /> Professional Overview
              </h3>
              {isEditing ? (
                <div>
                  <textarea 
                    value={bio}
                    rows={5}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{dev.bio}</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm text-left flex flex-col gap-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
                <Award className="h-5 w-5 text-secondary" /> Core Skill Assessments
              </h3>
              
              {isEditing ? (
                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Skills (Comma-separated)</label>
                  <input 
                    type="text" 
                    value={skills} 
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mt-2">
                  {dev.skills.map((skill: string, sIdx: number) => {
                    const score = dev.aiSkillScore?.[skill] || 85;
                    return (
                      <div key={sIdx} className="bg-muted border border-border px-4 py-2 rounded-xl flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{skill}</span>
                        <span className="text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-md">
                          {score}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Verified Portfolio Links */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm text-left flex flex-col gap-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
                <Globe className="h-5 w-5 text-primary" /> Verified Portfolios Links
              </h3>
              
              {isEditing ? (
                <div className="space-y-6 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/50 p-6 rounded-xl border border-border">
                    <input 
                      type="text" 
                      placeholder="Project Name"
                      value={newPort.name}
                      onChange={(e) => setNewPort({ ...newPort, name: e.target.value })}
                      className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input 
                      type="text" 
                      placeholder="Project URL"
                      value={newPort.url}
                      onChange={(e) => setNewPort({ ...newPort, url: e.target.value })}
                      className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button 
                      onClick={addPortfolio}
                      className="sm:col-span-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Link
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {portfolio.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-background border border-border px-4 py-3 rounded-xl">
                        <div>
                          <div className="font-bold text-foreground text-sm">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{item.url}</div>
                        </div>
                        <button onClick={() => removePortfolio(idx)} className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  {dev.portfolio.length > 0 ? (
                    dev.portfolio.map((item: any, pIdx: number) => (
                      <div key={pIdx} className="bg-background border border-border p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/30 transition-colors">
                        <div>
                          <a 
                            href={item.url.startsWith("http") ? item.url : `https://${item.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm font-bold text-foreground flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            {item.name} <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                          <div className="text-xs text-muted-foreground mt-1">{item.url}</div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-3 py-1 text-[10px] text-success font-bold uppercase tracking-wider shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Audited OK
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">No portfolio links added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Work experience */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm text-left flex flex-col gap-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
                <Briefcase className="h-5 w-5 text-secondary" /> Work Experience
              </h3>
              
              {isEditing ? (
                <div className="space-y-6 mt-2">
                  <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input 
                        type="text" 
                        placeholder="Role / Position"
                        value={newExp.role}
                        onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        type="text" 
                        placeholder="Company Name"
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        type="text" 
                        placeholder="Years (e.g. 2021 - Present)"
                        value={newExp.years}
                        onChange={(e) => setNewExp({ ...newExp, years: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <textarea 
                      placeholder="Role Description / Achievements"
                      value={newExp.desc}
                      onChange={(e) => setNewExp({ ...newExp, desc: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                    />
                    <button 
                      onClick={addExperience}
                      className="w-full rounded-xl bg-secondary py-2.5 text-sm font-bold text-white hover:bg-secondary/90 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Work History
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="flex justify-between items-start bg-background border border-border px-5 py-4 rounded-xl">
                        <div>
                          <div className="font-bold text-foreground text-sm">{exp.role} <span className="text-muted-foreground font-medium">at {exp.company}</span></div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-1">{exp.years}</div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.desc}</p>
                        </div>
                        <button onClick={() => removeExperience(idx)} className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-8 mt-4 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-border">
                  {dev.experience.length > 0 ? (
                    dev.experience.map((exp: any, eIdx: number) => (
                      <div key={eIdx} className="flex gap-6 relative pl-10">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-background bg-secondary flex items-center justify-center flex-shrink-0 shadow-sm" />
                        <div className="bg-background border border-border p-5 rounded-xl w-full shadow-sm hover:border-secondary/30 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="text-base font-black text-foreground">{exp.role}</h4>
                            <span className="text-xs text-muted-foreground font-bold bg-muted px-2.5 py-1 rounded-md shrink-0">{exp.years}</span>
                          </div>
                          <div className="text-sm font-semibold text-secondary mb-3">{exp.company}</div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{exp.desc}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground pl-10 py-2">No work experience listed yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Education & Certs */}
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm text-left flex flex-col gap-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
                <GraduationCap className="h-5 w-5 text-primary" /> Education & Certifications
              </h3>
              
              {isEditing ? (
                <div className="space-y-8 mt-2">
                  {/* Education editor */}
                  <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border">
                    <div className="text-xs uppercase font-black tracking-wider text-primary">Add Education</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input 
                        type="text" 
                        placeholder="Degree / Major"
                        value={newEdu.degree}
                        onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        type="text" 
                        placeholder="School / University"
                        value={newEdu.school}
                        onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        type="text" 
                        placeholder="Years (e.g. 2017 - 2021)"
                        value={newEdu.years}
                        onChange={(e) => setNewEdu({ ...newEdu, years: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button 
                      onClick={addEducation}
                      className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Education
                    </button>

                    <div className="flex flex-col gap-3 mt-4">
                      {education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-background border border-border px-4 py-3 rounded-xl">
                          <div>
                            <div className="font-bold text-foreground text-sm">{edu.degree}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{edu.school} • {edu.years}</div>
                          </div>
                          <button onClick={() => removeEducation(idx)} className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications editor */}
                  <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border">
                    <div className="text-xs uppercase font-black tracking-wider text-secondary">Add Certification</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input 
                        type="text" 
                        placeholder="Cert Name"
                        value={newCert.name}
                        onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        type="text" 
                        placeholder="Issuer"
                        value={newCert.issuer}
                        onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input 
                        type="text" 
                        placeholder="Earned Year"
                        value={newCert.date}
                        onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button 
                      onClick={addCertification}
                      className="w-full rounded-xl bg-secondary py-2.5 text-sm font-bold text-white hover:bg-secondary/90 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus className="h-4 w-4" /> Add Cert
                    </button>

                    <div className="flex flex-col gap-3 mt-4">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-background border border-border px-4 py-3 rounded-xl">
                          <div>
                            <div className="font-bold text-foreground text-sm">{cert.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{cert.issuer} • {cert.date}</div>
                          </div>
                          <button onClick={() => removeCertification(idx)} className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                  {dev.education.length > 0 || dev.certifications.length > 0 ? (
                    <>
                      {dev.education.map((edu: any, edIdx: number) => (
                        <div key={edIdx} className="bg-background border border-border p-5 rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                          <div className="text-sm font-bold text-foreground">{edu.degree}</div>
                          <div className="text-xs text-muted-foreground font-semibold mt-1">{edu.school}</div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-3 bg-muted px-2 py-1 rounded-md inline-block">{edu.years}</div>
                        </div>
                      ))}
                      
                      {dev.certifications.map((cert: any, cIdx: number) => (
                        <div key={cIdx} className="bg-background border border-border p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-secondary/30 transition-colors">
                          <div>
                            <div className="text-sm font-bold text-foreground">{cert.name}</div>
                            <div className="text-xs text-muted-foreground font-semibold mt-1">{cert.issuer}</div>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-3 bg-muted px-2 py-1 rounded-md inline-block self-start">Earned: {cert.date}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground col-span-2 py-2">No educational history or certs added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Save bar when editing */}
            {isEditing && (
              <div className="flex justify-end gap-4 pt-6 border-t border-border mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Client Reviews Section */}
            {!isEditing && (
              <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm text-left flex flex-col gap-4">
                <h3 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
                  <Star className="h-5 w-5 text-yellow-500" /> Client Reviews & Ratings
                </h3>
                <div className="flex flex-col gap-5 mt-2">
                  {dev.reviews && dev.reviews.length > 0 ? (
                    dev.reviews.map((rev: any, rIdx: number) => (
                      <div key={rIdx} className="bg-background border border-border p-5 rounded-xl flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-bold text-foreground">{rev.reviewerName}</span>
                            <span className="text-[10px] text-muted-foreground block font-mono mt-1 bg-muted px-2 py-0.5 rounded-md inline-block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> {rev.rating}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic leading-relaxed">"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">No client reviews received yet.</p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
