"use client"
import React, { useEffect, useState } from 'react';
import PanelTitle from '@/components/admin/PanelTitle';
import Search from '@/components/admin/Search';
import { useOrderStore } from '@/store/useOrderStore';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
} from "@headlessui/react";
import { IoIosArrowDown } from 'react-icons/io';
import Image from 'next/image';
import { formatUZS } from '@/lib/formatPrice';
import { ORDER_STATUSES, getStatusInfo } from '@/lib/orderStatus';
import { OrderStatus } from '@/lib/types';
import toast from 'react-hot-toast';
import { exportOrdersToExcel } from '@/lib/exportExcel';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const StatusBadge = ({ status }: { status?: string }) => {
  const info = getStatusInfo(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${info.color} ${info.bg}`}>
      {info.label}
    </span>
  );
};

const Orders = () => {
  const { orders, fetchAllOrders, loadingOrders, updateOrderStatus } = useOrderStore();
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      const info = getStatusInfo(newStatus);
      toast.success(`Buyurtma holati: ${info.label}`);
    } catch {
      toast.error("Holatni yangilashda xatolik");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PanelTitle title="Buyurtmalar" />
      <div className="flex items-center justify-between px-4">
        <div className="flex-1">
          <Search search={search} handleSearchChange={setSearch} placeholder="Buyurtmalarni qidirish" />
        </div>
        <Button
          variant="outline"
          className="rounded-xl cursor-pointer text-xs h-8 gap-1 shrink-0"
          onClick={() => exportOrdersToExcel(orders, 'buyurtmalar')}
        >
          <Download className="size-3.5" /> Excel
        </Button>
      </div>
      {loadingOrders ? (
          <div className="flex items-center justify-center">
            Yuklanmoqda...
          </div>
        ) : orders.length > 0 ? orders.map((order, idx) => (
          <Disclosure key={order.id}>
            {({ open }) => (
              <div className="mb-2">
                <DisclosureButton className="flex items-center justify-between w-full px-4 py-2 text-left bg-white shadow-lg rounded-lg border border-gray-200">
                  <div className='flex items-start gap-2'>
                    <span className='text-sm text-gray-500 mt-1'>{idx + 1}.</span>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <h3 className="font-medium capitalize">{order.clientName}</h3>
                        <p className="text-sm text-gray-500">{order.clientPhone}</p>
                      </div>
                      <StatusBadge status={order.status} />
                      <p className="text-sm text-gray-500">Sana Vaqt: {new Date((order.date?.seconds || 0) * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                  <IoIosArrowDown
                    className={`text-xl transition-all duration-300 ${
                      open ? "" : "-rotate-180"
                    }`}
                  />
                </DisclosureButton>
                <Transition
                  show={open}
                  enter="transition-all duration-300 ease-in-out"
                  enterFrom="transform opacity-0 max-h-0"
                  enterTo="transform opacity-100 max-h-[600px]"
                  leave="transition-all duration-300 ease-in-out"
                  leaveFrom="transform opacity-100 max-h-[600px]"
                  leaveTo="transform opacity-0 max-h-0"
                >
                  <DisclosurePanel className="px-4 py-2 bg-gray-100">
                    {/* Status changer + financials */}
                    <div className="flex items-center gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200 flex-wrap">
                      <span className="text-sm font-semibold text-gray-700">Holati:</span>
                      <select
                        className="flex-1 max-w-xs border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={order.status || 'yangi'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={updatingId === order.id}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <span className="inline-block w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin" />
                      )}
                      <Link href={`/admin/invoice/${order.id}`} target="_blank">
                        <Button
                          variant="outline"
                          className="rounded-lg cursor-pointer text-xs h-7 gap-1 border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100"
                        >
                          <FileText className="size-3" /> Faktura
                        </Button>
                      </Link>
                      <div className="ml-auto flex items-center gap-4 text-right">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Jami</p>
                          <p className="text-xs font-bold text-gray-700">{order.totalQuantity} ta</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Sotish</p>
                          <p className="text-sm font-bold text-green-700">{formatUZS(order.totalPrice)}</p>
                        </div>
                        {(() => {
                          const cost = (order.basketItems || []).reduce((s, i) => s + (i.costPrice || 0) * i.quantity, 0);
                          const profit = (order.totalPrice || 0) - cost;
                          if (cost <= 0) return null;
                          return (
                            <>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase">Tan narxi</p>
                                <p className="text-sm font-bold text-gray-500">{formatUZS(cost)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase">Foyda</p>
                                <p className={`text-sm font-bold ${profit > 0 ? 'text-amber-600' : 'text-red-600'}`}>{formatUZS(profit)}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left table-auto">
                        <thead>
                          <tr>
                            <th scope="col" className="h-12 px-6 text-md border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100 font-bold fontPara">S.No.</th>
                            <th scope="col" className="h-12 px-6 text-md border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100 font-bold fontPara">Rasm</th>
                            <th scope="col" className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Nomi</th>
                            <th scope="col" className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Narxi</th>
                            <th scope="col" className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Soni</th>
                            <th scope="col" className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Kategoriya</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.basketItems.map((item, index) => {
                            const { title, price, category, quantity, productImageUrl } = item;
                            return (
                              <tr key={index} className="text-pink-300">
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500">{index + 1}.</td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase">
                                  <div className="flex justify-center">
                                    <Image width={80} height={80} className="w-20" src={productImageUrl?.[0]?.url || ''} alt="" />
                                  </div>
                                </td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase">{title}</td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase font-semibold">{formatUZS(price)}</td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase">{quantity}</td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase">{category}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </DisclosurePanel>
                </Transition>
              </div>
            )}
          </Disclosure>
        )) : (
          <div className="flex items-center justify-center">
            Buyurtmalar mavjud emas
          </div>
        )}
    </div>
  );
};

export default Orders;
