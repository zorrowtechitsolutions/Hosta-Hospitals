'use client'

import { useGetAllHospitalBookingQuery } from '@/app/service/bookings'
import { useGetAHospitalQuery } from '@/app/service/hospital'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Stethoscope, Calendar, TrendingUp } from 'lucide-react'

export function DashboardStats() {
      const hospitalId = localStorage.getItem("adminId"); 


  const { 
    data: hospitalData, 
    isLoading, 
    error,
    refetch: hospitalRefetch
  } = useGetAHospitalQuery(hospitalId)

    const { 
      data: bookingData, 
  
    } = useGetAllHospitalBookingQuery(hospitalId)

    

  // Calculate actual statistics from hospital data
  const calculateStats = () => {
    if (!hospitalData) {
      return {
        totalDoctors: 0,
        specialties: 0,
        todaysAppointments: 0,
        patientVisits: 0
      }
    }

    // Calculate total doctors across all specialties
    const totalDoctors = hospitalData.data?.specialties?.reduce((count, specialty) => {
      return count + (specialty.doctors?.length || 0)
    }, 0)

    // Count specialties
    const specialties = hospitalData.data.specialties?.length || 0

    // For today's appointments and patient visits, you'll need to calculate from booking data
    // Since your hospital data shows booking: [], I'm using placeholder values
    // You'll need to replace these with actual calculations from your booking data
    

  const today = new Date().toISOString().split("T")[0]; 
// format: "2025-11-24" (YYYY-MM-DD)

const todaysAppointments = bookingData?.data
  ?.filter(item => 
    item?.booking_date?.split("T")[0] === today && item?.status === "accepted"
  ).length || 0   // limit to 10 results

    const patientVisits = bookingData?.data?.length || 0 

    return {
      totalDoctors,
      specialties,
      todaysAppointments,
      patientVisits
    }
  }

  const statsData = calculateStats()

  const stats = [
    {
      title: 'Total Doctors',
      value: statsData?.totalDoctors?.toString(),
      icon: Stethoscope,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      trend: 'All active doctors',
    },
    {
      title: 'Specialties',
      value: statsData?.specialties?.toString(),
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      trend: 'All registered',
    },
    {
      title: "Today's Appointments",
      value: statsData?.todaysAppointments?.toString(),
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      trend: 'Based on bookings',
    },
    {
      title: 'Total Bookings',
      value: statsData?.patientVisits?.toString(),
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      trend: 'All time bookings',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardTitle>
              <div className="bg-gray-200 p-2 rounded-lg animate-pulse">
                <div className="w-4 h-4"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border opacity-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`${stat.color} w-4 h-4`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground mt-1">Data unavailable</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`${stat.color} w-4 h-4`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}