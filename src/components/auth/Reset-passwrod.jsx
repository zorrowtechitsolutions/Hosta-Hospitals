// // 'use client'

// // import { useState, useRef, useEffect } from 'react'
// // import { Input } from '@/components/ui/input'
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// // import { Link, useNavigate } from 'react-router-dom'
// // import { Button } from '../ui/button'
// // import { useLoginHospitalMutation, useOtpHospitalMutation, useResetPasswordMutation } from '@/app/service/hospital'
// // import { toast } from 'sonner'

// // export function ResetPassword({ onSwitchToSignUp }) {
// //   const [phone, setPhone] = useState('')
// //   const [otp, setOtp] = useState(['', '', '', '', '', ''])
// //   const [showOtpInput, setShowOtpInput] = useState(false)
// //   const [error, setError] = useState('')
// //   const [countdown, setCountdown] = useState(0)
// //   const [loading, setLoading] = useState(false)
// //   const navigate = useNavigate()

// //   const [otpHospital, { isLoading: isVerifyingOtp }] = useOtpHospitalMutation()
// //   const [loginHospital, { isLoading: isSendingOtp }] = useLoginHospitalMutation()
// //     const [resetPassword, { isLoading: isSendingResetPassword }] = useResetPasswordMutation()


// //   // Refs for OTP inputs
// //   const otpRefs = useRef([])

// //   // Initialize OTP refs
// //   useEffect(() => {
// //     otpRefs.current = otpRefs.current.slice(0, 6)
// //   }, [])

// //   // Countdown timer
// //   useEffect(() => {
// //     if (countdown > 0) {
// //       const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
// //       return () => clearTimeout(timer)
// //     }
// //   }, [countdown])

// //   // Focus first OTP input when OTP input is shown
// //   useEffect(() => {
// //     if (showOtpInput && otpRefs.current[0]) {
// //       setTimeout(() => {
// //         otpRefs.current[0]?.focus()
// //       }, 100)
// //     }
// //   }, [showOtpInput])

// //   const validatePhone = (phoneNumber) => {
// //     const phoneRegex = /^[6-9]\d{9}$/ // Indian phone number format
// //     return phoneRegex.test(phoneNumber)
// //   }

// //   const handleSendOtp = async (e) => {
// //     e?.preventDefault()
// //     setError('')
    
// //     if (!phone) {
// //       setError('Please enter your phone number');
// //       toast.warning('Please enter your phone number!');
// //       return
// //     }

// //     if (!validatePhone(phone)) {
// //       setError('Please enter a valid 10-digit phone number');
// //       toast.warning('Please enter a valid 10-digit phone number!');
// //       return
// //     }

// //     setLoading(true)
// //     try {
// //       const result = await loginHospital({ phone }).unwrap()       
// //       // Set showOtpInput to true regardless of API response structure
// //       setShowOtpInput(true)
// //       setCountdown(60)
// //       toast.success('OTP sent successfully!');
      
