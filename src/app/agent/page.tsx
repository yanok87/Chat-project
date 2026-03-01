"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  useStore,
  getThreadsForInbox,
  getMessagesForDisplay,
  addMessage,
  markThreadReadBy,
  retryMessage,
  simulateSendConfirm,
  setTyping,
  clearTyping,
  AGENT_ID,
} from "@/lib/chatStore";
import { AgentInbox } from "@/components/agent/AgentInbox";
import { AgentThreadView } from "@/components/agent/AgentThreadView";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Message } from "@/types";

export default function AgentPage() {
  useStore(); // subscribe so we re-render when store updates (e.g. new message from visitor)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const threads = getThreadsForInbox(AGENT_ID);
  const messages = selectedThreadId ? getMessagesForDisplay(selectedThreadId, AGENT_ID) : [];

  // Mark thread as read when agent opens it or when messages change (e.g. agent replied or visitor sent)
  useEffect(() => {
    if (selectedThreadId) markThreadReadBy(selectedThreadId, AGENT_ID);
  }, [selectedThreadId, messages.length]);

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedThreadId) return;
      clearTyping(selectedThreadId);
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const newMessage: Message = {
        id: crypto.randomUUID(),
        threadId: selectedThreadId,
        senderId: AGENT_ID,
        content,
        createdAt: Date.now(),
        status: isOffline ? "pending" : "sending",
      };
      addMessage(newMessage);
      if (!isOffline) simulateSendConfirm(selectedThreadId, newMessage.id);
      markThreadReadBy(selectedThreadId, AGENT_ID);
    },
    [selectedThreadId]
  );

  const handleTyping = useCallback(() => {
    if (selectedThreadId) setTyping(selectedThreadId, AGENT_ID, "Support");
  }, [selectedThreadId]);

  const handleRetry = useCallback(
    (messageId: string) => {
      if (!selectedThreadId) return;
      retryMessage(selectedThreadId, messageId);
    },
    [selectedThreadId]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <header className="shrink-0 flex items-center px-4 py-3 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex-1 flex items-center justify-start min-w-0">
          <Link
            href="/"
            className="text-lg font-semibold text-gray-900 dark:text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            MiniCom
          </Link>
        </div>
        <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white text-center shrink-0">
          Agent Inbox
        </h1>
        <div className="flex-1 flex items-center justify-end min-w-0">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-80 shrink-0 flex flex-col min-h-0">
          <AgentInbox
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelect={setSelectedThreadId}
          />
        </aside>
        <section id="main" className="flex-1 flex flex-col min-h-0" aria-label="Thread">
          {selectedThreadId ? (
            <AgentThreadView
              threadId={selectedThreadId}
              messages={messages}
              onSend={handleSend}
              onRetry={handleRetry}
              onTyping={handleTyping}
              onClose={() => setSelectedThreadId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a conversation
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
