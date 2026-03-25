import {create} from "zustand";
import { collection, addDoc, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { fireDB } from '@/firebase/config';
import { Order, OrderStatus } from "@/lib/types";

interface StoreState {
  orders: Order[];
  currentOrder: Order | null;
  loadingOrders: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  fetchAllOrders: () => void;
  fetchUserOrders: (userUid: string) => void;
}

export const useOrderStore = create<StoreState>((set) => ({
  orders: [],
  currentOrder: null,
  loadingOrders: true,

  // Add a new order to Firestore and update the state
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
      await updateDoc(orderRef, { status });
      // onSnapshot will auto-update the store
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  fetchAllOrders: async () => {
    set({ loadingOrders: true });
    try {
      const q = query(collection(fireDB, "orders"));
      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        let OrderArray: any = [];
        QuerySnapshot.forEach((doc) => {
          OrderArray.push({ ...doc.data(), id: doc.id });
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
        let OrderArray: any = [];
        QuerySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userUid === userUid) {
            OrderArray.push({ ...data, id: doc.id });
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

  // Fetch a single order by its ID and update the state
  // fetchSingleOrder: async (orderId: string) => {
  //   try {
  //     const orderDoc = await getDoc(doc(fireDB, "orders", orderId));
  //     if (orderDoc.exists()) {
  //       set({ currentOrder: { id: orderDoc.id, ...orderDoc.data() } });
  //     } else {
  //       console.error("Order not found");
  //       set({ currentOrder: null });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching order by ID: ", error);
  //   }
  // },
}));
