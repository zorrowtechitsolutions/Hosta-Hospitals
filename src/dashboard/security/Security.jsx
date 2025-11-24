'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, Trash2, AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function SecurityPage() {
  const [showPasswords, setShowPasswords] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.warning('Please fill in all password fields!');
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('New passwords do not match!');
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.warning('Password must be at least 8 characters long!');
      return
    }

    setLoading(true)
    setTimeout(() => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setSuccessMessage('Password updated successfully')
      setLoading(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    }, 500)
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Redirect to login
      window.location.href = '/'
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground mt-2">Manage your account security and privacy</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200 flex items-center gap-2">
          <Check size={20} />
          {successMessage}
        </div>
      )}

      {/* Change Password Section */}
      <Card className="border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} /> Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <div className="relative">
              <Input
                type={showPasswords ? 'text' : 'password'}
                name="currentPassword"
                placeholder="Enter your current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="bg-input border-border pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <Input
                type={showPasswords ? 'text' : 'password'}
                name="newPassword"
                placeholder="Enter your new password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="bg-input border-border pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showPasswords ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="bg-input border-border pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-border max-w-2xl">
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p className="font-medium">Enable 2FA</p>
              <p className="text-sm text-muted-foreground">Use your phone to verify logins</p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-border max-w-2xl">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">Chrome on macOS</p>
                <p className="text-xs text-muted-foreground mt-1">IP: 192.168.1.1 • Today</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-border max-w-2xl border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your hospital account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-destructive bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              This action cannot be undone. All hospital data and records will be permanently deleted.
            </AlertDescription>
          </Alert>

          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Account
            </Button>
          ) : (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive space-y-4">
              <p className="text-sm font-medium">
                Are you sure? This will permanently delete your hospital account and all associated data.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-destructive hover:bg-destructive/90 text-white"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
