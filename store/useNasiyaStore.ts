import { create } from 'zustand';
import { collection, addDoc, query, onSnapshot, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { fireDB } from '@/firebase/config';

export interface PaymentRecord {
  date: string;
  amount: number;
  method: string;
  note?: string;
}

export interface NasiyaRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  orderId: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentHistory: PaymentRecord[];
  status: 'active' | 'paid_full' | 'overdue';
  createdDate: Timestamp;
  dueDate?: Timestamp;
  note?: string;
}

interface NasiyaState {
  records: NasiyaRecord[];
  loading: boolean;
  createNasiya: (data: Omit<NasiyaRecord, 'id' | 'createdDate' | 'paymentHistory' | 'paidAmount' | 'remainingAmount' | 'status'>) => Promise<void>;
  recordPayment: (nasiyaId: string, amount: number, method: string, note?: string) => Promise<void>;
  fetchNasiya: () => void;
}

export const useNasiyaStore = create<NasiyaState>((set) => ({
  records: [],
  loading: true,

  createNasiya: async (data) => {
    try {
      await addDoc(collection(fireDB, 'nasiya'), {
        ...data,
        paidAmount: 0,
        remainingAmount: data.originalAmount,
        paymentHistory: [],
        status: 'active',
        createdDate: new Date(),
      });
    } catch (error) {
      console.error('Error creating nasiya:', error);
      throw error;
    }
  },

  recordPayment: async (nasiyaId: string, amount: number, method: string, note?: string) => {
    try {
      const nasiyaRef = doc(fireDB, 'nasiya', nasiyaId);
      // Find current record from state
      const records = useNasiyaStore.getState().records;
      const record = records.find((r) => r.id === nasiyaId);
      if (!record) throw new Error('Nasiya topilmadi');

      const newPaidAmount = record.paidAmount + amount;
      const newRemaining = record.originalAmount - newPaidAmount;
      const newStatus = newRemaining <= 0 ? 'paid_full' : 'active';

      const payment: PaymentRecord = {
        date: new Date().toISOString(),
        amount,
        method,
        note,
      };

      await updateDoc(nasiyaRef, {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemaining),
        status: newStatus,
        paymentHistory: arrayUnion(payment),
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  },

  fetchNasiya: () => {
    set({ loading: true });
    try {
      const q = query(collection(fireDB, 'nasiya'));
      onSnapshot(q, (snapshot) => {
        const records: NasiyaRecord[] = [];
        snapshot.forEach((d) => {
          records.push({ ...d.data(), id: d.id } as NasiyaRecord);
        });
        records.sort((a, b) => {
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (a.status !== 'active' && b.status === 'active') return 1;
          return (b.remainingAmount || 0) - (a.remainingAmount || 0);
        });
        set({ records, loading: false });
      });
    } catch (error) {
      console.error('Error fetching nasiya:', error);
      set({ loading: false });
    }
  },
}));
