# MiniCom — Live Chat Support Demo

A prototype live customer support system (visitor chat widget + agent inbox), built with Next.js (App Router), React, and Tailwind CSS.

## Project overview

- **Visitor app** (`/`): A mock marketing site with a bottom-right chat widget. Visitors can start a conversation, see message bubbles, scrollable history, auto-scroll on new messages, and delivery states (sending / sent / failed) with Retry.
- **Agent app** (`/agent`): Inbox of open conversations with unread counts and last message preview (sorted by unread then recent). Click a thread to open it and reply; messages are synced back to the visitor via the same store.
- **Realtime**: Simulated with **localStorage** and the **storage event** so multiple tabs stay in sync. Optimistic send, retry on failure, out-of-order message handling (upsert by id, sort by `createdAt`).
- **Resilience**: Error boundary catches render errors and shows a fallback; offline banner appears when the user is offline.

## Architecture (text diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js App (single origin)                                     │
├─────────────────────────────────────────────────────────────────┤
│  Routes:                                                          │
│    /         → VisitorView (mock site + ChatWidget)              │
│    /agent    → Agent inbox list + AgentThreadView                │
├─────────────────────────────────────────────────────────────────┤
│  Shared layer                                                     │
│    lib/chatStore.ts  ← localStorage (key: minicom-data)           │
│    • threads, messages (in memory cache + persisted)              │
│    • useStore() → useSyncExternalStore(subscribe, getSnapshot)   │
│    • addMessage, setMessageStatus, retryMessage, getMessages,    │
│      getThreadsForInbox, markThreadReadBy                         │
├─────────────────────────────────────────────────────────────────┤
│  Cross-tab sync                                                   │
│    Tab A writes → localStorage.setItem → notify() in Tab A        │
│    Tab B        → window "storage" event → notify() → re-render  │
└─────────────────────────────────────────────────────────────────┘
```

- **Visitor** and **agent** both read/write the same store. No backend; all state is in the browser (localStorage + in-memory cache).

## State management choices and trade-offs

- **Single module store** (`lib/chatStore.ts`) with **localStorage** and **useSyncExternalStore**:
  - **Pros**: No extra dependency (no Zustand/Redux); simple persistence and cross-tab updates via storage events; one source of truth.
  - **Trade-offs**: No server persistence (threads/messages are lost if localStorage is cleared); not suitable for multi-device or real multi-user. For a demo, this keeps the scope small and avoids a backend.
- **Optimistic updates**: Messages are added with `status: "sending"`, then updated to `"sent"` or `"failed"` after a simulated delay. Retry updates the same message in place. Upsert by `message.id` avoids duplicates and handles out-of-order delivery when sorting by `createdAt`.

## How AI helped

*(Fill this in with your own notes. Example: "Used Cursor to scaffold the Next.js app and data model; asked for 'optimistic send and retry' and got addMessage + setMessageStatus + Retry button flow; edited the README and tests myself.")*

## Improvements with more time

- **Backend**: Persist threads and messages to a DB; realtime via WebSockets or a service (e.g. Supabase/Firebase).
- **Presence and typing**: "Agent is typing…" / "Visitor is typing…" with debounced updates.
- **Performance**: Virtualized message list (e.g. react-window) for very long threads.
- **Tests**: More component tests (e.g. MessageBubble Retry), E2E (Playwright) for full visitor → agent flow.
- **Accessibility**: More keyboard shortcuts and screen-reader tweaks.
- **Bonus**: Dark mode, notification sound/badge on new message, thread persistence to a real API.

## Running the project

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run test   # Jest + React Testing Library
```

- **Visitor**: Open `/`, use the chat button, send messages.
- **Agent**: Open `/agent`, pick a conversation, reply. Use another tab or window for `/` to see replies in the widget.
- **Test failed send**: In `src/lib/chatStore.ts` set `SEND_FAIL_RATE_FOR_DEMO = 1`, then send a message and use the Retry button.

## Submission checklist

- [ ] GitHub repo link
- [ ] Live demo link (e.g. Vercel / Netlify)
- [ ] README with all required sections (this file)
