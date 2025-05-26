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
}

export interface CategoryI {
  id: string;
  name: string;
  description: string;
  categoryImgUrl: ImageT[];
  storageFileId: string;
}