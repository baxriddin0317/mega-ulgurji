import AdminHeader from '@/components/admin/AdminHeader'
import Sidebar from '@/components/admin/Sidebar'
import BottomNav from '@/components/admin/BottomNav'
import DailySummaryGenerator from '@/components/admin/DailySummaryGenerator'
import CommandPalette from '@/components/admin/CommandPalette'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoute requireAuth={true} adminOnly={true}>
      <CommandPalette />
      <div className="flex min-h-screen bg-gray-100 print:bg-white print:min-h-0">
        {/* Sidebar — desktop only */}
        <div className="print:hidden">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* Header — hidden during print */}
          <div className="print:hidden">
            <AdminHeader />
          </div>

          {/* Page content — extra bottom padding on mobile for BottomNav */}
          <main className="flex-1 p-2 sm:p-4 md:p-6 pb-20 lg:pb-6 print:p-0">
            <div className='bg-white w-full h-full rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-xl sm:shadow-2xl print:shadow-none print:rounded-none print:p-0'>
            {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />

      <DailySummaryGenerator />
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '13px' } }} />
    </ProtectedRoute>
  )
}

export default AdminLayout
