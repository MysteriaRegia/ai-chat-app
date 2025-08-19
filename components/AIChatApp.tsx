"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, User, Bot, Menu, X, Sparkles } from "lucide-react";
import AuthPanel from "./AuthPanel";

/* ---------- Types ---------- */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  model?: string;
}
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

/* ---------- Initial state ---------- */
const startConversations: Conversation[] = [
  { id: "1", title: "New Inquiry", messages: [] },
];

/* ---------- Message bubbles ---------- */
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
  activeConversation,
  onSelectConversation,
  onNewChat,
  isOpen,
  onClose,
}: {
  conversations: Conversation[];
  activeConversation: Conversation | null;
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
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto px-3">
          {conversations.map((c) => {
            const active = activeConversation?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  active
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                    : "hover:bg-white/5 text-zinc-300 hover:text-white"
                }`}
              >
                {c.title}
              </button>
            );
          })}
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
        <option value="gpt-4o" className="bg-[#101010]">
          GPT-4o (OpenAI)
        </option>
        <option value="gpt-4o-mini" className="bg-[#101010]">
          GPT-4o Mini (OpenAI)
        </option>
        <option value="claude-3-5-sonnet-20241022" className="bg-[#101010]">
          Claude 3.5 Sonnet
        </option>
        <option value="claude-3-5-haiku-20241022" className="bg-[#101010]">
          Claude 3.5 Haiku
        </option>
      </select>
    </div>
  );
}

/* ---------- Main component ---------- */
export default function AIChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(startConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(
    startConversations[0]
  );
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  async function sendMessage() {
    if (!message.trim() || isLoading || !activeConversation) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated: Conversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMsg],
    };
    setActiveConversation(updated);
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.messages, model: selectedModel }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString(),
        model: selectedModel,
      };

      const finalConv: Conversation = {
        ...updated,
        messages: [...updated.messages, aiMsg],
        title:
          updated.messages.length === 1 ? userMsg.content.slice(0, 30) + "..." : updated.title,
      };

      setActiveConversation(finalConv);
      setConversations((prev) => prev.map((c) => (c.id === updated.id ? finalConv : c)));
    } catch (e) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setActiveConversation((prev) => (prev ? { ...prev, messages: [...prev.messages, errMsg] } : prev));
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

  function newChat() {
    const c: Conversation = { id: Date.now().toString(), title: "New Inquiry", messages: [] };
    setConversations([c, ...conversations]);
    setActiveConversation(c);
    setSidebarOpen(false);
  }

  function selectConversation(id: string) {
    const c = conversations.find((x) => x.id === id);
    if (c) {
      setActiveConversation(c);
      setSidebarOpen(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#0b0b0b] text-zinc-100">
      {/* sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
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
            <h1 className="text-xl font-bold">{activeConversation?.title || "New Inquiry"}</h1>
          </div>
        </header>

        <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />

        {/* chat area */}
        <div className="flex-1 overflow-y-auto">
          {activeConversation?.messages.length ? (
            <>
              {activeConversation.messages.map((m) =>
                m.role === "user" ? <UserMessage key={m.id} message={m} /> : <AIMessage key={m.id} message={m} />
              )}
              {isLoading && (
                <AIMessage
                  message={{
                    id: "loading",
                    role: "assistant",
                    content: "Consulting the archives...",
                    timestamp: new Date().toISOString(),
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
                  {/* your sigil (put file at /public/sigil.png) */}
                  <img src="/sigil.png" alt="Hierophant sigil" className="w-20 h-20 object-contain opacity-95" />
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 mb-3">
                  Welcome to Hierophant AI
                </h2>
                <p className="text-zinc-300/90 leading-relaxed">
                  Your guide to the sacred mysteries of knowledge. What wisdom do you seek today?
                </p>
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
