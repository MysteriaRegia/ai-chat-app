"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, User, Bot, Menu, X, Sparkles } from "lucide-react";
import AuthPanel from "./AuthPanel";
import { supabase } from "../lib/supabase";

/* ---------- Types ---------- */
interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  model?: string;
  conversation_id?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

/* ---------- UI atoms ---------- */
function AIMessage({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  return (
    <div className="flex gap-4 p-5 hover:bg-[#0f0f0f] transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-amber-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,197,24,0.15)]">
          <Bot size={18} className="text-amber-300" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-100 whitespace-pre-wrap leading-relaxed">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-3 h-5 align-middle ml-2 rounded-sm bg-amber-400/70 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-4 p-5 bg-[#0f0f0f] border-l-2 border-amber-500/40">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#1f1f1f] flex items-center justify-center">
          <User size={18} className="text-zinc-300" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-zinc-100 whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  isOpen,
  onClose,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-black/95 backdrop-blur-xl border-r border-amber-500/20 text-white transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex flex-col h-full">
        {/* brand */}
        <div className="flex items-center justify-between p-5 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-300" />
            </div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
              Hierophant AI
            </h2>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
            <X size={18} className="text-amber-300" />
          </button>
        </div>

        {/* new chat */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full px-4 py-3 rounded-xl font-medium text-black bg-gradient-to-r from-amber-300 to-yellow-500 hover:from-amber-200 hover:to-yellow-400 transition-colors shadow-[0_0_24px_rgba(245,197,24,0.25)]"
          >
            New Inquiry
          </button>
          <p className="text-[11px] text-amber-200/70 mt-2">
            Tip: Sign in below to save and sync chats.
          </p>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto px-3">
          {conversations.length === 0 ? (
            <div className="text-zinc-400 text-sm px-2 py-4">No saved conversations yet.</div>
          ) : (
            conversations.map((c) => {
              const active = activeId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    active
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                      : "hover:bg-white/5 text-zinc-300 hover:text-white"
                  }`}
                  title={c.title}
                >
                  {c.title}
                </button>
              );
            })
          )}
        </div>

        {/* auth */}
        <div className="p-5 border-t border-amber-500/20 bg-black/60">
          <AuthPanel />
        </div>
      </div>
    </div>
  );
}

/* ---------- Model selector ---------- */
function ModelSelector({
  selectedModel,
  onModelChange,
}: {
  selectedModel: string;
  onModelChange: (m: string) => void;
}) {
  return (
    <div className="px-6 py-4 border-b border-amber-500/20 bg-black/40">
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full max-w-xs px-4 py-2 rounded-lg bg-[#101010] border border-amber-500/30 text-amber-200 placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      >
        <option value="gpt-4o" className="bg-[#101010]">GPT-4o (OpenAI)</option>
        <option value="gpt-4o-mini" className="bg-[#101010]">GPT-4o Mini (OpenAI)</option>
        <option value="claude-3-5-sonnet-20241022" className="bg-[#101010]">Claude 3.5 Sonnet</option>
        <option value="claude-3-5-haiku-20241022" className="bg-[#101010]">Claude 3.5 Haiku</option>
      </select>
    </div>
  );
}

/* ---------- Main component (with Supabase persistence) ---------- */
export default function AIChatApp() {
  const [userId, setUserId] = useState<string | null>(null);

  // Saved conversations for this user
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Messages of the active conversation
  const [messages, setMessages] = useState<Message[]>([]);

  // Compose state
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  /* ---- auth + initial load ---- */
  useEffect(() => {
    // get current user
    supabase.auth.getUser().then(({ data }) => {
      const uid = data?.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        loadConversations(uid);
      }
    });
    // subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadConversations(uid);
      else {
        setConversations([]);
        setActiveId(null);
        setMessages([]);
      }
    });
    return () => {
      // @ts-ignore (handle v1/v2 shapes)
      sub?.subscription?.unsubscribe?.();
      // @ts-ignore
      sub?.unsubscribe?.();
    };
  }, []);

  /* ---- auto-scroll ---- */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* ---- data loaders ---- */
  async function loadConversations(uid: string) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id,title,created_at,updated_at")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setConversations(data as Conversation[]);
      // keep active if still present; otherwise select first
      if (data.length) {
        const stillExists = activeId && data.some((c) => c.id === activeId);
        setActiveId(stillExists ? activeId : data[0].id);
        if (!stillExists) loadMessages(data[0].id);
      }
    }
  }

  async function loadMessages(conversationId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("id,role,content,model,created_at,conversation_id")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const mapped: Message[] = data.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        model: m.model ?? undefined,
        timestamp: m.created_at ?? undefined,
        conversation_id: m.conversation_id,
      }));
      setMessages(mapped);
    }
  }

  /* ---- UI actions ---- */
  async function newChat() {
    // If signed in, create persisted conversation. If not, use ephemeral.
    if (userId) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title: "New Inquiry" })
        .select("id,title,created_at,updated_at")
        .single();

      if (!error && data) {
        setConversations((prev) => [data as Conversation, ...prev]);
        setActiveId(data.id);
        setMessages([]);
      }
    } else {
      // Ephemeral only
      const tempId = `local-${Date.now()}`;
      const c: Conversation = { id: tempId, title: "New Inquiry" };
      setConversations((prev) => [c, ...prev]);
      setActiveId(tempId);
      setMessages([]);
    }
    setSidebarOpen(false);
  }

  async function selectConversation(id: string) {
    setActiveId(id);
    if (userId && !id.startsWith("local-")) {
      await loadMessages(id);
    } else {
      setMessages([]); // local, we don't keep multiple histories here
    }
    setSidebarOpen(false);
  }

  async function sendMessage() {
    if (!message.trim() || isLoading) return;

    // If no conversation yet, create one quickly
    let currentId = activeId;
    if (!currentId) {
      if (userId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ user_id: userId, title: "New Inquiry" })
          .select("id,title")
          .single();
        if (error || !data) return;
        currentId = data.id;
        setConversations((prev) => [data as Conversation, ...prev]);
        setActiveId(currentId);
      } else {
        currentId = `local-${Date.now()}`;
        const c: Conversation = { id: currentId, title: "New Inquiry" };
        setConversations((prev) => [c, ...prev]);
        setActiveId(currentId);
      }
    }

    const userMsg: Message = {
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
      model: selectedModel,
      conversation_id: currentId,
    };

    // Optimistic add
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsLoading(true);

    // Persist user message if signed in
    if (userId && !currentId.startsWith("local-")) {
      await supabase.from("messages").insert({
        conversation_id: currentId,
        role: "user",
        content: userMsg.content,
        model: selectedModel,
      });
      // set a first-title based on first message
      const maybeTitle =
        messages.length === 0 ? userMsg.content.slice(0, 30) + "..." : undefined;
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString(), ...(maybeTitle ? { title: maybeTitle } : {}) })
        .eq("id", currentId);
      // refresh list order
      if (userId) loadConversations(userId);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            id: m.id ?? "",
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ?? new Date().toISOString(),
            model: m.model,
          })),
          model: selectedModel,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      const aiMsg: Message = {
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString(),
        model: selectedModel,
        conversation_id: currentId,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Persist assistant message if signed in
      if (userId && !currentId.startsWith("local-")) {
        await supabase.from("messages").insert({
          conversation_id: currentId,
          role: "assistant",
          content: aiMsg.content,
          model: selectedModel,
        });
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", currentId);
        if (userId) loadConversations(userId);
      }
    } catch (_e) {
      const err: Message = {
        role: "assistant",
        content: "I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, err]);
    } finally {
      setIsLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  /* ---------- Render ---------- */
  const activeTitle =
    conversations.find((c) => c.id === activeId)?.title ?? "New Inquiry";

  return (
    <div className="flex h-screen bg-[#0b0b0b] text-zinc-100">
      {/* sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={selectConversation}
        onNewChat={newChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* main */}
      <div className="flex-1 flex flex-col">
        {/* header */}
        <header className="flex items-center justify-between p-6 border-b border-amber-500/20 bg-black/40 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-amber-300" />
            </button>
            <h1 className="text-xl font-bold">{activeTitle}</h1>
          </div>
        </header>

        <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />

        {/* chat area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length ? (
            <>
              {messages.map((m, idx) =>
                m.role === "user" ? <UserMessage key={idx} message={m} /> : <AIMessage key={idx} message={m} />
              )}
              {isLoading && (
                <AIMessage
                  message={{
                    role: "assistant",
                    content: "Consulting the archives...",
                  }}
                  isStreaming
                />
              )}
              <div ref={endRef} />
            </>
          ) : (
            <div className="h-full grid place-items-center">
              <div className="text-center max-w-xl mx-auto px-6">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full border border-amber-500/40 bg-amber-500/10 shadow-[0_0_40px_rgba(245,197,24,0.2)] overflow-hidden flex items-center justify-center">
                  <img src="/sigil.png" alt="Hierophant sigil" className="w-20 h-20 object-contain opacity-95" />
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 mb-3">
                  Welcome to Hierophant AI
                </h2>
                <p className="text-zinc-300/90 leading-relaxed">
                  Your guide to the sacred mysteries of knowledge. What wisdom do you seek today?
                </p>
                {!userId && (
                  <p className="text-amber-200/70 text-sm mt-3">
                    Sign in (left panel) to save your inquiries.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* composer */}
        <div className="border-t border-amber-500/20 p-5 bg-black/40 backdrop-blur">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Ask the Hierophant anything..."
                  className="w-full px-4 py-4 rounded-2xl bg-[#101010] border border-amber-500/30 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 resize-none"
                  rows={1}
                  style={{ minHeight: "56px", maxHeight: "160px" }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="px-5 py-4 rounded-2xl text-black bg-gradient-to-r from-amber-300 to-yellow-500 hover:from-amber-200 hover:to-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_24px_rgba(245,197,24,0.25)]"
                aria-label="Send"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-3 text-center">
              Hierophant AI reveals knowledge but may contain mysteries. Verify important revelations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
