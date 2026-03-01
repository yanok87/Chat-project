"use client";

import { useSyncExternalStore } from "react";
import type { Thread, Message, ThreadInboxItem, MessageStatus } from "@/types";

const STORAGE_KEY = "minicom-data";
export const AGENT_ID = "agent-1";

export interface TypingState {
  userId: string;
  displayName: string;
  until: number;
}

export interface StoreData {
  threads: Record<string, Thread>;
  messages: Record<string, Message[]>;
  typing: Record<string, TypingState>;
}

const TYPING_TTL_MS = 2000;

function defaultData(): StoreData {
  return { threads: {}, messages: {}, typing: {} };
}

/** Cached empty snapshot for getServerSnapshot (must be stable to avoid infinite loop). */
const emptySnapshot: StoreData = defaultData();

function load(): StoreData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const data = JSON.parse(raw) as StoreData;
    return {
      threads: data.threads ?? {},
      messages: data.messages ?? {},
      typing: data.typing ?? {},
    };
  } catch {
    return defaultData();
  }
}

function save(data: StoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notify();
  } catch {
    // ignore
  }
}

let cache: StoreData = defaultData();
const listeners = new Set<() => void>();

function notify(): void {
  cache = load();
  listeners.forEach((cb) => cb());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function onStorage(e: StorageEvent): void {
  if (e.key === STORAGE_KEY) notify();
}

export function getSnapshot(): StoreData {
  return cache;
}

export function subscribeToStore(callback: () => void): () => void {
  return subscribe(callback);
}

/** Initialize cache from localStorage and notify subscribers. */
export function initStore(): void {
  cache = load();
  listeners.forEach((cb) => cb());
}

/** React hook: subscribe to store and return current data. */
export function useStore(): StoreData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot(): StoreData {
  return emptySnapshot;
}

/** Create thread if missing. Call before adding first message. */
export function ensureThread(threadId: string, visitorId: string): void {
  const data = load();
  if (data.threads[threadId]) return;
  const now = Date.now();
  data.threads[threadId] = {
    id: threadId,
    participantIds: [visitorId, AGENT_ID],
    createdAt: now,
    updatedAt: now,
    status: "open",
  };
  save(data);
}

/** Upsert message by id (handles out-of-order and duplicates). Updates thread.updatedAt. */
export function addMessage(message: Message): void {
  const data = load();
  if (!data.threads[message.threadId] && message.senderId !== AGENT_ID) {
    data.threads[message.threadId] = {
      id: message.threadId,
      participantIds: [message.senderId, AGENT_ID],
      createdAt: message.createdAt,
      updatedAt: message.createdAt,
      status: "open",
    };
  }
  const list = data.messages[message.threadId] ?? [];
  const idx = list.findIndex((m) => m.id === message.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...message };
  } else {
    list.push(message);
  }
  data.messages[message.threadId] = list;
  const thread = data.threads[message.threadId];
  if (thread) thread.updatedAt = Math.max(thread.updatedAt, message.createdAt);
  save(data);
}

/** Update a message's status (for optimistic send → sent/failed). */
export function setMessageStatus(threadId: string, messageId: string, status: MessageStatus): void {
  const data = load();
  const list = data.messages[threadId];
  if (!list) return;
  const msg = list.find((m) => m.id === messageId);
  if (!msg) return;
  msg.status = status;
  save(data);
}

/** Retry a failed message: set sending then sent (simulated success on retry). */
export function retryMessage(threadId: string, messageId: string): void {
  setMessageStatus(threadId, messageId, "sending");
  setTimeout(() => setMessageStatus(threadId, messageId, "sent"), 400);
}

/** 0–1. Set to 1 to force every send to "fail" so you can test the Retry flow. */
export const SEND_FAIL_RATE_FOR_DEMO = 0.2;

