import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./ChatInput";

describe("ChatInput", () => {
  it("calls onSend with trimmed content when user types and clicks Send", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByRole("textbox", { name: /message input/i });
    const sendBtn = screen.getByRole("button", { name: /send message/i });

    await user.type(input, "  Hello  ");
    expect(sendBtn).not.toBeDisabled();
    await user.click(sendBtn);

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("Hello");
  });
});
