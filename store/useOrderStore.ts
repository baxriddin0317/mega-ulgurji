import {create} from "zustand";
import { collection, addDoc, query, onSnapshot, doc, updateDoc, getDoc, increment, writeBatch, Timestamp, where } from "firebase/firestore";
import { fireDB } from '@/firebase/config';
import { Order, OrderStatus, ProductT } from "@/lib/types";

interface StoreState {
  orders: Order[];
  currentOrder: Order | null;
  loadingOrders: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  bulkUpdateOrderStatus: (orderIds: string[], status: OrderStatus) => Promise<{ success: number; failed: number }>;
  fetchAllOrders: () => void;
  fetchUserOrders: (userUid: string) => void;
}

export const useOrderStore = create<StoreState>((set) => ({
  orders: [],
  currentOrder: null,
  loadingOrders: true,

  addOrder: async (order: Order) => {
    try {
      if (!order.userUid) {
        throw new Error("Order must have a userUid");
      }
      const ordersCollectionRef = collection(fireDB, "orders");
      const docRef = await addDoc(ordersCollectionRef, {
        ...order,
        date: new Date(),
        status: 'yangi' as OrderStatus,
        userUid: order.userUid,
      });
      // Stock is NOT decremented here — only when admin marks "yetkazildi"
      set((state) => {
        const newOrder = { ...order, id: docRef.id };
        return { orders: [...state.orders, newOrder] };
      });
    } catch (error) {
      console.error("Error adding order to Firebase: ", error);
    }
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(fireDB, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;

      const orderData = orderSnap.data();
      const prevStatus = (orderData.status ?? 'yangi') as OrderStatus;
      const basketItems = (orderData.basketItems ?? []) as ProductT[];

      // Decrement stock when admin marks as DELIVERED (yetkazildi)
      if (status === 'yetkazildi' && prevStatus !== 'yetkazildi') {
        // Read current stock for each product before batch commit
        const stockSnapshots: Map<string, number> = new Map();
        for (const item of basketItems) {
          if (item.id) {
            const productSnap = await getDoc(doc(fireDB, "products", item.id));
            stockSnapshots.set(item.id, productSnap.exists() ? (productSnap.data().stock ?? 0) : 0);
          }
        }

        const stockBatch = writeBatch(fireDB);
        for (const item of basketItems) {
          if (item.id) {
            const productRef = doc(fireDB, "products", item.id);
            stockBatch.update(productRef, { stock: increment(-item.quantity) });
          }
        }
        await stockBatch.commit();

        // Log stock movements (fire-and-forget)
        for (const item of basketItems) {
          if (item.id) {
            const stockBefore = stockSnapshots.get(item.id) ?? 0;
            addDoc(collection(fireDB, "stockMovements"), {
              productId: item.id,
              productTitle: item.title,
              type: 'sotish',
              quantity: -item.quantity,
              stockBefore,
              stockAfter: stockBefore - item.quantity,
              reason: `Buyurtma yetkazildi`,
              reference: orderId,
              timestamp: Timestamp.now(),
            }).catch((err) => console.error('Error logging stock movement:', err));
          }
        }
      }

      // Restore stock if cancelling a DELIVERED order (rare but safe)
      // Or if cancelling any order that was already delivered
      if (status === 'bekor_qilindi' && prevStatus === 'yetkazildi') {
        // Read current stock for each product before batch commit
        const stockSnapshots: Map<string, number> = new Map();
        for (const item of basketItems) {
          if (item.id) {
            const productSnap = await getDoc(doc(fireDB, "products", item.id));
            stockSnapshots.set(item.id, productSnap.exists() ? (productSnap.data().stock ?? 0) : 0);
          }
        }

        const stockBatch = writeBatch(fireDB);
        for (const item of basketItems) {
          if (item.id) {
            const productRef = doc(fireDB, "products", item.id);
            stockBatch.update(productRef, { stock: increment(item.quantity) });
          }
        }
        await stockBatch.commit();

        // Log stock movements (fire-and-forget)
        for (const item of basketItems) {
          if (item.id) {
            const stockBefore = stockSnapshots.get(item.id) ?? 0;
            addDoc(collection(fireDB, "stockMovements"), {
              productId: item.id,
              productTitle: item.title,
              type: 'qaytarish',
              quantity: item.quantity,
              stockBefore,
              stockAfter: stockBefore + item.quantity,
              reason: `Buyurtma bekor qilindi`,
              reference: orderId,
              timestamp: Timestamp.now(),
            }).catch((err) => console.error('Error logging stock movement:', err));
          }
        }
      }

      await updateDoc(orderRef, { status });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  bulkUpdateOrderStatus: async (orderIds: string[], status: OrderStatus) => {
    const batch = writeBatch(fireDB);
    const results = { success: 0, failed: 0 };

    // Collect stock movement data for audit trail
    const movementLogs: Array<{
      productId: string;
      productTitle: string;
      type: string;
      quantity: number;
      stockBefore: number;
      reference: string;
    }> = [];

    for (const orderId of orderIds) {
      try {
        const orderRef = doc(fireDB, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) { results.failed++; continue; }

        const orderData = orderSnap.data();
        const prevStatus = orderData.status || 'yangi';
        const basketItems = orderData.basketItems ?? [];

        if (status === 'yetkazildi' && prevStatus !== 'yetkazildi') {
          for (const item of basketItems) {
            if (item.id) {
              const productSnap = await getDoc(doc(fireDB, "products", item.id));
              const stockBefore = productSnap.exists() ? (productSnap.data().stock ?? 0) : 0;
              batch.update(doc(fireDB, "products", item.id), { stock: increment(-item.quantity) });
              movementLogs.push({
                productId: item.id,
                productTitle: item.title || '',
                type: 'sotish',
                quantity: -item.quantity,
                stockBefore,
                reference: orderId,
              });
            }
          }
        }
        if (status === 'bekor_qilindi' && prevStatus === 'yetkazildi') {
          for (const item of basketItems) {
            if (item.id) {
              const productSnap = await getDoc(doc(fireDB, "products", item.id));
              const stockBefore = productSnap.exists() ? (productSnap.data().stock ?? 0) : 0;
              batch.update(doc(fireDB, "products", item.id), { stock: increment(item.quantity) });
              movementLogs.push({
                productId: item.id,
                productTitle: item.title || '',
                type: 'qaytarish',
                quantity: item.quantity,
                stockBefore,
                reference: orderId,
              });
            }
          }
        }

        batch.update(orderRef, { status });
        results.success++;
      } catch {
        results.failed++;
      }
    }

    await batch.commit();

    // Log stock movements after successful batch commit
    for (const log of movementLogs) {
      addDoc(collection(fireDB, "stockMovements"), {
        productId: log.productId,
        productTitle: log.productTitle,
        type: log.type,
        quantity: log.quantity,
        stockBefore: log.stockBefore,
        stockAfter: log.stockBefore + log.quantity,
        reason: log.type === 'sotish' ? 'Buyurtma yetkazildi (ommaviy)' : 'Buyurtma bekor qilindi (ommaviy)',
        reference: log.reference,
        timestamp: Timestamp.now(),
      }).catch((err) => console.error('Error logging stock movement:', err));
    }

    set((state) => ({
      orders: state.orders.map((o) =>
        orderIds.includes(o.id) ? { ...o, status } : o
      ),
    }));

    return results;
  },

  fetchAllOrders: async () => {
    set({ loadingOrders: true });
    try {
      const q = query(collection(fireDB, "orders"));
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        const OrderArray: Order[] = [];
        QuerySnapshot.forEach((doc) => {
          OrderArray.push({ ...doc.data(), id: doc.id } as Order);
        });
        set({ orders: OrderArray, loadingOrders: false });
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching orders: ", error);
      set({ loadingOrders: false });
    }
  },

  fetchUserOrders: async (userUid: string) => {
    set({ loadingOrders: true });
    try {
      const q = query(collection(fireDB, "orders"), where("userUid", "==", userUid));
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        const OrderArray: Order[] = [];
        QuerySnapshot.forEach((d) => {
          OrderArray.push({ ...d.data(), id: d.id } as Order);
        });
        set({ orders: OrderArray, loadingOrders: false });
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching user orders: ", error);
      set({ loadingOrders: false });
    }
  },
}));
