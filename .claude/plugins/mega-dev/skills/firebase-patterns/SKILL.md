---
name: firebase-patterns
description: Firebase patterns for this e-commerce app. Firestore CRUD operations, Auth flows, Storage image uploads, real-time listeners, security rules, and Admin SDK usage. Use when implementing any Firebase backend feature.
allowed-tools: Read, Grep, Glob
---

# Firebase Patterns for MegaHome Ulgurji

## Configuration
- Client SDK initialized in `firebase/config.ts`
- Exports: `fireDB` (Firestore), `auth` (Auth), `fireStorage` (Storage)
- Project: `mega-ulgurji-1fccf`

## Firestore Operations

### Read documents (one-time):
```typescript
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { fireDB } from '@/firebase/config'

const q = query(
  collection(fireDB, 'products'),
  where('category', '==', categoryName),
  orderBy('time', 'desc'),
  limit(20)
)
const snapshot = await getDocs(q)
const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductT))
```

### Real-time listener:
```typescript
import { onSnapshot } from 'firebase/firestore'

// In Zustand store:
const unsubscribe = onSnapshot(
  query(collection(fireDB, 'products'), orderBy('time', 'desc')),
  (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductT))
    set({ products: items })
  }
)
// IMPORTANT: Return unsubscribe for cleanup
```

### Create document:
```typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

await addDoc(collection(fireDB, 'orders'), {
  ...orderData,
  time: serverTimestamp(),
  date: serverTimestamp(),
})
```

### Update document:
```typescript
import { doc, updateDoc } from 'firebase/firestore'

await updateDoc(doc(fireDB, 'products', productId), {
  title: newTitle,
  price: newPrice,
})
```

### Delete document:
```typescript
import { doc, deleteDoc } from 'firebase/firestore'
await deleteDoc(doc(fireDB, 'products', productId))
```

## Authentication

### Sign up:
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth'
const credential = await createUserWithEmailAndPassword(auth, email, password)
// Then create user doc in Firestore "user" collection
await addDoc(collection(fireDB, 'user'), {
  name, email, uid: credential.user.uid, role: 'user', phone, time: serverTimestamp(), date: serverTimestamp()
})
```

### Sign in:
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth'
await signInWithEmailAndPassword(auth, email, password)
```

### Auth state listener (in AuthProvider):
```typescript
import { onAuthStateChanged } from 'firebase/auth'
onAuthStateChanged(auth, (user) => {
  if (user) { /* fetch user data from Firestore */ }
  else { /* clear auth state */ }
})
```

## Storage

### Upload image:
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
const storageRef = ref(fireStorage, `products/${storageFileId}/${file.name}`)
await uploadBytes(storageRef, file)
const url = await getDownloadURL(storageRef)
```

### Delete image:
```typescript
import { ref, deleteObject } from 'firebase/storage'
await deleteObject(ref(fireStorage, imagePath))
```

## Collections Schema
| Collection | Key Fields | Notes |
|-----------|-----------|-------|
| user | name, email, uid, role, phone | role: "admin" or "user" |
| categories | id, name, description, categoryImgUrl[], subcategory[] | subcategory is string array of tags |
| products | id, title, price, productImageUrl[], category, subcategory | price is string type |
| orders | id, clientName, clientPhone, basketItems[], totalPrice, userUid | basketItems contains ProductT[] |

## API Routes (Admin SDK)
- `app/api/delete-user/route.ts` - Uses `firebase-admin` to delete Auth user
- `app/api/sendOrderEmail/route.ts` - Sends email via Nodemailer

## Important Notes
- Product `price` is stored as `string`, not `number` - be careful with calculations
- `storageFileId` is generated with `uuid` for grouping multiple images
- Draft store (`useDraftStore.ts`) cleans up Storage images when drafts expire
- Orders store user's `uid` for filtering in order history
