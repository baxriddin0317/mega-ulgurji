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

const Orders = () => {
  const { orders, fetchAllOrders, loadingOrders } = useOrderStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  return (
    <div>
      <PanelTitle title="Buyurtmalar" />
      <Search search={search} handleSearchChange={setSearch} placeholder="Buyurtmalarni qidirish" />
      {loadingOrders ? (
          <div className="flex items-center justify-center">
            Yuklanmoqda...
          </div>
        ) : orders.length > 0 ? orders.map((order, idx) => (
          <Disclosure key={order.id}>
            {({ open }) => (
              <div>
                <DisclosureButton className="flex items-center justify-between w-full px-4 py-2 text-left bg-white shadow-lg rounded-lg border border-gray-200">
                  <div className='flex items-start gap-2'>
                    <span className='text-sm text-gray-500 mt-1'>{idx + 1}.</span>
                    <div className="flex items-end gap-4">
                      <div>
                        <h3 className="font-medium capitalize">{order.clientName}</h3>
                        <p className="text-sm text-gray-500">{order.clientPhone}</p>
                      </div>
                      <p className="text-sm text-gray-500">Sana Vaqt: {new Date(order.date.seconds * 1000).toLocaleString()}</p> 
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
                            <th
                              scope="col"
                              className="h-12 px-6 text-md border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100 font-bold fontPara"
                            >
                              S.No.
                            </th>
                            <th
                              scope="col"
                              className="h-12 px-6 text-md border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100 font-bold fontPara"
                            >
                              Rasm
                            </th>
                            <th
                              scope="col"
                              className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100"
                            >
                              Nomi
                            </th>
                            <th
                              scope="col"
                              className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100"
                            >
                              Narxi
                            </th>
                            <th
                              scope="col"
                              className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100"
                            >
                              Soni
                            </th>
                            <th
                              scope="col"
                              className="h-12 px-6 text-md font-bold fontPara border-l first:border-l-0 border-pink-100 text-slate-700 bg-slate-100"
                            >
                              Kategoriya
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.basketItems.map((item, index) => {
                            const { title, price, category, quantity, productImageUrl } =
                              item;
                            return (
                              <tr key={index} className="text-pink-300">
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 ">
                                  {index + 1}.
                                </td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">
                                  <div className="flex justify-center">
                                    <Image width={80} height={80} className="w-20" src={productImageUrl[0].url} alt="" />
                                  </div>
                                </td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">
                                  {title}
                                </td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">
                                  ${price}
                                </td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">
                                  {quantity}
                                </td>
                                <td className="h-12 px-6 text-md transition duration-300 border-t border-l first:border-l-0 border-pink-100 stroke-slate-500 text-slate-500 first-letter:uppercase ">
                                  {category}
                                </td>
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