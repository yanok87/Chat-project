"use client";

import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  /** If true, show on the right (visitor); otherwise left (agent) */
  isOwn: boolean;
  /** Called when user clicks Retry on a failed message (only for own messages) */
  onRetry?: () => void;
}

export function MessageBubble({ message, isOwn, onRetry }: MessageBubbleProps) {
  const showRetry = isOwn && message.status === "failed" && onRetry;

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
      role="listitem"
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-blue-600 text-white rounded-br-md dark:bg-blue-700"
            : "bg-gray-200 text-gray-900 rounded-bl-md dark:bg-gray-600 dark:text-gray-100"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`flex items-center gap-2 mt-1 flex-wrap ${isOwn ? "justify-end" : "justify-start"}`}>
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
          {message.status === "pending" && (
            <span className="text-xs opacity-80" aria-live="polite">
              Pending (will send when online)
            </span>
          )}
          {message.status === "failed" && (
            <span className="text-xs text-red-200" aria-live="assertive">
              Failed
            </span>
          )}
          {showRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/80 rounded"
              aria-label="Retry sending message"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
