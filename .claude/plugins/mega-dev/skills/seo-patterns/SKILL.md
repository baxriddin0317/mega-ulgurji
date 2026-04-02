---
name: seo-patterns
description: SEO and metadata patterns for Next.js 16 App Router. Covers generateMetadata, Open Graph, structured data (JSON-LD), sitemaps, dynamic OG images, and canonical URLs for product and category pages. Use when adding or fixing SEO, metadata, or social sharing.
---

# SEO & Metadata Patterns for MegaHome Ulgurji

## Overview
MegaHome Ulgurji is an Uzbek wholesale e-commerce platform. All SEO must target Uzbek-language queries, use proper e-commerce structured data, and generate dynamic metadata for product/category pages.

## Current State
- Root metadata in `app/layout.tsx`: basic title + description
- manifest.json in `public/` with PWA icons
- No dynamic metadata on product/category pages yet
- No sitemap or robots.txt
- No structured data (JSON-LD)
- No dynamic OG images

## Next.js 16 Metadata API

### Static Metadata (for fixed pages)
```typescript
// app/(client-side)/page.tsx (home page)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MegaHome Ulgurji - Ulgurji narxlarda uy jihozlari',
  description: "Naqd bo'lsa ulgurji bo'laqolsin! Eng arzon narxlarda sifatli uy jihozlari.",
  keywords: ['ulgurji', 'uy jihozlari', 'MegaHome', 'arzon narx', 'O\'zbekiston'],
  openGraph: {
    title: 'MegaHome Ulgurji',
    description: "Naqd bo'lsa ulgurji bo'laqolsin!",
    url: 'https://mega-ulgurji.vercel.app',
    siteName: 'MegaHome Ulgurji',
    locale: 'uz_UZ',
    type: 'website',
    images: [
      {
        url: '/og-image.png',    // Add to public/
        width: 1200,
        height: 630,
        alt: 'MegaHome Ulgurji - Ulgurji savdo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MegaHome Ulgurji',
    description: "Naqd bo'lsa ulgurji bo'laqolsin!",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mega-ulgurji.vercel.app',
  },
}
```

