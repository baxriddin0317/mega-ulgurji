"use client";
import { useEffect, useState } from "react";

/**
 * React to the browser's online/offline events.
 *
 * Starts `true` on the server so SSR matches the initial optimistic render;
 * the first effect pass reconciles with `navigator.onLine`. This avoids the
 * common hydration-mismatch warning and the 1-frame flash of an offline
 * banner for users who are online.
 *
 * Note: `navigator.onLine` reports the OS-level network state. A device can
 * be reported online while having no route to Firebase — for true data-layer
 * confidence we'd also subscribe to Firestore's snapshot-sync callback, but
 * that's a heavier second-phase addition.
 */
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
