---
name: api-security
description: API security patterns for Next.js API routes and Firebase backend. Covers auth token verification, Zod validation, rate limiting, CORS, input sanitization, error handling, security headers, Firebase Security Rules, and admin protection. Use when securing API routes or hardening the backend.
---

# API Security Patterns for MegaHome Ulgurji

## Overview
MegaHome Ulgurji uses Next.js API routes (`app/api/`) with Firebase Admin SDK for server-side operations. This skill covers securing those routes plus Firebase Security Rules for direct client-side Firestore/Storage access.

## Current API Routes
- `app/api/delete-user/route.ts` - Deletes user from Firebase Auth + Firestore (admin only)
- `app/api/sendOrderEmail/route.ts` - Sends order notification via Nodemailer

## Current Security Issues (to fix)
1. No auth token verification on API routes
2. Email credentials partially hardcoded (fallback to hardcoded value)
3. No rate limiting on order email endpoint
4. No input validation with Zod on API routes
5. Error messages may leak internal details
6. No CORS configuration
7. No security headers

## Firebase Auth Token Verification

### Middleware Pattern for API Routes
```typescript
// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

function getAdminApp() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return admin
}

export interface AuthenticatedUser {
  uid: string
  email: string
  role?: string
}

/**
 * Verify Firebase ID token from Authorization header.
 * Returns decoded user or null.
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const adminApp = getAdminApp()
    const decoded = await adminApp.auth().verifyIdToken(token)
    return {
      uid: decoded.uid,
      email: decoded.email || '',
    }
  } catch {
    return null
  }
}

/**
 * Verify token AND check admin role in Firestore "user" collection.
 */
export async function verifyAdminToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await verifyAuthToken(request)
  if (!user) return null

  try {
    const adminApp = getAdminApp()
    const userDoc = await adminApp.firestore().collection('user').doc(user.uid).get()
    const userData = userDoc.data()

    if (!userData || userData.role !== 'admin') {
      return null
    }

    return { ...user, role: 'admin' }
  } catch {
    return null
  }
}

/**
 * Helper to return 401 response.
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Helper to return 403 response.
 */
export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}
```

### Securing the Delete User Route
```typescript
// app/api/delete-user/route.ts (SECURED)
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, unauthorizedResponse, forbiddenResponse } from '@/lib/auth-middleware'
import * as admin from 'firebase-admin'
import { z } from 'zod'

const deleteUserSchema = z.object({
  uid: z.string().min(1, 'UID is required').max(128),
})

export async function POST(req: NextRequest) {
  // 1. Verify admin auth
  const adminUser = await verifyAdminToken(req)
  if (!adminUser) {
    return forbiddenResponse('Admin access required')
  }

  // 2. Validate input
  const body = await req.json()
  const parsed = deleteUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // 3. Prevent self-deletion
  if (parsed.data.uid === adminUser.uid) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  try {
    const adminApp = admin.apps.length ? admin : admin.initializeApp()
    await adminApp.auth().deleteUser(parsed.data.uid)
    await adminApp.firestore().collection('user').doc(parsed.data.uid).delete()
    return NextResponse.json({ success: true })
  } catch {
    // Don't leak internal error details
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
```

### Client-side: Sending Auth Token
```typescript
// In client components, attach the Firebase ID token:
import { auth } from '@/firebase/config'

async function securedApiCall(url: string, body: object) {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const token = await user.getIdToken()
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

// Usage:
// await securedApiCall('/api/delete-user', { uid: userToDelete.uid })
```

## Request Validation with Zod

