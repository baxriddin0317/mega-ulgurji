---
name: remotion-video
description: Remotion video production patterns for generating marketing videos, product showcases, promo clips, and social media content. Use when creating or modifying video compositions, rendering pipelines, or video templates for MegaHome Ulgurji.
---

# Remotion Video Production for MegaHome Ulgurji

## Overview
Remotion enables programmatic video creation in React. For MegaHome Ulgurji, this means auto-generating product showcase videos, promotional sale announcements, social media reels, and order confirmation clips using real product data from Firebase.

## Setup

### Installation
```bash
npm install remotion @remotion/cli @remotion/player @remotion/lambda
npm install -D @remotion/bundler @remotion/renderer
```

### Project Structure
```
remotion/
├── Root.tsx                    # Remotion entry point, registers all compositions
├── compositions/
│   ├── ProductShowcase.tsx     # Single product highlight video
│   ├── PromoVideo.tsx          # Sale/discount announcement
│   ├── CategoryHighlight.tsx   # Category collection showcase
│   ├── OrderConfirmation.tsx   # Animated order receipt
│   └── SocialReel.tsx          # Short-form social media content
├── components/
│   ├── AnimatedPrice.tsx       # Price display with spring animation
│   ├── ProductSlide.tsx        # Single product slide with image + text
│   ├── BrandLogo.tsx           # MegaHome logo animation
│   ├── TextReveal.tsx          # Uzbek text reveal animation
│   └── BackgroundPattern.tsx   # Brand-colored animated background
├── utils/
│   ├── colors.ts               # Brand color constants from globals.css
│   ├── fonts.ts                # Geist font loading for Remotion
│   └── firebase-data.ts        # Fetch product/category data for videos
├── templates/
│   ├── instagram-reel.ts       # 1080x1920, 30fps, 15-30s
│   ├── tiktok.ts               # 1080x1920, 30fps, 15-60s
│   ├── youtube-short.ts        # 1080x1920, 30fps, up to 60s
│   └── og-video.ts             # 1200x630, 30fps, 5-10s
└── render.ts                   # Render pipeline configuration
```

### remotion.config.ts (project root)
```typescript
import { Config } from '@remotion/cli/config'

Config.setVideoImageFormat('jpeg')
Config.setOverwriteOutput(true)
```

### package.json scripts
```json
{
  "scripts": {
    "remotion:studio": "remotion studio remotion/Root.tsx",
    "remotion:render": "remotion render remotion/Root.tsx",
    "remotion:preview": "remotion preview remotion/Root.tsx"
  }
}
```

## Brand Colors Integration

Map from `app/globals.css` theme variables to Remotion constants:

```typescript
// remotion/utils/colors.ts
export const BRAND_COLORS = {
  // From globals.css custom theme
  brandGray100: '#EEEEEE',      // --color-brand-gray-100
  brandGray200: '#5e5e5e',      // --color-brand-gray-200
  brandText: '#6B6B6B',         // --color-brand-text
  brandBlackText: '#0e141b',    // --color-brand-black-text

  // App theme
  background: '#000000',        // body bg-black/90
  themeColor: '#000000',        // manifest.json theme_color
  white: '#FFFFFF',

  // For accent/CTA elements (derived from primary oklch)
  primary: '#1a1f2e',           // approximate of oklch(0.21 0.034 264.665)
  destructive: '#e5484d',       // for sale/discount emphasis
} as const

export const BRAND_FONTS = {
  sans: 'Geist',                // --font-geist-sans from layout.tsx
  mono: 'Geist Mono',           // --font-geist-mono from layout.tsx
} as const
```

### Font Loading for Remotion
```typescript
// remotion/utils/fonts.ts
import { staticFile } from 'remotion'

export const loadGeistFont = () => {
  const font = new FontFace('Geist', `url(${staticFile('fonts/Geist-Regular.woff2')})`)
  return font.load().then((loaded) => {
    document.fonts.add(loaded)
  })
}
```

## Composition Templates

