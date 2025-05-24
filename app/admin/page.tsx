"use client"
import PanelTitle from '@/components/admin/PanelTitle';
import ProductTable from '@/components/admin/ProductTable';
import Search from '@/components/admin/Search';
import React, { useState } from 'react'

const Dashboard = () => {
  const [search, setSearch] = useState<string>('');
  const handleSearchChange = (e: string) => {
    setSearch(e)
  }
  return (
    <div>
      <PanelTitle title='products' />
      <Search search={search} handleSearchChange={handleSearchChange} placeholder='Search for products' />
      <ProductTable />
    </div>
  )
}

export default Dashboard