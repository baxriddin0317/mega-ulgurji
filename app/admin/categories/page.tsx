"use client"
import CategoryTable from '@/components/admin/CategoryTable';
import PanelTitle from '@/components/admin/PanelTitle'
import Search from '@/components/admin/Search';
import React, { useState } from 'react'

const Categories = () => {
  const [search, setSearch] = useState<string>('');
  const handleSearchChange = (e: string) => {
    setSearch(e)
  }
  return (
    <div>
      <PanelTitle title='Kategoriyalar' />
      <Search search={search} handleSearchChange={handleSearchChange} placeholder='Kategoriyalarni qidirish' />
      <CategoryTable search={search} />
    </div>
  )
}

export default Categories