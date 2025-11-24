'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useLoginHospitalEmailMutation } from '@/app/service/hospital'
import { toast } from 'sonner'

export function SignIn({ onSwitchToSignUp }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [loginHospital, { isLoading: isLoggingIn }] = useLoginHospitalEmailMutation()

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!email || !password) {
    setError('Please fill in all fields');
    return;
  }

  try {
    const result = await loginHospital({ email, password }).unwrap();

    if (result && result.status === "Success") {
      // Store data correctly
      localStorage.setItem("adminId", result.data._id);
  
      toast.success("Login successful!");

window.history.replaceState(null, "", "/dashboard");
navigate("/dashboard", { replace: true });
      
    } 

  } catch (error) {
    const msg = error?.data?.message || "Invalid email or password";
    setError(msg);
    toast.error(msg);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="border-border shadow-lg w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Hospital Admin</CardTitle>
          <CardDescription className="text-center">
            Sign in to your hospital management account
            <br/>
            <span className="text-xs text-muted-foreground mt-2 block">
              {error ? 'Login failed - check credentials' : 'Enter your email and password'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="hospital@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                required
                className="bg-input border-border"
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  required
                  className="bg-input border-border pr-10"
                  disabled={isLoggingIn}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoggingIn}
                >
                  {showPassword ? <EyeOff size={18} className='cursor-pointer' /> : <Eye size={18} className='cursor-pointer' />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoggingIn} 
              className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/sign-up')} 
              className="text-green-600 hover:underline font-medium cursor-pointer"
              disabled={isLoggingIn}
            >
              Sign Up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}