import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { fireDB } from '@/firebase/config';
import { Order } from '@/lib/types';
import { formatUZS } from '@/lib/formatPrice';

export interface Notification {
  id: string;
  orderId: string;
  type: 'new_order';
  title: string;
  message: string;
  clientPhone: string;
  totalPrice: number;
  totalQuantity: number;
  timestamp: number;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  _seenOrderIds: string[];
  _initialized: boolean;
  _unsubscribe: (() => void) | null;
  startListening: () => void;
  stopListening: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      _seenOrderIds: [],
      _initialized: false,
      _unsubscribe: null,

      startListening: () => {
        // Prevent duplicate listeners
        if (get()._unsubscribe) return;

        const q = query(collection(fireDB, 'orders'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const state = get();

          // On first snapshot, just record all existing order IDs
          if (!state._initialized) {
            const existingIds = snapshot.docs.map((doc) => doc.id);
            set({ _initialized: true, _seenOrderIds: existingIds });
            return;
          }

          // Process only genuinely new documents
          const newNotifications: Notification[] = [];
          for (const change of snapshot.docChanges()) {
            if (change.type === 'added') {
              const orderId = change.doc.id;
              // Skip if already seen
              if (state._seenOrderIds.includes(orderId)) continue;

              const data = change.doc.data() as Order;
              newNotifications.push({
                id: `notif_${orderId}`,
                orderId,
                type: 'new_order',
                title: `Yangi buyurtma: ${data.clientName}`,
                message: `${data.totalQuantity} ta mahsulot — ${formatUZS(data.totalPrice)}`,
                clientPhone: data.clientPhone,
                totalPrice: data.totalPrice,
                totalQuantity: data.totalQuantity,
                timestamp: Date.now(),
                read: false,
              });
            }
          }

          if (newNotifications.length > 0) {
            set((s) => ({
              notifications: [...newNotifications, ...s.notifications].slice(0, 50),
              unreadCount: s.unreadCount + newNotifications.length,
              _seenOrderIds: [
                ...newNotifications.map((n) => n.orderId),
                ...s._seenOrderIds,
              ],
            }));
          }
        });

        set({ _unsubscribe: unsubscribe });
      },

      stopListening: () => {
        const unsub = get()._unsubscribe;
        if (unsub) {
          unsub();
          set({ _unsubscribe: null });
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const target = state.notifications.find((n) => n.id === id);
          if (!target || target.read) return state;
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const target = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: target && !target.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'admin-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        _seenOrderIds: state._seenOrderIds,
      }),
    }
  )
);
