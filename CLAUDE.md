# MegaHome Ulgurji - E-Commerce Platform

## Project Overview
Uzbek wholesale e-commerce platform ("MegaHome ulgurji" = MegaHome wholesale). Built with Next.js 16 App Router, Firebase backend, Zustand state management, Tailwind CSS 4.

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Radix UI + Headless UI + shadcn/ui
- **State**: Zustand 5.0.4 (persisted stores)
- **Backend**: Firebase 11.8.1 (Auth + Firestore + Storage)
- **Server**: Firebase Admin 13.4.0 (API routes)
- **Forms**: React Hook Form + Zod validation
- **Email**: Nodemailer (Gmail SMTP)
- **Icons**: Lucide React + React Icons
- **Animations**: AOS (Animate On Scroll)
- **Notifications**: React Hot Toast

## Directory Structure
```
app/
├── (auth)/           # Login & signup pages
├── (client-side)/    # Customer-facing pages (home, product, category, cart, orders)
├── admin/            # Admin panel (users, products, categories, orders, profile)
├── api/              # API routes (delete-user, sendOrderEmail)
├── layout.tsx        # Root layout (AuthProvider, Toaster, fonts)
└── globals.css       # Tailwind theme + custom CSS variables
components/
├── admin/            # Admin UI (Sidebar, Tables, Forms, Search)
├── auth/             # LoginForm, SignUpForm, ProtectedRoute
├── client/           # Customer UI (Header, Footer, ProductCard, Cart)
├── contents/         # Page content wrappers
└── ui/               # shadcn/ui primitives (button, avatar, dialog, etc.)
store/                # Zustand stores
├── authStore.ts      # Auth state, user data, role checks
├── useCartStore.ts   # Cart items, quantities, totals (persisted)
├── useCategoryStore.ts # Category CRUD with real-time listeners
├── useProductStore.ts  # Product CRUD with real-time listeners
├── useOrderStore.ts  # Order management
├── useDraftStore.ts  # Auto-save drafts (24h expiry)
└── useToggleStore.ts # Sidebar toggle state
firebase/config.ts    # Firebase client SDK initialization
lib/types.ts          # TypeScript interfaces (ProductT, CategoryI, Order, UserData, ImageT)
hooks/                # Custom hooks (useWhiteBody, useScrollBodyColor, FormattedPrice)
providers/            # AuthProvider (Firebase onAuthStateChanged)
```

## Firebase Collections
- **"user"**: `{name, email, uid, role: "admin"|"user", phone, time, date}`
- **"categories"**: `{id, name, description, categoryImgUrl[], storageFileId, subcategory[]}`
- **"products"**: `{id, title, price, productImageUrl[], category, description, quantity, time, date, storageFileId, subcategory}`
- **"orders"**: `{id, clientName, clientPhone, date, basketItems[], totalPrice, totalQuantity, userUid}`

## Auth Flow
1. Signup creates Firebase Auth user + Firestore "user" doc (default role: "user")
2. Login authenticates via Firebase → fetches user data → stores in Zustand
3. ProtectedRoute checks `isAuthenticated` and `isAdmin()` for admin routes
4. AuthProvider uses `onAuthStateChanged` listener for session persistence

## Key Patterns
- Real-time Firestore listeners (`onSnapshot`) for products/categories
- Zustand stores with `persist` middleware for cart/auth
- Product images stored in Firebase Storage at `products/{storageFileId}/`
- Category images at `categories/{storageFileId}/`
- Draft auto-save with 24-hour expiry and storage cleanup
- Role-based routing: admin → /admin, user → /
- UI language: Uzbek (interface text), English (code/variables)

## Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
```

## Known Issues to Fix
- Email credentials hardcoded in `/app/api/sendOrderEmail/route.ts` → move to env vars
- `next.config.ts` has `unoptimized: true` → enable image optimization
- No pagination on products/orders (will slow down at scale)
- Missing error handling in order email API
- Duplicate `FormattedPrice` in hooks/ and utils/
- No stock validation when adding to cart
- Phone validation hardcoded for +998 (Uzbekistan only)

## Deployment
- **Vercel**: Auto-deploys from `main` branch
- **Firebase**: Project ID `mega-ulgurji-1fccf`
