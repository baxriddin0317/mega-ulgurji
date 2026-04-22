import { cn } from "@/lib/utils";

/**
 * Base skeleton primitive — a rounded pulsing block.
 * Respects `prefers-reduced-motion` via the `motion-safe:` variant.
 * Tuned for quiet, enterprise-grade perception of loading (SAP Fiori's
 * recommendation: skeletons beat spinners on 3G because they reduce
 * perceived wait and hint at the content shape about to appear).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md bg-gray-200/80 motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
