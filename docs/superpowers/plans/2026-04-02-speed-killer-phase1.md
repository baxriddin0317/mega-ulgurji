# Speed Killer Phase 1: Make Every Admin Action 3x Faster

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform MegaHome Ulgurji admin panel from "functional" to "insanely fast" — bulk everything, one-click everything, fix all date/time bugs, upgrade receipt system, add command palette, and optimize performance. Every change targets saving 2+ hours/day for the admin.

**Architecture:** Enhance existing Next.js 16 App Router + Zustand stores + Firebase Firestore. No new libraries except `cmdk` (command palette) and `date-fns` (date formatting). Follow existing patterns: shadcn/ui components, Tailwind CSS 4 with project brand colors, Uzbek UI text.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Firebase/Firestore, Zustand 5, Tailwind CSS 4, shadcn/ui, cmdk, date-fns

---

## File Structure Overview

### New Files to Create:
```
lib/formatDate.ts                              — Unified date/time formatting (Uzbek locale, UTC+5)
components/admin/CommandPalette.tsx             — Ctrl+K global search across orders/products/customers
components/admin/QuickEditProductModal.tsx      — Inline edit price/stock/name without page navigation
components/admin/BulkStockUpdateModal.tsx       — Batch stock adjustment for multiple products
components/admin/BulkOrderStatusModal.tsx       — Change status of multiple orders at once
components/admin/FloatingActionBar.tsx          — Shows batch actions when rows are selected
components/admin/CustomerStatementModal.tsx     — One-click customer account statement
```

### Files to Modify:
```
components/admin/ProductTable.tsx               — Add multi-select checkboxes, quick-edit button
app/admin/products/page.tsx                     — Integrate FloatingActionBar + BulkStockUpdate
app/admin/orders/page.tsx                       — Add multi-select, bulk status, fix date locale
app/admin/invoice/[id]/page.tsx                 — Full receipt overhaul (dates, QR, signatures, cost)
app/admin/invoices/page.tsx                     — Add time display, bulk print, sorting
app/admin/nasiya/page.tsx                       — Fix O(n²), add bulk payment, sorting
app/admin/kirim/page.tsx                        — Add search debounce, Excel import for stock
app/admin/reports/page.tsx                      — Optimize useMemo, single-pass reduce, date comparison
app/admin/layout.tsx                            — Integrate CommandPalette
components/admin/DashboardSummary.tsx           — Memoize all calculations
components/admin/NotificationPanel.tsx          — Memoize items, limit rendered count
store/useOrderStore.ts                          — Fix batch writes, add transaction safety
store/useProductStore.ts                        — Add bulk stock update action
lib/types.ts                                    — Add new types for multi-select, statements
package.json                                    — Add cmdk, date-fns dependencies
```

---

## Task 1: Install Dependencies & Create Date Utility

**Files:**
- Modify: `package.json`
- Create: `lib/formatDate.ts`

- [ ] **Step 1: Install cmdk and date-fns**

```bash
cd /c/Users/abdul/mega-ulgurji && npm install cmdk date-fns
```

- [ ] **Step 2: Create unified date formatting utility**

Create `lib/formatDate.ts`:

```typescript
import { format } from "date-fns";
import { uz } from "date-fns/locale";

/**
 * Convert Firestore Timestamp to JS Date safely.
 * Handles: Firestore Timestamp objects, seconds-based objects, Date objects, null/undefined.
 */
export function toDate(
  timestamp: { seconds: number; nanoseconds?: number } | Date | null | undefined
): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if ("seconds" in timestamp) return new Date(timestamp.seconds * 1000);
  return null;
}

/** "15-aprel 2026" */
export function formatDateUz(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "d-MMMM yyyy", { locale: uz });
}

/** "15-aprel 2026, 14:30" */
export function formatDateTimeUz(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "d-MMMM yyyy, HH:mm", { locale: uz });
}

/** "14:30" */
export function formatTimeUz(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "HH:mm", { locale: uz });
}

/** "15.04.2026" — short format for tables */
export function formatDateShort(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "dd.MM.yyyy", { locale: uz });
}

/** "15.04.2026, 14:30" — short with time for tables */
export function formatDateTimeShort(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "dd.MM.yyyy, HH:mm", { locale: uz });
}

/** Get start of today in local time */
export function getTodayStart(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/** Get start of this week (Monday) */
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Get start of this month */
export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/formatDate.ts package.json package-lock.json
git commit -m "feat: add date-fns utility and cmdk for speed improvements"
```

