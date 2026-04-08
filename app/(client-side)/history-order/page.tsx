"use client"
import Header from '@/components/client/Header'
import { Button } from '@/components/ui/button'
import { useWhiteBody } from '@/hooks/useWhiteBody'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useOrderStore } from '@/store/useOrderStore'
import { useAuthStore } from '@/store/authStore'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
} from "@headlessui/react";
import { IoIosArrowDown } from 'react-icons/io';
import Image from 'next/image';
import { formatUZS } from '@/lib/formatPrice';
import { getStatusInfo } from '@/lib/orderStatus';
import useCartProductStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

const HistoryOrder = () => {
  useWhiteBody();
  const router = useRouter();
  const { userData } = useAuthStore();
  const { orders, fetchUserOrders, loadingOrders } = useOrderStore();
  const { addToBasket, calculateTotals, clearBasket } = useCartProductStore();

  const handleReorder = (order: typeof orders[0]) => {
    clearBasket();
    order.basketItems.forEach((item) => {
      addToBasket(item);
    });
    calculateTotals();
    toast.success(`${order.basketItems.length} ta mahsulot savatga qo'shildi`);
    router.push('/cart-product');
  };

  useEffect(() => {
    if (userData?.uid) {
      fetchUserOrders(userData.uid);
    }
  }, [userData?.uid, fetchUserOrders]);

  return (
    <main className="h-full min-h-screen">
      <Header forceFixed={true} />
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-20">
        <Button
          variant="ghost"
          className="flex cursor-pointer items-center gap-1 w-fit text-gray-900 text-sm hover:text-black py-4 px-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="text-xl" />
          <span>Orqaga</span>
        </Button>
        <div className="mt-8">
          {loadingOrders ? (
            <div className="flex items-center justify-center">Yuklanmoqda...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500">Buyurtmalar tarixi topilmadi.</div>
          ) : (
            orders.map((order, idx) => (
              <Disclosure key={idx}>
                {({ open }) => (
                  <div className="mb-4">
                    <DisclosureButton className="flex items-center justify-between w-full px-4 py-2 text-left bg-white shadow-lg rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <h3 className="font-medium capitalize">{order.clientName}</h3>
                          <p className="text-sm text-gray-500">{order.clientPhone}</p>
                        </div>
                        {(() => {
                          const info = getStatusInfo(order.status);
                          return (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${info.color} ${info.bg}`}>
                              {info.label}
                            </span>
                          );
                        })()}
                        <p className="text-sm text-gray-500">Sana Vaqt: {new Date((order.date?.seconds || 0) * 1000).toLocaleString()}</p>
                      </div>
                      <IoIosArrowDown
                        className={`text-xl transition-all duration-300 shrink-0 ${open ? "rotate-180" : ""}`}
                      />
                    </DisclosureButton>
                    <Transition
                      show={open}
                      enter="transition-all duration-300 ease-in-out"
                      enterFrom="transform opacity-0 max-h-0"
                      enterTo="transform opacity-100 max-h-[1200px]"
                      leave="transition-all duration-300 ease-in-out"
                      leaveFrom="transform opacity-100 max-h-[1200px]"
                      leaveTo="transform opacity-0 max-h-0"
                    >
                      <DisclosurePanel className="px-2 sm:px-4 py-2 bg-gray-100 rounded-b-lg">
                        {/* Mobile card layout */}
                        <div className="space-y-3 sm:hidden">
                          {order.basketItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-3">
                              <div className="relative size-14 shrink-0 rounded-md overflow-hidden">
                                <Image fill className="object-cover" src={item.productImageUrl[0]?.url || ''} alt={item.title} sizes="56px" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-sm">{formatUZS(item.price)}</p>
                                <p className="text-xs text-gray-500">{item.quantity} ta</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="min-w-full text-left table-auto">
                            <thead>
                              <tr>
                                <th className="h-12 px-4 text-sm border-l first:border-l-0 border-gray-200 text-slate-700 bg-slate-100 font-bold">#</th>
                                <th className="h-12 px-4 text-sm border-l first:border-l-0 border-gray-200 text-slate-700 bg-slate-100 font-bold">Rasm</th>
                                <th className="h-12 px-4 text-sm font-bold border-l first:border-l-0 border-gray-200 text-slate-700 bg-slate-100">Nomi</th>
                                <th className="h-12 px-4 text-sm font-bold border-l first:border-l-0 border-gray-200 text-slate-700 bg-slate-100">Narxi</th>
                                <th className="h-12 px-4 text-sm font-bold border-l first:border-l-0 border-gray-200 text-slate-700 bg-slate-100">Soni</th>
                                <th className="h-12 px-4 text-sm font-bold border-l first:border-l-0 border-gray-200 text-slate-700 bg-slate-100">Kategoriya</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.basketItems.map((item, index) => (
                                <tr key={index}>
                                  <td className="h-12 px-4 text-sm border-t border-l first:border-l-0 border-gray-200 text-slate-500">{index + 1}</td>
                                  <td className="h-12 px-4 text-sm border-t border-l first:border-l-0 border-gray-200">
                                    <Image width={48} height={48} className="w-12 h-12 object-cover rounded" src={item.productImageUrl[0]?.url || ''} alt={item.title} />
                                  </td>
                                  <td className="h-12 px-4 text-sm border-t border-l first:border-l-0 border-gray-200 text-slate-600 capitalize">{item.title}</td>
                                  <td className="h-12 px-4 text-sm border-t border-l first:border-l-0 border-gray-200 text-slate-600 font-semibold">{formatUZS(item.price)}</td>
                                  <td className="h-12 px-4 text-sm border-t border-l first:border-l-0 border-gray-200 text-slate-600">{item.quantity}</td>
                                  <td className="h-12 px-4 text-sm border-t border-l first:border-l-0 border-gray-200 text-slate-600 capitalize">{item.category}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                          <Button
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReorder(order);
                            }}
                            className="cursor-pointer flex items-center gap-2 bg-black text-white rounded-xl h-10 px-5 text-sm font-bold"
                          >
                            <RefreshCw className="size-4" />
                            Qayta buyurtma
                          </Button>
                          <div className="flex gap-4 sm:gap-8 text-sm sm:text-base font-semibold">
                            <span>Jami: {order.totalQuantity} ta</span>
                            <span>{formatUZS(order.totalPrice)}</span>
                          </div>
                        </div>
                      </DisclosurePanel>
                    </Transition>
                  </div>
                )}
              </Disclosure>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

export default HistoryOrder