/** Simulate async send: after delay, set message to sent or failed (for demo). */
export function simulateSendConfirm(
  threadId: string,
  messageId: string,
  failRate = SEND_FAIL_RATE_FOR_DEMO
): void {
  setTimeout(() => {
    const status: MessageStatus = Math.random() < failRate ? "failed" : "sent";
    setMessageStatus(threadId, messageId, status);
  }, 400);
}

/** Get all messages with status "pending" (sent while offline). */
function getPendingMessages(): Array<{ threadId: string; messageId: string }> {
  const data = getSnapshot();
  const out: Array<{ threadId: string; messageId: string }> = [];
  for (const [threadId, list] of Object.entries(data.messages)) {
    for (const m of list) {
      if (m.status === "pending") out.push({ threadId, messageId: m.id });
    }
  }
  return out;
}

/** When back online: mark all pending messages as sending, then sent. */
export function flushPendingMessages(): void {
  const pending = getPendingMessages();
  for (const { threadId, messageId } of pending) {
    setMessageStatus(threadId, messageId, "sending");
  }
  if (pending.length > 0) {
    setTimeout(() => {
      for (const { threadId, messageId } of pending) {
        setMessageStatus(threadId, messageId, "sent");
      }
    }, 400);
  }
}

/** Mark messages in thread (not from userId) as read. */
export function markThreadReadBy(threadId: string, userId: string): void {
  const data = load();
  const list = data.messages[threadId];
  if (!list) return;
  const now = Date.now();
  let changed = false;
  for (const m of list) {
    if (m.senderId !== userId && !m.readAt) {
      m.readAt = now;
      changed = true;
    }
  }
  if (changed) {
    save(data);
  }
}

/** Inbox list: threads with lastMessage and unreadCount, sorted by unread then recent. Only "sent" messages count for lastMessage and unread. */
export function getThreadsForInbox(agentId: string): ThreadInboxItem[] {
  const data = getSnapshot();
  const items: ThreadInboxItem[] = [];
  for (const thread of Object.values(data.threads)) {
    const all = (data.messages[thread.id] ?? []).slice().sort((a, b) => a.createdAt - b.createdAt);
    const sentOnly = all.filter((m) => m.status === "sent");
    const last = sentOnly[sentOnly.length - 1];
    const unreadCount = sentOnly.filter((m) => m.senderId !== agentId && !m.readAt).length;
    items.push({
      ...thread,
      lastMessage: last ? { content: last.content, createdAt: last.createdAt, senderId: last.senderId, status: last.status } : undefined,
      unreadCount,
    });
  }
  items.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return b.updatedAt - a.updatedAt;
  });
  return items;
}

/** Messages for a thread, sorted by createdAt. */
export function getMessages(threadId: string): Message[] {
  const data = getSnapshot();
  const list = data.messages[threadId] ?? [];
  return list.slice().sort((a, b) => a.createdAt - b.createdAt);
}

/** Messages to display in the thread: own messages (all statuses) + other party's messages only when status === "sent". Failed/sending from the other side are hidden. */
export function getMessagesForDisplay(threadId: string, currentUserId: string): Message[] {
  const list = getMessages(threadId);
  return list.filter((m) => m.senderId === currentUserId || m.status === "sent");
}

/** Set "user is typing" in this thread; expires after TYPING_TTL_MS. Debounce by calling on each keystroke. */
export function setTyping(threadId: string, userId: string, displayName: string): void {
  const data = load();
  data.typing = data.typing ?? {};
  data.typing[threadId] = { userId, displayName, until: Date.now() + TYPING_TTL_MS };
  save(data);
}

/** Clear typing for this thread (e.g. when user sends). */
export function clearTyping(threadId: string): void {
  const data = load();
  if (!data.typing || !data.typing[threadId]) return;
  delete data.typing[threadId];
  save(data);
}

/** Who is currently typing in this thread (if until > now). */
export function getTyping(threadId: string): TypingState | null {
  const data = getSnapshot();
  const t = data.typing?.[threadId];
  if (!t || t.until <= Date.now()) return null;
  return t;
}
