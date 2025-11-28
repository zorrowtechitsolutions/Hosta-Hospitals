// 'use client'

// import { useState, useMemo, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Search, Calendar, Filter, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog'
// import { Label } from '@/components/ui/label'
// import { useGetAllHospitalBookingQuery, useUpdatebookingMutation } from '@/app/service/bookings'
// import { useNavigate } from 'react-router-dom'
// import { toast } from 'sonner'

// import io from "socket.io-client";

// const socket = io("https://www.zorrowtek.in");

// const statusOptions = [
//   { value: 'all', label: 'All Status' },
//   { value: 'pending', label: 'Pending' },
//   { value: 'accepted', label: 'Accepted' },
//   { value: 'declined', label: 'Declined' },
//   { value: 'cancelled', label: 'Cancelled' }
// ]

// const dateFilters = [
//     { value: 'all', label: 'All Dates' },
//   { value: 'today', label: "Today's Bookings" },

//   { value: 'tomorrow', label: 'Tomorrow' },
//   { value: 'this_week', label: 'This Week' },
//   { value: 'next_week', label: 'Next Week' }
// ]

// // Skeleton Loading Component
// const TableSkeleton = () => {
//   return (
//     <div className="overflow-x-auto">
//       <div className="min-w-[1000px]">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b">
//               <th className="text-left py-3 px-4 font-medium min-w-[150px]">Patient</th>
//               <th className="text-left py-3 px-4 font-medium min-w-[150px]">Contact</th>
//               <th className="text-left py-3 px-4 font-medium min-w-[180px]">Doctor & Specialty</th>
//               <th className="text-left py-3 px-4 font-medium min-w-[180px]">Booking Date</th>
//               <th className="text-left py-3 px-4 font-medium min-w-[150px]">Appointment Date & Time</th>
//               <th className="text-left py-3 px-4 font-medium min-w-[120px]">Status</th>
//               <th className="text-right py-3 px-4 font-medium min-w-[180px]">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {Array.from({ length: 5 }).map((_, index) => (
//               <tr key={index} className="border-b animate-pulse">
//                 <td className="py-4 px-4">
//                   <div className="space-y-2">
//                     <div className="h-4 bg-gray-200 rounded w-32"></div>
//                     <div className="h-3 bg-gray-200 rounded w-24"></div>
//                   </div>
//                 </td>
//                 <td className="py-4 px-4">
//                   <div className="space-y-2">
//                     <div className="h-4 bg-gray-200 rounded w-28"></div>
//                     <div className="h-3 bg-gray-200 rounded w-20"></div>
//                   </div>
//                 </td>
//                 <td className="py-4 px-4">
//                   <div className="space-y-2">
//                     <div className="h-4 bg-gray-200 rounded w-36"></div>
//                     <div className="h-3 bg-gray-200 rounded w-28"></div>
//                   </div>
//                 </td>
//                 <td className="py-4 px-4">
//                   <div className="space-y-2">
//                     <div className="h-4 bg-gray-200 rounded w-24"></div>
//                     <div className="h-3 bg-gray-200 rounded w-20"></div>
//                   </div>
//                 </td>
//                 <td className="py-4 px-4">
//                   <div className="space-y-2">
//                     <div className="h-4 bg-gray-200 rounded w-24"></div>
//                     <div className="h-3 bg-gray-200 rounded w-20"></div>
//                   </div>
//                 </td>
//                 <td className="py-4 px-4">
//                   <div className="h-6 bg-gray-200 rounded w-16"></div>
//                 </td>
//                 <td className="py-4 px-4 text-right">
//                   <div className="flex justify-end gap-2">
//                     <div className="h-8 bg-gray-200 rounded w-16"></div>
//                     <div className="h-8 bg-gray-200 rounded w-16"></div>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// // Convert 24h to 12h AM/PM format
// const formatTimeToAMPM = (time24) => {
//   if (!time24) return ''
  
