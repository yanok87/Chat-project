"use client";

import { useState, useEffect } from "react";
import { useStore, getTyping } from "@/lib/chatStore";

interface TypingIndicatorProps {
  threadId: string;
  currentUserId: string;
}

/** Shows "X is typing..." when the other party is typing. Re-renders on interval so it hides when typing expires. */
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
    <div className="px-3 pb-1 flex justify-start" role="status" aria-live="polite">
      <span className="text-xs text-gray-500">{typing.displayName} is typing…</span>
    </div>
  );
}
