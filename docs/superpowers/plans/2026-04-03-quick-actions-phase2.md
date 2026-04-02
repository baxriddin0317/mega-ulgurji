# Quick Actions Phase 2: Simple Actions, Huge Impact + UI/UX Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 12 time-saving quick actions (export-edit-reimport round-trip, duplicate product, inline stock +/-, admin quick-order, delivery sheets, dashboard command center, inactive customer alerts) plus comprehensive UI/UX polish across all admin pages. All features use real Firestore data — zero mock data.

**Architecture:** Enhance existing Next.js 16 App Router + Zustand stores + Firebase Firestore. No new libraries. Follow existing patterns: shadcn/ui, Tailwind CSS 4, Uzbek UI text. Key data: ProductT.price is STRING, Firestore "user" collection is singular, stock only changes on delivery status.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Firebase/Firestore, Zustand 5, Tailwind CSS 4, shadcn/ui, xlsx

---

## Critical Data Flow Reference

- **ProductT.price** is `string` — always use `Number(price)` for math
- **Order.basketItems** is `ProductT[]` — full product objects stored inside orders
- **Stock** only decrements when status changes to `yetkazildi`, restores on cancel
- **Firestore collections:** "products", "orders", "user" (singular), "categories", "nasiya", "receipts"
- **Store exports:** `useProductStore` (default), `useOrderStore` (named: `{ useOrderStore }`), `authStore` (named: `{ useAuthStore }`)
- **formatUZS(number)** returns "1 500 000 so'm", **formatNumber(number)** returns "1 500 000"

---

## File Structure Overview

### New Files:
```
lib/exportForUpdate.ts                         — Export products with ID column for round-trip
components/admin/ReimportProductsModal.tsx      — Upload edited Excel, match by ID, preview changes, apply
components/admin/QuickActionsWidget.tsx         — Dashboard command center (actions + needs attention)
components/admin/AdminQuickOrder.tsx            — Full quick-order creation page component
app/admin/create-order/page.tsx                — Route wrapper for admin order creation
lib/generateDeliverySheet.ts                   — Generate printable delivery sheet HTML
components/admin/BatchCategoryMoveModal.tsx     — Move selected products to another category
```

### Files to Modify:
```
store/useProductStore.ts                       — Add duplicateProduct, bulkUpdateProducts, bulkMoveCategory
lib/exportExcel.ts                             — Add exportLowStockProducts function
components/admin/ProductTable.tsx               — Add inline stock +/-, duplicate button
components/admin/FloatingActionBar.tsx           — Add category move action
app/admin/products/page.tsx                    — Wire reimport modal, category move, reorganize buttons
app/admin/orders/page.tsx                      — Add "confirm all new" button, delivery sheet export, row highlights
app/admin/page.tsx                             — Add QuickActionsWidget above DashboardSummary
app/admin/customers/page.tsx                   — Add inactive customer alerts, filters
components/admin/DashboardSummary.tsx           — Add low-stock export button on card
app/admin/invoices/page.tsx                    — Add batch print with multi-select
app/globals.css                                — Add button press feedback utility
app/admin/layout.tsx                           — Configure toast position to bottom-right
```

---

## Task 1: Export Products for Round-Trip Update

**Files:**
- Create: `lib/exportForUpdate.ts`
- Modify: `app/admin/products/page.tsx`

**Data Flow:** Read `products` from store -> build Excel with `id` as first column -> user downloads, edits prices/stock/names in Excel -> re-uploads in Task 2.

- [ ] **Step 1: Create lib/exportForUpdate.ts**

Export products with their Firestore document IDs. The ID column is the match key for re-import. Columns: ID (do not change!), #, Nomi, Kategoriya, Subkategoriya, Sotish narxi, Tan narxi, Ombor soni, Tavsif. Set column widths for readability.

- [ ] **Step 2: Add "Tahrirlash uchun eksport" button to products page**

Cyan-colored outline button. On click, exports filtered products (by active category) using the new function. Shows toast with count.

- [ ] **Step 3: Verify build and commit**
```bash
npm run build && git add lib/exportForUpdate.ts app/admin/products/page.tsx && git commit -m "feat: export products with IDs for round-trip editing"
```

---

## Task 2: Re-Import Updated Products Modal