//   // Handle both "HH:MM" and "HH:MM:SS" formats
//   const timeParts = time24.split(':')
//   const hours = parseInt(timeParts[0])
//   const minutes = timeParts[1]
//   const ampm = hours >= 12 ? 'PM' : 'AM'
//   const hour12 = hours % 12 || 12
//   return `${hour12}:${minutes} ${ampm}`
// }

// // Function to combine date and time into ISO string
// const combineDateAndTime = (dateString, timeString) => {
//   if (!dateString || !timeString) return dateString;
  
//   const date = new Date(dateString);
//   const [hours, minutes] = timeString.split(':');
  
//   date.setHours(parseInt(hours, 10));
//   date.setMinutes(parseInt(minutes, 10));
//   date.setSeconds(0);
//   date.setMilliseconds(0);
  
//   return date.toISOString();
// }

// // Format date for input[type="date"] (YYYY-MM-DD)
// const formatDateForInput = (dateString) => {
//   if (!dateString) return '';
//   const date = new Date(dateString);
//   return date.toISOString().split('T')[0];
// }

// export default function BookingsPage() {
//   const [search, setSearch] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [dateFilter, setDateFilter] = useState('today')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [selectedBooking, setSelectedBooking] = useState(null)
//   const [manualDate, setManualDate] = useState('')
//   const [manualTime, setManualTime] = useState('')
//   const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false)
//   const itemsPerPage = 5
//   const Navigate = useNavigate();

//   const hospitalId = localStorage.getItem("adminId"); 
  
//   const { 
//     data: bookingData, 
//     isLoading, 
//     error,
//     refetch
//   } = useGetAllHospitalBookingQuery(hospitalId)

//   const [updateBooking, { isLoading: isUpdating }] = useUpdatebookingMutation()

//   // 🔔 Handle real-time push notifications
//   useEffect(() => {
//     socket.on("pushNotifications", (data) => {
//       const hospitalId = localStorage.getItem("adminId"); 
//       if (hospitalId === data.hospitalId) {
//         refetch();
//       }
//     });

//     socket.on("pushNotificationWeb", (data) => {
//       const hospitalId = localStorage.getItem("adminId"); 
//       if (hospitalId === data.hospitalId) {
//         refetch();
//       }
//     });

//     return () => {
//       socket.off("bookingUpdate");
//       socket.off("pushNotificationWeb");
//     };
//   }, [refetch]);

//   // Filter and transform bookings data
//   const filteredBookings = useMemo(() => {
//     if (!bookingData?.data) return []

//     let filtered = bookingData.data

//     // Search filter
//     if (search) {
//       const searchLower = search.toLowerCase()
//       filtered = filtered.filter(booking =>
//         booking.patient_name.toLowerCase().includes(searchLower) ||
//         booking.patient_phone.includes(search) ||
//         booking.doctor_name.toLowerCase().includes(searchLower) ||
//         booking.specialty.toLowerCase().includes(searchLower)
//       )
//     }

//     // Status filter
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(booking => booking.status === statusFilter)
//     }

//     // Date filter
//     if (dateFilter !== 'all') {
//       const now = new Date()
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
//       const tomorrow = new Date(today)
//       tomorrow.setDate(tomorrow.getDate() + 1)

//       const startOfWeek = new Date(today)
//       startOfWeek.setDate(today.getDate() - today.getDay())
//       const endOfWeek = new Date(startOfWeek)
//       endOfWeek.setDate(startOfWeek.getDate() + 6)

//       const startOfNextWeek = new Date(endOfWeek)
//       startOfNextWeek.setDate(endOfWeek.getDate() + 1)
//       const endOfNextWeek = new Date(startOfNextWeek)
//       endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)

//       filtered = filtered.filter(booking => {
//         const bookingDate = new Date(booking.booking_date)
//         const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())

