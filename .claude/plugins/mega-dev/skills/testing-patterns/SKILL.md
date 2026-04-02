---
name: testing-patterns
description: Testing and quality assurance patterns for this e-commerce project. Covers Playwright E2E tests, component testing, Firebase emulator testing, Zustand store tests, API route tests, accessibility audits, and performance testing. Use when writing tests or setting up CI quality gates.
---

# Testing & Quality Patterns for MegaHome Ulgurji

## Overview
Testing strategy for MegaHome Ulgurji covers E2E flows (Playwright), component tests (Vitest + Testing Library), Firebase emulator integration, Zustand store unit tests, and automated quality gates.

## Setup

### Install Testing Dependencies
```bash
# E2E testing
npm install -D @playwright/test
npx playwright install

# Unit/component testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @vitejs/plugin-react jsdom

# Accessibility testing
npm install -D @axe-core/playwright axe-core

# Performance testing
npm install -D @lhci/cli
```

### Project Test Structure
```
tests/
├── e2e/                       # Playwright E2E tests
│   ├── auth.spec.ts           # Login, signup, logout flows
│   ├── products.spec.ts       # Product browsing, filtering
│   ├── cart.spec.ts           # Cart operations
│   ├── checkout.spec.ts       # Order submission
│   ├── admin-products.spec.ts # Admin product CRUD
│   ├── admin-categories.spec.ts
│   ├── admin-orders.spec.ts
│   ├── admin-users.spec.ts
│   └── mobile.spec.ts         # Mobile responsive tests
├── unit/                      # Vitest unit tests
│   ├── stores/
│   │   ├── authStore.test.ts
│   │   ├── useCartStore.test.ts
│   │   ├── useProductStore.test.ts
│   │   ├── useCategoryStore.test.ts
│   │   ├── useOrderStore.test.ts
│   │   └── useDraftStore.test.ts
│   └── utils/
│       ├── FormattedPrice.test.ts
│       └── cn.test.ts
├── integration/               # API route + Firebase tests
│   ├── api-delete-user.test.ts
│   ├── api-send-email.test.ts
│   └── firebase-rules.test.ts
└── fixtures/                  # Test data
    ├── products.ts
    ├── categories.ts
    ├── users.ts
    └── orders.ts
```

