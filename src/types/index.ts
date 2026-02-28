/**
 * MiniCom data model: participants, messages, threads.
 * Includes timestamps, delivery status, and read receipts.
 */

/** Who can send messages in a thread */
export type ParticipantRole = "visitor" | "agent";

export interface Participant {
  id: string;
  role: ParticipantRole;
  displayName: string;
  /** Optional; e.g. for agent identification */
  email?: string;
}

/** Delivery state for realtime/optimistic UI */
export type MessageStatus = "sending" | "sent" | "failed" | "pending";

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  createdAt: number; // epoch ms
  updatedAt?: number;
  status: MessageStatus;
  /** Read receipt: when the other party read this message (epoch ms) */
  readAt?: number;
}

/** Thread status for inbox filtering */
export type ThreadStatus = "open" | "closed";

export interface ThreadMetadata {
  /** Page/source where the visitor started the chat */
  source?: string;
  /** Custom key-value data (e.g. plan, user id from your backend) */
  [key: string]: string | undefined;
}

export interface Thread {
  id: string;
  /** Participant IDs; typically [visitorId, agentId] */
  participantIds: string[];
  createdAt: number;
  updatedAt: number; // last activity
  status: ThreadStatus;
  metadata?: ThreadMetadata;
}

/** Inbox list item: thread plus derived fields for display */
export interface ThreadInboxItem extends Thread {
  /** Last message in the thread (for preview) */
  lastMessage?: Pick<Message, "content" | "createdAt" | "senderId" | "status">;
  /** Unread count for the current user (e.g. agent) */
  unreadCount: number;
  /** Participants hydrated for display */
  participants?: Participant[];
}