//         switch (dateFilter) {
//           case 'today':
//             return bookingDay.getTime() === today.getTime()
//           case 'tomorrow':
//             return bookingDay.getTime() === tomorrow.getTime()
//           case 'this_week':
//             return bookingDay >= startOfWeek && bookingDay <= endOfWeek
//           case 'next_week':
//             return bookingDay >= startOfNextWeek && bookingDay <= endOfNextWeek
//           default:
//             return true
//         }
//       })
//     }

//     return filtered
//   }, [bookingData, search, statusFilter, dateFilter])

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1)
//   }, [search, statusFilter, dateFilter])

//   // Pagination
//   const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

//   const handleAcceptWithTime = (booking) => {
//     setSelectedBooking(booking)
//     // Set default date to the original booking date
//     setManualDate(formatDateForInput(booking.booking_date))
//     setManualTime('')
//     setIsTimeDialogOpen(true)
//   }

//   const handleDateChange = (value) => {
//     setManualDate(value)
//   }

//   const handleTimeChange = (value) => {
//     setManualTime(value)
//   }

//   const handleStatusUpdate = async (bookingId, newStatus, bookingDate = null, bookingTime = null) => {
//     try {
//       const updateData = { status: newStatus }
      
//       // Add booking_time and update booking_date when accepting and time/date are provided
//       if (newStatus === 'accepted' && bookingDate && bookingTime) {
//         updateData.booking_time = bookingTime // Store as HH:MM format
        
//         // Combine the selected date and time to create complete datetime
//         const completeDateTime = combineDateAndTime(bookingDate, bookingTime);
//         updateData.booking_date = completeDateTime; // Send complete datetime to backend
//       }
      
//       await updateBooking({
//         bookingId,
//         hospitalId,
//         updatebooking: updateData
//       }).unwrap()
      
//       setIsTimeDialogOpen(false)
//       setSelectedBooking(null)
//       setManualDate('')
//       setManualTime('')
//       refetch()
//       toast.success("Booking updated successfully!")
//     } catch (error) {
//       const msg = error?.data?.message || "Server error!";
//       toast.error(msg); 
//     }
//   }

//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       pending: { variant: 'secondary', label: 'Pending' },
//       accepted: { variant: 'default', label: 'Accepted' },
//       declined: { variant: 'destructive', label: 'Declined' },
//       cancelled: { variant: 'outline', label: 'Cancelled' }
//     }
    
//     const config = statusConfig[status] || { variant: 'secondary', label: status }
//     return (
//       <Badge variant={config.variant}>
//         {config.label}
//       </Badge>
//     )
//   }

//   const formatDate = (dateString) => {
//     const date = new Date(dateString)
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     })
//   }

//   const formatDateTime = (booking) => {
//     const date = formatDate(booking.booking_date)
//     const time = booking.booking_time ? formatTimeToAMPM(booking.booking_time) : 'Time not set'
    
//     return (
//       <div>
//         <div className="flex items-center gap-2">
//           <Calendar size={14} className="text-muted-foreground flex-shrink-0" />
//           <span className="text-sm whitespace-nowrap">{date}</span>
//         </div>
//         {booking.status === 'accepted' && booking.booking_time && (
//           <div className="flex items-center gap-2 mt-1">
//             <Clock size={14} className="text-muted-foreground flex-shrink-0" />
//             <span className="text-xs text-green-600 font-medium">{formatTimeToAMPM(booking.booking_time)}</span>
//           </div>
//         )}
//       </div>
//     )
//   }

//   const calculateAge = (dobString) => {
//     const dob = new Date(dobString)
//     const today = new Date()
//     let age = today.getFullYear() - dob.getFullYear()
//     const monthDiff = today.getMonth() - dob.getMonth()
    
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
//       age--
//     }
    
//     return age
//   }

//   // Stats for header
//   const todayBookingsCount = useMemo(() => {
//     if (!bookingData?.data) return 0
//     const today = new Date()
//     const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
//     return bookingData.data.filter(booking => {
//       const bookingDate = new Date(booking.booking_date)
//       const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
//       return bookingDay.getTime() === todayStart.getTime()
//     }).length
//   }, [bookingData])

