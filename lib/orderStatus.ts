import { OrderStatus } from './types';

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string; bg: string }[] = [
  { value: 'yangi',          label: 'Yangi',          color: 'text-blue-700',    bg: 'bg-blue-100' },
  { value: 'tasdiqlangan',   label: 'Tasdiqlangan',   color: 'text-amber-700',   bg: 'bg-amber-100' },
  { value: 'yigʻilmoqda',   label: "Yig'ilmoqda",    color: 'text-purple-700',  bg: 'bg-purple-100' },
  { value: 'yetkazilmoqda',  label: 'Yetkazilmoqda',  color: 'text-orange-700',  bg: 'bg-orange-100' },
  { value: 'yetkazildi',     label: 'Yetkazildi',     color: 'text-green-700',   bg: 'bg-green-100' },
  { value: 'bekor_qilindi',  label: 'Bekor qilindi',  color: 'text-red-700',     bg: 'bg-red-100' },
];

export function getStatusInfo(status?: string) {
  return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0]; // default: 'yangi'
}