### Dynamic Metadata (for product pages)
```typescript
// app/(client-side)/product/[slug]/page.tsx
import type { Metadata } from 'next'
import { doc, getDoc } from 'firebase/firestore'
import { fireDB } from '@/firebase/config'
import type { ProductT } from '@/lib/types'

// Fetch product data for metadata generation
async function getProduct(slug: string): Promise<ProductT | null> {
  const docRef = doc(fireDB, 'products', slug)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() } as ProductT
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params  // Next.js 16: params is a Promise
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'Mahsulot topilmadi | MegaHome Ulgurji' }
  }

  const price = Number(product.price).toLocaleString()
  const imageUrl = product.productImageUrl[0]?.url || '/og-image.png'

  return {
    title: `${product.title} - ${price} so'm | MegaHome Ulgurji`,
    description: product.description || `${product.title} - ulgurji narxda ${price} so'm. ${product.category} toifasida.`,
    openGraph: {
      title: `${product.title} | MegaHome Ulgurji`,
      description: `${product.title} - ${price} so'm. Ulgurji narxlarda sifatli mahsulotlar.`,
      url: `https://mega-ulgurji.vercel.app/product/${slug}`,
      siteName: 'MegaHome Ulgurji',
      locale: 'uz_UZ',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} - ${price} so'm`,
      description: product.description || `Ulgurji narxda - MegaHome`,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://mega-ulgurji.vercel.app/product/${slug}`,
    },
  }
}
```

### Dynamic Metadata (for category pages)
```typescript
// app/(client-side)/category/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const categoryName = decodeURIComponent(slug)

  return {
    title: `${categoryName} - Ulgurji narxlarda | MegaHome Ulgurji`,
    description: `${categoryName} toifasidagi barcha mahsulotlar ulgurji narxlarda. MegaHome Ulgurji - eng arzon narxlar.`,
    openGraph: {
      title: `${categoryName} | MegaHome Ulgurji`,
      description: `${categoryName} - ulgurji narxlarda sifatli mahsulotlar`,
      url: `https://mega-ulgurji.vercel.app/category/${slug}`,
      type: 'website',
      locale: 'uz_UZ',
    },
    alternates: {
      canonical: `https://mega-ulgurji.vercel.app/category/${slug}`,
    },
  }
}
```

## Structured Data (JSON-LD)

### Organization Schema (root layout)
```typescript
// components/seo/OrganizationSchema.tsx
// NOTE: Only use with trusted, hardcoded data. Never pass user input directly.
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MegaHome Ulgurji',
    url: 'https://mega-ulgurji.vercel.app',
    logo: 'https://mega-ulgurji.vercel.app/icon-512x512.png',
    description: "Naqd bo'lsa ulgurji bo'laqolsin! Ulgurji narxlarda uy jihozlari.",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'UZ',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Uzbek',
    },
  }

  return (
    <script
      type="application/ld+json"
      // Safe: only hardcoded trusted data is serialized here
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Add to app/layout.tsx <head>:
// <OrganizationSchema />
```

### Product Schema (product pages)
```typescript
// components/seo/ProductSchema.tsx
import type { ProductT } from '@/lib/types'

// IMPORTANT: Product data comes from Firestore (admin-entered).
// If accepting user-generated content, sanitize with DOMPurify before use.
export function ProductSchema({ product }: { product: ProductT }) {
  // Sanitize text fields to prevent injection
  const safeName = product.title.replace(/[<>"'&]/g, '')
  const safeDescription = (product.description || '').replace(/[<>"'&]/g, '')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: safeName,
    description: safeDescription,
    image: product.productImageUrl.map(img => img.url),
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UZS',
      availability: (product.stock ?? product.quantity) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'MegaHome Ulgurji',
      },
    },
    brand: {
      '@type': 'Brand',
      name: 'MegaHome',
    },
  }

  return (
    <script
      type="application/ld+json"
      // Product data from admin Firestore - sanitized above
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Add to product page:
// <ProductSchema product={product} />
```

### BreadcrumbList Schema
```typescript
// components/seo/BreadcrumbSchema.tsx
interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name.replace(/[<>"'&]/g, ''),
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Usage on product page:
// <BreadcrumbSchema items={[
//   { name: 'Bosh sahifa', url: 'https://mega-ulgurji.vercel.app' },
//   { name: product.category, url: `https://mega-ulgurji.vercel.app/category/${product.category}` },
//   { name: product.title, url: `https://mega-ulgurji.vercel.app/product/${product.id}` },
// ]} />
```

## Sitemap Generation

### Install next-sitemap
```bash
npm install next-sitemap
```

### Configuration
```javascript
// next-sitemap.config.js (project root)
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mega-ulgurji.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/admin/*',            // Exclude all admin pages
    '/api/*',              // Exclude API routes
    '/(auth)/*',           // Exclude auth pages from sitemap
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/(auth)'],
      },
    ],
    additionalSitemaps: [
      'https://mega-ulgurji.vercel.app/sitemap-products.xml',
    ],
  },
  // Generate dynamic paths from Firebase
  additionalPaths: async (config) => {
    // Fetch all product and category IDs from Firebase Admin
    const admin = require('firebase-admin')
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    }

    const db = admin.firestore()
    const paths = []

    // Product pages
    const products = await db.collection('products').get()
    for (const doc of products.docs) {
      paths.push({
        loc: `/product/${doc.id}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      })
    }

    // Category pages
    const categories = await db.collection('categories').get()
    for (const doc of categories.docs) {
      const data = doc.data()
      paths.push({
        loc: `/category/${encodeURIComponent(data.name)}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      })
    }

    return paths
  },
}
```

### Add postbuild script
```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "next-sitemap"
  }
}
```

## robots.txt (Alternative to next-sitemap generation)

If not using next-sitemap, create manually:

```
// public/robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /(auth)

Sitemap: https://mega-ulgurji.vercel.app/sitemap.xml
```

## Dynamic OG Images with next/og

```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'MegaHome Ulgurji'
  const price = searchParams.get('price')
  const imageUrl = searchParams.get('image')
  const category = searchParams.get('category')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e141b',     // brand-black-text
          padding: 40,
        }}
      >
        {/* Product image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: 400, height: 400, objectFit: 'contain', borderRadius: 12 }}
          />
        )}

        {/* Product title */}
        <h1 style={{
          color: '#FFFFFF',
          fontSize: 48,
          fontWeight: 700,
          marginTop: 20,
          textAlign: 'center',
        }}>
          {title}
        </h1>

        {/* Price */}
        {price && (
          <p style={{
            color: '#EEEEEE',     // brand-gray-100
            fontSize: 36,
            fontWeight: 600,
            marginTop: 10,
          }}>
            {Number(price).toLocaleString()} so'm
          </p>
        )}

        {/* Category badge */}
        {category && (
          <div style={{
            backgroundColor: '#5e5e5e',   // brand-gray-200
            color: '#EEEEEE',
            padding: '8px 20px',
            borderRadius: 20,
            fontSize: 20,
            marginTop: 10,
          }}>
            {category}
          </div>
        )}

        {/* Branding */}
        <div style={{
          position: 'absolute',
          bottom: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ color: '#6B6B6B', fontSize: 22 }}>
            MegaHome Ulgurji
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

### Usage in generateMetadata
```typescript
// In product page generateMetadata:
const ogImageUrl = new URL('/api/og', 'https://mega-ulgurji.vercel.app')
ogImageUrl.searchParams.set('title', product.title)
ogImageUrl.searchParams.set('price', product.price)
ogImageUrl.searchParams.set('category', product.category)
if (product.productImageUrl[0]) {
  ogImageUrl.searchParams.set('image', product.productImageUrl[0].url)
}

// Then in the return:
openGraph: {
  images: [{ url: ogImageUrl.toString(), width: 1200, height: 630 }],
}
```

## SEO Checklist for New Pages

When creating any new page in this project, verify:

1. **Metadata**: Add `export const metadata` (static) or `export async function generateMetadata` (dynamic)
2. **Title format**: `{PageContent} | MegaHome Ulgurji` (always include brand)
3. **Description**: 50-160 characters, include Uzbek keywords
4. **Open Graph**: title, description, image, url, type, locale (`uz_UZ`)
5. **Twitter Card**: card type, title, description, image
6. **Canonical URL**: Add `alternates.canonical` for all public pages
7. **Structured Data**: Add relevant JSON-LD schema (Product, BreadcrumbList)
8. **Semantic HTML**: Use proper heading hierarchy (h1 > h2 > h3)
9. **Image alt text**: Descriptive alt text for all `<Image>` / `<img>` elements
10. **Internal links**: Link to related categories/products where relevant
11. **Language**: Set `lang="uz"` on `<html>` tag (currently set to "en" in layout.tsx)

## Key Files
- `app/layout.tsx` - Root metadata (title, description, manifest, icons)
- `app/globals.css` - Brand colors for OG images
- `public/manifest.json` - PWA manifest with app name/description
- `public/` - favicon, apple-touch-icon, PWA icons
- `lib/types.ts` - ProductT, CategoryI types for dynamic metadata
- `firebase/config.ts` - Firestore access for product data in generateMetadata
