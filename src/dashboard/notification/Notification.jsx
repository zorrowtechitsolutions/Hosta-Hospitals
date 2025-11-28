'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Circle, Calendar, Search } from 'lucide-react'
import { useGetAllnotficationHospitalReadQuery, useGetAllnotficationHospitalUnReadQuery, useUpdateAnotficationHospitalMutation, useUpdatenotficationHospitalAllMutation } from '@/app/service/notification'
import { toast } from 'sonner'

// Skeleton Loading Component
const NotificationSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="sticky top-0 z-10 bg-background pb-4 pt-2 border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Notifications List Skeleton */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status Icon Skeleton */}
                  <div className="mt-1 flex-shrink-0">
                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </div>

                  {/* Content Skeleton */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NotificationsPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

     const hospitalId = localStorage.getItem("adminId"); 

  // Fetch read and unread notifications
  const { 
    data: readData, 
    isLoading: readLoading, 
    error: readError, 
    refetch: refetchRead 
  } = useGetAllnotficationHospitalReadQuery(hospitalId)

  const { 
    data: unreadData, 
    isLoading: unreadLoading, 
    error: unreadError, 
    refetch: refetchUnread 
  } = useGetAllnotficationHospitalUnReadQuery(hospitalId)


  const [updatenotficationHospitalAll, { isLoading: isPosting }] = useUpdatenotficationHospitalAllMutation()
    const [updateAnotficationHospital, { isLoading: isPostingNotification }] = useUpdateAnotficationHospitalMutation()


  // Combine and transform the data
  const allNotifications = useMemo(() => {
    const readNotifications = Array.isArray(readData) ? readData : []
    const unreadNotifications = Array.isArray(unreadData) ? unreadData : []

    const combined = [
      ...unreadNotifications.map(notif => ({
        ...notif,
        read: false,
        type: 'appointment',
        title: 'New Appointment Booking',
      })),
      ...readNotifications.map(notif => ({
        ...notif,
        read: true,
        type: 'appointment',
        title: 'New Appointment Booking',
      }))
    ]

    // Add date filter category based on createdAt
    return combined.map(notif => {
      const notificationDate = new Date(notif.createdAt)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let dateFilter = 'older'
      
      if (notificationDate.toDateString() === today.toDateString()) {
        dateFilter = 'today'
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        dateFilter = 'yesterday'
      } else {
        const diffTime = today.getTime() - notificationDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays <= 7) {
          dateFilter = 'week'
        }
      }
      
      return {
        ...notif,
        dateFilter
      }
    })
  }, [readData, unreadData, refreshKey])

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((notif) => {
      const statusMatch =
        filterStatus === 'all' ||
        (filterStatus === 'read' && notif.read) ||
        (filterStatus === 'unread' && !notif.read)

      const dateMatch = 
        filterDate === 'all' || 
        notif.dateFilter === filterDate

      const searchMatch =
        notif.title.toLowerCase().includes(search.toLowerCase()) ||
        notif.message.toLowerCase().includes(search.toLowerCase())

      return statusMatch && dateMatch && searchMatch
    })
  }, [allNotifications, filterStatus, filterDate, search])

  const unreadCount = allNotifications.filter((n) => !n.read).length

  const toggleRead = async (id, currentReadStatus) => {
    console.log(id, "hii");
    
    try {
      if (!currentReadStatus) {
        
        await updateAnotficationHospital(id).unwrap()
        refetchRead(), refetchUnread()
        toast.success("Notification readed!")
      }
    } catch (error) {
       const msg = error?.data?.message || "Server error!";
      toast.error(msg); 
    }
  }

  const markAllRead = async () => {
    try {

     const hospitalId = localStorage.getItem("adminId"); 
      await updatenotficationHospitalAll(hospitalId).unwrap()
      refetchRead(), refetchUnread()
      toast.success("Notification all readed!")
    } catch (error) {
       const msg = error?.data?.message || "Server error!";
       toast.error(msg); 
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
      case 'doctor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200'
      case 'patient':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      case 'system':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  const isLoading = readLoading || unreadLoading

  // Show skeleton while loading
  if (isLoading) {
    return <NotificationSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={markAllRead} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isPosting}
          >
            {isPosting ? 'Marking...' : 'Mark All Read'}
          </Button>
        )}
      </div>

      {/* Filters - Fixed Position */}
      <div className="sticky top-0 z-10 pb-4 pt-2 ">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
              <SelectTrigger className="w-40 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-40 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="older">Older</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border-border">
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No notifications found
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif?._id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notif.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <button
                      onClick={() => toggleRead(notif._id, notif.read)}
                      className={`mt-1 flex-shrink-0 ${
                        notif.read 
                          ? 'text-green-600 hover:text-green-800' 
                          : 'text-primary hover:text-primary/80'
                      }`}
                      disabled={isPosting}
                    >
                      {notif.read ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} className="fill-current" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{notif.title}</h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                                notif.type
                              )}`}
                            >
                              {notif.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Calendar size={14} />
                            {formatTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}