---

## Task 2: Fix Date/Time Formatting Across All Admin Pages

**Files:**
- Modify: `app/admin/orders/page.tsx` (fix locale-less toLocaleString)
- Modify: `app/admin/invoices/page.tsx` (add time display)
- Modify: `app/admin/invoice/[id]/page.tsx` (use formatDate utility, add timezone)
- Modify: `app/admin/nasiya/page.tsx` (consistent dates)
- Modify: `app/admin/kirim/page.tsx` (consistent dates)

- [ ] **Step 1: Fix orders page — replace locale-less toLocaleString**

In `app/admin/orders/page.tsx`, find the line:
```typescript
new Date((order.date?.seconds || 0) * 1000).toLocaleString()
```
Replace with:
```typescript
formatDateTimeShort(order.date)
```
Add import at top:
```typescript
import { formatDateTimeShort } from "@/lib/formatDate";
```

- [ ] **Step 2: Fix invoices list — add time display**

In `app/admin/invoices/page.tsx`, find the date display:
```typescript
const date = order.date?.seconds
  ? new Date(order.date.seconds * 1000).toLocaleDateString('uz-UZ')
  : '—';
```
Replace with:
```typescript
const date = formatDateTimeShort(order.date);
```
Add import at top:
```typescript
import { formatDateTimeShort } from "@/lib/formatDate";
```

- [ ] **Step 3: Fix invoice detail — use consistent formatting**

In `app/admin/invoice/[id]/page.tsx`, replace the date/time section:
```typescript
import { formatDateUz, formatTimeUz } from "@/lib/formatDate";
```
Replace `toLocaleDateString('uz-UZ', {...})` with `formatDateUz(order.date)`.
Replace `toLocaleTimeString('uz-UZ', {...})` with `formatTimeUz(order.date)`.

- [ ] **Step 4: Fix nasiya page dates**

In `app/admin/nasiya/page.tsx`, replace any raw date formatting with `formatDateTimeShort()`.

- [ ] **Step 5: Fix kirim page dates**

In `app/admin/kirim/page.tsx`, replace:
```typescript
{new Date((r.date as any)?.seconds * 1000).toLocaleDateString('uz-UZ')}
```
With:
```typescript
{formatDateTimeShort(r.date)}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "fix: consistent Uzbek date/time formatting across all admin pages"
```

---

## Task 3: Fix Order Store — Batch Writes & Transaction Safety

**Files:**
- Modify: `store/useOrderStore.ts`

- [ ] **Step 1: Fix sequential stock updates with batch write**

In `store/useOrderStore.ts`, the `updateOrderStatus` function currently loops with sequential `await updateDoc()` calls. Replace with Firestore `writeBatch()`:

Find the stock decrement section (approximately lines 54-61):
```typescript
if (status === 'yetkazildi' && prevStatus !== 'yetkazildi') {
  for (const item of basketItems) {
    if (item.id) {
      const productRef = doc(fireDB, "products", item.id);
      await updateDoc(productRef, { stock: increment(-item.quantity) });
    }
  }
}
```

Replace with:
```typescript
if (status === 'yetkazildi' && prevStatus !== 'yetkazildi') {
  const batch = writeBatch(fireDB);
  for (const item of basketItems) {
    if (item.id) {
      const productRef = doc(fireDB, "products", item.id);
      batch.update(productRef, { stock: increment(-item.quantity) });
    }
  }
  await batch.commit();
}
```

Do the same for the stock restore section (cancel after delivery).

Add import: `import { writeBatch } from "firebase/firestore";`

- [ ] **Step 2: Add bulk order status update action**

