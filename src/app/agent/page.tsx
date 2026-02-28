"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  useStore,
  getThreadsForInbox,
  getMessages,
  addMessage,
  markThreadReadBy,
  AGENT_ID,
} from "@/lib/chatStore";
import { AgentInbox } from "@/components/agent/AgentInbox";
import { AgentThreadView } from "@/components/agent/AgentThreadView";
import type { Message } from "@/types";

export default function AgentPage() {
  useStore(); // subscribe so we re-render when store updates (e.g. new message from visitor)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const threads = getThreadsForInbox(AGENT_ID);
  const messages = selectedThreadId ? getMessages(selectedThreadId) : [];

  useEffect(() => {
    if (selectedThreadId) markThreadReadBy(selectedThreadId, AGENT_ID);
  }, [selectedThreadId]);

  const handleSend = useCallback(
    (content: string) => {
      if (!selectedThreadId) return;
      const newMessage: Message = {
        id: crypto.randomUUID(),
        threadId: selectedThreadId,
        senderId: AGENT_ID,
        content,
        createdAt: Date.now(),
        status: "sent",
      };
      addMessage(newMessage);
    },
    [selectedThreadId]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Agent Inbox</h1>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          View site
        </Link>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-80 shrink-0 flex flex-col min-h-0">
          <AgentInbox
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelect={setSelectedThreadId}
          />
        </aside>
        <section className="flex-1 flex flex-col min-h-0" aria-label="Thread">
          {selectedThreadId ? (
            <AgentThreadView
              threadId={selectedThreadId}
              messages={messages}
              onSend={handleSend}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