### Order Email Validation
```typescript
// lib/validations/order.ts
import { z } from 'zod'

export const orderEmailSchema = z.object({
  clientName: z.string().min(2).max(100).trim(),
  clientLastName: z.string().min(2).max(100).trim().optional(),
  clientPhone: z.string().regex(
    /^\+998\d{9}$/,
    'Phone must be Uzbekistan format: +998XXXXXXXXX'
  ),
  date: z.object({
    seconds: z.number(),
    nanoseconds: z.number().optional(),
  }),
  basketItems: z.array(z.object({
    id: z.string(),
    title: z.string(),
    price: z.string(),
    quantity: z.number().positive(),
  })).min(1, 'Cart cannot be empty'),
  totalPrice: z.number().positive(),
  totalQuantity: z.number().positive().int(),
})

export type OrderEmailInput = z.infer<typeof orderEmailSchema>
```

### Applying Validation to Send Order Email
```typescript
// app/api/sendOrderEmail/route.ts (SECURED)
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthToken, unauthorizedResponse } from '@/lib/auth-middleware'
import { orderEmailSchema } from '@/lib/validations/order'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  // 1. Verify authenticated user
  const user = await verifyAuthToken(req)
  if (!user) {
    return unauthorizedResponse()
  }

  // 2. Validate request body
  const body = await req.json()
  const parsed = orderEmailSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid order data', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // 3. Send email with validated data
  const { clientName, clientPhone, basketItems, totalPrice, totalQuantity, date } = parsed.data

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,       // MUST be in .env, never hardcode
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const orderDetails = basketItems
    .map(item => `${item.title} - ${item.quantity} ta`)
    .join('\n')

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Yangi buyurtma: ${clientName}`,
      text: `Yangi buyurtma (mega ulgurji)\n\nIsm: ${clientName}\nTelefon: ${clientPhone}\n\nMahsulotlar:\n${orderDetails}\n\nJami: ${totalPrice} so'm\nMiqdor: ${totalQuantity}`,
    })

    return NextResponse.json({ message: 'Order email sent' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
```

## Rate Limiting

### Simple In-Memory Rate Limiter
```typescript
// lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number    // Time window in ms
  maxRequests: number // Max requests per window
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60_000, maxRequests: 10 }
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: config.maxRequests - entry.count }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60_000)
```

### Applying Rate Limiting to API Routes
```typescript
// In any API route handler:
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit by IP address
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const { allowed, remaining } = rateLimit(ip, {
    windowMs: 60_000,  // 1 minute
    maxRequests: 5,     // 5 requests per minute for order emails
  })

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' },
      }
    )
  }

  // ... rest of handler
}
```

## CORS Configuration

### Next.js Middleware for CORS
```typescript
// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://mega-ulgurji.vercel.app',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
].filter(Boolean)

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const origin = request.headers.get('origin')

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400')

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers })
    }
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

## Input Sanitization (XSS Prevention)

### Text Sanitization Utility
```typescript
// lib/sanitize.ts

/**
 * Strip HTML tags and encode special characters.
 * Use for any user-submitted text before storing or rendering.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/**
 * Validate and sanitize a phone number.
 * Only allows digits and + prefix for Uzbekistan format.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

/**
 * Sanitize a URL to prevent javascript: protocol injection.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return url
    }
    return ''
  } catch {
    return ''
  }
}
```

### Apply Sanitization in API Routes
```typescript
// In order email route, sanitize before email body:
const safeName = sanitizeText(clientName)
const safePhone = sanitizePhone(clientPhone)
```

## Error Handling Patterns

### Secure Error Responses
```typescript
// lib/api-errors.ts

/**
 * NEVER expose internal errors to clients.
 * Log full error server-side, return generic message to client.
 */
export function handleApiError(error: unknown, context: string) {
  // Log full error for debugging (server-side only)
  console.error(`[API Error - ${context}]:`, error)

  // Return generic message to client
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}

// BAD - leaks internals:
// return NextResponse.json({ error: error.message }, { status: 500 })
// return NextResponse.json({ error: `Firebase error: ${error.code}` }, { status: 500 })

// GOOD - generic message:
// return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
```

