'use client'

import { useState } from 'react'
import { Combine as Mobile } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { Outlet } from 'react-router-dom'
import { useGetAHospitalQuery } from '@/app/service/hospital'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

   const hospitalId = localStorage.getItem("adminId"); 

    const { 
      data, 
      isLoading, 
      error,
      refetch
    } = useGetAHospitalQuery(hospitalId)
  

  return (
    <div className="flex h-screen bg-green-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-border bg-sidebar">
        <Sidebar name = {data?.data?.name} imageUrl = {data?.data?.image?.imageUrl} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 bg-sidebar h-screen" onClick={(e) => e.stopPropagation()}>
            <Sidebar name = {data?.data?.name} imageUrl = {data?.data?.image?.imageUrl} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header  name = {data?.data?.name}   onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
