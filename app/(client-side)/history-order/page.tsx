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

const HistoryOrder = () => {
  useWhiteBody();
  const router = useRouter();
  const { userData } = useAuthStore();
  const { orders, fetchUserOrders, loadingOrders } = useOrderStore();

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
                      <div className="flex items-end gap-4">
                        <div>
                          <h3 className="font-medium capitalize">{order.clientName}</h3>
                          <p className="text-sm text-gray-500">{order.clientPhone}</p>
                        </div>
                        <p className="text-sm text-gray-500">Sana Vaqt: {new Date(order.date.seconds * 1000).toLocaleString()}</p>
                      </div>
                      <IoIosArrowDown
                        className={`text-xl transition-all duration-300 ${open ? "" : "-rotate-180"}`}
                      />
                    </DisclosureButton>
                    <Transition
                      show={open}
                      enter="transition-all duration-300 ease-in-out"
                      enterFrom="transform opacity-0 max-h-0"
                      enterTo="transform opacity-100 max-h-96"
                      leave="transition-all duration-300 ease-in-out"
                      leaveFrom="transform opacity-100 max-h-96"
                      leaveTo="transform opacity-0 max-h-0"
                    >
                      <DisclosurePanel className="px-4 py-2 bg-gray-100">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left table-auto">
                            <thead>
                              <tr>
                                <th className="h-12 px-6 text-md border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100 font-bold fontPara">S.No.</th>
                                <th className="h-12 px-6 text-md border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100 font-bold fontPara">Rasm</th>
                                <th className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Nomi</th>
                                <th className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Narxi</th>
                                <th className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Soni</th>
                                <th className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100">Kategoriya</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.basketItems.map((item, index) => (
                                <tr key={index} className="text-pink-300">
                                  <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 ">{index + 1}.</td>
                                  <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">
                                    <div className="flex justify-center">
                                      <Image width={80} height={80} className="w-20" src={item.productImageUrl[0]?.url || ''} alt="" />
                                    </div>
                                  </td>
                                  <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">{item.title}</td>
                                  <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">${item.price}</td>
                                  <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">{item.quantity}</td>
                                  <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">{item.category}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 flex justify-end gap-8 text-base font-semibold">
                          <span>Jami: {order.totalQuantity} ta</span>
                          <span>Umumiy narx: ${order.totalPrice}</span>
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