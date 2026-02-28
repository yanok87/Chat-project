"use client";

import type { Message } from "@/types";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { AGENT_ID } from "@/lib/chatStore";

interface AgentThreadViewProps {
  threadId: string;
  messages: Message[];
  onSend: (content: string) => void;
}

export function AgentThreadView({ threadId, messages, onSend }: AgentThreadViewProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white" data-thread-id={threadId}>
      <MessageList messages={messages} currentUserId={AGENT_ID} />
      <ChatInput onSend={onSend} placeholder="Reply…" />
    </div>
  );
}