### package.json scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:coverage": "vitest run --coverage",
    "test:a11y": "playwright test tests/e2e/a11y.spec.ts",
    "lighthouse": "lhci autorun"
  }
}
```

## Playwright E2E Configuration

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## E2E Test Patterns

### Authentication Flow Tests
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

// Test credentials (use Firebase emulator or test accounts)
const TEST_USER = { email: 'test@example.com', password: 'Test123456' }
const TEST_ADMIN = { email: 'admin@example.com', password: 'Admin123456' }

test.describe('Authentication', () => {
  test('should sign up new user', async ({ page }) => {
    await page.goto('/signup')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`)
    await page.fill('input[name="phone"]', '+998901234567')
    await page.fill('input[name="password"]', 'TestPassword123')
    await page.click('button[type="submit"]')

    // Should redirect to login after successful signup
    await expect(page).toHaveURL('/login')
  })

  test('should login as regular user and redirect to home', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')

    // Regular users redirect to home
    await expect(page).toHaveURL('/')
    // Header should show user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should login as admin and redirect to /admin', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_ADMIN.email)
    await page.fill('input[name="password"]', TEST_ADMIN.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/admin')
  })

  test('should block non-admin from /admin', async ({ page }) => {
    // Login as regular user first
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/')

    // Try to access admin
    await page.goto('/admin')
    // ProtectedRoute should redirect to home
    await expect(page).toHaveURL('/')
  })

  test('should persist auth state on refresh', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/')

    // Reload page - Zustand persist should maintain auth
    await page.reload()
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should logout and clear state', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')

    // Logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    await expect(page).toHaveURL('/')
  })
})
```

### Cart Operations Tests
```typescript
// tests/e2e/cart.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Cart Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login first (cart requires auth for price visibility)
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Test123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/')
  })

  test('should add product to cart', async ({ page }) => {
    // Navigate to first product
    await page.click('[data-testid="product-card"]:first-child')
    await page.click('[data-testid="add-to-cart"]')

    // Fixed cart button should show count
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })

  test('should increment and decrement quantity', async ({ page }) => {
    await page.goto('/cart-product')

    // Increment
    await page.click('[data-testid="increment-qty"]:first-child')
    await expect(page.locator('[data-testid="item-qty"]:first-child')).toHaveText('2')

    // Decrement
    await page.click('[data-testid="decrement-qty"]:first-child')
    await expect(page.locator('[data-testid="item-qty"]:first-child')).toHaveText('1')
  })

  test('should persist cart across page refreshes', async ({ page }) => {
    // Add item
    await page.click('[data-testid="product-card"]:first-child')
    await page.click('[data-testid="add-to-cart"]')

    // Refresh
    await page.reload()

    // Cart count should persist (Zustand persist with localStorage)
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })

  test('should calculate total price correctly', async ({ page }) => {
    await page.goto('/cart-product')
    const totalText = await page.locator('[data-testid="cart-total"]').textContent()
    expect(totalText).toMatch(/\d+/)  // Should contain a number
  })
})
```

### Checkout Flow Tests
```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout', () => {
  test('should submit order with valid details', async ({ page }) => {
    // Login and add items to cart first
    // ... (setup steps)

    await page.goto('/cart-product')
    await page.click('[data-testid="checkout-button"]')

    // Fill order modal
    await page.fill('input[name="clientName"]', 'Test Buyurtmachi')
    await page.fill('input[name="clientPhone"]', '+998901234567')
    await page.click('[data-testid="submit-order"]')

    // Should show success toast
    await expect(page.locator('[role="status"]')).toContainText('Buyurtma')

    // Cart should be cleared
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0')
  })

  test('should validate phone number format (+998)', async ({ page }) => {
    await page.goto('/cart-product')
    await page.click('[data-testid="checkout-button"]')

    await page.fill('input[name="clientName"]', 'Test')
    await page.fill('input[name="clientPhone"]', '1234567')  // Invalid
    await page.click('[data-testid="submit-order"]')

    // Should show validation error
    await expect(page.locator('[data-testid="phone-error"]')).toBeVisible()
  })
})
```

### Admin CRUD Tests
```typescript
// tests/e2e/admin-products.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'Admin123456')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('should create new product', async ({ page }) => {
    await page.goto('/admin/create-product')
    await page.fill('input[name="title"]', 'Test Mahsulot')
    await page.fill('input[name="price"]', '50000')
    await page.fill('textarea[name="description"]', 'Test tavsifi')
    await page.fill('input[name="quantity"]', '10')

    // Select category
    await page.click('[data-testid="category-select"]')
    await page.click('[data-testid="category-option"]:first-child')

    // Upload image (use test fixture)
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/test-product.jpg')

    await page.click('button[type="submit"]')

    // Should redirect to products list
    await expect(page).toHaveURL('/admin/products')
    await expect(page.locator('text=Test Mahsulot')).toBeVisible()
  })

  test('should delete product', async ({ page }) => {
    await page.goto('/admin/products')
    const productCount = await page.locator('[data-testid="product-row"]').count()

    await page.click('[data-testid="delete-product"]:last-child')
    await page.click('[data-testid="confirm-delete"]')

    // Product count should decrease
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(productCount - 1)
  })
})
```

## Vitest Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['store/**', 'lib/**', 'hooks/**', 'components/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

### tests/setup.ts
```typescript
import '@testing-library/jest-dom'

