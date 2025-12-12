'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Hospital, Mail, Phone, MapPin, Lock, Crosshair, Building } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAddAHospitalMutation } from '@/app/service/hospital'
import { toast } from 'sonner'

export function SignUp({ onSwitchToSignIn }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [errors, setErrors] = useState({})
  const [activeTab, setActiveTab] = useState('normal') // 'normal' or 'clinic'
  const router = useNavigate()

  const [addAHospital, { isLoading: isAddingHospital }] = useAddAHospitalMutation()

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    email: '',
    mobile: '',
    address: '',
    latitude: '',
    longitude: '',
    password: '',
    confirmPassword: '',
  })

  // Normal Hospital Working Hours
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'name' ? value.toUpperCase() : 
              name === 'email' ? value.toLowerCase() : value
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Hospital name is required'
    if (!formData.type) newErrors.type = 'Hospital type is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required'
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits'
    if (!formData.address) newErrors.address = 'Address is required'
    if (!formData.latitude) newErrors.latitude = 'Latitude is required'
    if (!formData.longitude) newErrors.longitude = 'Longitude is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          }))
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Unable to get your location. Please enter manually.')
          setIsGettingLocation(false)
        }
      )
    } else {
      toast.warning('Geolocation is not supported by your browser!');
      setIsGettingLocation(false)
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const requestData = {
        ...formData,
        hasBreakSchedule: activeTab === 'clinic',
      }

      // Add working hours based on active tab
      if (activeTab === 'normal') {
        requestData.workingHours = workingHours
      } else {
        requestData.workingHoursClinic = workingHoursClinic
      }

      // Remove confirmPassword from the request
      delete requestData.confirmPassword

      const result = await addAHospital({ data: requestData }).unwrap()      
      
      if (result.status == 200) {
        
        // Redirect to dashboard or login page
        router('/signin-otp')
        toast.success('Registration successful!');
      }
    } catch (error) {
         const msg = error?.data?.message || "Server error!";
       toast.error(msg);
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="border-border shadow-lg w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Hospital Account</CardTitle>
          <CardDescription className="text-center">
            Register your hospital to get started with our management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information - Same as before */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hospital Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Hospital Name
                </label>
                <div className="relative">
                  <Hospital className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter hospital name"
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Hospital Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-1">
                  Hospital Type
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                </div>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="pl-10"
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>
            </div>

            {/* Address and Coordinates - Same as before */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter hospital address"
                    rows={4}
                  />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium mb-1">
                    Latitude
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="Enter latitude"
                      className="pl-10"
                    />
                  </div>
                  {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                </div>
                
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium mb-1">
                    Longitude
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="Enter longitude"
                      className="pl-10"
                    />
                  </div>
                  {errors.longitude && <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>}
                </div>
              </div>
            </div>

            {/* Location Button */}
            <div>
              <Button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="w-full"
              >
                {isGettingLocation ? (
                  "Getting Location..."
                ) : (
                  <>
                    <Crosshair className="mr-2" size={18} />
                    Get Current Location
                  </>
                )}
              </Button>
            </div>

            {/* Working Hours Section with Tabs */}
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

            {/* Password Fields - Same as before */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} className='cursor-pointer' /> : <Eye size={18} className='cursor-pointer' />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} className='cursor-pointer' /> : <Eye size={18} className='cursor-pointer' />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={loading || isAddingHospital} 
              className="w-full cursor-pointer bg-green-600 hover:bg-green-700"
            >
              {loading || isAddingHospital ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <button onClick={() => router('sign-in')} className="text-green-600 hover:underline font-medium cursor-pointer">
              Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}