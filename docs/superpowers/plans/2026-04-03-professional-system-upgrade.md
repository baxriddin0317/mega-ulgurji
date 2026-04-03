# Professional System Upgrade: Real Ombor + UI/UX Polish + Notifications

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the app into a professional enterprise system — add real stock movement tracking (Ombor foundation), upgrade notification sounds to be clearly audible, redesign notification UI for visibility, improve both admin and customer sides for readability, and add border animations with semantic colors so every button's purpose is instantly clear.

**Architecture:** Add Firestore "stockMovements" collection for audit trail. Upgrade Web Audio sounds with louder, more distinct tones. Redesign NotificationPanel with larger, more visible layout. Add CSS shine-border animations with semantic colors (green=add, blue=data, amber=bulk, red=danger, purple=move). Improve customer-facing pages for professionalism.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Firebase/Firestore, Zustand 5, Tailwind CSS 4, shadcn/ui, Web Audio API

---

## File Structure

### New Files:
```
store/useStockMovementStore.ts              — Stock movement log store (Ombor audit trail)
lib/types.ts (additions)                    — StockMovement interface
app/admin/ombor/page.tsx                    — Ombor dashboard: movement history + stock overview
components/admin/StockMovementTable.tsx      — Filterable movement log table
```

### Files to Modify:
```
lib/notificationSound.ts                    — Louder, more distinct sounds
store/useNotificationStore.ts               — Add sound volume control
components/admin/NotificationPanel.tsx       — Larger, more visible UI
components/admin/AdminHeader.tsx             — Bigger bell icon, pulse animation
components/admin/Menu.tsx                    — Add Ombor link, improve active states
app/globals.css                             — Add shine-border color variants, button animations
store/useProductStore.ts                    — Log stock movements on every change
store/useOrderStore.ts                      — Log stock movements on delivery/cancel
store/useStockReceiptStore.ts               — Log stock movements on kirim
components/admin/ProductTable.tsx            — Log reason for inline +/- changes
components/admin/BulkStockUpdateModal.tsx    — Add reason field
app/admin/products/page.tsx                 — Add shine-border to action buttons
app/admin/orders/page.tsx                   — Improve order cards readability
app/admin/invoice/[id]/page.tsx             — Improve print layout
components/client/Header.tsx                — Improve search, add cart count
components/client/ProductCard.tsx            — Make entire card clickable, better stock display
components/client/Footer.tsx                — Professional footer with contact info
components/client/Modal.tsx                 — Better checkout UX with order summary
```

---

## Task 1: Louder, Distinct Notification Sounds

**Files:**
- Modify: `lib/notificationSound.ts`

**Current problem:** Sounds are quiet (gain 0.2-0.3) and short (0.3s). Users can't hear them in a busy warehouse.

- [ ] **Step 1: Rewrite notification sounds**

Replace the entire file with louder, more distinct sounds:

**Order sound** — Triple-tone "cash register" chime, gain 0.5, duration 0.8s:
- Tone 1: 880Hz (A5) → hold 0.15s
- Tone 2: 1047Hz (C6) → hold 0.15s  
- Tone 3: 1319Hz (E6) → hold 0.3s (higher, resolves)
- Each tone gain: 0.5 (much louder than current 0.3)

**User sound** — Two-tone rising "welcome" ping, gain 0.45, duration 0.5s:
- Tone 1: 523Hz (C5) → hold 0.15s
- Tone 2: 784Hz (G5) → hold 0.25s

**Alert sound** (NEW — for low stock, nasiya reminders):
- Single tone: 440Hz (A4), square wave (more piercing than sine), gain 0.5
- Beeps twice: 0.15s on, 0.1s off, 0.15s on

- [ ] **Step 2: Verify build and commit**
```bash
npm run build && git add lib/notificationSound.ts && git commit -m "feat: louder, more distinct notification sounds for warehouse environments"
```

---

## Task 2: Redesign Notification Panel UI for Visibility

**Files:**
- Modify: `components/admin/NotificationPanel.tsx`
- Modify: `components/admin/AdminHeader.tsx`

**Current problems:** Bell icon is small, panel is narrow (400px), items are compact and hard to scan.

- [ ] **Step 1: Upgrade bell icon in AdminHeader**

