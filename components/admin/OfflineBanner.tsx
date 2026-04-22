"use client";
/**
 * Amber strip under the admin header that surfaces loss of network.
 *
 * Firestore's client SDK quietly queues writes while offline and flushes
 * them on reconnect — the banner exists purely to tell shop owners, "your
 * last edit is pending, don't panic if the UI hasn't updated yet." Without
 * it they hammer the same button assuming nothing happened, which creates
 * duplicate writes when the connection returns.
 *
 * Renders nothing while online to avoid layout shift.
 */
import { WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnline } from "@/hooks/useOnline";

export default function OfflineBanner() {
  const online = useOnline();

  return (
    <AnimatePresence initial={false}>
      {!online && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="overflow-hidden bg-amber-50 border-b border-amber-200"
        >
          <div className="flex items-center gap-2 px-4 py-2 text-amber-900 text-xs sm:text-sm">
            <WifiOff className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">Oflayn rejim.</span>
            <span className="text-amber-800 truncate">
              O&apos;zgarishlar saqlanadi va internet qaytganda yuboriladi.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
