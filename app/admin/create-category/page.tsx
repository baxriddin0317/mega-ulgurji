"use client"
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'

const CreateCategory = () => {
  const [name, setName] = useState('');
  return (
    <div className="relative flex size-full justify-center">
      <form className="flex flex-col gap-4 md:w-[512px] py-5 max-w-[960px] flex-1 px-4">
        <div className="flex flex-wrap justify-between gap-3 mb-5">
          <h2 className="text-brand-black-text tracking-light text-4xl font-bold leading-tight min-w-72">Add Category</h2>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Category name*</p>
            <input
              placeholder="Enter category name"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Description</p>
            <textarea
              placeholder="Enter category description"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none min-h-36 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            ></textarea>
          </label>
        </div>
        <div className="flex flex-1 gap-3 flex-wrap justify-end">
           <Button
            type='button'
            variant={'secondary'}
            className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Cancel</span>
          </Button>
          <Button
            type='submit'
            variant={'default'}
            className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            Add category
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateCategory