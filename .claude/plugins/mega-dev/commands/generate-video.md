---
name: generate-video
description: Generate Remotion marketing videos for products or categories
user_invocable: true
---

Generate a marketing video for MegaHome Ulgurji using Remotion.

Arguments: $ARGUMENTS

Steps:

1. **Parse Request**: Determine video parameters from the arguments:
   - **Video type**: `product-showcase`, `promo`, or `category-highlight`
   - **Target ID**: Product ID or Category ID from Firestore
   - If not provided, ask the user to specify the type and ID

2. **Verify Remotion Setup**: Check that the Remotion workspace is configured:
   - Confirm `remotion/` directory exists at project root
   - Verify Remotion dependencies are installed: `npx remotion --version`
   - If missing, scaffold with:
     ```
     npx create-video@latest remotion --template blank
     ```
   - Ensure `remotion/src/Root.tsx` is present

3. **Fetch Asset Data**: Pull product/category data from Firestore:
   - Read `store/useProductStore.ts` and `store/useCategoryStore.ts` for data shapes
   - Reference `lib/types.ts` for `ProductT` and `CategoryI` interfaces
   - For **product-showcase**: fetch product title, price, description, `productImageUrl[]` from `products` collection
   - For **category-highlight**: fetch category name, description, `categoryImgUrl[]`, subcategories from `categories` collection
   - For **promo**: gather multiple featured products and current promotions

4. **Select and Download Assets from Firebase Storage**:
   - Product images are stored at `products/{storageFileId}/` in Firebase Storage
   - Category images are stored at `categories/{storageFileId}/` in Firebase Storage
   - Download required images to `remotion/public/assets/` for local rendering:
     ```bash
     mkdir -p remotion/public/assets
     ```
   - List available images and let the user confirm which to include

5. **Apply Brand Styling**: Use MegaHome Ulgurji brand identity:
   - Read `app/globals.css` for CSS custom properties and brand colors
   - Primary color scheme from the Tailwind theme configuration
   - Font family matching the site (from `app/layout.tsx` font imports)
   - Logo from `public/` directory
   - Consistent with the site's visual language

6. **Create Video Composition** based on type:
   - **product-showcase** (`remotion/src/compositions/ProductShowcase.tsx`):
     - Opening: brand logo animation (1.5s)
     - Product images carousel with zoom/pan transitions (4-6s)
     - Price display with formatted UZS price using `FormattedPrice` logic from `hooks/`
     - Product title and description overlay in Uzbek
     - Call-to-action ending with site URL (2s)
     - Total duration: ~15s
   - **promo** (`remotion/src/compositions/PromoVideo.tsx`):
     - Dynamic intro with brand animation (2s)
     - Multiple product grid showcase (4s)
     - Discount/offer highlight with animated text (3s)
     - Category browsing teaser (3s)
     - Contact info and CTA (3s)
     - Total duration: ~15s
   - **category-highlight** (`remotion/src/compositions/CategoryHighlight.tsx`):
     - Category name reveal animation (2s)
     - Category images with parallax scroll (4s)
     - Subcategory tags animated in (3s)
     - Featured products from the category (4s)
     - CTA with category deep link (2s)
     - Total duration: ~15s

7. **Render the Video**: Build with Remotion CLI:
   ```bash
   cd remotion && npx remotion render src/index.ts ProductShowcase out/product-showcase.mp4 --codec h264
   ```

8. **Export Social Media Sizes**: Render multiple aspect ratios:
   - **Instagram/TikTok Reel**: 1080x1920 (9:16 vertical)
     ```bash
     npx remotion render src/index.ts ProductShowcase out/product-showcase-reel.mp4 --height 1920 --width 1080
     ```
   - **Instagram Feed**: 1080x1080 (1:1 square)
     ```bash
     npx remotion render src/index.ts ProductShowcase out/product-showcase-feed.mp4 --height 1080 --width 1080
     ```
   - **YouTube/Landscape**: 1920x1080 (16:9 horizontal)
     ```bash
     npx remotion render src/index.ts ProductShowcase out/product-showcase-landscape.mp4 --height 1080 --width 1920
     ```
   - **Telegram/Stories**: 1080x1920 (9:16)

9. **Summary**: Report results:
   - List all rendered files with sizes in `remotion/out/`
   - Provide file paths for each social media format
   - Note any missing assets or rendering warnings
   - Suggest upload targets (Instagram, Telegram, YouTube)
