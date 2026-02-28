"use client";

import { useEffect } from "react";
import { initStore } from "@/lib/chatStore";

/** Call once on app load so store cache reflects localStorage. */
export function StoreInit() {
  useEffect(() => {
    initStore();
  }, []);
  return null;
}
