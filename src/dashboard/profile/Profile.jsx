'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Edit2, Save, X, Building, AlertCircle, Camera, Upload } from 'lucide-react'
import { useGetAHospitalQuery, useUpdateHospitalMutation } from '@/app/service/hospital'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('normal') // 'normal' or 'clinic'
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  // const hospitalId = "691f13a38ca833f164b47bbf"
      const hospitalId = localStorage.getItem("adminId"); 


  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useGetAHospitalQuery(hospitalId)

  

  const [updateHospital, { isLoading: isUpdating }] = useUpdateHospitalMutation()

  const [hospitalData, setHospitalData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    address: '',
    latitude: '',
    longitude: '',
    about: '',
    type: '',
    specialties: [],
    working_hours: [],
    working_hours_clinic: [],
    image: null
  })

  const [editData, setEditData] = useState(hospitalData)

  // Default working hours structure
  const [workingHours, setWorkingHours] = useState({
    Monday: { open: '09:00', close: '18:00', isHoliday: false },
    Tuesday: { open: '09:00', close: '18:00', isHoliday: false },
    Wednesday: { open: '09:00', close: '18:00', isHoliday: false },
    Thursday: { open: '09:00', close: '18:00', isHoliday: false },
    Friday: { open: '09:00', close: '18:00', isHoliday: false },
    Saturday: { open: '09:00', close: '18:00', isHoliday: false },
    Sunday: { open: '', close: '', isHoliday: true },
  })

  // Clinic Working Hours with morning and evening sessions
  const [workingHoursClinic, setWorkingHoursClinic] = useState({
    Monday: {
      morning_session: { open: '09:00', close: '12:00' },
      evening_session: { open: '16:00', close: '20:00' },
      isHoliday: false,
      hasBreak: true,
    },
    Tuesday: {
      morning_session: { open: '09:00', close: '12:00' },
      evening_session: { open: '16:00', close: '20:00' },
      isHoliday: false,
      hasBreak: true,
    },
    Wednesday: {
      morning_session: { open: '09:00', close: '12:00' },
      evening_session: { open: '16:00', close: '20:00' },
      isHoliday: false,
      hasBreak: true,
    },
    Thursday: {
      morning_session: { open: '09:00', close: '12:00' },
      evening_session: { open: '16:00', close: '20:00' },
      isHoliday: false,
      hasBreak: true,
    },
    Friday: {
      morning_session: { open: '09:00', close: '12:00' },
      evening_session: { open: '16:00', close: '20:00' },
      isHoliday: false,
      hasBreak: true,
    },
    Saturday: {
      morning_session: { open: '09:00', close: '12:00' },
      evening_session: { open: '16:00', close: '18:00' },
      isHoliday: false,
      hasBreak: true,
    },
    Sunday: {
      morning_session: { open: '', close: '' },
      evening_session: { open: '', close: '' },
      isHoliday: true,
      hasBreak: false,
    },
  })

  // Initialize data when API response is received
  useEffect(() => {
    if (data?.data) {
      const hospital = data.data
      console.log('Hospital data:', hospital)
      
      setHospitalData({
        name: hospital.name || '',
        email: hospital.email || '',
        phone: hospital.phone || '',
        emergencyContact: hospital.emergencyContact || '',
        address: hospital.address || '',
        latitude: hospital.latitude || '',
        longitude: hospital.longitude || '',
        about: hospital.about || '',
        type: hospital.type || '',
        specialties: hospital.specialties || [],
        working_hours: hospital.working_hours || [],
        working_hours_clinic: hospital.working_hours_clinic || [],
        image: hospital.image || null
      })

      // Set image preview if image exists
      if (hospital.image?.imageUrl) {
        setImagePreview(hospital.image.imageUrl)
      }

      // Convert API working hours to editable format
      if (hospital.working_hours && hospital.working_hours.length > 0) {
        const convertedHours = {}
        hospital.working_hours.forEach(day => {
          convertedHours[day.day] = {
            open: day.opening_time || '',
            close: day.closing_time || '',
            isHoliday: day.is_holiday || false
          }
        })
        setWorkingHours(convertedHours)
        setActiveTab('normal')
      } else if (hospital.working_hours_clinic && hospital.working_hours_clinic.length > 0) {
        const convertedClinicHours = {}
        hospital.working_hours_clinic.forEach(day => {
          convertedClinicHours[day.day] = {
            morning_session: {
              open: day.morning_session?.open || '',
              close: day.morning_session?.close || ''
            },
            evening_session: {
              open: day.evening_session?.open || '',
              close: day.evening_session?.close || ''
            },
            isHoliday: day.is_holiday || false,
            hasBreak: day.hasBreak || false
          }
        })
        setWorkingHoursClinic(convertedClinicHours)
        setActiveTab('clinic')
      }
    }
  }, [data])

  // Update editData when hospitalData changes
  useEffect(() => {
    setEditData(hospitalData)
  }, [hospitalData])

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(hospitalData)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleWorkingHoursChange = (day, type, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }))
  }

  const handleClinicHoursChange = (day, field, value) => {
    setWorkingHoursClinic((prev) => {
      const updatedDay = { ...prev[day] }

      if (field === 'isHoliday') {
        updatedDay.isHoliday = value
      } else if (field === 'hasBreak') {
        updatedDay.hasBreak = value
      } else if (field.includes('morning_session')) {
        const sessionField = field.split('.')[1]
        updatedDay.morning_session = {
          ...updatedDay.morning_session,
          [sessionField]: value
        }
      } else if (field.includes('evening_session')) {
        const sessionField = field.split('.')[1]
        updatedDay.evening_session = {
          ...updatedDay.evening_session,
          [sessionField]: value
        }
      } else {
        updatedDay[field] = value
      }

      return {
        ...prev,
        [day]: updatedDay,
      }
    })
  }

  const fill24HourTimes = () => {
    if (activeTab === 'normal') {
      const updated24HourTimes = Object.keys(workingHours).reduce((acc, day) => {
        acc[day] = { open: '00:00', close: '23:59', isHoliday: false }
        return acc
      }, {})
      setWorkingHours(updated24HourTimes)
    } else {
      const updated24HourTimes = Object.keys(workingHoursClinic).reduce((acc, day) => {
        acc[day] = {
          morning_session: { open: '00:00', close: '23:59' },
          evening_session: { open: '00:00', close: '23:59' },
          isHoliday: false,
          hasBreak: false,
        }
        return acc
      }, {})
      setWorkingHoursClinic(updated24HourTimes)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Convert working hours to API format
      const workingHoursApiFormat = Object.entries(workingHours).map(([day, hours]) => ({
        day,
        opening_time: hours.open,
        closing_time: hours.close,
        is_holiday: hours.isHoliday
      }))

      const workingHoursClinicApiFormat = Object.entries(workingHoursClinic).map(([day, hours]) => ({
        day,
        morning_session: hours.morning_session,
        evening_session: hours.evening_session,
        is_holiday: hours.isHoliday,
        hasBreak: hours.hasBreak
      }))

      // Create FormData for file upload
      const formData = new FormData()
      
      // Append basic data
      formData.append('name', editData.name)
      formData.append('email', editData.email)
      formData.append('phone', editData.phone)
      formData.append('emergencyContact', editData.emergencyContact)
      formData.append('address', editData.address)
      formData.append('latitude', editData.latitude)
      formData.append('longitude', editData.longitude)
      formData.append('about', editData.about)
      formData.append('type', editData.type)
      formData.append('working_hours', JSON.stringify(activeTab === 'normal' ? workingHoursApiFormat : []))
      formData.append('working_hours_clinic', JSON.stringify(activeTab === 'clinic' ? workingHoursClinicApiFormat : []))
      formData.append('hasBreakSchedule', activeTab === 'clinic' ? 'true' : 'false')

      // Append specialties if they exist
      if (hospitalData.specialties && hospitalData.specialties.length > 0) {
        formData.append('specialties', JSON.stringify(hospitalData.specialties))
      }

      // Append image if selected
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      const result = await updateHospital({
        id: hospitalId,
        data: formData,
      }).unwrap()

      setHospitalData(editData)
      setIsEditing(false)
      setSelectedImage(null)
      refetch()
      toast.success("Profile updated!")
    } catch (error) {
      const msg = error?.data?.message || "Server error!"
      toast.error(msg)
      console.error('Update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(hospitalData)
    setSelectedImage(null)
    // Reset image preview to original
    if (hospitalData.image?.imageUrl) {
      setImagePreview(hospitalData.image.imageUrl)
    } else {
      setImagePreview('')
    }
  }

  const handleInputChange = (field, value) => {
    setEditData({ ...editData, [field]: value })
  }

  // Format working hours for display
  const formatWorkingHours = () => {
    if (hospitalData.working_hours_clinic && hospitalData.working_hours_clinic.length > 0) {
      return hospitalData.working_hours_clinic.map(day => {
        if (day.is_holiday) {
          return `${day.day}: Closed`
        }
        const morning = day.morning_session ? `${day.morning_session.open || 'N/A'} - ${day.morning_session.close || 'N/A'}` : 'N/A'
        const evening = day.evening_session ? `${day.evening_session.open || 'N/A'} - ${day.evening_session.close || 'N/A'}` : 'N/A'
        return `${day.day}: ${morning} (Morning), ${evening} (Evening)`
      }).join('\n')
    } else if (hospitalData.working_hours && hospitalData.working_hours.length > 0) {
      return hospitalData.working_hours.map(day => {
        if (day.is_holiday) {
          return `${day.day}: Closed`
        }
        return `${day.day}: ${day.opening_time || 'N/A'} - ${day.closing_time || 'N/A'}`
      }).join('\n')
    }
    return 'No working hours set'
  }

  // Format specialties for display
  const formatSpecialties = () => {
    return hospitalData.specialties?.map(spec => spec.name).join(', ') || 'No specialties added'
  }

  // Render Normal Hospital Working Hours
  const renderNormalWorkingHours = () => (
    <div className="space-y-3">
      {Object.entries(workingHours).map(([day, hours]) => (
        <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
          <div className="w-full sm:w-24">
            <span className="text-sm font-medium text-green-700">{day}</span>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Open Time */}
            <div className="relative">
              <label className="block text-xs text-green-600 mb-1 sm:sr-only">Open Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={hours.isHoliday}
                />
              </div>
            </div>

            {/* Close Time */}
            <div className="relative">
              <label className="block text-xs text-green-600 mb-1 sm:sr-only">Close Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={hours.isHoliday}
                />
              </div>
            </div>

            {/* Holiday Checkbox */}
            <div className="flex items-center justify-start sm:justify-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours.isHoliday}
                  onChange={(e) => handleWorkingHoursChange(day, 'isHoliday', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-green-700 select-none">Holiday</span>
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render Clinic Working Hours
  const renderClinicWorkingHours = () => (
    <div className="space-y-4">
      {Object.entries(workingHoursClinic).map(([day, hours]) => (
        <div key={day} className="p-4 border border-green-200 rounded-lg bg-green-50">
          {/* Day Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <span className="text-sm font-medium text-green-700">{day}</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hours.isHoliday}
                  onChange={(e) => handleClinicHoursChange(day, 'isHoliday', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-green-700 select-none">Holiday</span>
              </label>
            </div>
          </div>

          {!hours.isHoliday && (
            <div className="space-y-4">
              {/* Morning Session */}
              <div>
                <h4 className="text-xs font-medium text-green-600 mb-2">Morning Session</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-green-500 mb-1">Open Time</label>
                    <input
                      type="time"
                      value={hours.morning_session.open}
                      onChange={(e) => handleClinicHoursChange(day, 'morning_session.open', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-green-500 mb-1">Close Time</label>
                    <input
                      type="time"
                      value={hours.morning_session.close}
                      onChange={(e) => handleClinicHoursChange(day, 'morning_session.close', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Evening Session */}
              <div>
                <h4 className="text-xs font-medium text-green-600 mb-2">Evening Session</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-green-500 mb-1">Open Time</label>
                    <input
                      type="time"
                      value={hours.evening_session.open}
                      onChange={(e) => handleClinicHoursChange(day, 'evening_session.open', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-green-500 mb-1">Close Time</label>
                    <input
                      type="time"
                      value={hours.evening_session.close}
                      onChange={(e) => handleClinicHoursChange(day, 'evening_session.close', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Break Schedule */}
              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hours.hasBreak}
                    onChange={(e) => handleClinicHoursChange(day, 'hasBreak', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-green-700 select-none">Has Break Between Sessions</span>
                </label>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading hospital data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error loading hospital data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Edit/Save/Cancel Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Hospital Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your hospital information and settings</p>
        </div>
        
        {/* Show Edit button when NOT editing, Show Save/Cancel when editing */}
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-green-600 hover:bg-green-700 cursor-pointer">
            <Edit2 size={20} className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className={'cursor-pointer'} 
              onClick={handleCancel} 
              disabled={loading || isUpdating}
            >
              <X size={18} className="mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || isUpdating} 
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              <Save size={18} className="mr-2" />
              {loading || isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Logo and Basic Info */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Hospital Information</CardTitle>
          <CardDescription>Basic details about your hospital</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-20 h-20 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Hospital" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-foreground text-4xl font-bold">
                    {hospitalData.name?.charAt(0) || 'H'}
                  </span>
                )}
              </div>
              
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera size={16} />
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hospital Name</label>
                  <Input
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-input border-border"
                    placeholder="Enter hospital name"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold">{hospitalData.name}</p>
                  <p className="text-muted-foreground text-sm">{hospitalData.type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Section (when editing) */}
          {isEditing && selectedImage && (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <p className="text-sm text-green-700 mb-2">
                New image selected: {selectedImage.name}
              </p>
              <div className="flex items-center gap-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-16 h-16 object-cover rounded"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedImage(null)
                    if (hospitalData.image?.imageUrl) {
                      setImagePreview(hospitalData.image.imageUrl)
                    } else {
                      setImagePreview('')
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Hospital Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Building size={16} /> Hospital Type
            </label>
            {isEditing ? (
              <select
                value={editData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select hospital type</option>
                <option value="Allopathy">Allopathy</option>
                <option value="Homeopathy">Homeopathy</option>
                <option value="Ayurveda">Ayurveda</option>
                <option value="Unani">Unani</option>
                <option value="Physiotherapy">Physiotherapy</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-foreground">{hospitalData.type}</p>
            )}
          </div>

          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Mail size={16} /> Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-input border-border"
                  placeholder="Enter email address"
                />
              ) : (
                <p className="text-foreground">{hospitalData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Phone size={16} /> Phone
              </label>
              {isEditing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-input border-border"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-foreground">{hospitalData.phone}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle size={16} /> Emergency Contact
              </label>
              {isEditing ? (
                <Input
                  value={editData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="bg-input border-border"
                  placeholder="Enter emergency contact"
                />
              ) : (
                <p className="text-foreground">{hospitalData.emergencyContact}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MapPin size={16} /> Address
              </label>
              {isEditing ? (
                <Textarea
                  value={editData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="bg-input border-border"
                  placeholder="Enter hospital address"
                />
              ) : (
                <p className="text-foreground text-sm">{hospitalData.address}</p>
              )}
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              {isEditing ? (
                <Input
                  value={editData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  className="bg-input border-border text-sm"
                  placeholder="Enter latitude"
                />
              ) : (
                <p className="text-foreground text-sm">{hospitalData.latitude}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              {isEditing ? (
                <Input
                  value={editData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  className="bg-input border-border text-sm"
                  placeholder="Enter longitude"
                />
              ) : (
                <p className="text-foreground text-sm">{hospitalData.longitude}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>About Hospital</CardTitle>
          <CardDescription>Hospital description and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <Textarea
              value={editData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              rows={5}
              className="bg-input border-border"
              placeholder="Enter hospital description and services"
            />
          ) : (
            <div className="space-y-4">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {hospitalData.about || 'No description available'}
              </p>
              
              {/* Specialties */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialties & Services</label>
                <p className="text-foreground text-sm">
                  {formatSpecialties()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Working Hours Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} /> Working Hours
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Edit your working hours' : 'Operating hours and schedule'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <label className="text-lg font-semibold">
                  Working Hours
                </label>
                <Button
                  onClick={fill24HourTimes}
                  variant="outline"
                  type="button"
                >
                  Set 24/7 Hours
                </Button>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  <button
                    type="button"
                    className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === 'normal'
                        ? 'border-b-2 border-green-600 text-green-600 bg-green-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('normal')}
                  >
                    <Building size={16} className="mr-2" />
                    Normal Hospital
                  </button>
                  <button
                    type="button"
                    className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      activeTab === 'clinic'
                        ? 'border-b-2 border-green-600 text-green-600 bg-green-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('clinic')}
                  >
                    <Building size={16} className="mr-2" />
                    Clinic
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {activeTab === 'normal' ? renderNormalWorkingHours() : renderClinicWorkingHours()}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {formatWorkingHours().split('\n').map((line, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-foreground text-sm font-medium w-24">
                    {line.split(':')[0]}:
                  </span>
                  <span className="text-foreground text-sm flex-1 text-right">
                    {line.split(':').slice(1).join(':').trim()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{data?.data?.booking?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{data?.data?.specialties?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Specialties</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{data?.data?.reviews?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}