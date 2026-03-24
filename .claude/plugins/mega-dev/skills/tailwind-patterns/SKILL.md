---
name: tailwind-patterns
description: Tailwind CSS 4 styling conventions for this e-commerce project. Theme variables, color system, responsive breakpoints, component patterns, and shadcn/ui usage. Use when styling components or fixing layout issues.
allowed-tools: Read, Grep, Glob
---

# Tailwind CSS 4 Patterns for MegaHome Ulgurji

## Theme System (globals.css)
This project uses Tailwind CSS 4 with CSS custom properties for theming.

### Custom Colors
```css
--color-link-hover: #EEEEEE
--color-brand-gray-100: #EEEEEE
--color-brand-gray-200: #5e5e5e
--color-brand-text: #6B6B6B
--color-brand-black-text: #0e141b
```

### Usage in components:
```tsx
<div className="text-brand-text">          // #6B6B6B
<div className="bg-brand-gray-100">        // #EEEEEE
<div className="text-brand-black-text">    // #0e141b
<div className="shadow-bottom-only">       // bottom-only shadow
```

### Theme Colors (Light/Dark)
```
primary, secondary, muted, accent, destructive
background, foreground, card, popover, border, input, ring
sidebar-* variants for admin panel
chart-1 through chart-5
```

## Custom Breakpoint
```css
--breakpoint-custom: 860px
```
Usage: `custom:grid-cols-3` (available at 860px+)

## Responsive Patterns Used in This Project

### Product Grid (components/client/Products.tsx)
- Mobile: 2 columns
- md (768px): 3 columns
- lg (1024px): 4 columns

### Admin Tables
- Mobile: Card layout with stacked fields
- Desktop: Traditional table rows

### Navigation
- Mobile: Sheet/Drawer (MobileMenu.tsx)
- Desktop: Sidebar (Sidebar.tsx)

## Component Styling Patterns

### cn() utility (lib/utils.ts)
```typescript
import { cn } from "@/lib/utils"
// Merges Tailwind classes, handles conflicts:
<div className={cn("p-4 bg-white", isActive && "bg-primary text-white", className)} />
```

### Button variants (shadcn/ui)
```tsx
<Button variant="default" />   // Primary
<Button variant="destructive" /> // Red/danger
<Button variant="outline" />   // Border only
<Button variant="ghost" />     // No background
<Button variant="link" />      // Text link style
```

### Common Layout Patterns
```tsx
// Page container
<div className="max-w-7xl mx-auto px-4">

// Card
<div className="bg-white rounded-lg shadow-bottom-only p-4">

// Grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

// Flex center
<div className="flex items-center justify-center">

// Fixed bottom button (FixedCartButton)
<div className="fixed bottom-4 right-4 z-50">
```

## Dark Mode
Configured with `@custom-variant dark (&:is(.dark *))` but not actively used in the UI (body uses `bg-black/90` as default).

## Key Files
- `app/globals.css` - Full theme definition
- `lib/utils.ts` - cn() utility
- `components/ui/` - shadcn/ui base components
- `components.json` - shadcn/ui configuration
