'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

const appointments = [
  { time: '09:00 AM', doctor: 'Dr. Smith', patient: 'John Doe', status: 'completed' },
  { time: '10:30 AM', doctor: 'Dr. Johnson', patient: 'Jane Wilson', status: 'completed' },
  { time: '01:00 PM', doctor: 'Dr. Brown', patient: 'Michael Johnson', status: 'in-progress' },
  { time: '02:30 PM', doctor: 'Dr. Davis', patient: 'Sarah Miller', status: 'pending' },
]

export function TodayAppointments() {
  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="text-lg">Today's Schedule</CardTitle>
        <CardDescription>Upcoming and completed appointments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((apt, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="mt-1">
              <Clock size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{apt.time}</p>
              <p className="text-xs text-muted-foreground">{apt.doctor}</p>
              <p className="text-xs text-muted-foreground truncate">{apt.patient}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
              apt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
              apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {apt.status === 'completed' ? 'Done' : apt.status === 'in-progress' ? 'Now' : 'Soon'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