// Mock Firebase
vi.mock('@/firebase/config', () => ({
  fireDB: {},
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  fireStorage: {},
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

## Zustand Store Testing

### Cart Store Test
```typescript
// tests/unit/stores/useCartStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/useCartStore'
import type { ProductT } from '@/lib/types'
import { Timestamp } from 'firebase/firestore'

const mockProduct: ProductT = {
  id: 'test-product-1',
  title: 'Test Stol',
  price: '50000',
  productImageUrl: [{ url: 'https://example.com/img.jpg', path: 'products/test/img.jpg' }],
  category: 'Stollar',
  description: 'Test tavsifi',
  quantity: 10,
  time: Timestamp.now(),
  date: Timestamp.now(),
  storageFileId: 'test-uuid',
}

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState({
      cartProducts: [],
      totalQuantity: 0,
      totalPrice: 0,
    })
  })

  it('should add product to cart', () => {
    const { addToBasket } = useCartStore.getState()
    addToBasket(mockProduct)

    const state = useCartStore.getState()
    expect(state.cartProducts).toHaveLength(1)
    expect(state.cartProducts[0].id).toBe('test-product-1')
  })

  it('should increment quantity of existing product', () => {
    const store = useCartStore.getState()
    store.addToBasket(mockProduct)
    store.addToBasket(mockProduct)

    const state = useCartStore.getState()
    expect(state.cartProducts).toHaveLength(1)
    expect(state.cartProducts[0].quantity).toBe(2)
  })

  it('should decrement quantity', () => {
    const store = useCartStore.getState()
    store.addToBasket(mockProduct)
    store.addToBasket(mockProduct)
    store.decrementQuantity(mockProduct.id)

    const state = useCartStore.getState()
    expect(state.cartProducts[0].quantity).toBe(1)
  })

  it('should remove product when quantity reaches 0', () => {
    const store = useCartStore.getState()
    store.addToBasket(mockProduct)
    store.decrementQuantity(mockProduct.id)

    const state = useCartStore.getState()
    expect(state.cartProducts).toHaveLength(0)
  })

  it('should calculate totals correctly', () => {
    const store = useCartStore.getState()
    store.addToBasket(mockProduct)
    store.addToBasket(mockProduct)
    store.calculateTotals()

    const state = useCartStore.getState()
    expect(state.totalQuantity).toBe(2)
    expect(state.totalPrice).toBe(100000)  // 50000 * 2
  })

  it('should clear basket', () => {
    const store = useCartStore.getState()
    store.addToBasket(mockProduct)
    store.clearBasket()

    const state = useCartStore.getState()
    expect(state.cartProducts).toHaveLength(0)
    expect(state.totalQuantity).toBe(0)
    expect(state.totalPrice).toBe(0)
  })
})
```

### Auth Store Test
```typescript
// tests/unit/stores/authStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      userData: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('should set user data', () => {
    const { setUserData } = useAuthStore.getState()
    setUserData({
      name: 'Test User',
      email: 'test@example.com',
      uid: 'test-uid',
      role: 'user',
      phone: '+998901234567',
    })

    const state = useAuthStore.getState()
    expect(state.userData?.name).toBe('Test User')
    expect(state.userData?.role).toBe('user')
  })

  it('should detect admin role', () => {
    useAuthStore.setState({
      userData: {
        name: 'Admin',
        email: 'admin@example.com',
        uid: 'admin-uid',
        role: 'admin',
        phone: '+998901234567',
      },
    })

    const { isAdmin } = useAuthStore.getState()
    expect(isAdmin()).toBe(true)
  })

  it('should return false for non-admin', () => {
    useAuthStore.setState({
      userData: {
        name: 'User',
        email: 'user@example.com',
        uid: 'user-uid',
        role: 'user',
        phone: '+998901234567',
      },
    })

    const { isAdmin } = useAuthStore.getState()
    expect(isAdmin()).toBe(false)
  })
})
```

## Firebase Emulator Testing

### firebase.json (add emulators section)
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Connect to emulators in test env
```typescript
// tests/firebase-test-setup.ts
import { connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator } from 'firebase/firestore'
import { connectStorageEmulator } from 'firebase/storage'
import { auth, fireDB, fireStorage } from '@/firebase/config'

if (process.env.NODE_ENV === 'test' || process.env.USE_EMULATORS) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099')
  connectFirestoreEmulator(fireDB, '127.0.0.1', 8080)
  connectStorageEmulator(fireStorage, '127.0.0.1', 9199)
}
```

### Running with emulators
```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Run tests against emulators
USE_EMULATORS=true npm run test:e2e
```

## API Route Testing

```typescript
// tests/integration/api-delete-user.test.ts
import { describe, it, expect, vi } from 'vitest'

// Mock firebase-admin
vi.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: vi.fn(),
  credential: { cert: vi.fn() },
  auth: () => ({
    deleteUser: vi.fn().mockResolvedValue(undefined),
  }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        delete: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
}))

describe('DELETE /api/delete-user', () => {
  it('should return 400 if uid is missing', async () => {
    const { POST } = await import('@/app/api/delete-user/route')
    const request = new Request('http://localhost:3000/api/delete-user', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    expect(response.status).toBe(400)
  })

  it('should delete user with valid uid', async () => {
    const { POST } = await import('@/app/api/delete-user/route')
    const request = new Request('http://localhost:3000/api/delete-user', {
      method: 'POST',
      body: JSON.stringify({ uid: 'test-uid-123' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request as any)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

## Accessibility Testing

```typescript
// tests/e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Cart', path: '/cart-product' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
]

for (const { name, path } of pages) {
  test(`${name} page should have no a11y violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.aos-animate')  // Exclude AOS animated elements during scan
      .analyze()

    expect(results.violations).toEqual([])
  })
}

test('admin pages should have no a11y violations', async ({ page }) => {
  // Login as admin first
  await page.goto('/login')
  await page.fill('input[name="email"]', 'admin@example.com')
  await page.fill('input[name="password"]', 'Admin123456')
  await page.click('button[type="submit"]')

  const adminPages = ['/admin', '/admin/products', '/admin/categories', '/admin/orders', '/admin/customers']

  for (const adminPath of adminPages) {
    await page.goto(adminPath)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  }
})
```

## Performance Testing (Lighthouse CI)

### lighthouserc.js
```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/cart-product',
      ],
      startServerCommand: 'npm run build && npm start',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### Run Lighthouse CI
```bash
npx lhci autorun
```

## Test File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| E2E test | `tests/e2e/{feature}.spec.ts` | `tests/e2e/auth.spec.ts` |
| Unit test | `tests/unit/{dir}/{file}.test.ts` | `tests/unit/stores/useCartStore.test.ts` |
| Integration | `tests/integration/{feature}.test.ts` | `tests/integration/api-delete-user.test.ts` |
| Fixture | `tests/fixtures/{entity}.ts` | `tests/fixtures/products.ts` |

## Test Data Fixtures

```typescript
// tests/fixtures/products.ts
import type { ProductT } from '@/lib/types'
import { Timestamp } from 'firebase/firestore'

export const mockProducts: ProductT[] = [
  {
    id: 'prod-1',
    title: 'Yoзgi Stol',
    price: '150000',
    productImageUrl: [{ url: 'https://example.com/stol.jpg', path: 'products/stol/img.jpg' }],
    category: 'Stollar',
    description: 'Sifatli yog\'och stol',
    quantity: 25,
    time: Timestamp.now(),
    date: Timestamp.now(),
    storageFileId: 'uuid-stol-1',
  },
  {
    id: 'prod-2',
    title: 'Ofis Stuli',
    price: '80000',
    productImageUrl: [{ url: 'https://example.com/stul.jpg', path: 'products/stul/img.jpg' }],
    category: 'Stullar',
    description: 'Qulay ofis stuli',
    quantity: 50,
    time: Timestamp.now(),
    date: Timestamp.now(),
    storageFileId: 'uuid-stul-1',
  },
]

// tests/fixtures/users.ts
export const mockUsers = {
  admin: { name: 'Admin', email: 'admin@megahome.uz', uid: 'admin-uid', role: 'admin' as const, phone: '+998901234567' },
  user: { name: 'Foydalanuvchi', email: 'user@megahome.uz', uid: 'user-uid', role: 'user' as const, phone: '+998909876543' },
}
```

## CI Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run test:unit

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx lhci autorun
```

## Key Conventions
- E2E tests use `data-testid` attributes for selectors (add to components as needed)
- Store tests use `getState()` and `setState()` directly (no component rendering needed)
- Mock Firebase in unit tests, use emulators for integration tests
- Test Uzbek text content with exact strings (e.g., "Buyurtma qabul qilindi")
- Price is stored as string in Firestore - test number conversion
- Phone validation tests must use +998 prefix (Uzbekistan format)
- Cart persistence tests should verify localStorage key `basket-storage`
