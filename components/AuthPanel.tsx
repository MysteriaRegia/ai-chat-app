"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  // Load current user and listen for auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      // unsubscribe (handles both older/newer supabase-js shapes)
      // @ts-ignore
      sub?.subscription?.unsubscribe?.();
      // @ts-ignore
      sub?.unsubscribe?.();
    };
  }, []);

  // Ensure a profile row exists after login
  useEffect(() => {
    if (user?.id) {
      supabase.from("profiles").upsert({
        id: user.id,
        email: user.email ?? null,
        full_name: user.user_metadata?.full_name ?? null,
      });
    }
  }, [user]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending magic link...");
    const redirectTo =
      typeof window !== "undefined" ? window.location.origin : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) setStatus(`Error: ${error.message}`);
    else setStatus("Check your email for the sign-in link.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setStatus("Signed out.");
  }

  if (user) {
    return (
      <div className="text-sm text-white/90">
        <div className="mb-2">
          <div className="font-semibold">Signed in</div>
          <div className="truncate">{user.email}</div>
        </div>
        <button
          onClick={signOut}
          className="w-full px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
        >
          Sign out
        </button>
        {status && <div className="mt-2 text-xs text-white/70">{status}</div>}
      </div>
    );
  }

  return (
    <form onSubmit={sendMagicLink} className="text-sm text-white/90">
      <label className="block mb-1">Sign in with email</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full mb-2 px-3 py-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
      >
        Send magic link
      </button>
      {status && <div className="mt-2 text-xs text-white/70">{status}</div>}
    </form>
  );
}
