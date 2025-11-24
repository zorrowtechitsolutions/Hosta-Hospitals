'use client'

import { AppointmentsChart } from "@/components/dashboard/Appointments-chart"
import { DashboardStats } from "@/components/dashboard/Dashboard-stats"
import { TodayAppointments } from "@/components/dashboard/Today-appointments"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back to your hospital management system</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentsChart />
        </div>
        <div>
          <TodayAppointments />
        </div>
      </div>
    </div>
  )
}
