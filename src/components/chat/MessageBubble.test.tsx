import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

const baseMessage: Message = {
  id: "msg-1",
  threadId: "thread-1",
  senderId: "user-1",
  content: "Hello world",
  createdAt: Date.now(),
  status: "sent",
};

describe("MessageBubble", () => {
  it("renders message content and timestamp", () => {
    render(<MessageBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it('shows "Sending…" when status is sending', () => {
    const message: Message = { ...baseMessage, status: "sending" };
    render(<MessageBubble message={message} isOwn={true} />);
    expect(screen.getByText("Sending…")).toBeInTheDocument();
  });

  it('shows "Failed" when status is failed', () => {
    const message: Message = { ...baseMessage, status: "failed" };
    render(<MessageBubble message={message} isOwn={true} />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("shows Retry button when own message, failed, and onRetry provided", () => {
    const message: Message = { ...baseMessage, status: "failed" };
    const onRetry = jest.fn();
    render(<MessageBubble message={message} isOwn={true} onRetry={onRetry} />);
    const retryBtn = screen.getByRole("button", { name: /retry sending message/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it("does not show Retry for other user's failed message", () => {
    const message: Message = { ...baseMessage, status: "failed" };
    const onRetry = jest.fn();
    render(<MessageBubble message={message} isOwn={false} onRetry={onRetry} />);
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("does not show Retry when onRetry is not provided", () => {
    const message: Message = { ...baseMessage, status: "failed" };
    render(<MessageBubble message={message} isOwn={true} />);
    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("calls onRetry when Retry button is clicked", async () => {
    const user = userEvent.setup();
    const message: Message = { ...baseMessage, status: "failed" };
    const onRetry = jest.fn();
    render(<MessageBubble message={message} isOwn={true} onRetry={onRetry} />);

    const retryBtn = screen.getByRole("button", { name: /retry sending message/i });
    await user.click(retryBtn);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
