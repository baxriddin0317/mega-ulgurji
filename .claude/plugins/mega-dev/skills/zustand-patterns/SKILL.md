---
name: zustand-patterns
description: Zustand state management patterns for this e-commerce project. Store creation, persist middleware, selectors, Firebase integration, and store-to-component data flow. Use when creating or modifying Zustand stores.
allowed-tools: Read, Grep, Glob
---

# Zustand Patterns for MegaHome Ulgurji

## Store Architecture
All stores in `store/` directory. This project uses Zustand 5 with persist middleware.

## Existing Stores

### authStore.ts
```typescript
// State: user (Firebase User), userData (Firestore doc), isAuthenticated, isLoading
// Actions: setUser, setUserData, fetchUserData, fetchAllUsers, logout, isAdmin()
// Persist: user, userData, isAuthenticated
// Usage: const { userData, isAdmin } = useAuthStore()
```

### useCartStore.ts
```typescript
// State: cartProducts[], totalQuantity, totalPrice
// Actions: addToBasket, incrementQuantity, decrementQuantity, getItemQuantity, calculateTotals, clearBasket
// Persist key: 'basket-storage'
// Usage: const { cartProducts, addToBasket } = useCartStore()
```

### useCategoryStore.ts
```typescript
// State: categories[], singleCategory, isLoading
// Actions: addCategory, fetchCategories (onSnapshot), fetchSingleCategory, updateCategory, deleteCategory
// No persist (real-time from Firestore)
```

### useProductStore.ts
```typescript
// State: products[], singleProduct, isLoading
// Actions: fetchProducts (onSnapshot), fetchSingleProduct, updateProduct, deleteProduct
// No persist (real-time from Firestore)
```

### useOrderStore.ts
```typescript
// State: orders[], currentOrder, loadingOrders
// Actions: addOrder, fetchAllOrders, fetchUserOrders
// No persist
```

### useDraftStore.ts
```typescript
// State: categoryDraft with 24h expiry
// Actions: saveCategoryDraft, loadCategoryDraft, deleteCategoryDraft
// Cleans up Storage images on draft deletion
```

### useToggleStore.ts (useSidebarStore)
```typescript
// State: isOpen
// Actions: toggle, open, close
// No persist
```

## Creating a New Store

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NewStoreState {
  items: Item[]
  isLoading: boolean
  // Actions
  fetchItems: () => void
  addItem: (item: Item) => void
}

export const useNewStore = create<NewStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchItems: () => {
        set({ isLoading: true })
        const unsubscribe = onSnapshot(
          query(collection(fireDB, 'items'), orderBy('time', 'desc')),
          (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Item))
            set({ items, isLoading: false })
          }
        )
        return unsubscribe
      },

      addItem: async (item) => {
        await addDoc(collection(fireDB, 'items'), item)
        // onSnapshot will auto-update the store
      },
    }),
    {
      name: 'new-store-storage', // localStorage key
      partialize: (state) => ({ items: state.items }), // only persist what's needed
    }
  )
)
```

## Selector Patterns (Prevent Re-renders)
```typescript
// BAD - re-renders on ANY store change:
const store = useCartStore()

// GOOD - only re-renders when cartProducts changes:
const cartProducts = useCartStore(state => state.cartProducts)
const addToBasket = useCartStore(state => state.addToBasket)

// GOOD - derived data with shallow comparison:
import { useShallow } from 'zustand/shallow'
const { totalPrice, totalQuantity } = useCartStore(
  useShallow(state => ({ totalPrice: state.totalPrice, totalQuantity: state.totalQuantity }))
)
```

## Store + Firebase Data Flow
```
User Action → Zustand Action → Firebase Write → onSnapshot → Zustand State Update → React Re-render
```

## Key Conventions
- Store files: `use{Name}Store.ts` in `store/`
- Types: Defined in `lib/types.ts`
- Firebase imports: From `@/firebase/config`
- Real-time stores (products, categories): Don't persist, use onSnapshot
- Local stores (cart, auth): Use persist middleware
- Always handle loading states (`isLoading`, `isfetchLoading`)