**Files:**
- Create: `components/admin/ReimportProductsModal.tsx`
- Modify: `store/useProductStore.ts` — add `bulkUpdateProducts` method
- Modify: `app/admin/products/page.tsx` — wire the modal

**Data Flow:** User uploads Excel -> parse with xlsx -> match rows by `id` column against existing products -> show preview (X updated, Y errors) -> batch update via Firestore writeBatch -> real-time listener auto-refreshes.

- [ ] **Step 1: Add bulkUpdateProducts to store**

New method that accepts array of `{ id: string; data: Partial<ProductT> }`, uses writeBatch to update all in one atomic operation.

- [ ] **Step 2: Create ReimportProductsModal component**

File upload (drag-drop or click). On file select: parse with XLSX, find ID column, match against existing products. Show preview table with changes highlighted (old value -> new value). Green for valid, red for errors. "Yangilash" button commits changes. Smart column mapping (same UZ/EN/RU support as existing importExcel.ts).

- [ ] **Step 3: Wire modal in products page**

Add state, button ("Yangilash uchun import" in orange), and conditional rendering.

- [ ] **Step 4: Verify build and commit**
```bash
npm run build && git add store/useProductStore.ts components/admin/ReimportProductsModal.tsx app/admin/products/page.tsx && git commit -m "feat: re-import products from edited Excel with preview and validation"
```

---

## Task 3: Duplicate Product + Inline Stock +/- Buttons

**Files:**
- Modify: `store/useProductStore.ts` — add `duplicateProduct` method
- Modify: `components/admin/ProductTable.tsx` — add duplicate button + inline stock controls

**Data Flow for Duplicate:** Find product by ID in store -> create new Firestore doc with same data, empty images, title prefixed "Nusxa: ", new storageFileId, new timestamps.

**Data Flow for Inline Stock:** Click +/- -> call `updateProduct(id, { stock: currentStock +/- 1 })` -> optimistic update -> Firestore write -> onSnapshot auto-refreshes.

- [ ] **Step 1: Add duplicateProduct to store**

Copies all product data except id/images/timestamps. Adds "Nusxa: " prefix to title. Uses addDoc to create new document.

- [ ] **Step 2: Add inline stock +/- to ProductTable desktop rows**

Replace static stock badge with interactive: [-] 47 [+] control. Minus disabled at 0. Each click calls updateProduct immediately. Color-coded: red if <=5, green if >5.

- [ ] **Step 3: Add duplicate (Copy) button to ProductTable rows**

Copy icon button next to Quick Edit. Calls duplicateProduct, shows toast on success.

- [ ] **Step 4: Verify build and commit**
```bash
npm run build && git add store/useProductStore.ts components/admin/ProductTable.tsx && git commit -m "feat: duplicate product and inline stock +/- buttons in table"
```

---

## Task 4: Batch Category Move

**Files:**
- Create: `components/admin/BatchCategoryMoveModal.tsx`
- Modify: `components/admin/FloatingActionBar.tsx` — add category move button
- Modify: `app/admin/products/page.tsx` — wire modal

**Data Flow:** Select products via checkbox -> click "Kategoriya" in floating bar -> modal shows all categories from useCategoryStore -> select target -> batch update all selected products' `category` field via writeBatch.

- [ ] **Step 1: Create BatchCategoryMoveModal**

Shows list of categories as selectable buttons (same pattern as BulkOrderStatusModal). Uses writeBatch to update category field for all selected products.

- [ ] **Step 2: Add FolderInput icon button to FloatingActionBar**

New prop `onBatchCategoryMove`, new button with folder icon.

- [ ] **Step 3: Wire in products page**

Add state, modal rendering, clear selection on close.

- [ ] **Step 4: Verify build and commit**
```bash
npm run build && git add components/admin/BatchCategoryMoveModal.tsx components/admin/FloatingActionBar.tsx app/admin/products/page.tsx && git commit -m "feat: batch move products to another category"
```

---

## Task 5: Admin Quick-Order Creation

**Files:**
- Create: `app/admin/create-order/page.tsx`
- Create: `components/admin/AdminQuickOrder.tsx`

**Data Flow:** Admin selects customer from authStore.users -> adds products from useProductStore.products -> system calculates totals -> calls useOrderStore.addOrder() with real Order object -> order appears in orders list via onSnapshot.

