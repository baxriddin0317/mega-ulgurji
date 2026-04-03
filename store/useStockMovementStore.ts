import { create } from "zustand";
import { collection, addDoc, onSnapshot, orderBy, query, limit, Timestamp } from "firebase/firestore";
import { fireDB } from "@/firebase/config";
import type { StockMovement, StockMovementType } from "@/lib/types";

interface StockMovementStore {
  movements: StockMovement[];
  loading: boolean;
  fetchMovements: () => void;
  logMovement: (data: {
    productId: string;
    productTitle: string;
    type: StockMovementType;
    quantity: number;
    stockBefore: number;
    stockAfter: number;
    reason: string;
    reference?: string;
  }) => Promise<void>;
}

const useStockMovementStore = create<StockMovementStore>((set) => ({
  movements: [],
  loading: true,

  fetchMovements: () => {
    const q = query(
      collection(fireDB, "stockMovements"),
      orderBy("timestamp", "desc"),
      limit(200)
    );
    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StockMovement[];
      set({ movements: data, loading: false });
    });
  },

  logMovement: async (data) => {
    await addDoc(collection(fireDB, "stockMovements"), {
      ...data,
      timestamp: Timestamp.now(),
    });
  },
}));

export default useStockMovementStore;
