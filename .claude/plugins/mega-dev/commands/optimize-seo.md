---
name: optimize-seo
description: Audit and optimize SEO across all pages of the site
user_invocable: true
---

Perform a comprehensive SEO audit and optimization for MegaHome Ulgurji.

Steps:

1. **Metadata Completeness**: Check every page for proper `<title>` and `<meta name="description">`:
   - Scan `app/layout.tsx` for root-level metadata export
   - Check `app/(client-side)/` pages: home, product detail, category, cart, orders
   - Check `app/(auth)/` pages: login, signup
   - Check `app/admin/` pages for `noindex` meta (admin should not be indexed)
   - Verify each page exports a `metadata` object or uses `generateMetadata()`:
     ```bash
     grep -rn "export.*metadata\|generateMetadata" app/ --include="*.tsx" --include="*.ts"
     ```
   - Flag any page missing title or description
   - Ensure titles follow pattern: `"Page Name | MegaHome Ulgurji"` and are under 60 characters
   - Ensure descriptions are 120-160 characters and contain relevant Uzbek keywords

2. **Open Graph Tags**: Verify OG tags on product and category pages:
   - Check for `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
   - Product pages should use the product's first image from `productImageUrl[]` as `og:image`
   - Category pages should use the category's first image from `categoryImgUrl[]` as `og:image`
   - Verify `og:locale` is set to `uz_UZ` for Uzbek content
   - Check for Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
   - If missing, create or update the `generateMetadata` function in those route files

3. **Image Alt Text Audit**: Check all `<img>` and `<Image>` tags for alt attributes:
   ```bash
   grep -rn "<img\|<Image" components/ app/ --include="*.tsx" | grep -v "alt="
   ```
   - Scan `components/client/` for product cards, category cards, hero sections
   - Scan `components/admin/` for admin image displays
   - Every product image should have alt text like the product title
   - Every category image should have alt text like the category name
   - Decorative images should use `alt=""`
   - Report all missing alt text with file locations

4. **Structured Data (JSON-LD)**: Validate and add schema markup:
   - Check if any existing JSON-LD scripts exist:
     ```bash
     grep -rn "application/ld+json" app/ components/ --include="*.tsx"
     ```
   - Product pages need `Product` schema with: name, description, image, price (priceCurrency: UZS), availability
   - Category pages need `CollectionPage` schema
   - Home page needs `WebSite` schema with search action
   - Organization schema in root layout: name "MegaHome Ulgurji", url, logo
   - Create `components/seo/JsonLd.tsx` component if structured data is missing

5. **Sitemap Generation**: Check and generate XML sitemap:
   - Check if `app/sitemap.ts` or `public/sitemap.xml` exists:
     ```bash
     ls app/sitemap.ts public/sitemap.xml 2>/dev/null
     ```
   - If missing, create `app/sitemap.ts` using Next.js 16 Metadata API:
     - Include all public pages: home, categories, products
     - Set appropriate `changeFrequency` and `priority` values
     - Product pages: `changeFrequency: 'weekly'`, `priority: 0.8`
     - Category pages: `changeFrequency: 'weekly'`, `priority: 0.7`
     - Home page: `changeFrequency: 'daily'`, `priority: 1.0`
     - Exclude admin and auth pages

6. **Robots.txt Validation**: Check `app/robots.ts` or `public/robots.txt`:
   ```bash
   ls app/robots.ts public/robots.txt 2>/dev/null
   ```
   - Ensure it allows crawling of public pages
   - Blocks `/admin/*`, `/api/*`, `/(auth)/*`
   - Points to the sitemap URL
   - If missing, create `app/robots.ts` using Next.js Metadata API

7. **Additional Checks**:
   - Verify `next.config.ts` has proper `images.domains` for Firebase Storage URLs
   - Check for canonical URLs on all pages
   - Verify no duplicate `<h1>` tags per page:
     ```bash
     grep -rn "<h1\|<H1" app/ components/ --include="*.tsx"
     ```
   - Check page load performance impact: images should use `next/image` with proper `width`/`height`
   - Note that `next.config.ts` has `unoptimized: true` (known issue) -- recommend enabling optimization
   - Check for `lang="uz"` attribute on the `<html>` tag in `app/layout.tsx`

8. **SEO Score Report**: Provide a scored summary:
   - **Metadata**: X/10 (title, description on all pages)
   - **Open Graph**: X/10 (OG + Twitter cards on key pages)
   - **Images**: X/10 (alt text coverage)
   - **Structured Data**: X/10 (JSON-LD schemas present)
   - **Sitemap**: X/10 (exists and covers all routes)
   - **Robots.txt**: X/10 (properly configured)
   - **Technical**: X/10 (canonical URLs, lang attribute, heading hierarchy)
   - **Overall Score**: X/70
   - List all findings as actionable items with priority (High/Medium/Low) and affected file paths
