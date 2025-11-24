'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Monday', scheduled: 45, completed: 40, cancelled: 5 },
  { day: 'Tuesday', scheduled: 52, completed: 48, cancelled: 4 },
  { day: 'Wednesday', scheduled: 48, completed: 45, cancelled: 3 },
  { day: 'Thursday', scheduled: 61, completed: 58, cancelled: 3 },
  { day: 'Friday', scheduled: 55, completed: 52, cancelled: 3 },
  { day: 'Saturday', scheduled: 30, completed: 28, cancelled: 2 },
  { day: 'Sunday', scheduled: 20, completed: 18, cancelled: 2 },
]

export function AppointmentsChart() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Weekly Appointments Overview</CardTitle>
        <CardDescription>Scheduled, Completed, and Cancelled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="day" 
              stroke="var(--color-muted-foreground)"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'var(--color-muted)' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="scheduled" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
