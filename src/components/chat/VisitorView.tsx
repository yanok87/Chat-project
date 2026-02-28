"use client";

import { useState, useCallback, useEffect } from "react";
import type { Message } from "@/types";
import { ChatWidget } from "./ChatWidget";

const VISITOR_ID_KEY = "minicom-visitor-id";
const THREAD_ID_KEY = "minicom-thread-id";

function getOrCreateId(key: string): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function VisitorView() {
  const [visitorId, setVisitorId] = useState("");
  const [threadId, setThreadId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setVisitorId(getOrCreateId(VISITOR_ID_KEY));
    setThreadId(getOrCreateId(THREAD_ID_KEY));
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      if (!visitorId || !threadId) return;
      const newMessage: Message = {
        id: crypto.randomUUID(),
        threadId,
        senderId: visitorId,
        content,
        createdAt: Date.now(),
        status: "sent",
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [threadId, visitorId]
  );

  return (
    <>
      {/* Mock website content */}
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="text-xl font-semibold text-slate-800">Acme Inc.</span>
            <nav className="text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900">Product</a>
              <span className="mx-3">·</span>
              <a href="#" className="hover:text-slate-900">Pricing</a>
              <span className="mx-3">·</span>
              <a href="#" className="hover:text-slate-900">Contact</a>
            </nav>
          </div>
        </header>
        <section className="max-w-4xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Welcome to our demo site
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            This is a mock website. Use the chat button in the bottom-right corner to start a
            conversation with support.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-2xl">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <h2 className="font-semibold text-slate-800">Fast support</h2>
              <p className="mt-1 text-sm text-slate-600">Get help via live chat anytime.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
              <h2 className="font-semibold text-slate-800">Real humans</h2>
              <p className="mt-1 text-sm text-slate-600">Our team is here to assist you.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Chat widget — only interactive once we have ids (client) */}
      <ChatWidget
        currentUserId={visitorId}
        threadId={threadId}
        messages={messages}
        onSend={handleSend}
        title="Support"
        disabled={!visitorId}
      />
    </>
  );
}
