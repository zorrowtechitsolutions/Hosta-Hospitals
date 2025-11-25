'use client'

import { useGetAllHospitalBookingQuery } from '@/app/service/bookings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function AppointmentsChart() {

  const hospitalId = localStorage.getItem("adminId"); 

  const { 
    data: bookingData, 
    isLoading,
    error
  } = useGetAllHospitalBookingQuery(hospitalId)

  // Process booking data to get weekly stats
  const processBookingData = () => {
    if (!bookingData?.data || !Array.isArray(bookingData.data)) {
      return []
    }

    // Get current week dates
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0)

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Initialize week data with only required statuses
    const weekData = weekDays.map(day => ({
      day,
      pending: 0,
      accepted: 0,
      declined: 0,
      cancel: 0
    }))

    // Process each booking
    bookingData.data.forEach(booking => {
      const bookingDate = new Date(booking.booking_date)
      const dayOfWeek = bookingDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      // Only process bookings from current week
      if (bookingDate >= startOfWeek) {
        const status = booking.status?.toLowerCase()
        
        switch (status) {
          case 'accepted':
          case 'completed':
            weekData[dayOfWeek].accepted++
            break
          case 'cancel':
          case 'cancelled':
            weekData[dayOfWeek].cancel++
            break
          case 'declined':
          case 'rejected':
            weekData[dayOfWeek].declined++
            break
          case 'pending':
            weekData[dayOfWeek].pending++
            break
          default:
            // If there's any other status, count it as pending
            weekData[dayOfWeek].pending++
        }
      }
    })

    return weekData
  }

  // Alternative: Process all-time data by day of week
  const processAllTimeData = () => {
    if (!bookingData?.data || !Array.isArray(bookingData.data)) {
      return []
    }

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // Initialize week data with only required statuses
    const weekData = weekDays.map(day => ({
      day,
      pending: 0,
      accepted: 0,
      declined: 0,
      cancel: 0
    }))

    // Process all bookings
    bookingData.data.forEach(booking => {
      const bookingDate = new Date(booking.booking_date)
      const dayOfWeek = bookingDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      const status = booking.status?.toLowerCase()
      
      switch (status) {
        case 'accepted':
        case 'completed':
          weekData[dayOfWeek].accepted++
          break
        case 'cancel':
        case 'cancelled':
          weekData[dayOfWeek].cancel++
          break
        case 'declined':
        case 'rejected':
          weekData[dayOfWeek].declined++
          break
        case 'pending':
          weekData[dayOfWeek].pending++
          break
        default:
          // If there's any other status, count it as pending
          weekData[dayOfWeek].pending++
      }
    })

    return weekData
  }

  // Use all-time data for better visualization with your sample data
  const chartData = processAllTimeData()

  // Calculate totals for the description
  const totals = chartData.reduce((acc, day) => ({
    pending: acc.pending + day.pending,
    accepted: acc.accepted + day.accepted,
    declined: acc.declined + day.declined,
    cancel: acc.cancel + day.cancel
  }), { pending: 0, accepted: 0, declined: 0, cancel: 0 })

  // Color scheme for different statuses
  const statusColors = {
    pending: 'var(--color-warning)',
    accepted: 'var(--color-accent)',
    declined: 'var(--color-muted-foreground)',
    cancel: 'var(--color-destructive)'
  }

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Weekly Appointments Overview</CardTitle>
          <CardDescription>Loading appointment data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Weekly Appointments Overview</CardTitle>
          <CardDescription>Error loading appointment data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-destructive">
              <p>Failed to load booking data</p>
              <p className="text-sm text-muted-foreground mt-1">Please try again later</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Weekly Appointments Overview</CardTitle>
        <CardDescription>
          Total: {totals.pending + totals.accepted + totals.declined + totals.cancel} appointments • 
          Pending: {totals.pending} • 
          Accepted: {totals.accepted} • 
          Cancel: {totals.cancel} • 
          Declined: {totals.declined}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
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
                formatter={(value, name) => {
                  const statusNames = {
                    pending: 'Pending',
                    accepted: 'Accepted',
                    declined: 'Declined',
                    cancel: 'Cancel'
                  }
                  return [value, statusNames[name] || name]
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
                formatter={(value) => {
                  const statusNames = {
                    pending: 'Pending',
                    accepted: 'Accepted',
                    declined: 'Declined',
                    cancel: 'Cancel'
                  }
                  return statusNames[value] || value
                }}
              />
              <Bar 
                dataKey="pending" 
                name="pending"
                fill={statusColors.pending}
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="accepted" 
                name="accepted"
                fill={statusColors.accepted}
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="cancel" 
                name="cancel"
                fill={statusColors.cancel}
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="declined" 
                name="declined"
                fill={statusColors.declined}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>No appointment data available</p>
              <p className="text-sm mt-1">Bookings will appear here once they are made</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}