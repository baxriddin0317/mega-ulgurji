import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { fireDB } from '@/firebase/config';
import { Order } from '@/lib/types';
import { formatUZS } from '@/lib/formatPrice';

export interface Notification {
  id: string;
  refId: string;
  type: 'new_order' | 'new_user';
  title: string;
  message: string;
  detail: string;
  timestamp: number;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  _seenOrderIds: string[];
  _seenUserIds: string[];
  _ordersInitialized: boolean;
  _usersInitialized: boolean;
  _unsubOrders: (() => void) | null;
  _unsubUsers: (() => void) | null;
  newUserIds: string[];
  startListening: () => void;
  stopListening: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  isNewUser: (uid: string) => boolean;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      _seenOrderIds: [],
      _seenUserIds: [],
      _ordersInitialized: false,
      _usersInitialized: false,
      _unsubOrders: null,
      _unsubUsers: null,
      newUserIds: [],

      startListening: () => {
        const state = get();

        // --- Orders listener ---
        if (!state._unsubOrders) {
          const ordersUnsub = onSnapshot(query(collection(fireDB, 'orders')), (snapshot) => {
            const s = get();

            if (!s._ordersInitialized) {
              set({
                _ordersInitialized: true,
                _seenOrderIds: snapshot.docs.map((d) => d.id),
              });
              return;
            }

            const newNotifs: Notification[] = [];
            for (const change of snapshot.docChanges()) {
              if (change.type === 'added') {
                const id = change.doc.id;
                if (s._seenOrderIds.includes(id)) continue;
                const data = change.doc.data() as Order;
                newNotifs.push({
                  id: `order_${id}`,
                  refId: id,
                  type: 'new_order',
                  title: `Yangi buyurtma: ${data.clientName}`,
                  message: `${data.totalQuantity} ta mahsulot — ${formatUZS(data.totalPrice)}`,
                  detail: data.clientPhone,
                  timestamp: Date.now(),
                  read: false,
                });
              }
            }

            if (newNotifs.length > 0) {
              set((prev) => ({
                notifications: [...newNotifs, ...prev.notifications].slice(0, 50),
                unreadCount: prev.unreadCount + newNotifs.length,
                _seenOrderIds: [...newNotifs.map((n) => n.refId), ...prev._seenOrderIds],
              }));
            }
          });
          set({ _unsubOrders: ordersUnsub });
        }

        // --- Users listener ---
        if (!state._unsubUsers) {
          const usersUnsub = onSnapshot(query(collection(fireDB, 'user')), (snapshot) => {
            const s = get();

            if (!s._usersInitialized) {
              set({
                _usersInitialized: true,
                _seenUserIds: snapshot.docs.map((d) => d.id),
              });
              return;
            }

            const newNotifs: Notification[] = [];
            const newUids: string[] = [];
            for (const change of snapshot.docChanges()) {
              if (change.type === 'added') {
                const uid = change.doc.id;
                if (s._seenUserIds.includes(uid)) continue;
                const data = change.doc.data();
                newUids.push(uid);
                newNotifs.push({
                  id: `user_${uid}`,
                  refId: uid,
                  type: 'new_user',
                  title: `Yangi foydalanuvchi: ${data.name}`,
                  message: data.phone || data.email || '',
                  detail: data.email || '',
                  timestamp: Date.now(),
                  read: false,
                });
              }
            }

            if (newNotifs.length > 0) {
              set((prev) => ({
                notifications: [...newNotifs, ...prev.notifications].slice(0, 50),
                unreadCount: prev.unreadCount + newNotifs.length,
                _seenUserIds: [...newUids, ...prev._seenUserIds],
                newUserIds: [...newUids, ...prev.newUserIds],
              }));
            }
          });
          set({ _unsubUsers: usersUnsub });
        }
      },

      stopListening: () => {
        const s = get();
        if (s._unsubOrders) { s._unsubOrders(); }
        if (s._unsubUsers) { s._unsubUsers(); }
        set({ _unsubOrders: null, _unsubUsers: null });
      },

      markAsRead: (id) => {
        set((state) => {
          const target = state.notifications.find((n) => n.id === id);
          if (!target || target.read) return state;
          // If marking a user notification as read, remove from newUserIds
          const updatedNewUserIds = target.type === 'new_user'
            ? state.newUserIds.filter((uid) => uid !== target.refId)
            : state.newUserIds;
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
            newUserIds: updatedNewUserIds,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
          newUserIds: [],
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const target = state.notifications.find((n) => n.id === id);
          const updatedNewUserIds = target?.type === 'new_user'
            ? state.newUserIds.filter((uid) => uid !== target.refId)
            : state.newUserIds;
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
            newUserIds: updatedNewUserIds,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0, newUserIds: [] });
      },

      isNewUser: (uid: string) => {
        return get().newUserIds.includes(uid);
      },
    }),
    {
      name: 'admin-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        _seenOrderIds: state._seenOrderIds,
        _seenUserIds: state._seenUserIds,
        newUserIds: state.newUserIds,
      }),
    }
  )
);
