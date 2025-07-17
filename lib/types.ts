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
  productImageUrl: ImageT[];
  category: string;
  description: string;
  quantity: number;
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

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  date: Timestamp;
  basketItems: ProductT[];
  totalPrice: number;
  totalQuantity: number;
  userUid: string; // Add this field to associate order with user
}