### ProductShowcase - Single Product Video
```typescript
// remotion/compositions/ProductShowcase.tsx
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig, Img } from 'remotion'
import { BRAND_COLORS } from '../utils/colors'
import type { ProductT } from '@/lib/types'

interface ProductShowcaseProps {
  product: ProductT
  brandName?: string
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  product,
  brandName = 'MegaHome Ulgurji',
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Intro: Brand logo fade in (0-30 frames)
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  // Product image entrance with spring (30-60 frames)
  const imageScale = spring({ frame: frame - 30, fps, config: { damping: 12, stiffness: 100 } })

  // Price reveal (60-80 frames)
  const priceSlide = interpolate(frame, [60, 80], [100, 0], { extrapolateRight: 'clamp' })

  // Title text reveal (45-65 frames)
  const titleOpacity = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND_COLORS.background }}>
      {/* Brand header */}
      <Sequence from={0} durationInFrames={30}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: logoOpacity }}>
          <h1 style={{
            color: BRAND_COLORS.white,
            fontFamily: 'Geist',
            fontSize: 48,
            fontWeight: 700,
          }}>
            {brandName}
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Product image */}
      <Sequence from={30} durationInFrames={150}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          {product.productImageUrl[0] && (
            <Img
              src={product.productImageUrl[0].url}
              style={{
                width: 600,
                height: 600,
                objectFit: 'contain',
                transform: `scale(${imageScale})`,
                borderRadius: 16,
              }}
            />
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Product title */}
      <Sequence from={45}>
        <div style={{
          position: 'absolute',
          bottom: 200,
          width: '100%',
          textAlign: 'center',
          opacity: titleOpacity,
        }}>
          <h2 style={{
            color: BRAND_COLORS.white,
            fontFamily: 'Geist',
            fontSize: 36,
            fontWeight: 600,
          }}>
            {product.title}
          </h2>
        </div>
      </Sequence>

      {/* Price */}
      <Sequence from={60}>
        <div style={{
          position: 'absolute',
          bottom: 140,
          width: '100%',
          textAlign: 'center',
          overflow: 'hidden',
        }}>
          <p style={{
            color: BRAND_COLORS.brandGray100,
            fontFamily: 'Geist Mono',
            fontSize: 32,
            fontWeight: 700,
            transform: `translateY(${priceSlide}%)`,
          }}>
            {Number(product.price).toLocaleString()} so'm
          </p>
        </div>
      </Sequence>
    </AbsoluteFill>
  )
}
```

### PromoVideo - Sale Announcement
```typescript
// remotion/compositions/PromoVideo.tsx
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { BRAND_COLORS } from '../utils/colors'

interface PromoVideoProps {
  title: string            // e.g., "KATTA CHEGIRMA!"
  subtitle: string         // e.g., "50% gacha chegirma"
  validUntil: string       // e.g., "31-dekabr"
  productImages: string[]  // Firebase Storage URLs
}

export const PromoVideo: React.FC<PromoVideoProps> = ({
  title,
  subtitle,
  validUntil,
  productImages,
}) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Pulsing background
  const bgPulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.9, 1, 0.9]
  )

  // Staggered product image reveals
  const getImageDelay = (index: number) => 30 + index * 15

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND_COLORS.brandBlackText }}>
      {/* Animated sale badge */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            transform: `scale(${bgPulse})`,
            padding: '20px 40px',
            backgroundColor: BRAND_COLORS.destructive,
            borderRadius: 12,
          }}>
            <h1 style={{
              color: BRAND_COLORS.white,
              fontFamily: 'Geist',
              fontSize: 56,
              fontWeight: 800,
              textAlign: 'center',
            }}>
              {title}
            </h1>
          </div>
          <p style={{
            color: BRAND_COLORS.brandGray100,
            fontFamily: 'Geist',
            fontSize: 28,
            marginTop: 20,
          }}>
            {subtitle}
          </p>
          <p style={{
            color: BRAND_COLORS.brandText,
            fontFamily: 'Geist',
            fontSize: 18,
            marginTop: 10,
          }}>
            {validUntil} gacha amal qiladi
          </p>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
```

### CategoryHighlight - Category Collection
```typescript
// remotion/compositions/CategoryHighlight.tsx
import { AbsoluteFill, Sequence, Img, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { BRAND_COLORS } from '../utils/colors'
import type { CategoryI, ProductT } from '@/lib/types'

interface CategoryHighlightProps {
  category: CategoryI
  products: ProductT[]     // Top products in this category
}

export const CategoryHighlight: React.FC<CategoryHighlightProps> = ({
  category,
  products,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND_COLORS.background }}>
      {/* Category name intro */}
      <Sequence from={0} durationInFrames={45}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{
            color: BRAND_COLORS.white,
            fontFamily: 'Geist',
            fontSize: 52,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            {category.name}
          </h1>
          {category.description && (
            <p style={{
              color: BRAND_COLORS.brandText,
              fontFamily: 'Geist',
              fontSize: 22,
              marginTop: 10,
              opacity: interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' }),
            }}>
              {category.description}
            </p>
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Product slideshow - each product gets 60 frames (2s at 30fps) */}
      {products.slice(0, 5).map((product, index) => (
        <Sequence key={product.id} from={45 + index * 60} durationInFrames={60}>
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            {product.productImageUrl[0] && (
              <Img
                src={product.productImageUrl[0].url}
                style={{
                  width: 500,
                  height: 500,
                  objectFit: 'contain',
                  transform: `scale(${spring({
                    frame: frame - (45 + index * 60),
                    fps,
                    config: { damping: 12 },
                  })})`,
                }}
              />
            )}
            <div style={{ position: 'absolute', bottom: 120, textAlign: 'center', width: '100%' }}>
              <h2 style={{ color: BRAND_COLORS.white, fontFamily: 'Geist', fontSize: 30 }}>
                {product.title}
              </h2>
              <p style={{ color: BRAND_COLORS.brandGray100, fontFamily: 'Geist Mono', fontSize: 24, marginTop: 8 }}>
                {Number(product.price).toLocaleString()} so'm
              </p>
            </div>
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Outro: MegaHome branding */}
      <Sequence from={45 + Math.min(products.length, 5) * 60}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: BRAND_COLORS.white, fontFamily: 'Geist', fontSize: 42 }}>
            MegaHome Ulgurji
          </h1>
          <p style={{ color: BRAND_COLORS.brandText, fontFamily: 'Geist', fontSize: 20, marginTop: 10 }}>
            Naqd bo'lsa ulgurji bo'laqolsin!
          </p>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
```

