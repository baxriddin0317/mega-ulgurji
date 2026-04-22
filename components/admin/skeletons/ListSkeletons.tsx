/**
 * Page-shape skeletons for each admin list.
 *
 * Design rule (from SAP Fiori): each skeleton should mirror the final row's
 * visual shape so the transition to real data is flicker-free. We render 5
 * rows by default — enough to fill the mobile viewport without promising
 * too much data that may not arrive.
 */
import { Skeleton } from "@/components/ui/skeleton";

function OrderRowSkeleton() {
  return (
    <div className="flex items-center w-full px-3 sm:px-4 py-3 shadow-sm rounded-lg border border-l-4 border-gray-200 border-l-gray-200 bg-white gap-3">
      <Skeleton className="size-4 rounded" />
      <Skeleton className="h-3 w-4 rounded" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-28 sm:w-40" />
        <Skeleton className="h-3 w-20 sm:w-24" />
      </div>
      <div className="hidden sm:block space-y-1.5">
        <Skeleton className="h-3.5 w-20 rounded-full" />
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="h-3.5 w-16 ml-auto" />
        <Skeleton className="h-3 w-10 ml-auto" />
      </div>
    </div>
  );
}

export function OrderListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="px-2 sm:px-0 space-y-2" role="status" aria-label="Buyurtmalar yuklanmoqda">
      {Array.from({ length: rows }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
      <span className="sr-only">Yuklanmoqda…</span>
    </div>
  );
}

function InvoiceRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-4 py-3 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-3 w-4 rounded" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-3.5 w-28 sm:w-40" />
          <Skeleton className="h-3 w-20 sm:w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="text-right space-y-1">
          <Skeleton className="h-3 w-16 ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-3.5 w-20 ml-auto" />
          <Skeleton className="h-3 w-10 ml-auto" />
        </div>
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function InvoiceListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Fakturalar yuklanmoqda">
      {Array.from({ length: rows }).map((_, i) => (
        <InvoiceRowSkeleton key={i} />
      ))}
      <span className="sr-only">Yuklanmoqda…</span>
    </div>
  );
}

function CustomerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 sm:size-10 rounded-full" />
        <div className="min-w-0 space-y-1.5 flex-1">
          <Skeleton className="h-4 w-40 sm:w-52" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Mijozlar yuklanmoqda">
      {Array.from({ length: rows }).map((_, i) => (
        <CustomerCardSkeleton key={i} />
      ))}
      <span className="sr-only">Yuklanmoqda…</span>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex gap-3 bg-white rounded-xl border border-gray-200 p-3">
      <Skeleton className="size-16 rounded-2xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-44 sm:w-60" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function ProductCardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Mahsulotlar yuklanmoqda">
      {Array.from({ length: rows }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
      <span className="sr-only">Yuklanmoqda…</span>
    </div>
  );
}

function ProductTableRowSkeleton() {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-3 py-3"><Skeleton className="size-4 rounded" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
      <td className="px-4 py-3"><Skeleton className="size-16 rounded-2xl" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
      </td>
      <td className="px-4 py-3"><Skeleton className="h-8 w-28 rounded-xl" /></td>
      <td className="px-4 py-3"><Skeleton className="h-8 w-24 rounded-xl" /></td>
      <td className="px-4 py-3 text-center"><Skeleton className="size-8 mx-auto rounded" /></td>
      <td className="px-4 py-3 text-center"><Skeleton className="size-8 mx-auto rounded" /></td>
      <td className="px-4 py-3 text-center"><Skeleton className="size-8 mx-auto rounded" /></td>
    </tr>
  );
}

export function ProductTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <ProductTableRowSkeleton key={i} />
      ))}
    </>
  );
}