Make the bell larger and add continuous pulse when unread:
```tsx
<button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
  <Bell className="size-6 text-gray-700" />
  {unreadCount > 0 && (
    <>
      <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center animate-bounce">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
      <span className="absolute top-0 right-0 size-3 bg-red-500 rounded-full animate-ping" />
    </>
  )}
</button>
```

- [ ] **Step 2: Widen notification panel and improve readability**

Key changes to NotificationPanel:
- Panel width: `w-[400px]` → `w-[460px]`
- Notification items: larger padding (`px-4 py-3.5` instead of `px-3 py-2.5`)
- Type icons: `size-10 rounded-xl` instead of `size-8 rounded-full` (square icons, more visible)
- Title text: `text-sm font-bold` instead of `text-xs font-semibold`
- Message text: `text-sm text-gray-600` instead of `text-xs text-gray-500`
- Time text: `text-xs text-gray-400` stays same
- Unread dot: `size-3` instead of `size-2` with stronger pulse
- Add colored left border per type: `border-l-4 border-green-500` (order), `border-l-4 border-blue-500` (user), etc.

- [ ] **Step 3: Improve toast notifications**

Toasts should be larger and more visible:
- Font size: 14px instead of 13px
- Padding: 16px 20px instead of 12px 16px  
- Add icon to toast (cart icon for orders, user icon for users)
- Duration: 8000ms for orders (important), 5000ms for others
- Add subtle slide-in animation

- [ ] **Step 4: Verify build and commit**
```bash
npm run build && git add components/admin/NotificationPanel.tsx components/admin/AdminHeader.tsx && git commit -m "feat: larger, more visible notification panel with colored borders and bigger bell"
```

---

## Task 3: Stock Movement Log (Ombor Foundation)

**Files:**
- Add to: `lib/types.ts` — StockMovement interface
- Create: `store/useStockMovementStore.ts`
- Modify: `store/useProductStore.ts` — log movements on stock changes
- Modify: `store/useOrderStore.ts` — log movements on delivery/cancel
- Modify: `store/useStockReceiptStore.ts` — log movements on kirim receipt

**Firestore collection:** "stockMovements"

- [ ] **Step 1: Add StockMovement type to lib/types.ts**

```typescript
export type StockMovementType = 'kirim' | 'sotish' | 'tuzatish' | 'qaytarish' | 'zarar';

export interface StockMovement {
  id: string;
  productId: string;
  productTitle: string;
  type: StockMovementType;
  quantity: number;          // positive = in, negative = out
  stockBefore: number;
  stockAfter: number;
  reason: string;
  reference?: string;        // order ID, receipt ID, etc.
  userId?: string;
  userName?: string;
  timestamp: Timestamp;
}
```

Movement types in Uzbek:
- `kirim` = Incoming (supplier receipt)
- `sotish` = Sale/outgoing (order delivery)
- `tuzatish` = Adjustment (manual correction)
- `qaytarish` = Return (customer return)
- `zarar` = Damage/loss

- [ ] **Step 2: Create useStockMovementStore**

```typescript
// store/useStockMovementStore.ts
import { create } from "zustand";
import { collection, addDoc, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { fireDB } from "@/firebase/config";
import type { StockMovement, StockMovementType } from "@/lib/types";

interface StockMovementStore {
  movements: StockMovement[];
  loading: boolean;
  fetchMovements: () => void;
  logMovement: (data: Omit<StockMovement, "id" | "timestamp">) => Promise<void>;
}

const useStockMovementStore = create<StockMovementStore>((set) => ({
  movements: [],
  loading: true,

  fetchMovements: () => {
    const q = query(collection(fireDB, "stockMovements"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StockMovement[];
      set({ movements: data, loading: false });
    });
  },

  logMovement: async (data) => {
    await addDoc(collection(fireDB, "stockMovements"), {
      ...data,
      timestamp: Timestamp.now(),
    });
  },
}));

export default useStockMovementStore;
```

- [ ] **Step 3: Hook into useProductStore — log on every stock change**

In `updateProduct`, `bulkUpdateStock`, `bulkUpdateProducts`, after the Firestore write, call `logMovement` with type "tuzatish" (adjustment).

In the inline +/- handler (ProductTable), pass a reason like "Qo'lda tuzatish" (Manual adjustment).

- [ ] **Step 4: Hook into useOrderStore — log on delivery/cancel**

In `updateOrderStatus`, after stock decrement (delivery), log each item as type "sotish". After stock restore (cancel), log as type "qaytarish".