//   return (
//     <div className="space-y-6 h-full flex flex-col">
//       {/* Date & Time Input Dialog */}
//       <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Set Appointment Date & Time</DialogTitle>
//             <DialogDescription>
//               Set the appointment date and time for {selectedBooking?.patient_name}'s booking with Dr. {selectedBooking?.doctor_name}
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4">
//             {/* Date Input */}
//             <div className="space-y-2">
//               <Label htmlFor="booking-date">Appointment Date *</Label>
//               <Input
//                 id="booking-date"
//                 type="date"
//                 value={manualDate}
//                 onChange={(e) => handleDateChange(e.target.value)}
//                 className="w-full"
//                 min={new Date().toISOString().split('T')[0]} // Prevent past dates
//               />
//               <p className="text-xs text-muted-foreground">
//                 Select the appointment date
//               </p>
//             </div>

//             {/* Time Input */}
//             <div className="space-y-2">
//               <Label htmlFor="booking-time">Appointment Time *</Label>
//               <Input
//                 id="booking-time"
//                 type="time"
//                 value={manualTime}
//                 onChange={(e) => handleTimeChange(e.target.value)}
//                 className="w-full"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Use the time picker or type in HH:MM format (24-hour)
//               </p>
//             </div>
            
//             {(manualDate || manualTime) && (
//               <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <p className="text-sm text-green-800 font-medium">
//                   Appointment set for:
//                 </p>
//                 {manualDate && (
//                   <p className="text-sm text-green-700 mt-1">
//                     <span className="font-medium">Date:</span> {new Date(manualDate).toLocaleDateString('en-US', { 
//                       weekday: 'long', 
//                       year: 'numeric', 
//                       month: 'long', 
//                       day: 'numeric' 
//                     })}
//                   </p>
//                 )}
//                 {manualTime && (
//                   <p className="text-sm text-green-700">
//                     <span className="font-medium">Time:</span> {formatTimeToAMPM(manualTime)}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
          
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setIsTimeDialogOpen(false)
//                 setManualDate('')
//                 setManualTime('')
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={() => handleStatusUpdate(selectedBooking._id, 'accepted', manualDate, manualTime)}
//               disabled={!manualDate || !manualTime || isUpdating}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               {isUpdating ? 'Confirming...' : 'Confirm Appointment'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="flex-1">
//           <h1 className="text-3xl font-bold text-green-800">Bookings</h1>
//           <p className="text-muted-foreground mt-2">Manage patient appointments and bookings</p>
//         </div>
//         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
//           <div className="text-sm text-muted-foreground text-right">
//             <div>Total: {filteredBookings.length} bookings</div>
//             {dateFilter === 'today' && (
//               <div className="text-green-600 font-medium">
//                 Today: {todayBookingsCount} bookings
//               </div>
//             )}
//           </div>
//           <Button className="whitespace-nowrap bg-green-600 hover:bg-green-700 cursor-pointer" onClick={() => Navigate("/dashboard/bookings/doctor-mange")}>
//             Manage Doctor Booking
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <Filter size={20} />
//             Filters
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="pt-0">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {/* Search */}
//             <div className="relative">
//               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//               <Input
//                 placeholder="Search patients, doctors..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="pl-10"
//               />
//             </div>

