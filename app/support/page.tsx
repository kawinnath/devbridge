"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { 
  Mail, Phone, Clock, HelpCircle, CheckCircle2, AlertCircle, 
  Send, User, FileText, ArrowRight
} from "lucide-react";

export default function SupportCenterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name || !email || !subject || !message) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    "Account Issues", "Login Problems", "Payment Support", 
    "Subscription Help", "Client Support", "Developer Support", 
    "Report a Bug", "Report Abuse"
  ];

  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-violet-600/30 selection:text-violet-200">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-violet-600/10 border border-violet-500/20 rounded-2xl mb-4 text-violet-400">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Support Center
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Need help? Our support team is here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Contact Card */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 bg-white/[0.01] backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Support Contact</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-600/10 border border-violet-500/20 rounded-xl text-violet-400 mt-0.5">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Email</p>
                      <a href="mailto:kawinnath08@gmail.com" className="text-xs sm:text-sm font-medium text-white hover:text-violet-400 transition">
                        kawinnath08@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-cyan-600/10 border border-cyan-500/20 rounded-xl text-cyan-400 mt-0.5">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Phone</p>
                      <a href="tel:+919789396398" className="text-xs sm:text-sm font-medium text-white hover:text-cyan-400 transition">
                        +91 9789396398
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-emerald-400 mt-0.5">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Support Hours</p>
                      <p className="text-xs sm:text-sm font-medium text-white">
                        Monday – Saturday
                      </p>
                      <p className="text-[11px] text-gray-400">
                        9:00 AM – 6:00 PM IST
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories Card */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 bg-white/[0.01] backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Support Categories</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 glass-panel px-3 py-2 rounded-lg border border-white/5 text-gray-300">
                      <ArrowRight className="h-3.5 w-3.5 text-violet-400" />
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Contact Form Column */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-2xl p-8 border border-white/5 bg-white/[0.01] backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                <h3 className="text-lg font-bold text-white mb-6">Contact Support</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-400">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span>Thank you! Our support team will contact you as soon as possible.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full glass-panel border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 transition mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Your Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full glass-panel border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 transition mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Account activation check"
                      className="w-full glass-panel border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 transition mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe how we can assist you..."
                      rows={5}
                      className="w-full glass-panel border border-white/10 rounded-lg p-3.5 text-xs text-white focus:outline-none focus:border-violet-500/50 transition mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-violet-600 py-3 text-xs font-bold text-white hover:bg-violet-500 transition shadow-lg shadow-violet-600/15 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Submit Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
