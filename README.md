# MiniCom — Live Chat Support Demo

A prototype live customer support system (visitor chat widget + agent inbox), built with Next.js (App Router), React, and Tailwind CSS.

## Project overview

- **Home** (`/`): Entry point with “Enter as user” and “Enter as support agent”.
- **Visitor app** (`/visitor`): A mock marketing site with a bottom-right chat widget. Visitors can start a conversation, see message bubbles, scrollable history, auto-scroll on new messages, and delivery states (sending / sent / failed) with Retry.
- **Agent app** (`/agent`): Inbox of open conversations with unread counts and last message preview (sorted by unread then recent). Click a thread to open it and reply; messages are synced back to the visitor via the same store.
- **Realtime**: Simulated with **localStorage** and the **storage event** so multiple tabs stay in sync. Optimistic send, retry on failure, out-of-order message handling (upsert by id, sort by `createdAt`).
- **Resilience**: Error boundary catches render errors and shows a fallback; offline banner appears when the user is offline.

## Architecture (text diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js App (single origin)                                     │
├─────────────────────────────────────────────────────────────────┤
│  Routes:                                                          │
│    /         → Home (Enter as user / Enter as support agent)      │
│    /visitor  → VisitorView (mock site + ChatWidget)              │
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

## Source layout

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home: "Enter as user" → /visitor, "Enter as support agent" → /agent
│   ├── visitor/
│   │   └── page.tsx        # Mock site + chat widget (VisitorView)
│   ├── agent/
│   │   └── page.tsx        # Agent inbox + thread view
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── chat/               # Visitor widget: ChatWidget, MessageList, MessageBubble, ChatInput, TypingIndicator, VisitorView
│   ├── agent/              # Agent app: AgentInbox (keyboard nav), AgentThreadView
│   ├── StoreInit.tsx       # Inits store from localStorage on load
│   ├── ThemeToggle.tsx
│   ├── OfflineBanner.tsx
│   └── ErrorBoundary.tsx
├── contexts/
│   └── ThemeContext.tsx    # Theme (light/dark) with persistence
├── lib/
│   └── chatStore.ts        # localStorage store; optimistic send (sending→sent/failed), setMessageStatus, retryMessage, simulateSendConfirm; upsert by id (out-of-order safe)
└── types/                  # Data model (thread, message, participant)
```

## State management choices and trade-offs

- **Single module store** (`lib/chatStore.ts`) with **localStorage** and **useSyncExternalStore**:
  - **Pros**: No extra dependency (no Zustand/Redux); simple persistence and cross-tab updates via storage events; one source of truth.
  - **Trade-offs**: No server persistence (threads/messages are lost if localStorage is cleared); not suitable for multi-device or real multi-user. For a demo, this keeps the scope small and avoids a backend.
- **Optimistic updates**: Messages are added with `status: "sending"`, then updated to `"sent"` or `"failed"` after a simulated delay. Retry updates the same message in place. Upsert by `message.id` avoids duplicates and handles out-of-order delivery when sorting by `createdAt`.

## How AI helped

Cursor helped with most of the implementation: scaffolding the Next.js app and data model; the optimistic send and retry flow (addMessage, setMessageStatus, Retry button); dark mode (system preference + toggle); notification badge and sound on new messages; a11y (keyboard shortcuts, screen reader, focus); keeping the README in sync. I did the debugging, project and user logic updates, user experience improvements, state logic, and the decisions on what belongs in Context vs localStorage; I also directed the work, tested it, and did some README and test edits myself.


## Running the project

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run test   # Jest + React Testing Library
```

- **Visitor**: Open `/`, click “Enter as user”, then use the chat button and send messages.
- **Agent**: Open `/`, click “Enter as support agent” (or go to `/agent`), pick a conversation, reply. Use another tab for `/visitor` to see replies in the widget.
- **Test failed send**: By default `SEND_FAIL_RATE_FOR_DEMO = 0.2` in `src/lib/chatStore.ts`, so ~20% of sends simulate failure. Set it to `1` to force every send to fail. After ~400ms a failed message shows "Failed"; use the Retry button on that bubble (visitor or agent thread) to mark it as sent.


