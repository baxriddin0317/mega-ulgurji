import {create} from "zustand";
import { collection, addDoc, query, onSnapshot, doc, updateDoc, getDoc, increment, writeBatch } from "firebase/firestore";
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
      const prevStatus = (orderData.status || 'yangi') as OrderStatus;
      const basketItems = (orderData.basketItems || []) as ProductT[];

      // Decrement stock when admin marks as DELIVERED (yetkazildi)
      if (status === 'yetkazildi' && prevStatus !== 'yetkazildi') {
        const stockBatch = writeBatch(fireDB);
        for (const item of basketItems) {
          if (item.id) {
            const productRef = doc(fireDB, "products", item.id);
            stockBatch.update(productRef, { stock: increment(-item.quantity) });
          }
        }
        await stockBatch.commit();
      }

      // Restore stock if cancelling a DELIVERED order (rare but safe)
      // Or if cancelling any order that was already delivered
      if (status === 'bekor_qilindi' && prevStatus === 'yetkazildi') {
        const stockBatch = writeBatch(fireDB);
        for (const item of basketItems) {
          if (item.id) {
            const productRef = doc(fireDB, "products", item.id);
            stockBatch.update(productRef, { stock: increment(item.quantity) });
          }
        }
        await stockBatch.commit();
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

    for (const orderId of orderIds) {
      try {
        const orderRef = doc(fireDB, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) { results.failed++; continue; }

        const orderData = orderSnap.data();
        const prevStatus = orderData.status || 'yangi';
        const basketItems = orderData.basketItems || [];

        if (status === 'yetkazildi' && prevStatus !== 'yetkazildi') {
          for (const item of basketItems) {
            if (item.id) {
              batch.update(doc(fireDB, "products", item.id), { stock: increment(-item.quantity) });
            }
          }
        }
        if (status === 'bekor_qilindi' && prevStatus === 'yetkazildi') {
          for (const item of basketItems) {
            if (item.id) {
              batch.update(doc(fireDB, "products", item.id), { stock: increment(item.quantity) });
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
      const q = query(collection(fireDB, "orders"));
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        const OrderArray: Order[] = [];
        QuerySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userUid === userUid) {
            OrderArray.push({ ...data, id: doc.id } as Order);
          }
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