### Standard API Response Format
```typescript
// Successful response:
NextResponse.json({ success: true, data: result })

// Validation error:
NextResponse.json({ error: 'Invalid input', details: zodErrors }, { status: 400 })

// Auth error:
NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Forbidden:
NextResponse.json({ error: 'Forbidden' }, { status: 403 })

// Rate limited:
NextResponse.json({ error: 'Too many requests' }, { status: 429 })

// Server error:
NextResponse.json({ error: 'Internal server error' }, { status: 500 })
```

## Environment Variable Management

### Required Environment Variables
```bash
# .env.local (NEVER commit this file)

# Firebase Admin SDK (for API routes)
FIREBASE_PROJECT_ID=mega-ulgurji-1fccf
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mega-ulgurji-1fccf.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Email (Nodemailer)
GMAIL_USER=megahomeweb@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# App
NEXT_PUBLIC_SITE_URL=https://mega-ulgurji.vercel.app
```

### Validate Environment at Build Time
```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  GMAIL_USER: z.string().email(),
  GMAIL_APP_PASSWORD: z.string().min(1),
})

// Validate on import (fails fast if env vars are missing)
export const env = envSchema.parse({
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
})
```

## Security Headers

### Next.js Config Headers
```typescript
// next.config.ts (add to existing config)
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  crossOrigin: 'anonymous',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.firebasestorage.app",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebasestorage.app wss://*.firebaseio.com",
              "frame-src https://mega-ulgurji-1fccf.firebaseapp.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

## Firebase Security Rules

### Firestore Rules
```
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/user/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    // User collection
    match /user/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Categories - public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }

    // Orders - authenticated read own, admin read all
    match /orders/{orderId} {
      allow read: if isAuthenticated() &&
        (resource.data.userUid == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}
```

### Storage Rules
```
// storage.rules
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Product images - public read, admin upload/delete
    match /products/{storageFileId}/{fileName} {
      allow read: if true;
      allow write, delete: if request.auth != null &&
        firestore.get(/databases/(default)/documents/user/$(request.auth.uid)).data.role == 'admin';
    }

    // Category images - public read, admin upload/delete
    match /categories/{storageFileId}/{fileName} {
      allow read: if true;
      allow write, delete: if request.auth != null &&
        firestore.get(/databases/(default)/documents/user/$(request.auth.uid)).data.role == 'admin';
    }

    // Deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Admin-Only Route Protection Pattern

### Complete Secured Admin Route Template
```typescript
// app/api/admin/{action}/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, forbiddenResponse } from '@/lib/auth-middleware'
import { rateLimit } from '@/lib/rate-limit'
import { handleApiError } from '@/lib/api-errors'
import { z } from 'zod'

const requestSchema = z.object({
  // Define expected fields
})

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const { allowed } = rateLimit(`admin-action-${ip}`, { windowMs: 60_000, maxRequests: 20 })
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // 2. Auth check (admin only)
  const admin = await verifyAdminToken(req)
  if (!admin) {
    return forbiddenResponse()
  }

  // 3. Input validation
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // 4. Business logic
  try {
    // ... perform action with parsed.data
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'admin-action')
  }
}
```

## Security Checklist for New API Routes

1. Add Firebase Auth token verification (`verifyAuthToken` or `verifyAdminToken`)
2. Validate all input with Zod schemas
3. Apply rate limiting (per IP or per user)
4. Sanitize text inputs before storage or email
5. Return generic error messages (never expose stack traces)
6. Use environment variables for all secrets
7. Log errors server-side with context
8. Test with invalid/missing auth tokens
9. Test with malformed request bodies
10. Test rate limit behavior

## Key Files
- `app/api/delete-user/route.ts` - Admin user deletion (needs auth)
- `app/api/sendOrderEmail/route.ts` - Order notification (needs auth + validation)
- `firebase/config.ts` - Client SDK config (project: mega-ulgurji-1fccf)
- `lib/types.ts` - Type definitions for validation schemas
- `store/authStore.ts` - Client-side auth state (isAdmin check)
- `components/auth/ProtectedRoute.tsx` - Client-side admin gate
