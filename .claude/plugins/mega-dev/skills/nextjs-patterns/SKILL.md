---
name: nextjs-patterns
description: Next.js 16 App Router patterns for this e-commerce project. Route groups, layouts, dynamic routes, API routes, metadata, server/client components, image optimization, and middleware. Use when creating pages, modifying routing, or working with Next.js features.
allowed-tools: Read, Grep, Glob
---

# Next.js 16 App Router Patterns for MegaHome Ulgurji

## Route Structure
This project uses route groups to separate concerns:
- `(auth)` - Login/signup with custom auth layout
- `(client-side)` - Customer-facing pages with Header/Footer
- `admin` - Admin panel with Sidebar/ProtectedRoute
- `api` - Server-side API routes

## Creating New Pages

### Client-side page:
```typescript
// app/(client-side)/new-page/page.tsx
// Automatically gets Header + Footer from (client-side)/layout.tsx
export default function NewPage() {
  return <div>Content</div>
}
```

### Admin page:
```typescript
// app/admin/new-section/page.tsx
// Automatically gets Sidebar + ProtectedRoute from admin/layout.tsx
export default function AdminNewSection() {
  return <div>Admin Content</div>
}
```

### Dynamic route:
```typescript
// app/(client-side)/product/[slug]/page.tsx
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // Next.js 16: params is a Promise
  return <ProductContent slug={slug} />
}
```

## Server vs Client Components
- **Server (default)**: Pages, layouts, data fetching wrappers
- **Client ("use client")**: Interactive components, Zustand consumers, Firebase listeners
- Rule: Keep "use client" boundary as low as possible in component tree

## API Routes (Route Handlers)
```typescript
// app/api/endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  // ... process
  return NextResponse.json({ success: true })
}
```

## Metadata
```typescript
export const metadata: Metadata = {
  title: "Page Title | MegaHome ulgurji",
  description: "Page description in Uzbek",
}
```

## Image Handling
Currently using `unoptimized: true` in next.config.ts. When switching to optimized:
```typescript
import Image from 'next/image'
// Configure remotePatterns for Firebase Storage:
// images: { remotePatterns: [{ hostname: 'firebasestorage.googleapis.com' }] }
```

## Key Config Files
- `next.config.ts` - Images, crossOrigin settings
- `app/layout.tsx` - Root layout (fonts, AuthProvider, Toaster)
- `app/globals.css` - Tailwind theme, CSS variables
- `tsconfig.json` - Path aliases (@/ → ./)
