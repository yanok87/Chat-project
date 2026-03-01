"use client";

import { useState, useEffect } from "react";
import { useStore, getTyping } from "@/lib/chatStore";

interface TypingIndicatorProps {
  threadId: string;
  currentUserId: string;
}

/** Shows animated dots when the other party is typing. */
export function TypingIndicator({ threadId, currentUserId }: TypingIndicatorProps) {
  useStore(); // subscribe to store
  const [tick, setTick] = useState(0);
  const typing = getTyping(threadId);

  useEffect(() => {
    if (!typing) return;
    const delay = Math.max(0, typing.until - Date.now());
    const id = setTimeout(() => setTick((t) => t + 1), delay);
    return () => clearTimeout(id);
  }, [typing, tick]);

  if (!typing || typing.userId === currentUserId) return null;

  return (
    <div className="flex justify-start items-center px-3 py-2" role="status" aria-live="polite" aria-label={`${typing.displayName} is typing`}>
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-gray-500 animate-typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 rounded-full bg-gray-500 animate-typing-dot" style={{ animationDelay: "200ms" }} />
        <span className="h-2 w-2 rounded-full bg-gray-500 animate-typing-dot" style={{ animationDelay: "400ms" }} />
      </div>
    </div>
  );
}