### OrderConfirmation - Animated Receipt
```typescript
// remotion/compositions/OrderConfirmation.tsx
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { BRAND_COLORS } from '../utils/colors'
import type { Order } from '@/lib/types'

interface OrderConfirmationProps {
  order: Order
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const checkmarkScale = spring({ frame: frame - 15, fps, config: { damping: 8 } })

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND_COLORS.white }}>
      {/* Checkmark animation */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${checkmarkScale})`,
          }}>
            <span style={{ fontSize: 40, color: BRAND_COLORS.white }}>✓</span>
          </div>
          <h2 style={{
            color: BRAND_COLORS.brandBlackText,
            fontFamily: 'Geist',
            fontSize: 32,
            marginTop: 20,
          }}>
            Buyurtma qabul qilindi!
          </h2>
        </AbsoluteFill>
      </Sequence>

      {/* Order details */}
      <Sequence from={45}>
        <div style={{ padding: 40, marginTop: 300 }}>
          <p style={{ color: BRAND_COLORS.brandText, fontFamily: 'Geist', fontSize: 20 }}>
            {order.clientName} - {order.basketItems.length} ta mahsulot
          </p>
          <p style={{ color: BRAND_COLORS.brandBlackText, fontFamily: 'Geist Mono', fontSize: 28, marginTop: 8 }}>
            Jami: {order.totalPrice.toLocaleString()} so'm
          </p>
        </div>
      </Sequence>
    </AbsoluteFill>
  )
}
```

## Root.tsx - Composition Registry
```typescript
// remotion/Root.tsx
import { Composition } from 'remotion'
import { ProductShowcase } from './compositions/ProductShowcase'
import { PromoVideo } from './compositions/PromoVideo'
import { CategoryHighlight } from './compositions/CategoryHighlight'
import { OrderConfirmation } from './compositions/OrderConfirmation'

// Default props for Remotion Studio preview
import { defaultProduct, defaultCategory, defaultOrder } from './utils/defaults'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Instagram Reel / TikTok / YouTube Short - vertical */}
      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={180}    // 6 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ product: defaultProduct }}
      />

      <Composition
        id="PromoVideo"
        component={PromoVideo}
        durationInFrames={300}    // 10 seconds
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: 'KATTA CHEGIRMA!',
          subtitle: '50% gacha chegirma barcha mahsulotlarga',
          validUntil: '31-dekabr',
          productImages: [],
        }}
      />

      <Composition
        id="CategoryHighlight"
        component={CategoryHighlight}
        durationInFrames={450}    // 15 seconds
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ category: defaultCategory, products: [] }}
      />

      <Composition
        id="OrderConfirmation"
        component={OrderConfirmation}
        durationInFrames={120}    // 4 seconds
        fps={30}
        width={1080}
        height={1080}             // Square for sharing
        defaultProps={{ order: defaultOrder }}
      />

      {/* OG Video for link previews */}
      <Composition
        id="ProductShowcaseOG"
        component={ProductShowcase}
        durationInFrames={150}
        fps={30}
        width={1200}
        height={630}
        defaultProps={{ product: defaultProduct }}
      />
    </>
  )
}
```

## Firebase Data Integration

### Fetching Products for Video Generation
```typescript
// remotion/utils/firebase-data.ts
// NOTE: Use Firebase Admin SDK for server-side rendering
// Do NOT import client SDK (firebase/config.ts) in render scripts
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

