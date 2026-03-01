"use client";

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Focus the input when mounted (e.g. when chat panel opens) */
  autoFocus?: boolean;
  /** Call on each keystroke (debounced by caller) to show "typing" to the other side */
  onTyping?: () => void;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message…",
  autoFocus = false,
  onTyping,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const send = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onTyping?.();
    },
    [onTyping]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex gap-2 p-3 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 min-h-[40px] max-h-32 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        aria-label="Message input"
      />
      <button
        type="button"
        onClick={send}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-offset-gray-800"
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  );
}