- [ ] **Step 5: Hook into useStockReceiptStore — log on kirim**

In `addReceipt`, after stock increment, log each item as type "kirim" with supplier name as reference.

- [ ] **Step 6: Verify build and commit**
```bash
npm run build && git add lib/types.ts store/useStockMovementStore.ts store/useProductStore.ts store/useOrderStore.ts store/useStockReceiptStore.ts && git commit -m "feat: stock movement audit log (Ombor foundation) — tracks every stock change"
```

---

## Task 4: Ombor Dashboard Page

**Files:**
- Create: `app/admin/ombor/page.tsx`
- Create: `components/admin/StockMovementTable.tsx`
- Modify: `components/admin/Menu.tsx` — add Ombor link

- [ ] **Step 1: Create StockMovementTable component**

Filterable table showing movement history:
- Columns: Sana (date), Mahsulot (product), Turi (type badge), Miqdor (+/-), Oldin/Keyin (before/after), Sabab (reason), Havola (reference link)
- Type badges with colors: kirim=green, sotish=blue, tuzatish=amber, qaytarish=purple, zarar=red
- Filters: by type, by date range, by product search
- Sorted newest first
- Pagination (20 per page, "Ko'proq" button)

- [ ] **Step 2: Create Ombor page**

Page layout:
- Title: "Ombor" with subtitle "Tovar harakati tarixi"
- Summary cards: Bugungi kirim (today's incoming), Bugungi chiqim (today's outgoing), Tuzatishlar (adjustments count)
- Filter tabs and search above table
- StockMovementTable below

- [ ] **Step 3: Add Ombor to sidebar menu**

In Menu.tsx, add between "Kirim" and "Hisobotlar":
```tsx
<Link href="/admin/ombor" className={menuLinkClass("/admin/ombor")}>
  <Warehouse className="size-5" /> Ombor
</Link>
```

- [ ] **Step 4: Verify build and commit**
```bash
npm run build && git add app/admin/ombor/ components/admin/StockMovementTable.tsx components/admin/Menu.tsx && git commit -m "feat: Ombor dashboard with stock movement history and audit trail"
```

---

## Task 5: Add Reason Field to Stock Adjustments

**Files:**
- Modify: `components/admin/BulkStockUpdateModal.tsx` — add reason dropdown
- Modify: `components/admin/ProductTable.tsx` — add reason on inline +/-
- Modify: `app/admin/kirim/page.tsx` — show movement type badge

- [ ] **Step 1: Add reason dropdown to BulkStockUpdateModal**

Add a select dropdown with adjustment reasons:
- "Inventarizatsiya" (Inventory count)
- "Zarar / nosozlik" (Damage/defect)
- "Qaytarish" (Return)
- "Boshqa" (Other) with free-text input

Pass reason to bulkUpdateStock and logMovement.

- [ ] **Step 2: Add reason prompt on large inline stock changes**

If admin clicks +/- more than 10 times on same product in 1 minute, or uses the number input to change by more than 20 units, show a small inline dropdown asking for reason. For small changes (1-5 units), default to "Qo'lda tuzatish".

- [ ] **Step 3: Verify build and commit**
```bash
npm run build && git add components/admin/BulkStockUpdateModal.tsx components/admin/ProductTable.tsx app/admin/kirim/page.tsx && git commit -m "feat: adjustment reasons for stock changes with audit logging"
```

---

## Task 6: Shine-Border Animated Buttons with Semantic Colors

**Files:**
- Modify: `app/globals.css` — add color-specific shine-border variants
- Modify: `app/admin/products/page.tsx` — apply to action buttons
- Modify: `app/admin/orders/page.tsx` — apply to action buttons

- [ ] **Step 1: Add semantic shine-border CSS variants to globals.css**

```css
/* Semantic shine borders for action buttons */
.shine-border-green {
  --shine-color: #22c55e;
  --shine-duration: 8s;
}
.shine-border-blue {
  --shine-color: #3b82f6;
  --shine-duration: 8s;
}
.shine-border-amber {
  --shine-color: #f59e0b;
  --shine-duration: 8s;
}
.shine-border-red {
  --shine-color: #ef4444;
  --shine-duration: 8s;
}
.shine-border-purple {
  --shine-color: #a855f7;
  --shine-duration: 8s;
}
.shine-border-cyan {
  --shine-color: #06b6d4;
  --shine-duration: 8s;
}

/* Button press feedback */
.btn-press:active {
  transform: scale(0.97);
  transition: transform 0.1s;
}

/* Subtle glow on hover for important actions */
.glow-green:hover { box-shadow: 0 0 12px rgba(34, 197, 94, 0.3); }
.glow-blue:hover { box-shadow: 0 0 12px rgba(59, 130, 246, 0.3); }
.glow-amber:hover { box-shadow: 0 0 12px rgba(245, 158, 11, 0.3); }
.glow-red:hover { box-shadow: 0 0 12px rgba(239, 68, 68, 0.3); }
```

