---
name: run-tests
description: Run the full test suite including E2E, components, types, and linting
user_invocable: true
---

Run the full test suite for MegaHome Ulgurji and report results.

Arguments: $ARGUMENTS

Steps:

1. **Parse Scope**: Determine what to run from arguments:
   - `all` (default): run everything below
   - `e2e`: Playwright E2E tests only
   - `components`: component tests only
   - `types`: TypeScript compilation check only
   - `lint`: ESLint only
   - `build`: build check only
   - If no arguments, run the full suite

2. **Check Test Infrastructure**: Verify testing tools are installed:
   ```bash
   npx playwright --version 2>/dev/null || echo "Playwright not installed"
   npx vitest --version 2>/dev/null || echo "Vitest not installed"
   ```
   - If Playwright is missing and E2E tests are requested:
     ```bash
     npm install -D @playwright/test && npx playwright install
     ```
   - If Vitest is missing and component tests are requested:
     ```bash
     npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
     ```
   - Check for test config files:
     ```bash
     ls playwright.config.ts vitest.config.ts 2>/dev/null
     ```
   - If configs are missing, scaffold them with sensible defaults for Next.js 16

3. **TypeScript Compilation Check**: Verify type safety across the codebase:
   ```bash
   npx tsc --noEmit --pretty 2>&1
   ```
   - Parse output for error count and locations
   - Group errors by file: `store/`, `components/`, `app/`, `lib/`
   - Flag any `any` type usage:
     ```bash
     grep -rn ": any\|as any\|<any>" store/ components/ app/ lib/ hooks/ utils/ --include="*.ts" --include="*.tsx"
     ```
   - Report total errors and warnings

4. **ESLint Check**: Run linting across the project:
   ```bash
   npm run lint 2>&1
   ```
   - If `npm run lint` fails, try direct invocation:
     ```bash
     npx eslint app/ components/ store/ lib/ hooks/ utils/ --ext .ts,.tsx 2>&1
     ```
   - Parse output for error/warning counts
   - Group issues by rule (e.g., `no-unused-vars`, `react-hooks/exhaustive-deps`)
   - Report the most frequent lint violations

5. **Component Tests**: Run unit/component tests with Vitest:
   ```bash
   npx vitest run --reporter=verbose 2>&1
   ```
   - If no test files exist yet, report which components should have tests:
     - `components/client/Header.tsx` -- navigation and cart badge
     - `components/client/ProductCard.tsx` -- product display and add-to-cart
     - `components/auth/LoginForm.tsx` -- form validation
     - `components/auth/SignUpForm.tsx` -- form validation and submission
     - `components/admin/ProductForm.tsx` -- product CRUD form
     - `store/useCartStore.ts` -- cart add/remove/quantity logic
     - `store/authStore.ts` -- auth state and role checks
     - `hooks/FormattedPrice.ts` -- UZS price formatting
   - Suggest creating a `__tests__/` directory or colocated `.test.tsx` files

6. **Playwright E2E Tests**: Run end-to-end browser tests:
   ```bash
   npx playwright test --reporter=list 2>&1
   ```
   - If no E2E tests exist yet, report which user flows should be covered:
     - **Auth flow**: signup, login, logout
     - **Product browsing**: home page load, category filter, product detail view
     - **Cart flow**: add to cart, update quantity, remove item
     - **Order flow**: place order, view order history
     - **Admin flow**: login as admin, CRUD products, CRUD categories, manage orders
   - Suggest creating tests in `e2e/` or `tests/` directory
   - If tests exist, report pass/fail per test file and total duration

7. **Build Check**: Verify the production build succeeds:
   ```bash
   npm run build 2>&1
   ```
   - Capture TypeScript errors surfaced during build
   - Report bundle sizes for each route in the build output
   - Flag routes exceeding 200KB (First Load JS)
   - Check for any build warnings

8. **Coverage Report**: Aggregate test coverage if available:
   ```bash
   npx vitest run --coverage 2>&1
   ```
   - Report line, branch, function, and statement coverage percentages
   - Identify files with zero coverage
   - Highlight critical files that need coverage:
     - All Zustand stores in `store/`
     - Auth logic in `providers/AuthProvider.tsx`
     - API routes in `app/api/`

9. **Results Summary**: Produce a clear report card:
   - **TypeScript**: PASS/FAIL (X errors, Y warnings)
   - **ESLint**: PASS/FAIL (X errors, Y warnings)
   - **Component Tests**: PASS/FAIL (X passed, Y failed, Z skipped)
   - **E2E Tests**: PASS/FAIL (X passed, Y failed)
   - **Build**: PASS/FAIL (total bundle size)
   - **Coverage**: X% overall
   - **Overall Status**: PASS (all green) / WARN (warnings only) / FAIL (errors present)

10. **Fix Suggestions**: For each failure, provide:
    - The exact file and line number
    - The error message
    - A concrete fix suggestion or code snippet
    - Priority: Critical (build-breaking), High (test failure), Medium (lint error), Low (warning)
