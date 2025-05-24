"use client"
import Image from 'next/image';
import React from 'react'
import { Button } from '../ui/button';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

const products = [
    {
      id: "1",
      title: "Runnr Free Metcon 5",
      price: "$120",
      Image: "https://picsum.photos/200/300",
      type: "Women's shoes",
      vendor: "Nike",
      published: true
    },
    {
      id: "2",
      title: "Air Jordan 1 Mid",
      price: "$135",
      Image: "https://picsum.photos/200/300",
      type: "Men's shoes",
      vendor: "Nike",
      published: true
    },
    {
      id: "3",
      title: "Adidas Ultraboost 22",
      price: "$190",
      Image: "https://picsum.photos/200/300",
      type: "Running shoes",
      vendor: "Adidas",
      published: true
    },
    {
      id: "4",
      title: "New Balance 990v5",
      price: "$175",
      Image: "https://picsum.photos/200/300",
      type: "Men's shoes",
      vendor: "New Balance",
      published: false
    },
    {
      id: "5",
      title: "Puma RS-X",
      price: "$110",
      Image: "https://picsum.photos/200/300",
      type: "Casual shoes",
      vendor: "Puma",
      published: true
    },
  ];

const ProductTable = () => {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/admin/update-product/${id}`);
  }
  
  return (
     <div className="w-full px-4 py-3">
      {/* Desktop and Tablet view */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full w-full">
          <thead>
            <tr className="bg-white">
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Image</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Price</th>
              <th className="px-4 py-3 text-left text-black text-sm max-w-[100px] font-medium">Category</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">Edit</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">
                  {product.title}
                </td>
                <td className="h-20 px-4 py-2 text-sm font-normal">
                  <div className='size-16 relative overflow-hidden rounded-2xl'>
                    <Image className='absolute size-full object-cover' src={product.Image} fill alt={product.title} />
                  </div>
                </td>
                <td className="h-20 px-4 py-2 text-gray-700 text-sm font-normal">{product.price}</td>
                <td className="max-w-xs h-20 px-4 py-2 text-sm font-normal">
                  <span className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-8 px-4 bg-gray-100 text-black text-sm font-medium w-full">
                    {product.type}
                  </span>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-gray-700 text-sm font-normal">
                  <Button onClick={() => handleEdit(product.id)} className='flex items-center justify-center mx-auto cursor-pointer' variant={'ghost'}>
                    <BiEdit size={24} />
                  </Button>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-sm font-normal">
                  <Button className="flex items-center justify-center mx-auto cursor-pointer" variant={'default'}>
                    <BiTrash size={24} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Card layout */}
      <div className="md:hidden space-y-4">
        {products.map((product, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-black">{product.title}</h3>
              <span className="text-gray-700">{product.price}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Image</span>
                <div className='size-16 relative overflow-hidden rounded-2xl'>
                  <Image className='absolute size-full object-cover' src={product.Image} fill alt={product.title} />
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Type</span>
                <button className="rounded-xl bg-gray-100 text-xs px-3 py-1">
                  {product.type}
                </button>
              </div>
              
              <div className="flex flex-1 gap-3 flex-wrap pt-3 justify-end">
                <Button
                  variant={'secondary'}
                  className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Update</span>
                </Button>
                <Button
                  variant={'default'}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductTable