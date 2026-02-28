"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  className?: string;
}

export function MessageList({ messages, currentUserId, className = "" }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div
      className={`flex-1 overflow-y-auto p-3 flex flex-col gap-2 ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No messages yet. Say hello!</p>
      ) : (
        messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))
      )}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