// //     } catch (error) {
// //        const msg = error.response?.data?.message || "Server error!";
// //        toast.error(msg);
      
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleOtpChange = (value, index) => {
// //     if (!/^\d?$/.test(value)) return // Only allow digits

// //     const newOtp = [...otp]
// //     newOtp[index] = value
// //     setOtp(newOtp)
// //     setError('')

// //     // Auto-focus next input
// //     if (value && index < 5) {
// //       const nextInput = otpRefs.current[index + 1]
// //       if (nextInput) nextInput.focus()
// //     }

// //     // Auto-submit when all fields are filled
// //     const isAllFilled = newOtp.every(digit => digit !== '')
// //     if (isAllFilled) {
// //       handleVerifyOtp()
// //     }
// //   }

// //   const handleOtpKeyDown = (e, index) => {
// //     if (e.key === 'Backspace') {
// //       if (!otp[index] && index > 0) {
// //         // Move to previous input on backspace if current is empty
// //         const prevInput = otpRefs.current[index - 1]
// //         if (prevInput) {
// //           prevInput.focus()
// //           // Clear the previous input
// //           const newOtp = [...otp]
// //           newOtp[index - 1] = ''
// //           setOtp(newOtp)
// //         }
// //       } else if (otp[index]) {
// //         // Clear current input on backspace
// //         const newOtp = [...otp]
// //         newOtp[index] = ''
// //         setOtp(newOtp)
// //       }
// //     }
// //   }

// //   const handleOtpPaste = (e) => {
// //     e.preventDefault()
// //     const pastedData = e.clipboardData.getData('text')
// //     const pastedNumbers = pastedData.replace(/\D/g, '').split('').slice(0, 6)
    
// //     if (pastedNumbers.length === 6) {
// //       setOtp(pastedNumbers)
// //       setError('')
      
// //       // Focus last input after paste
// //       const lastInput = otpRefs.current[5]
// //       if (lastInput) lastInput.focus()
      
// //       // Auto-submit after paste
// //       setTimeout(() => {
// //         handleVerifyOtp()
// //       }, 100)
// //     }
// //   }

// //   const handleVerifyOtp = async () => {

// //       const otpString = otp.join('')
    
// //     if (otpString.length !== 6) {
// //       // setError('Please enter complete 6-digit OTP')
// //       // toast.warning('Please enter complete 6-digit OTP');
// //       return
// //     }


// //     setLoading(true)
// //     try {
// //       const result = await otpHospital({
// //         phone: phone,
// //         otp: otpString
// //       }).unwrap()
      
// //       if (result && result.status == 200) {
// //       // Store data correctly

// // toast.success("Phone verified successfully!");
     
// // window.history.replaceState(null, "", "/dashboard");
// // navigate("/dashboard", { replace: true });
// //       } else {
// //         setError(result.message || 'Invalid OTP')
// //         // Clear OTP on error
// //         setOtp(['', '', '', '', '', ''])
// //         // Focus first input
// //         if (otpRefs.current[0]) {
// //           otpRefs.current[0].focus()
// //         }
// //       }
// //     } catch (error) {
// //        const msg = error?.data?.message || "Server error!";
// //        toast.error(msg);
// //       setError(error.data?.message || 'Invalid OTP. Please try again.')
// //       // Clear OTP on error
// //       setOtp(['', '', '', '', '', ''])
// //       // Focus first input
// //       if (otpRefs.current[0]) {
// //         otpRefs.current[0].focus()
// //       }
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleResendOtp = () => {
// //     if (countdown === 0) {
// //       // Clear OTP fields when resending
// //       setOtp(['', '', '', '', '', ''])
// //       setError('')
// //       handleSendOtp()
      
// //       // Focus first input after resend
// //       setTimeout(() => {
// //         if (otpRefs.current[0]) {
// //           otpRefs.current[0].focus()
// //         }
// //       }, 100)
// //     }
// //   }

// //   const handleBackToPhone = () => {
// //     setShowOtpInput(false)
// //     setOtp(['', '', '', '', '', ''])
// //     setError('')
// //     setCountdown(0)
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-background p-4">
// //       <Card className="border-border shadow-lg w-full max-w-md">
// //         <CardHeader className="space-y-1">
// //           <div className="flex items-center justify-center mb-4">
// //             <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
// //               <span className="text-primary-foreground font-bold text-lg">H</span>
// //             </div>
// //           </div>
// //           <CardTitle className="text-2xl font-bold text-center">
// //             {showOtpInput ? 'Enter OTP' : 'Hospital Admin'}
// //           </CardTitle>
// //           <CardDescription className="text-center">
// //             {showOtpInput 
// //               ? `Enter OTP sent to ${phone}`
// //               : 'Sign in to your hospital management account'
// //             }
// //             <br/>
// //             <span className="text-xs text-muted-foreground mt-2 block">
// //               {error ? error : showOtpInput ? 'Enter the 6-digit OTP' : 'Enter your phone number'}
// //             </span>
// //           </CardDescription>
// //         </CardHeader>
// //         <CardContent>
// //           {error && (
// //             <div className={`mb-4 p-3 rounded-lg text-sm ${
// //               error.includes('successfully') 
// //                 ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
// //                 : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
// //             }`}>
// //               {error}
// //             </div>
// //           )}

// //           {/* Phone Input Section */}
// //           {!showOtpInput && (
// //             <form onSubmit={handleSendOtp} className="space-y-4">
// //               <div className="space-y-2">
// //                 <label htmlFor="phone" className="text-sm font-medium">
// //                   Phone Number
// //                 </label>
// //                 <Input
// //                   id="phone"
// //                   type="tel"
// //                   placeholder="Enter 10-digit phone number"
// //                   value={phone}
// //                   onChange={(e) => {
// //                     setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
// //                     setError('')
// //                   }}
// //                   required
// //                   className="bg-input border-border"
// //                   disabled={loading || isSendingOtp}
// //                 />
// //                 <p className="text-xs text-muted-foreground">
// //                   Enter your registered 10-digit phone number
// //                 </p>
// //               </div>

// //               <Button 
// //                 type="submit" 
// //                 disabled={loading || isSendingOtp} 
// //                 className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
// //               >
// //                 {loading || isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
// //               </Button>
// //             </form>
// //           )}

// //           {/* OTP Input Section */}
// //           {showOtpInput && (
// //             <div className="space-y-4">
// //               <div className="space-y-2">
// //                 <label className="text-sm font-medium block text-center">
// //                   Enter 6-digit OTP
// //                 </label>
// //                 <div 
// //                   className="flex justify-center gap-2 mb-4"
// //                   onPaste={handleOtpPaste}
// //                 >
// //                   {[0, 1, 2, 3, 4, 5].map((index) => (
// //                     <Input
// //                       key={index}
// //                       ref={(el) => (otpRefs.current[index] = el)}
// //                       type="text"
// //                       inputMode="numeric"
// //                       maxLength={1}
// //                       value={otp[index]}
// //                       onChange={(e) => handleOtpChange(e.target.value, index)}
// //                       onKeyDown={(e) => handleOtpKeyDown(e, index)}
// //                       className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary focus:ring-1 focus:ring-primary"
// //                       autoComplete="one-time-code"
// //                       disabled={loading || isVerifyingOtp}
// //                     />
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="flex gap-2">
// //                 <Button
// //                   variant="outline"
// //                   onClick={handleBackToPhone}
// //                   disabled={loading || isVerifyingOtp}
// //                   className="flex-1 cursor-pointer"
// //                 >
// //                   Back
// //                 </Button>
// //                 <Button
// //                   onClick={handleVerifyOtp}
// //                   disabled={loading || isVerifyingOtp}
// //                   className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
// //                 >
// //                   {loading || isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
// //                 </Button>
// //               </div>

// //               <div className="text-center">
// //                 <button
// //                   type="button"
// //                   onClick={handleResendOtp}
// //                   disabled={countdown > 0 || loading}
// //                   className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
// //                 >
// //                   {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
// //                 </button>
// //               </div>
// //             </div>
// //           )}

// //           <div className="mt-6 text-center text-sm">
// //             Don't have an account?{' '}
// //             <button 
// //               onClick={onSwitchToSignUp} 
// //               className="text-green-600 hover:underline font-medium"
// //               disabled={loading}
// //             >
// //               Sign Up
// //             </button>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   )
// // }



// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Link, useNavigate } from 'react-router-dom'
// import { Button } from '../ui/button'
// import { useLoginHospitalMutation, useOtpHospitalMutation, useResetPasswordMutation } from '@/app/service/hospital'
// import { toast } from 'sonner'

// export function ResetPassword({ onSwitchToSignUp }) {
//   const [phone, setPhone] = useState('')
//   const [otp, setOtp] = useState(['', '', '', '', '', ''])
//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [showOtpInput, setShowOtpInput] = useState(false)
//   const [showPasswordInput, setShowPasswordInput] = useState(false)
//   const [error, setError] = useState('')
//   const [countdown, setCountdown] = useState(0)
//   const [loading, setLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const navigate = useNavigate()

//   const [otpHospital, { isLoading: isVerifyingOtp }] = useOtpHospitalMutation()
//   const [loginHospital, { isLoading: isSendingOtp }] = useLoginHospitalMutation()
//   const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation()

//   // Refs for OTP inputs
//   const otpRefs = useRef([])

//   // Initialize OTP refs
//   useEffect(() => {
//     otpRefs.current = otpRefs.current.slice(0, 6)
//   }, [])

//   // Countdown timer
//   useEffect(() => {
//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
//       return () => clearTimeout(timer)
//     }
//   }, [countdown])

//   // Focus first OTP input when OTP input is shown
//   useEffect(() => {
//     if (showOtpInput && otpRefs.current[0]) {
//       setTimeout(() => {
//         otpRefs.current[0]?.focus()
//       }, 100)
//     }
//   }, [showOtpInput])

//   const validatePhone = (phoneNumber) => {
//     const phoneRegex = /^[6-9]\d{9}$/ // Indian phone number format
//     return phoneRegex.test(phoneNumber)
//   }

//   const validatePassword = (password) => {
//     // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
//     return passwordRegex.test(password)
//   }

//   const handleSendOtp = async (e) => {
//     e?.preventDefault()
//     setError('')
    
//     if (!phone) {
//       setError('Please enter your phone number');
//       toast.warning('Please enter your phone number!');
//       return
//     }

//     if (!validatePhone(phone)) {
//       setError('Please enter a valid 10-digit phone number');
//       toast.warning('Please enter a valid 10-digit phone number!');
//       return
//     }

//     setLoading(true)
//     try {
//       const result = await loginHospital({ phone }).unwrap()       
//       setShowOtpInput(true)
//       setCountdown(60)
//       toast.success('OTP sent successfully!');
      
//     } catch (error) {
//       const msg = error.response?.data?.message || "Server error!";
//       toast.error(msg);
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleOtpChange = (value, index) => {
//     if (!/^\d?$/.test(value)) return // Only allow digits

//     const newOtp = [...otp]
//     newOtp[index] = value
//     setOtp(newOtp)
//     setError('')

//     // Auto-focus next input
//     if (value && index < 5) {
//       const nextInput = otpRefs.current[index + 1]
//       if (nextInput) nextInput.focus()
//     }

//     // Auto-submit when all fields are filled
//     const isAllFilled = newOtp.every(digit => digit !== '')
//     if (isAllFilled) {
//       handleVerifyOtp()
//     }
//   }

//   const handleOtpKeyDown = (e, index) => {
//     if (e.key === 'Backspace') {
//       if (!otp[index] && index > 0) {
//         // Move to previous input on backspace if current is empty
//         const prevInput = otpRefs.current[index - 1]
//         if (prevInput) {
//           prevInput.focus()
//           // Clear the previous input
//           const newOtp = [...otp]
//           newOtp[index - 1] = ''
//           setOtp(newOtp)
//         }
//       } else if (otp[index]) {
//         // Clear current input on backspace
//         const newOtp = [...otp]
//         newOtp[index] = ''
//         setOtp(newOtp)
//       }
//     }
//   }

//   const handleOtpPaste = (e) => {
//     e.preventDefault()
//     const pastedData = e.clipboardData.getData('text')
//     const pastedNumbers = pastedData.replace(/\D/g, '').split('').slice(0, 6)
    
//     if (pastedNumbers.length === 6) {
//       setOtp(pastedNumbers)
//       setError('')
      
//       // Focus last input after paste
//       const lastInput = otpRefs.current[5]
//       if (lastInput) lastInput.focus()
      
//       // Auto-submit after paste
//       setTimeout(() => {
//         handleVerifyOtp()
//       }, 100)
//     }
//   }

//   const handleVerifyOtp = async () => {
//     const otpString = otp.join('')
    
//     if (otpString.length !== 6) {
//       return
//     }

//     setLoading(true)
//     try {
//       const result = await otpHospital({
//         phone: phone,
//         otp: otpString
//       }).unwrap()
      
//       if (result && result.status == 200) {
//         toast.success("Phone verified successfully!");
//         setShowPasswordInput(true)
//         setShowOtpInput(false)
//       } else {
//         setError(result.message || 'Invalid OTP')
//         setOtp(['', '', '', '', '', ''])
//         if (otpRefs.current[0]) {
//           otpRefs.current[0].focus()
//         }
//       }
//     } catch (error) {
//       const msg = error?.data?.message || "Server error!";
//       toast.error(msg);
//       setError(error.data?.message || 'Invalid OTP. Please try again.')
//       setOtp(['', '', '', '', '', ''])
//       if (otpRefs.current[0]) {
//         otpRefs.current[0].focus()
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleResetPassword = async (e) => {
//     e.preventDefault()
//     setError('')

//     if (!password || !confirmPassword) {
//       setError('Please fill in all password fields')
//       toast.warning('Please fill in all password fields!')
//       return
//     }

//     if (password !== confirmPassword) {
//       setError('Passwords do not match')
//       toast.warning('Passwords do not match!')
//       return
//     }

//     if (!validatePassword(password)) {
//       setError('Password must be at least 8 characters with uppercase, lowercase, and number')
//       toast.warning('Password must be at least 8 characters with uppercase, lowercase, and number!')
//       return
//     }

//     setLoading(true)
//     try {
//       const result = await resetPassword({
//         phone: phone,
//         password: password
//       }).unwrap()

//       if (result && result.status === 200) {
//         toast.success("Password reset successfully!");
//         // Redirect to login or dashboard
//         setTimeout(() => {
//           window.history.replaceState(null, "", "/dashboard");
//           navigate("/dashboard", { replace: true });
//         }, 1500)
//       } else {
//         setError(result.message || 'Failed to reset password')
//       }
//     } catch (error) {
//       const msg = error?.data?.message || "Server error!";
//       toast.error(msg);
//       setError(error.data?.message || 'Failed to reset password. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleResendOtp = () => {
//     if (countdown === 0) {
//       setOtp(['', '', '', '', '', ''])
//       setError('')
//       handleSendOtp()
      
//       setTimeout(() => {
//         if (otpRefs.current[0]) {
//           otpRefs.current[0].focus()
//         }
//       }, 100)
//     }
//   }

//   const handleBackToPhone = () => {
//     setShowOtpInput(false)
//     setShowPasswordInput(false)
//     setOtp(['', '', '', '', '', ''])
//     setPassword('')
//     setConfirmPassword('')
//     setError('')
//     setCountdown(0)
//   }

//   const handleBackToOtp = () => {
//     setShowPasswordInput(false)
//     setShowOtpInput(true)
//     setPassword('')
//     setConfirmPassword('')
//     setError('')
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <Card className="border-border shadow-lg w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <div className="flex items-center justify-center mb-4">
//             <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
//               <span className="text-primary-foreground font-bold text-lg">H</span>
//             </div>
//           </div>
//           <CardTitle className="text-2xl font-bold text-center">
//             {showPasswordInput ? 'Reset Password' : showOtpInput ? 'Enter OTP' : 'Hospital Admin'}
//           </CardTitle>
//           <CardDescription className="text-center">
//             {showPasswordInput 
//               ? 'Set your new password'
//               : showOtpInput 
//                 ? `Enter OTP sent to ${phone}`
//                 : ''
//             }
//             <br/>
//             <span className="text-xs text-muted-foreground mt-2 block">
//               {error ? error : showPasswordInput ? 'Enter your new password' : showOtpInput ? 'Enter the 6-digit OTP' : 'Enter your register phone number'}
//             </span>
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {error && (
//             <div className={`mb-4 p-3 rounded-lg text-sm ${
//               error.includes('successfully') 
//                 ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
//                 : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
//             }`}>
//               {error}
//             </div>
//           )}

//           {/* Phone Input Section */}
//           {!showOtpInput && !showPasswordInput && (
//             <form onSubmit={handleSendOtp} className="space-y-4">
//               <div className="space-y-2">
//                 <label htmlFor="phone" className="text-sm font-medium">
//                   Phone Number
//                 </label>
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="Enter 10-digit phone number"
//                   value={phone}
//                   onChange={(e) => {
//                     setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
//                     setError('')
//                   }}
//                   required
//                   className="bg-input border-border"
//                   disabled={loading || isSendingOtp}
//                 />
//                 <p className="text-xs text-muted-foreground">
//                   Enter your registered 10-digit phone number
//                 </p>
//               </div>

//               <Button 
//                 type="submit" 
//                 disabled={loading || isSendingOtp} 
//                 className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
//               >
//                 {loading || isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
//               </Button>
//             </form>
//           )}

//           {/* OTP Input Section */}
//           {showOtpInput && !showPasswordInput && (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium block text-center">
//                   Enter 6-digit OTP
//                 </label>
//                 <div 
//                   className="flex justify-center gap-2 mb-4"
//                   onPaste={handleOtpPaste}
//                 >
//                   {[0, 1, 2, 3, 4, 5].map((index) => (
//                     <Input
//                       key={index}
//                       ref={(el) => (otpRefs.current[index] = el)}
//                       type="text"
//                       inputMode="numeric"
//                       maxLength={1}
//                       value={otp[index]}
//                       onChange={(e) => handleOtpChange(e.target.value, index)}
//                       onKeyDown={(e) => handleOtpKeyDown(e, index)}
//                       className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary focus:ring-1 focus:ring-primary"
//                       autoComplete="one-time-code"
//                       disabled={loading || isVerifyingOtp}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={handleBackToPhone}
//                   disabled={loading || isVerifyingOtp}
//                   className="flex-1 cursor-pointer"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   onClick={handleVerifyOtp}
//                   disabled={loading || isVerifyingOtp}
//                   className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
//                 >
//                   {loading || isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
//                 </Button>
//               </div>

//               <div className="text-center">
//                 <button
//                   type="button"
//                   onClick={handleResendOtp}
//                   disabled={countdown > 0 || loading}
//                   className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
//                 >
//                   {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Password Reset Section */}
//           {showPasswordInput && (
//             <form onSubmit={handleResetPassword} className="space-y-4">
//               <div className="space-y-2">
//                 <label htmlFor="password" className="text-sm font-medium">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter new password"
//                     value={password}
//                     onChange={(e) => {
//                       setPassword(e.target.value)
//                       setError('')
//                     }}
//                     required
//                     className="bg-input border-border pr-10"
//                     disabled={loading || isResettingPassword}
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? 'Hide' : 'Show'}
//                   </button>
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   Must be at least 8 characters with uppercase, lowercase, and number
//                 </p>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="confirmPassword" className="text-sm font-medium">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <Input
//                     id="confirmPassword"
//                     type={showConfirmPassword ? "text" : "password"}
//                     placeholder="Confirm new password"
//                     value={confirmPassword}
//                     onChange={(e) => {
//                       setConfirmPassword(e.target.value)
//                       setError('')
//                     }}
//                     required
//                     className="bg-input border-border pr-10"
//                     disabled={loading || isResettingPassword}
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   >
//                     {showConfirmPassword ? 'Hide' : 'Show'}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={handleBackToOtp}
//                   disabled={loading || isResettingPassword}
//                   className="flex-1 cursor-pointer"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={loading || isResettingPassword}
//                   className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
//                 >
//                   {loading || isResettingPassword ? 'Resetting...' : 'Reset Password'}
//                 </Button>
//               </div>
//             </form>
//           )}

//           <div className="mt-6 text-center text-sm">
//             Don't have an account?{' '}
//             <button 
//               onClick={onSwitchToSignUp} 
//               className="text-green-600 hover:underline font-medium"
//               disabled={loading}
//             >
//               Sign Up
//             </button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useLoginHospitalMutation, useOtpHospitalMutation, useResetPasswordMutation } from '@/app/service/hospital'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export function ResetPassword({ onSwitchToSignUp }) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const [otpHospital, { isLoading: isVerifyingOtp }] = useOtpHospitalMutation()
  const [loginHospital, { isLoading: isSendingOtp }] = useLoginHospitalMutation()
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation()

  // Refs for OTP inputs
  const otpRefs = useRef([])

  // Initialize OTP refs
  useEffect(() => {
    otpRefs.current = otpRefs.current.slice(0, 6)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Focus first OTP input when OTP input is shown
  useEffect(() => {
    if (showOtpInput && otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    }
  }, [showOtpInput])

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^[6-9]\d{9}$/ // Indian phone number format
    return phoneRegex.test(phoneNumber)
  }

  const validatePassword = (password) => {
    // Only check for minimum 8 characters
    return password.length >= 8
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError('')
    
    if (!phone) {
      setError('Please enter your phone number');
      toast.warning('Please enter your phone number!');
      return
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      toast.warning('Please enter a valid 10-digit phone number!');
      return
    }

    setLoading(true)
    try {
      const result = await loginHospital({ phone }).unwrap()       
      setShowOtpInput(true)
      setCountdown(60)
      toast.success('OTP sent successfully!');
      
    } catch (error) {
      const msg = error.response?.data?.message || "Server error!";
      toast.error(msg);
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = otpRefs.current[index + 1]
      if (nextInput) nextInput.focus()
    }

    // Auto-submit when all fields are filled
    const isAllFilled = newOtp.every(digit => digit !== '')
    if (isAllFilled) {
      handleVerifyOtp()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        const prevInput = otpRefs.current[index - 1]
        if (prevInput) {
          prevInput.focus()
          // Clear the previous input
          const newOtp = [...otp]
          newOtp[index - 1] = ''
          setOtp(newOtp)
        }
      } else if (otp[index]) {
        // Clear current input on backspace
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
      setOtp(pastedNumbers)
      setError('')
      
      // Focus last input after paste
      const lastInput = otpRefs.current[5]
      if (lastInput) lastInput.focus()
      
      // Auto-submit after paste
      setTimeout(() => {
        handleVerifyOtp()
      }, 100)
    }
  }

  const handleVerifyOtp = async () => {
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      return
    }

    setLoading(true)
    try {
      const result = await otpHospital({
        phone: phone,
        otp: otpString
      }).unwrap()
      
      if (result && result.status == 200) {
        toast.success("Phone verified successfully!");
        setShowPasswordInput(true)
        setShowOtpInput(false)
      } else {
        setError(result.message || 'Invalid OTP')
        setOtp(['', '', '', '', '', ''])
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus()
        }
      }
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg);
      setError(error.data?.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Please fill in all password fields')
      toast.warning('Please fill in all password fields!')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      toast.warning('Passwords do not match!')
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long')
      toast.warning('Password must be at least 8 characters long!')
      return
    }

    setLoading(true)
    try {

      
      const result = await resetPassword({
        phone: phone,
        password: password
      }).unwrap()

      if (result && result.status == 200) {
        toast.success("Password reset successfully!");
        // Redirect to login or dashboard
        setTimeout(() => {
          
          navigate("/sign-in", { replace: true });
        }, 1500)
      } else {
        setError(result.message || 'Failed to reset password')
      }
    } catch (error) {
      const msg = error?.data?.message || "Server error!";
      toast.error(msg);
      setError(error.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = () => {
    if (countdown === 0) {
      setOtp(['', '', '', '', '', ''])
      setError('')
      handleSendOtp()
      
      setTimeout(() => {
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus()
        }
      }, 100)
    }
  }

  const handleBackToPhone = () => {
    setShowOtpInput(false)
    setShowPasswordInput(false)
    setOtp(['', '', '', '', '', ''])
    setPassword('')
    setConfirmPassword('')
    setError('')
    setCountdown(0)
  }

  const handleBackToOtp = () => {
    setShowPasswordInput(false)
    setShowOtpInput(true)
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="border-border shadow-lg w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {showPasswordInput ? 'Reset Password' : showOtpInput ? 'Enter OTP' : 'Hospital Admin'}
          </CardTitle>
          <CardDescription className="text-center">
            {showPasswordInput 
              ? 'Set your new password'
              : showOtpInput 
                ? `Enter OTP sent to ${phone}`
                : 'Sign in to your hospital management account'
            }
            <br/>
            <span className="text-xs text-muted-foreground mt-2 block">
              {error ? error : showPasswordInput ? 'Enter your new password' : showOtpInput ? 'Enter the 6-digit OTP' : 'Enter your phone number'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              error.includes('successfully') 
                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
            }`}>
              {error}
            </div>
          )}

          {/* Phone Input Section */}
          {!showOtpInput && !showPasswordInput && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    setError('')
                  }}
                  required
                  className="bg-input border-border"
                  disabled={loading || isSendingOtp}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your registered 10-digit phone number
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={loading || isSendingOtp} 
                className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                {loading || isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {/* OTP Input Section */}
          {showOtpInput && !showPasswordInput && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium block text-center">
                  Enter 6-digit OTP
                </label>
                <div 
                  className="flex justify-center gap-2 mb-4"
                  onPaste={handleOtpPaste}
                >
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary focus:ring-1 focus:ring-primary"
                      autoComplete="one-time-code"
                      disabled={loading || isVerifyingOtp}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackToPhone}
                  disabled={loading || isVerifyingOtp}
                  className="flex-1 cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={loading || isVerifyingOtp}
                  className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                  {loading || isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Password Reset Section */}
          {showPasswordInput && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    required
                    className="bg-input border-border pr-10"
                    disabled={loading || isResettingPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                    required
                    className="bg-input border-border pr-10"
                    disabled={loading || isResettingPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBackToOtp}
                  disabled={loading || isResettingPassword}
                  className="flex-1 cursor-pointer"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isResettingPassword}
                  className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                >
                  {loading || isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToSignUp} 
              className="text-green-600 hover:underline font-medium"
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}