//             {/* Status Filter */}
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {statusOptions.map(option => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Date Filter */}
//             <Select value={dateFilter} onValueChange={setDateFilter}>
//               <SelectTrigger>
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {dateFilters.map(option => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Clear Filters */}
//             {(search || statusFilter !== 'all' || dateFilter !== 'today') && (
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setSearch('')
//                   setStatusFilter('all')
//                   setDateFilter('today')
//                 }}
//                 className="whitespace-nowrap"
//               >
//                 Clear Filters
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Bookings Table */}
//       <Card className="flex-1 flex flex-col">
//         <CardHeader>
//           <CardTitle className="flex items-center justify-between">
//             <span>All Bookings</span>
//             {dateFilter === 'today' && (
//               <Badge variant="secondary" className="ml-2">
//                 Showing Today's Bookings
//               </Badge>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="flex-1 p-0">
//           {isLoading || error ? (
//             <div className="p-6">
//               <TableSkeleton />
//             </div>
//           ) : (
//             <div className="flex flex-col h-full">
//               {/* Table Container with Scroll */}
//               <div className="flex-1 overflow-auto">
//                 <div className="min-w-[1000px]">
//                   <table className="w-full text-sm">
//                     <thead className="sticky top-0 bg-white z-10">
//                       <tr className="border-b">
//                         <th className="text-left py-3 px-4 font-medium min-w-[150px]">Patient</th>
//                         <th className="text-left py-3 px-4 font-medium min-w-[150px]">Contact</th>
//                         <th className="text-left py-3 px-4 font-medium min-w-[180px]">Doctor & Specialty</th>
//                         <th className="text-left py-3 px-4 font-medium min-w-[180px]">Booking Date</th>
//                         <th className="text-left py-3 px-4 font-medium min-w-[150px]">Appointment Date & Time</th>
//                         <th className="text-left py-3 px-4 font-medium min-w-[120px]">Status</th>
//                         <th className="text-right py-3 px-4 font-medium min-w-[180px]">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paginatedBookings.map((booking) => (
//                         <tr key={booking._id} className="border-b hover:bg-muted/50 transition-colors">
//                           <td className="py-4 px-4">
//                             <div>
//                               <div className="font-medium">{booking.patient_name}</div>
//                               <div className="text-sm text-muted-foreground">
//                                 Age: {calculateAge(booking.patient_dob)} • {booking.patient_place}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="text-sm">
//                               <div className="font-medium">{booking.patient_phone}</div>
//                               <div className="text-muted-foreground truncate max-w-[150px]">
//                                 {booking.userId?.email}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="py-4 px-4">
//                             <div>
//                               <div className="font-medium">{booking.doctor_name}</div>
//                               <div className="text-sm text-muted-foreground">
//                                 {booking.specialty}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="py-4 px-4">
//                             {new Date(booking.createdAt).toLocaleString("en-IN", {
//                               day: "2-digit",
//                               month: "short",
//                               year: "numeric",
//                               hour: "2-digit",
//                               minute: "2-digit",
//                               hour12: true
//                             })}
//                           </td>
//                           <td className="py-4 px-4">
//                             {formatDateTime(booking)}
//                           </td>
//                           <td className="py-4 px-4">
//                             {getStatusBadge(booking.status)}
//                           </td>
//                           <td className="py-4 px-4">
//                             <div className="flex items-center justify-end gap-2">
//                               {/* Only show actions for pending bookings */}
//                               {booking.status === 'pending' && (
//                                 <>
//                                   <Button
//                                     size="sm"
//                                     onClick={() => handleAcceptWithTime(booking)}
//                                     disabled={isUpdating}
//                                     className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
//                                   >
//                                     <Clock size={14} className="mr-1" />
//                                     Accept
//                                   </Button>
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     onClick={() => handleStatusUpdate(booking._id, 'declined')}
//                                     disabled={isUpdating}
//                                     className="text-red-600 border-red-600 hover:bg-red-50 whitespace-nowrap"
//                                   >
//                                     Decline
//                                   </Button>
//                                 </>
//                               )}
//                               {/* No actions for other statuses */}
//                               {(booking.status === 'accepted' || booking.status === 'declined' || booking.status === 'cancelled') && (
//                                 <span className="text-sm text-muted-foreground">No actions available</span>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {paginatedBookings.length === 0 && (
//                 <div className="flex-1 flex items-center justify-center p-12 text-center text-muted-foreground">
//                   <div>
//                     <Calendar size={48} className="mx-auto mb-4 opacity-50" />
//                     <p className="text-lg font-medium">No bookings found</p>
//                     <p className="text-sm">
//                       {search || statusFilter !== 'all' || dateFilter !== 'today' 
//                         ? 'Try adjusting your filters' 
//                         : 'No bookings available for today'
//                       }
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Pagination - Fixed at bottom */}
//               {totalPages > 1 && paginatedBookings.length > 0 && (
//                 <div className="border-t bg-white sticky bottom-0">
//                   <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
//                     <p className="text-sm text-muted-foreground">
//                       Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
//                     </p>
//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                         disabled={currentPage === 1}
//                       >
//                         <ChevronLeft size={16} />
//                       </Button>
                      
