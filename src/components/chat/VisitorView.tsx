"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Message } from "@/types";
import { ChatWidget } from "./ChatWidget";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  useStore,
  addMessage as addMessageToStore,
  getMessagesForDisplay,
  simulateSendConfirm,
  retryMessage,
  setTyping,
  clearTyping,
} from "@/lib/chatStore";

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
  useStore(); // re-render when store updates (e.g. agent reply from another tab)
  const messages = threadId && visitorId ? getMessagesForDisplay(threadId, visitorId) : [];

  useEffect(() => {
    setVisitorId(getOrCreateId(VISITOR_ID_KEY));
    setThreadId(getOrCreateId(THREAD_ID_KEY));
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      if (!visitorId || !threadId) return;
      clearTyping(threadId);
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const newMessage: Message = {
        id: crypto.randomUUID(),
        threadId,
        senderId: visitorId,
        content,
        createdAt: Date.now(),
        status: isOffline ? "pending" : "sending",
      };
      addMessageToStore(newMessage);
      if (!isOffline) simulateSendConfirm(threadId, newMessage.id);
    },
    [threadId, visitorId]
  );

  const handleTyping = useCallback(() => {
    if (threadId && visitorId) setTyping(threadId, visitorId, "Visitor");
  }, [threadId, visitorId]);

  const handleRetry = useCallback(
    (messageId: string) => {
      retryMessage(threadId, messageId);
    },
    [threadId]
  );

  return (
    <>
      {/* Mock website content */}
      <main id="main" className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-slate-800 dark:text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              MiniCom
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <section className="max-w-4xl mx-auto px-6 py-20">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight dark:text-white">
            Welcome to our demo site
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl dark:text-gray-400">
            This is a mock website. Use the chat button in the bottom-right corner to start a
            conversation with support.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 max-w-2xl">
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-slate-800 dark:text-white">Fast support</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">Get help via live chat anytime.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="font-semibold text-slate-800 dark:text-white">Real humans</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">Our team is here to assist you.</p>
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
        onRetry={handleRetry}
        onTyping={handleTyping}
        title="Support"
        disabled={!visitorId}
      />
    </>
  );
}
