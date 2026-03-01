"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

const ROW_HEIGHT_ESTIMATE = 72;
const ROW_GAP_PX = 8;
const OVERSCAN = 5;

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  className?: string;
  /** Called when user clicks Retry on a failed message (messageId) */
  onRetry?: (messageId: string) => void;
}

export function MessageList({ messages, currentUserId, className = "", onRetry }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE + ROW_GAP_PX,
    overscan: OVERSCAN,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      virtualizer.scrollToIndex(messages.length - 1, { align: "end", behavior: "smooth" });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length, virtualizer]);

  if (messages.length === 0) {
    return (
      <div
        className={`flex-1 overflow-y-auto p-3 flex flex-col ${className}`}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <p className="text-sm text-gray-500 text-center py-4">No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`flex-1 overflow-y-auto overflow-x-hidden p-3 ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const msg = messages[virtualRow.index];
          return (
            <div
              key={msg.id}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: ROW_GAP_PX,
              }}
            >
              <MessageBubble
                message={msg}
                isOwn={msg.senderId === currentUserId}
                onRetry={onRetry ? () => onRetry(msg.id) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
