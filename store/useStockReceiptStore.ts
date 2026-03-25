import { create } from 'zustand';
import { collection, addDoc, query, onSnapshot, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { fireDB } from '@/firebase/config';
import { StockReceipt, StockReceiptItem } from '@/lib/types';

interface StockReceiptState {
  receipts: StockReceipt[];
  loading: boolean;
  addReceipt: (receipt: Omit<StockReceipt, 'id'>) => Promise<void>;
  fetchReceipts: () => void;
}

export const useStockReceiptStore = create<StockReceiptState>((set) => ({
  receipts: [],
  loading: true,

  addReceipt: async (receipt) => {
    try {
      // Save receipt document
      await addDoc(collection(fireDB, 'stockReceipts'), {
        ...receipt,
        date: new Date(),
      });

      // Update each product: stock + weighted average costPrice
      for (const item of receipt.items) {
        const productRef = doc(fireDB, 'products', item.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const product = productSnap.data();
          const currentStock = product.stock ?? 0;
          const currentCost = product.costPrice ?? 0;

          // Weighted average cost = (old_qty * old_cost + new_qty * new_cost) / (old_qty + new_qty)
          const totalOldValue = currentStock * currentCost;
          const totalNewValue = item.quantity * item.unitCost;
          const newTotalQty = currentStock + item.quantity;
          const weightedAvgCost = newTotalQty > 0
            ? Math.round((totalOldValue + totalNewValue) / newTotalQty)
            : item.unitCost;

          await updateDoc(productRef, {
            stock: increment(item.quantity),
            costPrice: weightedAvgCost,
          });
        }
      }
    } catch (error) {
      console.error('Error adding stock receipt:', error);
      throw error;
    }
  },

  fetchReceipts: () => {
    set({ loading: true });
    try {
      const q = query(collection(fireDB, 'stockReceipts'));
      onSnapshot(q, (snapshot) => {
        const receipts: StockReceipt[] = [];
        snapshot.forEach((d) => {
          receipts.push({ ...d.data(), id: d.id } as StockReceipt);
        });
        // Sort by date descending (newest first)
        receipts.sort((a, b) => {
          const aTime = a.date?.seconds || 0;
          const bTime = b.date?.seconds || 0;
          return bTime - aTime;
        });
        set({ receipts, loading: false });
      });
    } catch (error) {
      console.error('Error fetching receipts:', error);
      set({ loading: false });
    }
  },
}));
