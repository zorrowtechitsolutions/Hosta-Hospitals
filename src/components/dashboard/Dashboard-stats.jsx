'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Stethoscope, Calendar, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: 'Total Doctors',
    value: '24',
    icon: Stethoscope,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    trend: '+2 this month',
  },
  {
    title: 'Specialties',
    value: '8',
    icon: Users,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    trend: 'All registered',
  },
  {
    title: "Today's Appointments",
    value: '12',
    icon: Calendar,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    trend: '5 completed',
  },
  {
    title: 'Patient Visits',
    value: '328',
    icon: TrendingUp,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    trend: '+12% this week',
  },
]

export function DashboardStats() {
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
