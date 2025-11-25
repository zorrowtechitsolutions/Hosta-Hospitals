'use client'

import { useGetAllHospitalBookingQuery } from '@/app/service/bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'



export function TodayAppointments() {

    const hospitalId = localStorage.getItem("adminId"); 
  
    const { 
      data: bookingData, 
      isLoading,
      error
    } = useGetAllHospitalBookingQuery(hospitalId)


 const today = new Date().toISOString().split("T")[0]; 
// "2025-11-24"

const appointments = bookingData?.data
  ?.filter(item => {
    const onlyDate = item?.createdAt?.split("T")[0]; 
    return onlyDate === today;
  })
  .slice(0, 4);



  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="text-lg">Today's Schedule</CardTitle>
        <CardDescription>Upcoming and completed appointments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments?.map((apt, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="mt-1">
              <Clock size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{apt?.booking_date?.split("T")[0]}</p>
              <p className="text-xs text-muted-foreground">{apt?.doctor_name}</p>
              <p className="text-xs text-muted-foreground truncate">{apt?.patient_name}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
              apt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
              apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {apt.status === 'acceepted' ? 'Done' : apt.status === 'pending' ? 'Pending' : 'Soon'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
