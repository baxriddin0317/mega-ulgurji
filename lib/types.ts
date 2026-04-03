// types/auth.ts
import { Timestamp } from 'firebase/firestore';

export interface ImageT {
  url: string;
  path: string;
}

// 
export interface ProductT {
  id: string;
  title: string;
  price: string;
  costPrice?: number;
  productImageUrl: ImageT[];
  category: string;
  description: string;
  quantity: number;
  stock?: number;
  time: Timestamp;
  date: Timestamp;
  storageFileId: string;
  subcategory?: string;
}

export interface CategoryI {
  id: string;
  name: string;
  description: string;
  categoryImgUrl: ImageT[];
  storageFileId: string;
  subcategory: string[]; // Added for subcategories/tags
}

export type OrderStatus = 'yangi' | 'tasdiqlangan' | 'yigʻilmoqda' | 'yetkazilmoqda' | 'yetkazildi' | 'bekor_qilindi';

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  date: Timestamp;
  basketItems: ProductT[];
  totalPrice: number;
  totalQuantity: number;
  userUid: string;
  status?: OrderStatus;
}

export interface StockReceiptItem {
  productId: string;
  productTitle: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface StockReceipt {
  id: string;
  supplierName: string;
  date: Timestamp;
  items: StockReceiptItem[];
  totalAmount: number;
  note?: string;
}

export type StockMovementType = 'kirim' | 'sotish' | 'tuzatish' | 'qaytarish' | 'zarar';

export interface StockMovement {
  id: string;
  productId: string;
  productTitle: string;
  type: StockMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  reference?: string;
  userId?: string;
  userName?: string;
  timestamp: Timestamp;
}