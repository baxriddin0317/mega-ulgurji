---
name: ecommerce-qa
description: Quality assurance and testing patterns for this e-commerce app. Covers testing user flows, auth edge cases, cart logic, order processing, admin operations, and mobile responsiveness. Use when testing features or ensuring quality.
allowed-tools: Read, Grep, Glob, Bash
---

# E-Commerce QA Patterns for MegaHome Ulgurji

## Critical User Flows to Test

### 1. Authentication Flow
- [ ] Sign up with valid credentials → redirects to login
- [ ] Sign up with existing email → shows error
- [ ] Login as regular user → redirects to home
- [ ] Login as admin → redirects to /admin
- [ ] Logout → clears auth state, redirects home
- [ ] Access /admin without auth → redirects home
- [ ] Access /admin as regular user → redirects home
- [ ] Refresh page → auth state persists (Zustand persist)

### 2. Product Browsing
- [ ] Home page loads categories and products
- [ ] Category page shows filtered products
- [ ] Subcategory filter works within category
- [ ] Product detail page shows images, description, price
- [ ] Price hidden for non-authenticated users
- [ ] Product images display correctly from Firebase Storage
- [ ] AOS animations trigger on scroll

### 3. Cart Operations
- [ ] Add product to cart → cart count updates
- [ ] Increment/decrement quantity in cart
- [ ] Remove item (decrement to 0)
- [ ] Cart persists across page refreshes (localStorage)
- [ ] Total price and quantity calculate correctly
- [ ] Fixed cart button shows correct count

### 4. Order Process
- [ ] Open order modal from cart
- [ ] Fill in name and phone number
- [ ] Submit order → saves to Firestore
- [ ] Email sent to admin (check Nodemailer)
- [ ] Cart clears after successful order
- [ ] Order appears in user's history
- [ ] Order appears in admin orders panel

### 5. Admin Operations
- [ ] View all users with roles
- [ ] Change user role (admin/user)
- [ ] Delete user (Auth + Firestore)
- [ ] Create category with image upload
- [ ] Edit category (name, description, images, subcategories)
- [ ] Delete category
- [ ] Create product with images and category assignment
- [ ] Edit product details
- [ ] Delete product (including Storage cleanup)
- [ ] View all orders with expandable details
- [ ] Admin profile update (name, phone, password)

### 6. Mobile Responsiveness
- [ ] Header collapses to hamburger menu
- [ ] Admin sidebar becomes drawer
- [ ] Product grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- [ ] Admin tables switch to card layout on mobile
- [ ] Order modal is usable on small screens
- [ ] Cart page scrollable with fixed total section

## Common Bug Patterns
1. **Hydration mismatches**: Client-side Zustand persist vs server render
2. **Image loading**: Firebase Storage URLs may fail if rules are wrong
3. **Auth timing**: ProtectedRoute may flash before auth state loads
4. **Phone formatting**: Only works for +998 (Uzbekistan) numbers
5. **Draft expiry**: Old drafts may reference deleted Storage files

## Build Verification
```bash
npm run build    # Should complete without errors
npm run lint     # Should pass ESLint
```

## Environment Check
Ensure these are set for production:
- Firebase client config (currently in firebase/config.ts)
- Gmail SMTP credentials (currently hardcoded - MUST move to .env)
- Firebase Admin credentials (for API routes)
