import AdminHeader from '@/components/admin/AdminHeader'
import Sidebar from '@/components/admin/Sidebar'
import DailySummaryGenerator from '@/components/admin/DailySummaryGenerator'
import CommandPalette from '@/components/admin/CommandPalette'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import React, { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={true} adminOnly={true}>
      <CommandPalette />
      <div className="flex min-h-screen bg-gray-100 print:bg-white print:min-h-0">
        {/* Sidebar — hidden during print */}
        <div className="print:hidden">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Header — hidden during print */}
          <div className="print:hidden">
            <AdminHeader />
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 print:p-0">
            <div className='bg-white w-full h-full rounded-2xl sm:p-4 shadow-2xl print:shadow-none print:rounded-none print:p-0'>
            {children}
            </div>
          </main>
        </div>
      </div>
      <DailySummaryGenerator />
      <Toaster />
    </ProtectedRoute>
  )
}

export default AdminLayout