Color meaning system:
- **Green** = Add/Create (+ Mahsulot, + Kategoriya, + Buyurtma)
- **Blue** = Data/Export (Excel, Template, Tahrirlash eksport)
- **Amber** = Bulk/Warning (Narx yangilash, Ombor yangilash, Tasdiqlash)
- **Red** = Danger/Delete (O'chirish, Bekor qilish)
- **Purple** = Move/Transfer (Kategoriya ko'chirish)
- **Cyan** = Update/Edit (Yangilash uchun import)

- [ ] **Step 2: Apply to products page buttons**

Wrap each button with its semantic class: `className="... btn-press glow-green"` for add buttons, `glow-blue` for export, etc.

- [ ] **Step 3: Apply to orders page buttons**

Same pattern for confirm, delivery sheet, export buttons.

- [ ] **Step 4: Verify build and commit**
```bash
npm run build && git add app/globals.css app/admin/products/page.tsx app/admin/orders/page.tsx && git commit -m "ui: semantic shine-border colors and glow effects for action buttons"
```

---

## Task 7: Customer-Side UI Improvements

**Files:**
- Modify: `components/client/ProductCard.tsx` — full card clickable, better stock display
- Modify: `components/client/Footer.tsx` — professional footer
- Modify: `components/client/Modal.tsx` — better checkout with order summary
- Modify: `components/client/Header.tsx` — cart count in header

- [ ] **Step 1: Make entire ProductCard clickable with better stock display**

Wrap entire card in Link. Add stock status as colored pill badge. Add category tag. Improve hover with scale + shadow.

- [ ] **Step 2: Professional footer**

Add 3 columns: About (logo + description), Links (pages), Contact (phone, address, social icons). Copyright line at bottom.

- [ ] **Step 3: Improve checkout modal**

Add order summary above form: item count, total price, list of items (scrollable if many). Add "Orqaga" (Back) button. Larger submit button with cart icon.

- [ ] **Step 4: Add cart count badge to header**

In Header, next to the user dropdown, show small cart count badge: `cartProducts.length` with rose-500 background.

- [ ] **Step 5: Verify build and commit**
```bash
npm run build && git add components/client/ProductCard.tsx components/client/Footer.tsx components/client/Modal.tsx components/client/Header.tsx && git commit -m "ui: professional customer-side improvements — footer, checkout, card, header"
```

---

## Task 8: Admin Orders Page Readability Improvements

**Files:**
- Modify: `app/admin/orders/page.tsx`

- [ ] **Step 1: Improve order card readability**

- Add colored left border per status (like notification items): green for delivered, blue for new, amber for confirmed, red for cancelled
- Make client name larger: `text-base font-bold` instead of `text-sm`
- Add order total price visible in collapsed header (not just expanded)
- Show item count badge: "3 ta" in a small pill
- Better spacing between order cards: `gap-3` instead of gap-2

- [ ] **Step 2: Verify build and commit**
```bash
npm run build && git add app/admin/orders/page.tsx && git commit -m "ui: improved order card readability with status borders and visible totals"
```

---

## Impact Summary

| Task | What Changes | Who Benefits |
|------|-------------|--------------|
| T1: Louder sounds | 2x louder, 3 distinct tones | Admin (hears in warehouse) |
| T2: Notification UI | Wider panel, bigger icons, colored borders | Admin (reads faster) |
| T3: Stock movement log | Every +/- recorded with who/when/why | Owner (trust, audit) |
| T4: Ombor dashboard | Full movement history page | Admin (visibility) |
| T5: Adjustment reasons | Why stock changed | Owner (accountability) |
| T6: Shine-border buttons | Color-coded actions | Admin (instant recognition) |
| T7: Customer UI | Footer, checkout, cards | Customers (professionalism) |
| T8: Order readability | Status borders, visible totals | Admin (scan faster) |
