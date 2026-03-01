import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ThreadInboxItem } from "@/types";
import { AgentInbox } from "./AgentInbox";

const now = Date.now();

const mockThreads: ThreadInboxItem[] = [
  {
    id: "thread-1",
    participantIds: ["visitor-1", "agent-1"],
    createdAt: now - 60000,
    updatedAt: now - 30000,
    status: "open",
    unreadCount: 2,
    lastMessage: {
      content: "Hello, I need help with my order",
      createdAt: now - 30000,
      senderId: "visitor-1",
      status: "sent",
    },
  },
  {
    id: "thread-2",
    participantIds: ["visitor-2", "agent-1"],
    createdAt: now - 120000,
    updatedAt: now - 60000,
    status: "open",
    unreadCount: 0,
    lastMessage: {
      content: "Thanks, all good!",
      createdAt: now - 60000,
      senderId: "agent-1",
      status: "sent",
    },
  },
];

describe("AgentInbox", () => {
  it('shows "No conversations yet" when threads is empty', () => {
    render(<AgentInbox threads={[]} selectedThreadId={null} onSelect={jest.fn()} />);
    expect(screen.getByText("No conversations yet.")).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: /conversations/i })).toBeInTheDocument();
  });

  it("renders thread list with preview and unread count", () => {
    render(<AgentInbox threads={mockThreads} selectedThreadId={null} onSelect={jest.fn()} />);
    expect(screen.getByText("Hello, I need help with my order")).toBeInTheDocument();
    expect(screen.getByText("Thanks, all good!")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // unread badge for first thread
  });

  it("truncates long preview with ellipsis", () => {
    const longContent = "A".repeat(60);
    const threads: ThreadInboxItem[] = [
      {
        ...mockThreads[0],
        id: "thread-long",
        lastMessage: { ...mockThreads[0].lastMessage!, content: longContent },
      },
    ];
    render(<AgentInbox threads={threads} selectedThreadId={null} onSelect={jest.fn()} />);
    expect(screen.getByText(/A{50}…/)).toBeInTheDocument();
  });

  it("calls onSelect with thread id when a thread is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<AgentInbox threads={mockThreads} selectedThreadId={null} onSelect={onSelect} />);

    await user.click(screen.getByRole("option", { name: /2 unread/i }));
    expect(onSelect).toHaveBeenCalledWith("thread-1");
  });

  it("marks selected thread with aria-selected", () => {
    render(<AgentInbox threads={mockThreads} selectedThreadId="thread-2" onSelect={jest.fn()} />);
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("shows thread with no messages as 'No messages yet'", () => {
    const threads: ThreadInboxItem[] = [
      {
        ...mockThreads[0],
        id: "thread-empty",
        lastMessage: undefined,
        unreadCount: 0,
      },
    ];
    render(<AgentInbox threads={threads} selectedThreadId={null} onSelect={jest.fn()} />);
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });
});
