"use client";

import { useState } from "react";
import type { Message } from "@/types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface ChatWidgetProps {
  /** Current visitor/participant id (for bubble alignment and send) */
  currentUserId: string;
  threadId: string;
  messages: Message[];
  onSend: (content: string) => void;
  title?: string;
  /** Disable input until e.g. client ids are ready */
  disabled?: boolean;
  /** Called when user clicks Retry on a failed message (messageId) */
  onRetry?: (messageId: string) => void;
}

export function ChatWidget({
  currentUserId,
  threadId,
  messages,
  onSend,
  title = "Chat",
  disabled = false,
  onRetry,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Launcher button: bottom-right */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        <span className="sr-only">{isOpen ? "Close chat" : "Open chat"}</span>
        {isOpen ? (
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl"
          role="dialog"
          aria-label={title}
          data-thread-id={threadId}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <MessageList messages={messages} currentUserId={currentUserId} onRetry={onRetry} />
          <ChatInput onSend={onSend} disabled={disabled} autoFocus />
        </div>
      )}
    </>
  );
}