**CRITICAL:** Order.basketItems must be ProductT[] objects. The addOrder sets status 'yangi' and date internally. Order.totalPrice = sum of Number(product.price) * quantity.

- [ ] **Step 1: Create AdminQuickOrder component**

Three sections:
1. Customer selector: searchable list from authStore.users. Shows name, phone. "Oxirgi buyurtma" (Repeat last order) button per customer.
2. Product adder: search bar with autocomplete from products. For selected customer: show most-ordered products as quick-add cards. Quantity inputs. Running total in sticky footer.
3. Confirm: order summary, "Buyurtma yaratish" button calling addOrder with constructed Order object.

Repeat last order: finds customer's most recent order from orders array, copies basketItems with quantities.

- [ ] **Step 2: Create route page wrapper**

Simple page at app/admin/create-order/page.tsx importing AdminQuickOrder.

- [ ] **Step 3: Add navigation link to sidebar and CommandPalette**

Add "Buyurtma yaratish" to sidebar menu and CommandPalette quick actions.

- [ ] **Step 4: Verify build and commit**
```bash
npm run build && git add app/admin/create-order/ components/admin/AdminQuickOrder.tsx && git commit -m "feat: admin quick-order creation with repeat-last-order"
```

---

## Task 6: Delivery Sheet Export

**Files:**
- Create: `lib/generateDeliverySheet.ts`
- Modify: `app/admin/orders/page.tsx` — add "Yetkazish varaqasi" button

**Data Flow:** Filter orders by status (tasdiqlangan/yetkazilmoqda) -> generate printable HTML with order details per customer -> open in new browser tab for printing.

- [ ] **Step 1: Create generateDeliverySheet function**

Generates full HTML document with print-friendly CSS. Header: company name, date, total counts. Per customer block: stop number, customer name (large), phone, items table (product, quantity, price), total, signature line. Uses page-break-inside:avoid for print. Opens result in new tab using URL.createObjectURL with Blob.

- [ ] **Step 2: Add button to orders page**

"Yetkazish varaqasi" button filters pending delivery orders and calls generateDeliverySheet.

- [ ] **Step 3: Verify build and commit**
```bash
npm run build && git add lib/generateDeliverySheet.ts app/admin/orders/page.tsx && git commit -m "feat: delivery sheet export for drivers"
```

---

## Task 7: One-Click Confirm All New Orders

**Files:**
- Modify: `app/admin/orders/page.tsx`

