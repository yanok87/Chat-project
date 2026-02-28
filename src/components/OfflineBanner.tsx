"use client";

import { useState, useEffect, useRef } from "react";
import { flushPendingMessages } from "@/lib/chatStore";

const OFFLINE_DEBOUNCE_MS = 1200;

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const offlineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    if (navigator.onLine) flushPendingMessages();
    const handleOnline = () => {
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
        offlineTimeoutRef.current = null;
      }
      setShowBanner(false);
      setIsOnline(true);
      flushPendingMessages();
    };
    const handleOffline = () => {
      setIsOnline(false);
      offlineTimeoutRef.current = setTimeout(() => setShowBanner(true), OFFLINE_DEBOUNCE_MS);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      if (offlineTimeoutRef.current) clearTimeout(offlineTimeoutRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fallback: "online" event often doesn't fire (e.g. DevTools toggle). Poll while offline.
  useEffect(() => {
    if (typeof window === "undefined" || isOnline) return;
    const id = setInterval(() => {
      if (navigator.onLine) {
        if (offlineTimeoutRef.current) {
          clearTimeout(offlineTimeoutRef.current);
          offlineTimeoutRef.current = null;
        }
        flushPendingMessages();
        setIsOnline(true);
        setShowBanner(false);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div
      className="sticky top-0 z-50 px-4 py-2 bg-amber-500 text-amber-900 text-center text-sm font-medium"
      role="status"
      aria-live="polite"
    >
      You’re offline. Messages will send when you’re back online.
    </div>
  );
}
