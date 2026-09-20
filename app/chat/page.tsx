"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { 
  Send, ShieldCheck, Phone, CheckCheck, 
  Paperclip, Mic, Sparkles, User, Brain, AlertCircle, MessageSquare
} from "lucide-react";

function ChatContent() {
  const { user } = useTheme();
  const searchParams = useSearchParams();
  
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch available chat contacts on mount
  useEffect(() => {
    async function loadContacts() {
      try {
        const res = await fetch("/api/chat/users");
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
          
          // Select contact from URL if redirected, else pick first available
          const paramUserId = searchParams.get("userId");
          if (paramUserId) {
            setActiveContactId(paramUserId);
          } else if (data.length > 0) {
            setActiveContactId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load contacts:", err);
      } finally {
        setLoadingContacts(false);
      }
    }
    loadContacts();
  }, [searchParams]);

  // 2. Fetch message history for the active contact
  async function loadMessages(targetId: string) {
    try {
      const res = await fetch(`/api/chat?targetId=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load chat messages:", err);
    }
  }

  useEffect(() => {
    if (!activeContactId) return;
    
    setLoadingMessages(true);
    loadMessages(activeContactId).finally(() => setLoadingMessages(false));

    // Poll for new incoming messages every 4 seconds
    const interval = setInterval(() => {
      loadMessages(activeContactId);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeContactId]);

  // 3. Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContactId]);

  const activeContact = contacts.find(c => c.id === activeContactId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId || !user) return;

    const content = inputText;
    setInputText("");

    // Optimistically append message to screen instantly
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: activeContactId,
      content: content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeContactId,
          content: content,
        }),
      });
      if (res.ok) {
        loadMessages(activeContactId);
      }
    } catch (err) {
      console.error("Failed to deliver message:", err);
    }
  };

  const handleSendAttachment = async (attachmentText: string) => {
    if (!activeContactId || !user) return;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeContactId,
          content: attachmentText,
        }),
      });
      if (res.ok) {
        loadMessages(activeContactId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-10 z-10 relative flex pt-24">
        
        {/* Chat box container */}
        <div className="w-full h-[700px] bg-card rounded-2xl border border-border shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT: CONTACTS SIDEBAR */}
          <div className="md:col-span-4 border-r border-border flex flex-col bg-muted/30">
            <div className="p-5 border-b border-border flex items-center justify-between bg-card">
              <span className="font-black text-sm text-foreground uppercase tracking-wider">
                Conversations
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {loadingContacts ? (
                <div className="text-center py-10 text-sm font-semibold text-muted-foreground flex flex-col items-center gap-3">
                  <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  Loading contacts...
                </div>
              ) : contacts.length > 0 ? (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setActiveContactId(contact.id)}
                    className={`w-full rounded-xl p-4 text-left transition-all flex items-center gap-4 ${
                      activeContactId === contact.id 
                        ? "bg-primary/10 border border-primary/20 shadow-sm" 
                        : "hover:bg-card border border-transparent hover:border-border hover:shadow-sm"
                    }`}
                  >
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-sm font-black text-white uppercase flex-shrink-0 shadow-sm">
                      {contact.avatar}
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-background" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold truncate ${activeContactId === contact.id ? "text-primary" : "text-foreground"}`}>
                          {contact.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium truncate">{contact.role}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-16 px-6 text-sm font-semibold text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                  No active contacts found. Find developers or post projects to start messaging!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CHAT PANE */}
          <div className="md:col-span-8 flex flex-col h-full bg-background relative">
            {activeContact ? (
              <>
                {/* Header info */}
                <div className="p-5 border-b border-border bg-card flex justify-between items-center z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-sm font-black text-white uppercase shadow-sm">
                      {activeContact.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                        {activeContact.name}
                        {activeContact.verified && <ShieldCheck className="h-4 w-4 text-success" />}
                      </h3>
                      <span className="text-[10px] text-success font-bold uppercase tracking-widest mt-0.5 block">Connected</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
                    <Sparkles className="h-4 w-4 text-warning" />
                    Verified Member
                  </div>
                </div>

                {/* Message history */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                  
                  <div className="bg-muted/50 border border-border px-5 py-3 rounded-xl text-xs font-semibold text-muted-foreground text-center max-w-md mx-auto flex items-center gap-2 leading-relaxed shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-success flex-shrink-0" />
                    All communication is logged and audited for verified credentials safety.
                  </div>

                  {loadingMessages ? (
                    <div className="text-center py-10 text-sm font-semibold text-muted-foreground flex flex-col items-center gap-3">
                      <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      Loading conversation...
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col max-w-[75%] gap-1.5 relative z-10 ${isMe ? "self-end items-end" : "self-start items-start"}`}
                        >
                          <div 
                            className={`rounded-2xl px-5 py-3 text-sm leading-relaxed text-left shadow-sm ${isMe 
                              ? "bg-primary text-primary-foreground rounded-tr-sm" 
                              : "bg-card border border-border text-foreground rounded-tl-sm"}`}
                          >
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && <CheckCheck className="h-3.5 w-3.5 text-success" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-sm font-semibold text-muted-foreground relative z-10">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      No message history yet. Send a greeting to kick off the conversation!
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Text Input area */}
                <form onSubmit={handleSendMessage} className="p-5 border-t border-border bg-card flex items-center gap-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => handleSendAttachment("[Attachment: freelancer_specs_sheet.pdf]")}
                    className="h-10 w-10 rounded-xl flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 shadow-sm"
                    title="Attach specifications document"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background border border-border rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />

                  <button
                    type="button"
                    onClick={() => handleSendAttachment("[Voice Message - 0:12s]")}
                    className="h-10 w-10 rounded-xl flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 shadow-sm"
                    title="Send voice note"
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  <button
                    type="submit"
                    className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-md active:scale-95 shrink-0"
                  >
                    <Send className="h-5 w-5 ml-1" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-muted-foreground text-sm font-semibold relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <Brain className="h-16 w-16 text-muted-foreground/30 mb-6" />
                Select a conversation partner from the directory<br/> to start messaging.
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-bold text-muted-foreground bg-background">Loading Messenger...</div>}>
      <ChatContent />
    </Suspense>
  );
}
