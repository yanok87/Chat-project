# Source layout

```
src/
├── app/                    # Next.js App Router
│   ├── (visitor)/          # Mock site + chat widget (later)
│   ├── agent/              # Agent inbox + thread view (later)
│   ├── layout.tsx
│   ├── page.tsx            # Home / visitor entry
│   └── globals.css
├── components/
│   ├── chat/               # Visitor widget: ChatWidget, MessageList, MessageBubble, ChatInput, VisitorView
│   ├── agent/              # Agent app: AgentInbox (keyboard nav), AgentThreadView
│   └── StoreInit.tsx       # Inits store from localStorage on load
├── lib/
│   ├── chatStore.ts        # localStorage store, useStore(), addMessage, getThreadsForInbox, getMessages, markThreadReadBy
├── types/                  # Data model (thread, message, participant)
└── FOLDER_STRUCTURE.md     # This file
```

Routes:

- `/` – visitor mock website + chat widget
- `/agent` – agent inbox (thread list, unread, last preview, sort) + thread view (reply)
