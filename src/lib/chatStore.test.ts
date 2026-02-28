import {
  initStore,
  addMessage,
  setMessageStatus,
  getMessages,
  getThreadsForInbox,
  AGENT_ID,
} from "./chatStore";

function clearStore() {
  localStorage.removeItem("minicom-data");
  initStore();
}

beforeEach(() => {
  clearStore();
});

describe("chatStore", () => {
  describe("state transition: message sending -> sent", () => {
    it("updates message status from sending to sent", () => {
      const threadId = "thread-1";
      const messageId = "msg-1";
      addMessage({
        id: messageId,
        threadId,
        senderId: "visitor-1",
        content: "Hi",
        createdAt: Date.now(),
        status: "sending",
      });

      let messages = getMessages(threadId);
      expect(messages).toHaveLength(1);
      expect(messages[0].status).toBe("sending");

      setMessageStatus(threadId, messageId, "sent");
      messages = getMessages(threadId);
      expect(messages[0].status).toBe("sent");
    });
  });

  describe("edge case: unknown thread", () => {
    it("returns empty array for unknown thread id", () => {
      const messages = getMessages("non-existent-thread-id");
      expect(messages).toEqual([]);
    });

    it("getThreadsForInbox returns empty array when no threads", () => {
      const threads = getThreadsForInbox(AGENT_ID);
      expect(threads).toEqual([]);
    });
  });
});
