"use client";

import { useSyncExternalStore } from "react";
import type { Thread, Message, ThreadInboxItem } from "@/types";

const STORAGE_KEY = "minicom-data";
export const AGENT_ID = "agent-1";

export interface StoreData {
  threads: Record<string, Thread>;
  messages: Record<string, Message[]>;
}

function defaultData(): StoreData {
  return { threads: {}, messages: {} };
}

function load(): StoreData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const data = JSON.parse(raw) as StoreData;
    return {
      threads: data.threads ?? {},
      messages: data.messages ?? {},
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
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => defaultData()
  );
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

/** Append message and update thread.updatedAt. Creates thread if visitor sends first. */
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
  list.push(message);
  data.messages[message.threadId] = list;
  const thread = data.threads[message.threadId];
  if (thread) thread.updatedAt = message.createdAt;
  save(data);
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
  if (changed) save(data);
}

/** Inbox list: threads with lastMessage and unreadCount, sorted by unread then recent. */
export function getThreadsForInbox(agentId: string): ThreadInboxItem[] {
  const data = getSnapshot();
  const items: ThreadInboxItem[] = [];
  for (const thread of Object.values(data.threads)) {
    const list = (data.messages[thread.id] ?? []).slice().sort((a, b) => a.createdAt - b.createdAt);
    const last = list[list.length - 1];
    const unreadCount = list.filter((m) => m.senderId !== agentId && !m.readAt).length;
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