//                       {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                         <Button
//                           key={page}
//                           variant={currentPage === page ? "default" : "outline"}
//                           size="sm"
//                           onClick={() => setCurrentPage(page)}
//                           className="w-10 h-10 p-0"
//                         >
//                           {page}
//                         </Button>
//                       ))}
                      
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                         disabled={currentPage === totalPages}
//                       >
//                         <ChevronRight size={16} />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, Filter, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useGetAllHospitalBookingQuery, useUpdatebookingMutation } from '@/app/service/bookings'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import io from "socket.io-client";

const socket = io("https://www.zorrowtek.in");

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' }
]

const dateFilters = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: "Today's Bookings" },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this_week', label: 'This Week' },
  { value: 'next_week', label: 'Next Week' }
]

// Skeleton Loading Component
const TableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium min-w-[150px]">Patient</th>
              <th className="text-left py-3 px-4 font-medium min-w-[150px]">Contact</th>
              <th className="text-left py-3 px-4 font-medium min-w-[180px]">Doctor & Specialty</th>
              <th className="text-left py-3 px-4 font-medium min-w-[180px]">Booking Date</th>
              <th className="text-left py-3 px-4 font-medium min-w-[150px]">Appointment Date & Time</th>
              <th className="text-left py-3 px-4 font-medium min-w-[120px]">Status</th>
              <th className="text-right py-3 px-4 font-medium min-w-[180px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-b animate-pulse">
                <td className="py-4 px-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Convert 24h to 12h AM/PM format