Add new method to the store:
```typescript
bulkUpdateOrderStatus: async (orderIds: string[], status: OrderStatus) => {
  const batch = writeBatch(fireDB);
  const results: { success: number; failed: number } = { success: 0, failed: 0 };

  for (const orderId of orderIds) {
    try {
      const orderRef = doc(fireDB, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) { results.failed++; continue; }

      const orderData = orderSnap.data();
      const prevStatus = orderData.status || 'yangi';
      const basketItems = orderData.basketItems || [];

      // Stock management for delivery/cancel
      if (status === 'yetkazildi' && prevStatus !== 'yetkazildi') {
        for (const item of basketItems) {
          if (item.id) {
            const productRef = doc(fireDB, "products", item.id);
            batch.update(productRef, { stock: increment(-item.quantity) });
          }
        }
      }
      if (status === 'bekor_qilindi' && prevStatus === 'yetkazildi') {
        for (const item of basketItems) {
          if (item.id) {
            const productRef = doc(fireDB, "products", item.id);
            batch.update(productRef, { stock: increment(item.quantity) });
          }
        }
      }

      batch.update(orderRef, { status });
      results.success++;
    } catch {
      results.failed++;
    }
  }

  await batch.commit();

  // Update local state
  set((state) => ({
    orders: state.orders.map((o) =>
      orderIds.includes(o.id) ? { ...o, status } : o
    ),
  }));

  return results;
},
```

- [ ] **Step 3: Add bulk stock update to product store**

In `store/useProductStore.ts`, add:
```typescript
bulkUpdateStock: async (updates: { id: string; stock: number }[]) => {
  const batch = writeBatch(fireDB);
  for (const { id, stock } of updates) {
    const ref = doc(fireDB, "products", id);
    batch.update(ref, { stock });
  }
  await batch.commit();
  return updates.length;
},
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add store/useOrderStore.ts store/useProductStore.ts
git commit -m "fix: batch writes for stock updates, add bulk order status and stock actions"
```

---

## Task 4: Performance — Memoize Dashboard & Reports

**Files:**
- Modify: `components/admin/DashboardSummary.tsx`
- Modify: `app/admin/reports/page.tsx`
- Modify: `components/admin/NotificationPanel.tsx`
- Modify: `app/admin/nasiya/page.tsx`

- [ ] **Step 1: Memoize DashboardSummary calculations**

Wrap each stat calculation in `useMemo`:
```typescript
const unreadOrders = useMemo(
  () => notifications.filter((n) => !n.read && n.type === "new_order"),
  [notifications]
);
const unreadUsers = useMemo(
  () => notifications.filter((n) => !n.read && n.type === "new_user"),
  [notifications]
);
const deliveredOrders = useMemo(
  () => orders.filter((o) => o.status === 'yetkazildi'),
  [orders]
);
const totalRevenue = useMemo(
  () => deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  [deliveredOrders]
);
const totalProfit = useMemo(() => {
  return deliveredOrders.reduce((sum, order) => {
    const cost = (order.basketItems || []).reduce(
      (c, item) => c + (item.costPrice || 0) * item.quantity, 0
    );
    return sum + ((order.totalPrice || 0) - cost);
  }, 0);
}, [deliveredOrders]);
const lowStockProducts = useMemo(
  () => products.filter((p) => typeof p.stock === 'number' && p.stock <= 5),
  [products]
);
```

- [ ] **Step 2: Optimize reports page — single-pass reduce**

In `app/admin/reports/page.tsx`, replace three separate `.filter()` calls with one reduce:
```typescript
const stats = useMemo(() => {
  const startDate = getStartDate(period);
  const startMs = startDate.getTime();

  let deliveredCount = 0, cancelledCount = 0, pendingCount = 0;
  let totalRevenue = 0, totalCost = 0, totalItems = 0;
  const productProfitMap: Record<string, { title: string; revenue: number; cost: number; qty: number }> = {};

  for (const o of orders) {
    const orderDate = o.date?.seconds ? o.date.seconds * 1000 : 0;
    if (orderDate < startMs) continue;

    if (o.status === 'yetkazildi') {
      deliveredCount++;
      totalRevenue += o.totalPrice || 0;
      totalItems += o.totalQuantity || 0;
      for (const item of (o.basketItems || [])) {
        const itemCost = (item.costPrice || 0) * item.quantity;
        totalCost += itemCost;
        const key = item.id || item.title;
        if (!productProfitMap[key]) {
          productProfitMap[key] = { title: item.title, revenue: 0, cost: 0, qty: 0 };
        }
        productProfitMap[key].revenue += Number(item.price) * item.quantity;
        productProfitMap[key].cost += itemCost;
        productProfitMap[key].qty += item.quantity;
      }
    } else if (o.status === 'bekor_qilindi') {
      cancelledCount++;
    } else {
      pendingCount++;
    }
  }

  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const topProducts = Object.values(productProfitMap)
    .map((p) => ({ ...p, profit: p.revenue - p.cost, margin: p.revenue > 0 ? ((p.revenue - p.cost) / p.revenue) * 100 : 0 }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  return {
    totalOrders: deliveredCount + cancelledCount + pendingCount,
    deliveredCount, cancelledCount, pendingCount,
    totalRevenue, totalCost, totalProfit, profitMargin,
    totalItems, topProducts,
  };
}, [orders, period]);
```

