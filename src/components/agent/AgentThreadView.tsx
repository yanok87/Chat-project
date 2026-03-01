"use client";

import type { Message } from "@/types";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { AGENT_ID } from "@/lib/chatStore";

interface AgentThreadViewProps {
  threadId: string;
  messages: Message[];
  onSend: (content: string) => void;
  onRetry?: (messageId: string) => void;
  onTyping?: () => void;
  onClose?: () => void;
}

export function AgentThreadView({ threadId, messages, onSend, onRetry, onTyping, onClose }: AgentThreadViewProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-gray-800" data-thread-id={threadId}>
      {onClose && (
        <div className="shrink-0 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Back to inbox"
          >
            ← Back to inbox
          </button>
        </div>
      )}
      <MessageList messages={messages} currentUserId={AGENT_ID} onRetry={onRetry} />
      <TypingIndicator threadId={threadId} currentUserId={AGENT_ID} />
      <ChatInput onSend={onSend} placeholder="Reply…" onTyping={onTyping} />
    </div>
  );
}