**Data Flow:** Filter orders where status === 'yangi' -> call bulkUpdateOrderStatus(ids, 'tasdiqlangan') -> toast with count. No stock changes (confirmation doesn't affect stock).

- [ ] **Step 1: Add "Barchasini tasdiqlash" button**

Amber button above orders list, only visible when new orders exist. Shows count: "X ta yangi buyurtmani tasdiqlash". Loading state while processing.

- [ ] **Step 2: Verify build and commit**
```bash
npm run build && git add app/admin/orders/page.tsx && git commit -m "feat: one-click confirm all new orders"
```

---

## Task 8: Dashboard Quick Actions + Needs Attention Widget

**Files:**
- Create: `components/admin/QuickActionsWidget.tsx`
- Modify: `app/admin/page.tsx`

**Data Flow:** Reads from existing stores (products, orders, users) to compute attention items. No new Firestore queries — purely derived state with useMemo.

- [ ] **Step 1: Create QuickActionsWidget**

Two sections:
1. Quick Actions: 4 colored link cards (+ Buyurtma, + Mahsulot, Kirim, Hisobotlar)
2. Needs Attention: contextual pill badges computed from real data — pending orders count, out-of-stock count, low stock count, inactive customers (7+ days since last order). Each links to relevant page.

All data from existing stores, computed with useMemo. Attention items only show when count > 0.

- [ ] **Step 2: Add widget to dashboard page**

Place QuickActionsWidget before DashboardSummary in app/admin/page.tsx.

- [ ] **Step 3: Verify build and commit**
```bash
npm run build && git add components/admin/QuickActionsWidget.tsx app/admin/page.tsx && git commit -m "feat: dashboard quick actions widget with needs-attention alerts"
```

---

## Task 9: Inactive Customer Alerts + Customer Filters

**Files:**
- Modify: `app/admin/customers/page.tsx`

**Data Flow:** Compute last order date per customer from orders array -> classify as active (<=7d) / cooling (8-14d) / at-risk (15-30d) / inactive (30+d) -> show colored dot + filter tabs.

- [ ] **Step 1: Add activity status computation with useMemo**

Build Map of userUid -> lastOrderTimestamp from orders. Classify each customer. Return function that takes uid and returns { status, label, color }.

- [ ] **Step 2: Add filter tabs and colored dots**

Filter tabs: "Barchasi", "Faol", "Sovumoqda", "Xavfli", "Faolsiz". Colored dots next to customer names. Filter customer list based on selected tab.

- [ ] **Step 3: Verify build and commit**
```bash
npm run build && git add app/admin/customers/page.tsx && git commit -m "feat: inactive customer alerts with activity status dots and filters"
```

---

## Task 10: Low Stock Reorder List Export

**Files:**
- Modify: `lib/exportExcel.ts` — add `exportLowStockProducts`
- Modify: `components/admin/DashboardSummary.tsx` — add export button on low-stock card

**Data Flow:** Filter products where stock <= 5 -> export Excel with: Name, Category, Current Stock, Suggested Reorder (max(20-stock, 10)), Unit Cost, Estimated Total.

- [ ] **Step 1: Add exportLowStockProducts function to lib/exportExcel.ts**

Creates Excel with low-stock products, suggested reorder quantities, and estimated cost.

- [ ] **Step 2: Add download button to low-stock dashboard card**

Small download icon button on the low-stock card that calls exportLowStockProducts(products).

- [ ] **Step 3: Verify build and commit**
```bash
npm run build && git add lib/exportExcel.ts components/admin/DashboardSummary.tsx && git commit -m "feat: one-click low stock reorder list export from dashboard"
```

---

## Task 11: Batch Print Invoices

**Files:**
- Modify: `app/admin/invoices/page.tsx`

**Data Flow:** Select invoices via checkboxes -> click print -> open each invoice page in new tab (max 10 to avoid popup blocking).

- [ ] **Step 1: Add multi-select and print button**

Add selectedInvoiceIds state. Add checkboxes to invoice rows. Add "Chop etish" button that opens selected invoice pages in new tabs.

- [ ] **Step 2: Verify build and commit**
```bash
npm run build && git add app/admin/invoices/page.tsx && git commit -m "feat: batch print invoices with multi-select"
```

---

## Task 12: UI/UX Polish Across All Pages

**Files:**
- Modify: `app/admin/products/page.tsx` — reorganize action buttons
- Modify: `app/admin/orders/page.tsx` — add row highlight on selection
- Modify: `app/globals.css` — add button press feedback utility
- Modify: `app/admin/layout.tsx` — configure toast position

- [ ] **Step 1: Add button press feedback to globals.css**

Add active:scale utility for all interactive elements.

- [ ] **Step 2: Reorganize products page action buttons**

Group into: Primary row (Add Product, Add Category), Secondary row with visual dividers: Export group | Import group | Bulk group | Delete All.

- [ ] **Step 3: Add row highlight on order selection**

Add bg-blue-50/50 + border-blue-200 to selected order rows.

- [ ] **Step 4: Configure toast position to bottom-right**

Update Toaster in admin layout: position="bottom-right", duration 3000ms.

- [ ] **Step 5: Verify build and commit**
```bash
npm run build && git add app/admin/products/page.tsx app/admin/orders/page.tsx app/globals.css app/admin/layout.tsx && git commit -m "ui: polish action buttons, selection highlights, toast position"
```

---

## Impact Summary

| Task | Daily Savings | Complexity |
|------|--------------|------------|
| T1: Export for update | 30 min | Easy |
| T2: Re-import modal | 90 min | Medium |
| T3: Duplicate + inline stock | 45 min | Medium |
| T4: Batch category move | 20 min | Easy |
| T5: Admin quick-order | 60 min | Hard |
| T6: Delivery sheet | 30 min | Easy |
| T7: Confirm all new | 15 min | Easy |
| T8: Dashboard widgets | 20 min | Medium |
| T9: Inactive customers | 15 min | Easy |
| T10: Low stock export | 10 min | Easy |
| T11: Batch print | 15 min | Easy |
| T12: UI/UX polish | Perception | Easy |

**Total: ~5.8 hours/day saved. Combined with Phase 1: ~11.3 hours/day.**
