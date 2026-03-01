import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentThreadView } from "./AgentThreadView";

jest.mock("@/lib/chatStore", () => ({
  useStore: () => {},
  getTyping: () => undefined,
  AGENT_ID: "agent-1",
}));

describe("AgentThreadView", () => {
  it("renders thread container with data-thread-id", () => {
    render(
      <AgentThreadView threadId="thread-1" messages={[]} onSend={jest.fn()} />
    );
    expect(document.querySelector("[data-thread-id='thread-1']")).toBeInTheDocument();
  });

  it("renders chat messages region", () => {
    render(
      <AgentThreadView threadId="thread-1" messages={[]} onSend={jest.fn()} />
    );
    expect(screen.getByRole("log", { name: /chat messages/i })).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(
      <AgentThreadView threadId="thread-1" messages={[]} onSend={jest.fn()} />
    );
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('renders reply input with placeholder "Reply…"', () => {
    render(
      <AgentThreadView threadId="thread-1" messages={[]} onSend={jest.fn()} />
    );
    expect(screen.getByRole("textbox", { name: /message input/i })).toHaveAttribute(
      "placeholder",
      "Reply…"
    );
  });

  it("calls onSend when user sends a message", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(
      <AgentThreadView threadId="thread-1" messages={[]} onSend={onSend} />
    );

    await user.type(screen.getByRole("textbox", { name: /message input/i }), "Hi there");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("Hi there");
  });

  it("calls onTyping when user types", async () => {
    const user = userEvent.setup();
    const onTyping = jest.fn();
    render(
      <AgentThreadView
        threadId="thread-1"
        messages={[]}
        onSend={jest.fn()}
        onTyping={onTyping}
      />
    );

    await user.type(screen.getByRole("textbox", { name: /message input/i }), "x");
    expect(onTyping).toHaveBeenCalled();
  });
});