const formatTimeToAMPM = (time24) => {
  if (!time24) return ''
  
  // Handle both "HH:MM" and "HH:MM:SS" formats
  const timeParts = time24.split(':')
  const hours = parseInt(timeParts[0])
  const minutes = timeParts[1]
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Function to combine date and time into ISO string
const combineDateAndTime = (dateString, timeString) => {
  if (!dateString || !timeString) return dateString;
  
  const date = new Date(dateString);
  const [hours, minutes] = timeString.split(':');
  
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  date.setSeconds(0);
  date.setMilliseconds(0);
  
  return date.toISOString();
}

// Format date for input[type="date"] (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

export default function BookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // Changed default to 'all'
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [manualDate, setManualDate] = useState('')
  const [manualTime, setManualTime] = useState('')
  const [isTimeDialogOpen, setIsTimeDialogOpen] = useState(false)
  const itemsPerPage = 5
  const Navigate = useNavigate();

  const hospitalId = localStorage.getItem("adminId"); 
  
  const { 
    data: bookingData, 
    isLoading, 
    error,
    refetch
  } = useGetAllHospitalBookingQuery(hospitalId)

  const [updateBooking, { isLoading: isUpdating }] = useUpdatebookingMutation()

  // 🔔 Handle real-time push notifications
  useEffect(() => {
    socket.on("pushNotifications", (data) => {
      const hospitalId = localStorage.getItem("adminId"); 
      if (hospitalId === data.hospitalId) {
        refetch();
      }
    });

    socket.on("pushNotificationWeb", (data) => {
      const hospitalId = localStorage.getItem("adminId"); 
      if (hospitalId === data.hospitalId) {
        refetch();
      }
    });

    return () => {
      socket.off("bookingUpdate");
      socket.off("pushNotificationWeb");
    };
  }, [refetch]);

  // Filter and transform bookings data
  const filteredBookings = useMemo(() => {
    if (!bookingData?.data) return []

    let filtered = bookingData.data

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(booking =>
        booking.patient_name.toLowerCase().includes(searchLower) ||
        booking.patient_phone.includes(search) ||
        booking.doctor_name.toLowerCase().includes(searchLower) ||
        booking.specialty.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const startOfNextWeek = new Date(endOfWeek)
      startOfNextWeek.setDate(endOfWeek.getDate() + 1)
      const endOfNextWeek = new Date(startOfNextWeek)
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.booking_date)
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())

        switch (dateFilter) {
          case 'today':
            return bookingDay.getTime() === today.getTime()
          case 'tomorrow':
            return bookingDay.getTime() === tomorrow.getTime()
          case 'this_week':
            return bookingDay >= startOfWeek && bookingDay <= endOfWeek
          case 'next_week':
            return bookingDay >= startOfNextWeek && bookingDay <= endOfNextWeek
          default:
            return true
        }
      })
    }

    return filtered
  }, [bookingData, search, statusFilter, dateFilter])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, dateFilter])

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

  const handleAcceptWithTime = (booking) => {
    setSelectedBooking(booking)
    // Set default date to the original booking date
    setManualDate(formatDateForInput(booking.booking_date))
    setManualTime('')
    setIsTimeDialogOpen(true)
  }

  const handleDateChange = (value) => {
    setManualDate(value)
  }

  const handleTimeChange = (value) => {
    setManualTime(value)
  }

  const handleStatusUpdate = async (bookingId, newStatus, bookingDate = null, bookingTime = null) => {
    try {
      const updateData = { status: newStatus }
      
      // Add booking_time and update booking_date when accepting and time/date are provided
      if (newStatus === 'accepted' && bookingDate && bookingTime) {
        updateData.booking_time = bookingTime // Store as HH:MM format
        
        // Combine the selected date and time to create complete datetime
        const completeDateTime = combineDateAndTime(bookingDate, bookingTime);
        updateData.booking_date = completeDateTime; // Send complete datetime to backend
      }
      
      await updateBooking({
        bookingId,
        hospitalId,
        updatebooking: updateData
      }).unwrap()
      
      setIsTimeDialogOpen(false)
      setSelectedBooking(null)
      setManualDate('')
      setManualTime('')
      refetch()
      toast.success("Booking updated successfully!")
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg); 
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', label: 'Pending' },
      accepted: { variant: 'default', label: 'Accepted' },
      declined: { variant: 'destructive', label: 'Declined' },
      cancelled: { variant: 'outline', label: 'Cancelled' }
    }
    
    const config = statusConfig[status] || { variant: 'secondary', label: status }
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (booking) => {
    const date = formatDate(booking.booking_date)
    const time = booking.booking_time ? formatTimeToAMPM(booking.booking_time) : 'Time not set'
    
    return (
      <div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm whitespace-nowrap">{date}</span>
        </div>
        {booking.status === 'accepted' && booking.booking_time && (
          <div className="flex items-center gap-2 mt-1">
            <Clock size={14} className="text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-green-600 font-medium">{formatTimeToAMPM(booking.booking_time)}</span>
          </div>
        )}
      </div>
    )
  }

  const calculateAge = (dobString) => {
    const dob = new Date(dobString)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    
    return age
  }

  // Stats for header
  const todayBookingsCount = useMemo(() => {
    if (!bookingData?.data) return 0
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    return bookingData.data.filter(booking => {
      const bookingDate = new Date(booking.booking_date)
      const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
      return bookingDay.getTime() === todayStart.getTime()
    }).length
  }, [bookingData])

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Date & Time Input Dialog */}
      <Dialog open={isTimeDialogOpen} onOpenChange={setIsTimeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Appointment Date & Time</DialogTitle>
            <DialogDescription>
              Set the appointment date and time for {selectedBooking?.patient_name}'s booking with Dr. {selectedBooking?.doctor_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="booking-date">Appointment Date *</Label>
              <Input
                id="booking-date"
                type="date"
                value={manualDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full"
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
              />
              <p className="text-xs text-muted-foreground">
                Select the appointment date
              </p>
            </div>

            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="booking-time">Appointment Time *</Label>
              <Input
                id="booking-time"
                type="time"
                value={manualTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Use the time picker or type in HH:MM format (24-hour)
              </p>
            </div>
            
            {(manualDate || manualTime) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  Appointment set for:
                </p>
                {manualDate && (
                  <p className="text-sm text-green-700 mt-1">
                    <span className="font-medium">Date:</span> {new Date(manualDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
                {manualTime && (
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Time:</span> {formatTimeToAMPM(manualTime)}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsTimeDialogOpen(false)
                setManualDate('')
                setManualTime('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleStatusUpdate(selectedBooking._id, 'accepted', manualDate, manualTime)}
              disabled={!manualDate || !manualTime || isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? 'Confirming...' : 'Confirm Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-green-800">Bookings</h1>
          <p className="text-muted-foreground mt-2">Manage patient appointments and bookings</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-sm text-muted-foreground text-right">
            <div>Total: {filteredBookings.length} bookings</div>
            {dateFilter === 'today' && (
              <div className="text-green-600 font-medium">
                Today: {todayBookingsCount} bookings
              </div>
            )}
          </div>
          <Button className="whitespace-nowrap bg-green-600 hover:bg-green-700 cursor-pointer" onClick={() => Navigate("/dashboard/bookings/doctor-mange")}>
            Manage Doctor Booking
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter size={20} />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients, doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateFilters.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(search || statusFilter !== 'all' || dateFilter !== 'all') && ( // Changed from 'today' to 'all'
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setDateFilter('all') // Changed from 'today' to 'all'
                }}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Bookings</span>
            {dateFilter === 'today' && (
              <Badge variant="secondary" className="ml-2">
                Showing Today's Bookings
              </Badge>
            )}
            {dateFilter === 'all' && (
              <Badge variant="secondary" className="ml-2">
                Showing All Bookings
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {isLoading || error ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Table Container with Scroll */}
              <div className="flex-1 overflow-auto">
                <div className="min-w-[1000px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium min-w-[150px]">Patient</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[150px]">Contact</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[180px]">Doctor & Specialty</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[180px]">Booking Date</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[150px]">Appointment Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[120px]">Status</th>
                        <th className="text-right py-3 px-4 font-medium min-w-[180px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.map((booking) => (
                        <tr key={booking._id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium">{booking.patient_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Age: {calculateAge(booking.patient_dob)} • {booking.patient_place}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="font-medium">{booking.patient_phone}</div>
                              <div className="text-muted-foreground truncate max-w-[150px]">
                                {booking.userId?.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium">{booking.doctor_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {booking.specialty}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {new Date(booking.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
                            })}
                          </td>
                          <td className="py-4 px-4">
                            {formatDateTime(booking)}
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* Only show actions for pending bookings */}
                              {booking.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptWithTime(booking)}
                                    disabled={isUpdating}
                                    className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                                  >
                                    <Clock size={14} className="mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(booking._id, 'declined')}
                                    disabled={isUpdating}
                                    className="text-red-600 border-red-600 hover:bg-red-50 whitespace-nowrap"
                                  >
                                    Decline
                                  </Button>
                                </>
                              )}
                              {/* No actions for other statuses */}
                              {(booking.status === 'accepted' || booking.status === 'declined' || booking.status === 'cancelled') && (
                                <span className="text-sm text-muted-foreground">No actions available</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {paginatedBookings.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-12 text-center text-muted-foreground">
                  <div>
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No bookings found</p>
                    <p className="text-sm">
                      {search || statusFilter !== 'all' || dateFilter !== 'all'  // Changed from 'today' to 'all'
                        ? 'Try adjusting your filters' 
                        : 'No bookings available'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Pagination - Fixed at bottom */}
              {totalPages > 1 && paginatedBookings.length > 0 && (
                <div className="border-t bg-white sticky bottom-0">
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}