- [ ] **Step 3: Fix nasiya O(n²) with Set**

In `app/admin/nasiya/page.tsx`, replace:
```typescript
const ordersWithoutNasiya = deliveredOrders.filter((o) =>
  !records.some((r) => r.orderId === o.id)
);
```
With:
```typescript
const nasiyaOrderIds = useMemo(() => new Set(records.map(r => r.orderId)), [records]);
const ordersWithoutNasiya = useMemo(
  () => deliveredOrders.filter((o) => !nasiyaOrderIds.has(o.id)),
  [deliveredOrders, nasiyaOrderIds]
);
```

- [ ] **Step 4: Memoize NotificationPanel items**

Wrap `NotificationItem` component in `React.memo`:
```typescript
const NotificationItem = React.memo(({ notification, onRead, onRemove, formatTime }: NotificationItemProps) => {
  // ... existing code
});
```
Add display name: `NotificationItem.displayName = "NotificationItem";`

Limit rendered notifications to 50 max with "Ko'proq ko'rish" (Show more) button.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add components/admin/DashboardSummary.tsx app/admin/reports/page.tsx app/admin/nasiya/page.tsx components/admin/NotificationPanel.tsx
git commit -m "perf: memoize dashboard stats, single-pass reports, fix O(n²) nasiya filter"
```

---

## Task 5: Command Palette (Ctrl+K Global Search)

**Files:**
- Create: `components/admin/CommandPalette.tsx`
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Create CommandPalette component**

Create `components/admin/CommandPalette.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useAuthStore } from "@/store/authStore";
import { formatUZS } from "@/lib/formatPrice";
import {
  Package, ShoppingCart, Users, BarChart3, FileText,
  CreditCard, Truck, Settings, Search, Plus, Download,
} from "lucide-react";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { products } = useProductStore();
  const { orders } = useOrderStore();
  const { users } = useAuthStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Qidirish"
      className="fixed inset-0 z-[100]"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[101]">
        <Command.Input
          placeholder="Qidirish... (mahsulot, buyurtma, mijoz, sahifa)"
          className="w-full px-4 py-3.5 text-sm border-b border-gray-200 outline-none placeholder:text-gray-400"
        />
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">
            Natija topilmadi
          </Command.Empty>

          {/* Quick Actions */}
          <Command.Group heading="Tezkor amallar" className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">
            <Command.Item
              onSelect={() => runCommand(() => router.push("/admin/create-product"))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm hover:bg-gray-100 data-[selected=true]:bg-gray-100"
            >
              <Plus className="size-4 text-gray-400" />
              <span>Yangi mahsulot qo'shish</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/admin/create-category"))}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm hover:bg-gray-100 data-[selected=true]:bg-gray-100"
            >
              <Plus className="size-4 text-gray-400" />
              <span>Yangi kategoriya qo'shish</span>
            </Command.Item>
          </Command.Group>

          {/* Pages */}
          <Command.Group heading="Sahifalar" className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">
            {[
              { name: "Dashboard", icon: BarChart3, path: "/admin" },
              { name: "Mahsulotlar", icon: Package, path: "/admin/products" },
              { name: "Buyurtmalar", icon: ShoppingCart, path: "/admin/orders" },
              { name: "Mijozlar", icon: Users, path: "/admin/customers" },
              { name: "Fakturalar", icon: FileText, path: "/admin/invoices" },
              { name: "Nasiya", icon: CreditCard, path: "/admin/nasiya" },
              { name: "Kirim", icon: Truck, path: "/admin/kirim" },
              { name: "Hisobotlar", icon: BarChart3, path: "/admin/reports" },
              { name: "Profil", icon: Settings, path: "/admin/profile" },
            ].map((page) => (
              <Command.Item
                key={page.path}
                onSelect={() => runCommand(() => router.push(page.path))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm hover:bg-gray-100 data-[selected=true]:bg-gray-100"
              >
                <page.icon className="size-4 text-gray-400" />
                <span>{page.name}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Products Search */}
          <Command.Group heading="Mahsulotlar" className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">
            {products.slice(0, 8).map((p) => (
              <Command.Item
                key={p.id}
                value={`${p.title} ${p.category}`}
                onSelect={() => runCommand(() => router.push(`/admin/update-product/${p.id}`))}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm hover:bg-gray-100 data-[selected=true]:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Package className="size-4 text-gray-400" />
                  <span className="truncate">{p.title}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatUZS(Number(p.price))}</span>
              </Command.Item>
            ))}
          </Command.Group>

          {/* Orders Search */}
          <Command.Group heading="Buyurtmalar" className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">
            {orders.slice(0, 5).map((o) => (
              <Command.Item
                key={o.id}
                value={`${o.clientName} ${o.clientPhone} ${o.id}`}
                onSelect={() => runCommand(() => router.push(`/admin/invoice/${o.id}`))}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm hover:bg-gray-100 data-[selected=true]:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="size-4 text-gray-400" />
                  <span className="truncate">{o.clientName}</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatUZS(o.totalPrice)}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        <div className="border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
          <span>Natijalarni tanlash uchun ↑↓ bosing</span>
          <span>ESC yopish</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
```

- [ ] **Step 2: Add CommandPalette to admin layout**

In `app/admin/layout.tsx`, add after imports:
```typescript
import CommandPalette from "@/components/admin/CommandPalette";
```
Add `<CommandPalette />` inside the layout, before or after children.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/admin/CommandPalette.tsx app/admin/layout.tsx
git commit -m "feat: Ctrl+K command palette for instant navigation and search"
```

---

## Task 6: Multi-Select & Floating Action Bar for Products

**Files:**
- Create: `components/admin/FloatingActionBar.tsx`
- Create: `components/admin/BulkStockUpdateModal.tsx`
- Modify: `components/admin/ProductTable.tsx`
- Modify: `app/admin/products/page.tsx`

- [ ] **Step 1: Create FloatingActionBar component**

Create `components/admin/FloatingActionBar.tsx`:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, Package, Trash2, X } from "lucide-react";

interface FloatingActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkPriceUpdate: () => void;
  onBulkStockUpdate: () => void;
  onBulkDelete: () => void;
}

export default function FloatingActionBar({
  selectedCount,
  onClearSelection,
  onBulkPriceUpdate,
  onBulkStockUpdate,
  onBulkDelete,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-bottom-4 duration-200">
      <span className="text-sm font-medium mr-2">
        {selectedCount} ta tanlangan
      </span>

      <Button
        size="sm"
        variant="ghost"
        onClick={onBulkPriceUpdate}
        className="text-amber-400 hover:text-amber-300 hover:bg-gray-800 gap-1.5 text-xs"
      >
        <DollarSign className="size-3.5" />
        Narx yangilash
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={onBulkStockUpdate}
        className="text-blue-400 hover:text-blue-300 hover:bg-gray-800 gap-1.5 text-xs"
      >
        <Package className="size-3.5" />
        Ombor yangilash
      </Button>

      <Button
        size="sm"
        variant="ghost"
        onClick={onBulkDelete}
        className="text-red-400 hover:text-red-300 hover:bg-gray-800 gap-1.5 text-xs"
      >
        <Trash2 className="size-3.5" />
        O'chirish
      </Button>

      <button
        onClick={onClearSelection}
        className="ml-2 p-1 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <X className="size-4 text-gray-400" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create BulkStockUpdateModal**

Create `components/admin/BulkStockUpdateModal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import toast from "react-hot-toast";

interface BulkStockUpdateModalProps {
  selectedIds: string[];
  onClose: () => void;
}

export default function BulkStockUpdateModal({
  selectedIds,
  onClose,
}: BulkStockUpdateModalProps) {
  const { products, bulkUpdateStock } = useProductStore();
  const [mode, setMode] = useState<"set" | "increment">("set");
  const [value, setValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  const handleSubmit = async () => {
    if (value < 0 && mode === "set") {
      toast.error("Ombor soni manfiy bo'lishi mumkin emas");
      return;
    }
    setLoading(true);
    try {
      const updates = selectedProducts.map((p) => ({
        id: p.id,
        stock: mode === "set" ? value : (typeof p.stock === "number" ? p.stock : 0) + value,
      }));
      const count = await bulkUpdateStock(updates);
      toast.success(`${count} ta mahsulot ombori yangilandi`);
      onClose();
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl max-w-lg w-full mx-4 p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
          <X className="size-5 text-gray-400" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Omborni ommaviy yangilash
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {selectedIds.length} ta mahsulot tanlangan
        </p>

        {/* Mode selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("set")}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
              mode === "set" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            Aniq son belgilash
          </button>
          <button
            onClick={() => setMode("increment")}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
              mode === "increment" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            Qo'shish / Ayirish
          </button>
        </div>

        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder={mode === "set" ? "Yangi ombor soni" : "+10 yoki -5"}
        />

        {/* Preview */}
        <div className="mt-4 max-h-48 overflow-y-auto space-y-1.5">
          {selectedProducts.slice(0, 8).map((p) => {
            const currentStock = typeof p.stock === "number" ? p.stock : 0;
            const newStock = mode === "set" ? value : currentStock + value;
            return (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-sm">
                <span className="truncate mr-3">{p.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-gray-400 line-through">{currentStock}</span>
                  <span className="text-gray-400">→</span>
                  <span className={newStock <= 5 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                    {newStock}
                  </span>
                </div>
              </div>
            );
          })}
          {selectedProducts.length > 8 && (
            <p className="text-xs text-gray-400 text-center py-1">
              ... va yana {selectedProducts.length - 8} ta mahsulot
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Yangilanmoqda..." : "Yangilash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add multi-select checkboxes to ProductTable**

In `components/admin/ProductTable.tsx`, add props:
```typescript
interface ProductTableProps {
  search: string;
  selectedCategory: string;
  selectedSubcategory: string;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}
```

Add a checkbox column as the first column in the table header and each row. The header checkbox toggles select-all for visible products. Each row checkbox toggles that product's selection.

- [ ] **Step 4: Integrate FloatingActionBar in products page**

In `app/admin/products/page.tsx`, add state:
```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [showBulkStock, setShowBulkStock] = useState(false);
```

Pass `selectedIds` and `onSelectionChange` to ProductTable. Add FloatingActionBar and BulkStockUpdateModal conditionally.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add components/admin/FloatingActionBar.tsx components/admin/BulkStockUpdateModal.tsx components/admin/ProductTable.tsx app/admin/products/page.tsx
git commit -m "feat: multi-select products with floating action bar and bulk stock update"
```

---

## Task 7: Quick Edit Product Modal

**Files:**
- Create: `components/admin/QuickEditProductModal.tsx`
- Modify: `components/admin/ProductTable.tsx`

- [ ] **Step 1: Create QuickEditProductModal**

Create `components/admin/QuickEditProductModal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { formatUZS } from "@/lib/formatPrice";
import toast from "react-hot-toast";
import type { ProductT } from "@/lib/types";

interface QuickEditProductModalProps {
  product: ProductT;
  onClose: () => void;
}

export default function QuickEditProductModal({
  product,
  onClose,
}: QuickEditProductModalProps) {
  const { updateProduct } = useProductStore();
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price);
  const [costPrice, setCostPrice] = useState(product.costPrice || 0);
  const [stock, setStock] = useState(typeof product.stock === "number" ? product.stock : 0);
  const [loading, setLoading] = useState(false);

  const profit = Number(price) - costPrice;
  const margin = Number(price) > 0 ? (profit / Number(price)) * 100 : 0;

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Nomi bo'sh bo'lishi mumkin emas"); return; }
    if (Number(price) <= 0) { toast.error("Narx 0 dan katta bo'lishi kerak"); return; }

    setLoading(true);
    try {
      await updateProduct(product.id, {
        title: title.trim(),
        price: String(price),
        costPrice,
        stock,
      });
      toast.success("Mahsulot yangilandi");
      onClose();
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
          <X className="size-5 text-gray-400" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Tezkor tahrirlash</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nomi</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Sotish narxi</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Tan narxi</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Ombor soni</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Profit preview */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 text-sm">
            <span className="text-gray-500">Foyda:</span>
            <span className={profit >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {formatUZS(profit)} ({margin.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add quick-edit button to ProductTable rows**

In `components/admin/ProductTable.tsx`, add a `Pencil` icon button next to the existing edit (navigate) button. On click, it opens `QuickEditProductModal` with the product data. The existing edit button still navigates to the full edit page.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/admin/QuickEditProductModal.tsx components/admin/ProductTable.tsx
git commit -m "feat: quick-edit product modal for instant price/stock/name changes"
```

---

## Task 8: Bulk Order Status Change

**Files:**
- Create: `components/admin/BulkOrderStatusModal.tsx`
- Modify: `app/admin/orders/page.tsx`

- [ ] **Step 1: Create BulkOrderStatusModal**

Create `components/admin/BulkOrderStatusModal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useOrderStore } from "@/store/useOrderStore";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import type { OrderStatus } from "@/lib/types";
import toast from "react-hot-toast";

interface BulkOrderStatusModalProps {
  selectedOrderIds: string[];
  onClose: () => void;
}

export default function BulkOrderStatusModal({
  selectedOrderIds,
  onClose,
}: BulkOrderStatusModalProps) {
  const { bulkUpdateOrderStatus } = useOrderStore();
  const [status, setStatus] = useState<OrderStatus>("tasdiqlangan");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const results = await bulkUpdateOrderStatus(selectedOrderIds, status);
      toast.success(
        `${results.success} ta buyurtma yangilandi${results.failed > 0 ? `, ${results.failed} ta xatolik` : ""}`
      );
      onClose();
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
          <X className="size-5 text-gray-400" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Statusni ommaviy o'zgartirish
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {selectedOrderIds.length} ta buyurtma tanlangan
        </p>

        <div className="space-y-2">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value as OrderStatus)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                status === s.value
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className={`inline-block w-3 h-3 rounded-full ${s.bg || "bg-gray-200"}`} />
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
          >
            {loading ? "Yangilanmoqda..." : `${selectedOrderIds.length} ta yangilash`}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add multi-select to orders page**

In `app/admin/orders/page.tsx`:
- Add `selectedOrderIds` state (Set<string>)
- Add checkbox to each order row (inside Disclosure button area)
- Add a FloatingActionBar-style bar at the bottom when orders are selected
- "Statusni o'zgartirish" button opens BulkOrderStatusModal
- "Excel export" button exports only selected orders

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/admin/BulkOrderStatusModal.tsx app/admin/orders/page.tsx
git commit -m "feat: bulk order status change with multi-select"
```

---

## Task 9: Professional Invoice/Receipt Overhaul

**Files:**
- Modify: `app/admin/invoice/[id]/page.tsx`

- [ ] **Step 1: Overhaul the invoice template**

Replace the entire invoice UI with a professional design including:

1. **Header**: Company name, logo placeholder, invoice number (sequential format: `MH-2026-XXXXX`)
2. **Date/Time block**: Formatted with `formatDateUz()` and `formatTimeUz()`, timezone indicator "(UTC+5)"
3. **Status badge**: Color-coded with proper sizing
4. **Customer info section**: Name, phone, formatted nicely
5. **Items table with 8 columns**: #, Product, Category, Unit Price, Qty, Subtotal, Cost Price (if admin), Profit (if admin)
6. **Totals section**: Subtotal, QQS (VAT 12%) if applicable, Grand Total, Total Profit
7. **Footer**: Business info, thank you message, stamp/signature area
8. **QR code placeholder**: For future fiscal receipt integration
9. **Print-optimized CSS**: Proper page breaks, color printing, A4 margins

Key changes:
- Replace raw date handling with `formatDateUz()` and `formatTimeUz()` from `lib/formatDate.ts`
- Add cost price and profit columns (admin view only)
- Add proper loading skeleton instead of plain text
- Add sequential invoice number display (based on order creation order)
- Add "Telegram orqali yuborish" (Share via Telegram) button
- Add "Excel yuklab olish" (Download as Excel) button alongside print

- [ ] **Step 2: Verify build and print preview**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/invoice/[id]/page.tsx
git commit -m "feat: professional invoice with cost/profit, QR placeholder, proper dates, share options"
```

---

## Task 10: Invoices List — Sorting, Bulk Print, Date Filters

**Files:**
- Modify: `app/admin/invoices/page.tsx`

- [ ] **Step 1: Add sorting and date filters**

Enhance the invoices page:
- Add date range filter (Bugun, Shu hafta, Shu oy, Barchasi tabs — same pattern as reports page)
- Add sort options: "Sana bo'yicha" (By date), "Summa bo'yicha" (By amount), "Status bo'yicha" (By status)
- Fix date display to include time using `formatDateTimeShort()`
- Add "Barchasini chop etish" (Print All) button that opens all selected invoices
- Add multi-select checkboxes to invoice rows
- Add "Excel export" button for filtered invoices

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/invoices/page.tsx
git commit -m "feat: invoice list with date filters, sorting, bulk print, and multi-select"
```

---

## Task 11: Nasiya Improvements — Bulk Payment, Sorting, Customer Statement

**Files:**
- Modify: `app/admin/nasiya/page.tsx`
- Create: `components/admin/CustomerStatementModal.tsx`

- [ ] **Step 1: Add sorting and filtering to nasiya page**

Add filter tabs: "Barchasi", "Faol" (active), "To'langan" (paid)
Add sort: "Qarz summasi bo'yicha" (By debt amount), "Sana bo'yicha" (By date)
Move payment form state to NasiyaCard level (each card owns its own form state).

- [ ] **Step 2: Create CustomerStatementModal**

One-click customer account statement showing:
- Customer name and phone
- All nasiya records (active + paid)
- Payment history timeline
- Total owed, total paid, balance
- "Chop etish" (Print) button
- "Telegram yuborish" (Share via Telegram) button

- [ ] **Step 3: Add bulk payment actions**

Add multi-select to nasiya cards. When selected, show floating action bar with:
- "SMS eslatma yuborish" (Send SMS reminder) — placeholder for future
- "Excel export"
- "Barchasini to'langan deb belgilash" (Mark all as paid)

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/nasiya/page.tsx components/admin/CustomerStatementModal.tsx
git commit -m "feat: nasiya sorting, filtering, customer statement, bulk payment actions"
```

---

## Task 12: Kirim (Stock Receipt) — Search Debounce & Excel Import

**Files:**
- Modify: `app/admin/kirim/page.tsx`

- [ ] **Step 1: Add search debouncing**

Replace direct state update with debounced search (300ms delay):
```typescript
const [inputValue, setInputValue] = useState("");
const debouncedSearch = useMemo(
  () => {
    let timeout: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setSearchQuery(value), 300);
    };
  },
  []
);
```

- [ ] **Step 2: Add Excel import for stock receipts**

Add "Import" button that accepts Excel file with columns: Product Name, Quantity, Unit Cost.
Match product names to existing products using fuzzy matching.
Show preview table with validation before import.
Reuse patterns from ImportProductsModal.

- [ ] **Step 3: Add recent receipts pagination**

Replace hardcoded `.slice(0, 10)` with "Ko'proq ko'rish" (Show more) button that loads 10 more each click.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/admin/kirim/page.tsx
git commit -m "feat: kirim search debounce, Excel import, receipt pagination"
```

---

## Summary: Impact Analysis

| Task | Time Saved/Day | Revenue Impact | Complexity |
|------|---------------|----------------|------------|
| T1: Date utility | Foundational | Code quality | Easy |
| T2: Fix dates everywhere | 10 min (no confusion) | Trust/accuracy | Easy |
| T3: Batch writes + bulk actions | 30 min | Data integrity | Medium |
| T4: Memoize dashboard/reports | 20 min (faster loads) | UX speed | Easy |
| T5: Command palette | 30 min (instant nav) | Productivity | Medium |
| T6: Multi-select + floating bar | 45 min (bulk ops) | Enterprise feature | Medium |
| T7: Quick edit modal | 60 min (skip page loads) | Huge time saver | Medium |
| T8: Bulk order status | 45 min (batch processing) | Enterprise feature | Medium |
| T9: Invoice overhaul | 30 min (professional docs) | Revenue (billing) | Medium |
| T10: Invoice filters/sort | 20 min (find invoices fast) | Productivity | Easy |
| T11: Nasiya improvements | 45 min (debt management) | Revenue recovery | Medium |
| T12: Kirim improvements | 20 min (faster stock entry) | Accuracy | Easy |

**Total estimated daily time savings: ~5.5 hours**

**This makes admin operations 3-4x faster and positions the platform for enterprise sales.**
