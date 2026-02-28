"use client";

import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  /** If true, show on the right (visitor); otherwise left (agent) */
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
      role="listitem"
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-200 text-gray-900 rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span className="text-xs opacity-80">
            {new Date(message.createdAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.status === "sending" && (
            <span className="text-xs opacity-80" aria-live="polite">
              Sending…
            </span>
          )}
          {message.status === "failed" && (
            <span className="text-xs text-red-200" aria-live="assertive">
              Failed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
