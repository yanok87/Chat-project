"use client";

import { useRef } from "react";
import type { ThreadInboxItem } from "@/types";

interface AgentInboxProps {
  threads: ThreadInboxItem[];
  selectedThreadId: string | null;
  onSelect: (threadId: string) => void;
}

function formatPreview(content: string, maxLen = 50): string {
  const t = content.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen) + "…";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AgentInbox({ threads, selectedThreadId, onSelect }: AgentInboxProps) {
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (threads.length === 0) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!buttons?.length) return;
    const current = document.activeElement as HTMLButtonElement | null;
    const index = current ? Array.from(buttons).indexOf(current) : -1;
    if (e.key === "ArrowDown" && index < buttons.length - 1) {
      e.preventDefault();
      buttons[index + 1].focus();
    } else if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      buttons[index - 1].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttons[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttons[buttons.length - 1].focus();
    }
  };

  return (
    <ul
      ref={listRef}
      className="flex flex-col border-r border-gray-200 bg-gray-50 overflow-y-auto dark:border-gray-700 dark:bg-gray-800/50"
      role="listbox"
      aria-label="Conversations"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {threads.length === 0 ? (
        <li className="p-4 text-sm text-gray-500 dark:text-gray-400">No conversations yet.</li>
      ) : (
        threads.map((thread) => {
          const isSelected = thread.id === selectedThreadId;
          const preview = thread.lastMessage
            ? formatPreview(thread.lastMessage.content)
            : "No messages yet";
          const time = thread.lastMessage
            ? formatTime(thread.lastMessage.createdAt)
            : formatTime(thread.updatedAt);
          return (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => onSelect(thread.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-offset-0 ${
                  isSelected ? "bg-white border-l-4 border-l-blue-600 dark:bg-gray-800 dark:border-l-blue-500" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                role="option"
                aria-selected={isSelected}
                aria-label={`Conversation ${thread.unreadCount > 0 ? `, ${thread.unreadCount} unread` : ""}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs text-gray-500 shrink-0 dark:text-gray-400">{time}</span>
                  {thread.unreadCount > 0 && (
                    <span
                      className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center"
                      aria-hidden
                    >
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-gray-900 truncate dark:text-gray-200">{preview}</p>
              </button>
            </li>
          );
        })
      )}
    </ul>
  );
}
