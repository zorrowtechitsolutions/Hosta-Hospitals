'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, X, Check, Eye, EyeOff, Trash2, AlertTriangle, RotateCcw } from 'lucide-react'
import { useDeleteHospitalMutation, useGetAHospitalQuery, useLoginHospitalMutation, useOtpHospitalMutation, useUpdateHospitalMutation, useRecoveryAccountHospitalMutation } from '@/app/service/hospital'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import io from "socket.io-client";

const socket = io("https://www.zorrowtek.in");

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeTab, setActiveTab] = useState('general')
  const navigate = useNavigate();

  const hospitalId = localStorage.getItem("adminId"); 

  const { 
    data, 
    isLoading, 
    error,
    refetch
  } = useGetAHospitalQuery(hospitalId)
  
  const [updateHospital, { isLoading: isUpdating }] = useUpdateHospitalMutation()
  const [otpHospital, { isLoading: isSendingOtp }] = useOtpHospitalMutation()
  const [loginHospital, { isLoading: isLoggingIn }] = useLoginHospitalMutation()
  const [deleteHospital, { isLoading: isDelete }] = useDeleteHospitalMutation()
  const [recoveryAccountHospital, { isLoading: isRecovery }] = useRecoveryAccountHospitalMutation()

  const [settings, setSettings] = useState({
    hospitalName: '',
    email: '',
  })

  const [editSettings, setEditSettings] = useState(settings)

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  })
  
  const [passwordMessage, setPasswordMessage] = useState('')

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Delete Account States
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isAccountDeleted, setIsAccountDeleted] = useState(false)
  const [deleteDate, setDeleteDate] = useState('')

  // Refs for OTP inputs
  const otpRefs = useRef([])


    useEffect(() => {
      socket.on("hospitalDelete", (data) => {
        const currentId = localStorage.getItem("adminId");
  
        if (currentId === data.hospitalId) {     
       localStorage.removeItem("adminId")
       navigate("/"); 
        }
        
      });
  
      return () => socket.off("hospitalDelete");
    }, []);


  // Initialize settings when data is loaded
  useEffect(() => {
    if (data?.data) {
      const hospitalData = data.data
      setSettings({
        hospitalName: hospitalData.name || '',
        email: hospitalData.email || '',
      })
      // Pre-fill phone number if available
      if (hospitalData.phone) {
        setPhoneNumber(hospitalData.phone)
      }
      
      // Check if account is deleted
      if (hospitalData.deleteDate) {
        setIsAccountDeleted(true)
        setDeleteDate(hospitalData.deleteDate)
      }
    }
  }, [data])

  // Update editSettings when settings change
  useEffect(() => {
    setEditSettings(settings)
  }, [settings])

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Focus first OTP input when modal opens
  useEffect(() => {
    if (showOtpModal && isOtpSent && otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    }
  }, [showOtpModal, isOtpSent])

  const handleEdit = () => {
    setIsEditing(true)
    setEditSettings(settings)
  }

  const handleSave = async () => {
    if (!editSettings.hospitalName || !editSettings.email) {
      toast.warning('Please fill in all fields!')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', editSettings.hospitalName)
      formData.append('email', editSettings.email)

      const result = await updateHospital({
        id: hospitalId,
        data: formData
      }).unwrap()

      setSettings(editSettings)
      setIsEditing(false)
      setSaveMessage('Settings updated successfully')
      toast.success('Settings updated successfully!');
      refetch()
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg);
    } finally {
      setLoading(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditSettings(settings)
    setSaveMessage('')
  }

  const handlePasswordChangeClick = () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.warning('Please fill in all password fields!');
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('New passwords do not match!');
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.warning('New password must be at least 8 characters!');
      return
    }

    setShowOtpModal(true)
  }

  const sendOtp = async () => {
    if (!phoneNumber) {
      toast.warning('Please enter your phone number!')
      return
    }

    try {
      setOtpError('')
      const result = await loginHospital({
        phone: phoneNumber
      }).unwrap()

      setIsOtpSent(true)
      setCountdown(60)
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg);
    }
  }

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError('')

    if (value && index < 5) {
      const nextInput = otpRefs.current[index + 1]
      if (nextInput) nextInput.focus()
    }

    if (value && index === 5) {
      const otpString = newOtp.join('')
      if (otpString.length === 6) {
        verifyOtpAndUpdatePassword()
      }
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const prevInput = otpRefs.current[index - 1]
        if (prevInput) {
          prevInput.focus()
          const newOtp = [...otp]
          newOtp[index - 1] = ''
          setOtp(newOtp)
        }
      } else if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const pastedNumbers = pastedData.replace(/\D/g, '').split('').slice(0, 6)
    
    if (pastedNumbers.length === 6) {
      const newOtp = [...otp]
      pastedNumbers.forEach((num, index) => {
        newOtp[index] = num
      })
      setOtp(newOtp)
      setOtpError('')
      
      const lastInput = otpRefs.current[6]
      if (lastInput) lastInput.focus()
      
      setTimeout(() => {
        verifyOtpAndUpdatePassword()
      }, 100)
    }
  }

  const verifyOtpAndUpdatePassword = async () => {
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      return
    }

    setLoading(true)
    try {
      const verifyResult = await otpHospital({
        phone: phoneNumber,
        otp: otpString
      }).unwrap()

      const formData = new FormData()
      formData.append('newPassword', passwordData.newPassword)

      const updateResult = await updateHospital({
        id: hospitalId,
        data: formData
      }).unwrap()

      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      })
      setOtp(['', '', '', '', '', ''])
      setIsOtpSent(false)
      setShowOtpModal(false)
      setOtpError('')
      setCountdown(0)
      setPasswordMessage('Password updated successfully')
      
      refetch()
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg);
    } finally {
      setLoading(false)
      setTimeout(() => setPasswordMessage(''), 3000)
    }
  }

  const resendOtp = () => {
    if (countdown === 0) {
      setOtp(['', '', '', '', '', ''])
      setOtpError('')
      sendOtp()
      
      setTimeout(() => {
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus()
        }
      }, 100)
    }
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setOtp(['', '', '', '', '', ''])
    setIsOtpSent(false)
    setOtpError('')
    setCountdown(0)
  }

  // Delete Account Functions
  const handleDeleteAccount = async () => {
    if (deleteConfirm.toLowerCase() !== 'delete') {
      toast.warning('Please type "delete" to confirm account deletion');
      return;
    }

    try {
      const result = await deleteHospital(hospitalId).unwrap();
      toast.success('Account deletion initiated successfully! Your account will be permanently deleted in 10 days.');
      setShowDeleteModal(false);
      setDeleteConfirm('');
      setIsAccountDeleted(true);
      setDeleteDate(result?.data?.deleteDate || new Date().toISOString());
      
      // Don't remove from localStorage - keep user logged in for recovery
      refetch();
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg);
    }
  };

  // Recovery Account Function
  const handleRecoveryAccount = async () => {
    try {
      const result = await recoveryAccountHospital(hospitalId).unwrap();
      toast.success('Account recovery initiated successfully! Your account has been restored.');
      setIsAccountDeleted(false);
      setDeleteDate('');
      refetch();
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteConfirm('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirm('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Calculate remaining days until permanent deletion
  const getRemainingDays = () => {
    if (!deleteDate) return 0;
    const deleteDateTime = new Date(deleteDate).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = deleteDateTime + (10 * 24 * 60 * 60 * 1000) - currentTime; // 10 days from delete date
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

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
      <div>
        <h1 className="text-3xl font-bold text-green-800">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings</p>
      </div>

      {/* Account Deletion Banner */}
      {isAccountDeleted && (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Account Scheduled for Deletion
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your account is scheduled for permanent deletion on {formatDate(deleteDate)} 
                  ({getRemainingDays()} days remaining). You can recover your account during this period.
                </p>
              </div>
            </div>
            <Button
              onClick={handleRecoveryAccount}
              disabled={isRecovery}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              <RotateCcw size={16} className="mr-2" />
              {isRecovery ? 'Recovering...' : 'Recover Account'}
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Change Password
        </button>
        <button
          onClick={() => setActiveTab('delete')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'delete'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Delete Account
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <>
          {saveMessage && (
            <div className="p-4 rounded-lg bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 flex items-center gap-2">
              <Check size={20} />
              {saveMessage}
            </div>
          )}

          <Card className="border-border max-w-2xl">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your hospital account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hospital Name</label>
                {isEditing ? (
                  <Input
                    value={editSettings.hospitalName}
                    onChange={(e) =>
                      setEditSettings({ ...editSettings, hospitalName: e.target.value })
                    }
                    className="bg-input border-border"
                    placeholder="Enter hospital name"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted text-foreground">
                    {settings.hospitalName || 'Not set'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editSettings.email}
                    onChange={(e) =>
                      setEditSettings({ ...editSettings, email: e.target.value })
                    }
                    className="bg-input border-border"
                    placeholder="Enter email address"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted text-foreground">
                    {settings.email || 'Not set'}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className={'cursor-pointer'} onClick={handleCancel} disabled={loading || isUpdating}>
                    <X size={18} className="mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || isUpdating}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    <Save size={18} className="mr-2" />
                    {loading || isUpdating ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              ) : (
                <Button onClick={handleEdit} className="bg-green-600 hover:bg-green-700 cursor-pointer">
                  Edit Settings
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-border max-w-2xl">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                <p className="text-foreground">{formatDate(data?.data?.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-foreground">{formatDate(data?.data?.updatedAt)}</p>
              </div>
              {isAccountDeleted && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Deletion Date</p>
                  <p className="text-red-600 font-medium">{formatDate(deleteDate)}</p>
                  <p className="text-sm text-red-600">
                    {getRemainingDays()} days remaining until permanent deletion
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <>
          {passwordMessage && (
            <div className="p-4 rounded-lg bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 flex items-center gap-2">
              <Check size={20} />
              {passwordMessage}
            </div>
          )}

          <Card className="border-border max-w-2xl">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="Enter new password (min 8 characters)"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="bg-input border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="bg-input border-border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className={'cursor-pointer'}
                  onClick={() => setPasswordData({ newPassword: '', confirmPassword: '' })}
                  disabled={loading || isUpdating}
                >
                  Clear
                </Button>
                <Button
                  onClick={handlePasswordChangeClick}
                  disabled={loading || isUpdating}
                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                  <Save size={18} className="mr-2" />
                  Update Password
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Password must be at least 8 characters long and should include a mix of uppercase, lowercase, numbers, and symbols for better security.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Account Tab */}
      {activeTab === 'delete' && (
        <Card className="border-border max-w-2xl border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle size={24} />
              Delete Account
            </CardTitle>
            <CardDescription className="text-red-600/80">
              {isAccountDeleted ? 'Account Recovery' : 'Permanently delete your hospital account'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAccountDeleted ? (
              // Recovery View
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Check className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Account Scheduled for Deletion
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your account is currently scheduled for deletion. You can recover it during the 10-day grace period.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled Deletion Date</p>
                  <p className="text-lg font-semibold text-red-600">{formatDate(deleteDate)}</p>
                  <p className="text-sm text-red-600">
                    {getRemainingDays()} days remaining until permanent deletion
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleRecoveryAccount}
                    disabled={isRecovery}
                    className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    <RotateCcw size={18} className="mr-2" />
                    {isRecovery ? 'Recovering Account...' : 'Recover My Account'}
                  </Button>
                </div>
              </div>
            ) : (
              // Delete View
              <>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Important: Account Deletion Information
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                        <li>This account will be temporarily deleted and permanently removed after 10 days</li>
                        <li>During this 10-day period, you can recover your account</li>
                        <li>After 10 days, your account and all associated data will be permanently deleted</li>
                        <li>Once permanently deleted, you can register again with the same credentials</li>
                        <li>All your booking data, patient records, and hospital information will be lost</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> This action cannot be undone after the 10-day grace period. 
                    Please make sure you have exported any important data before proceeding.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={openDeleteModal}
                    variant="destructive"
                    className="w-full cursor-pointer"
                    disabled={isDelete}
                  >
                    <Trash2 size={18} className="mr-2" />
                    {isDelete ? 'Deleting Account...' : 'Delete My Account'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Verify Your Identity</h3>
            
            {!isOtpSent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className={'cursor-pointer'} onClick={closeOtpModal}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={sendOtp} 
                    disabled={isLoggingIn} 
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    {isLoggingIn ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground dark:text-gray-300">
                  Enter the 6-digit OTP sent to <span className="font-semibold text-gray-900 dark:text-white">{phoneNumber}</span>
                </p>
                
                <div 
                  className="flex justify-center gap-2 mb-4"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el
                      }}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary focus:ring-1 focus:ring-primary"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-sm text-red-500 text-center font-medium">{otpError}</p>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={resendOtp}
                      disabled={countdown > 0}
                      className="text-sm cursor-pointer"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </Button>
                    
                    <Button
                      onClick={verifyOtpAndUpdatePassword}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 cursor-pointer"
                    >
                      {loading ? 'Verifying...' : 'Verify & Update'}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={closeOtpModal}
                    className="w-full mt-2 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full border border-red-200 dark:border-red-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Delete Account</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action is irreversible after 10 days</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Are you sure you want to delete your account?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Your account will be temporarily deleted and permanently removed after 10 days.
                  You can recover it during this period.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type <span className="font-mono text-red-600">"delete"</span> to confirm:
                </label>
                <Input
                  type="text"
                  placeholder='Type "delete" to confirm'
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="flex-1 cursor-pointer"
                  disabled={isDelete}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="flex-1 cursor-pointer"
                  disabled={isDelete || deleteConfirm.toLowerCase() !== 'delete'}
                >
                  {isDelete ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}