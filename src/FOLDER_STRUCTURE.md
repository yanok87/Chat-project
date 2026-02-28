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
├── lib/                    # Store, transport, utils
├── types/                  # Data model (thread, message, participant)
└── FOLDER_STRUCTURE.md     # This file
```

Routes to add later:

- `/` – visitor mock website + widget
- `/agent` – agent app (inbox, then thread view)