export async function getProductsForVideo(categoryName?: string, limit = 5) {
  const db = getAdminApp().firestore()
  let query = db.collection('products').orderBy('time', 'desc').limit(limit)
  if (categoryName) {
    query = query.where('category', '==', categoryName) as typeof query
  }
  const snapshot = await query.get()
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getCategoryForVideo(categoryId: string) {
  const db = getAdminApp().firestore()
  const doc = await db.collection('categories').doc(categoryId).get()
  return { id: doc.id, ...doc.data() }
}
```

### Uploading Rendered Videos to Firebase Storage
```typescript
// remotion/utils/upload-video.ts
import * as admin from 'firebase-admin'
import * as fs from 'fs'

export async function uploadVideoToStorage(
  localPath: string,
  storagePath: string  // e.g., 'videos/promos/summer-sale.mp4'
): Promise<string> {
  const bucket = admin.storage().bucket()
  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: {
      contentType: 'video/mp4',
      metadata: { generatedBy: 'remotion', project: 'mega-ulgurji' },
    },
  })
  const file = bucket.file(storagePath)
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '2030-01-01',
  })
  return url
}
```

## Rendering Pipeline

### Local Render
```typescript
// remotion/render.ts
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import path from 'path'

export async function renderVideo(
  compositionId: string,
  inputProps: Record<string, unknown>,
  outputPath: string,
) {
  const bundled = await bundle({
    entryPoint: path.resolve('./remotion/Root.tsx'),
    webpackOverride: (config) => config,
  })

  const composition = await selectComposition({
    serveUrl: bundled,
    id: compositionId,
    inputProps,
  })

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
  })

  console.log(`Rendered: ${outputPath}`)
}

// Usage:
// await renderVideo('ProductShowcase', { product: myProduct }, './out/showcase.mp4')
// await renderVideo('PromoVideo', { title: 'CHEGIRMA!', ... }, './out/promo.mp4')
```

### Cloud Render with Remotion Lambda (optional)
```typescript
// For high-volume rendering, use Remotion Lambda
import { renderMediaOnLambda } from '@remotion/lambda/client'

export async function renderOnCloud(compositionId: string, inputProps: Record<string, unknown>) {
  const result = await renderMediaOnLambda({
    region: 'eu-central-1',
    functionName: 'remotion-render-mega-ulgurji',
    composition: compositionId,
    serveUrl: process.env.REMOTION_SERVE_URL!,
    codec: 'h264',
    inputProps,
  })
  return result.outputUrl
}
```

## Output Formats Reference

| Platform        | Width  | Height | FPS | Duration   | Aspect Ratio |
|-----------------|--------|--------|-----|------------|--------------|
| Instagram Reel  | 1080   | 1920   | 30  | 15-30s     | 9:16         |
| TikTok          | 1080   | 1920   | 30  | 15-60s     | 9:16         |
| YouTube Short   | 1080   | 1920   | 30  | up to 60s  | 9:16         |
| OG Video        | 1200   | 630    | 30  | 5-10s      | ~1.9:1       |
| Square (Share)  | 1080   | 1080   | 30  | 10-30s     | 1:1          |
| Landscape       | 1920   | 1080   | 30  | any        | 16:9         |

## Animation Patterns

### Spring Animation (bouncy entrance)
```typescript
const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100, mass: 0.5 } })
```

### Linear Interpolation (fade, slide)
```typescript
const opacity = interpolate(frame, [startFrame, endFrame], [0, 1], { extrapolateRight: 'clamp' })
const slideX = interpolate(frame, [startFrame, endFrame], [-200, 0], { extrapolateRight: 'clamp' })
```

### Staggered List Animation
```typescript
{items.map((item, i) => {
  const delay = baseDelay + i * staggerFrames
  const itemOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: 'clamp' })
  const itemSlideY = interpolate(frame, [delay, delay + 15], [30, 0], { extrapolateRight: 'clamp' })
  return (
    <div key={i} style={{ opacity: itemOpacity, transform: `translateY(${itemSlideY}px)` }}>
      {item.title}
    </div>
  )
})}
```

## Remotion Player Integration (in-app preview)
```typescript
// components/admin/VideoPreview.tsx
'use client'
import { Player } from '@remotion/player'
import { ProductShowcase } from '@/remotion/compositions/ProductShowcase'
import type { ProductT } from '@/lib/types'

export function VideoPreview({ product }: { product: ProductT }) {
  return (
    <Player
      component={ProductShowcase}
      inputProps={{ product }}
      durationInFrames={180}
      fps={30}
      compositionWidth={1080}
      compositionHeight={1920}
      style={{ width: 270, height: 480 }}  // Scaled down for preview
      controls
      autoPlay
      loop
    />
  )
}
```

## Key Conventions
- All video compositions live in `remotion/compositions/`
- Shared visual components in `remotion/components/`
- Use brand colors from `remotion/utils/colors.ts` (mirrors globals.css)
- Uzbek text for all user-facing labels (so'm, ta, Buyurtma, etc.)
- Product prices: convert from string to number with `Number(product.price)`
- Image URLs come from `product.productImageUrl[].url` (ImageT type)
- Storage paths follow `products/{storageFileId}/` and `categories/{storageFileId}/`
- Firebase Admin SDK for render scripts, client SDK only for in-browser Player
