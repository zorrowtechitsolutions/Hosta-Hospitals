

// export default PasswordReset;
import React, { useState, useEffect, useRef } from "react";
import { Phone, Lock, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { BackButton } from "../Components/Commen";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../Components/Axios";

const PasswordReset: React.FC = () => {
  const [formData, setFormData] = useState({
    phone: "",
    otp: ["", "", "", "", "", ""],
    newPassword: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    let interval: any;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, timer]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.phone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Send OTP to phone
    apiClient
      .post("/api/hospital/login", { phone: formData.phone }, { withCredentials: true })
      .then(() => {
        setStep(2);
        setSuccess("OTP sent to your phone number.");
        setIsResendDisabled(true);
        setTimer(60);
        // Focus first OTP input when moving to step 2
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to send OTP. Please try again.");
      });
  };

  const handleResendOtp = () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    apiClient
      .post("/api/hospital/login", { phone: formData.phone }, { withCredentials: true })
      .then(() => {
        setSuccess("OTP resent to your phone number.");
        setIsResendDisabled(true);
        setTimer(60);
        // Reset OTP fields and focus first input
        setFormData(prev => ({ ...prev, otp: ["", "", "", "", "", ""] }));
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to resend OTP. Please try again.");
      });
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...formData.otp];
    
    // Handle paste event (multiple digits)
    if (value.length > 1) {
      const pastedDigits = value.split('').slice(0, 6 - index);
      pastedDigits.forEach((digit, digitIndex) => {
        if (index + digitIndex < 6) {
          newOtp[index + digitIndex] = digit;
        }
      });
      
      setFormData(prev => ({ ...prev, otp: newOtp }));
      
      // Focus next empty input or last input
      const nextIndex = Math.min(index + pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single digit input
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!formData.otp[index] && index > 0) {
        // Move to previous input if current is empty
        otpInputRefs.current[index - 1]?.focus();
      }
      
      const newOtp = [...formData.otp];
      newOtp[index] = "";
      setFormData(prev => ({ ...prev, otp: newOtp }));

      if (index > 0 && !formData.otp[index]) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.replace(/\D/g, '').split('').slice(0, 6);
    
    if (pastedDigits.length > 0) {
      const newOtp = [...formData.otp];
      pastedDigits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      
      setFormData(prev => ({ ...prev, otp: newOtp }));
      
      // Focus next empty input or last input
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const getOtpString = () => {
    return formData.otp.join('');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const otpString = getOtpString();
    if (!otpString || otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    // Verify OTP
    apiClient
      .post(
        "/api/hospital/otp",
        { phone: formData.phone, otp: otpString },
        { withCredentials: true }
      )
      .then(() => {
        setStep(3);
        setSuccess("OTP verified successfully.");
      })
      .catch((err) => {
        console.log(err);
        setError("Invalid OTP. Please try again.");
      });
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Reset password
    apiClient
      .post(
        "/api/hospital/password",
        {
          phone: formData.phone,
          password: formData.newPassword,
        },
        { withCredentials: true }
      )
      .then(() => {
        setStep(4);
        setSuccess("Password reset successfully.");
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to reset password. Please try again.");
      });
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-green-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600"
                  size={18}
                />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="pl-10 w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Send OTP
            </button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-3 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center space-x-2">
                {formData.otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={index === 5 ? 1 : 6} // Allow paste on first input
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined} // Only handle paste on first input
                    className="w-12 h-12 text-center text-xl font-semibold border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              <div className="mt-4 text-center">
                {isResendDisabled ? (
                  <p className="text-green-600 text-sm">
                    Resend OTP in {timer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Verify OTP
            </button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-green-700 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600"
                  size={18}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="pl-10 pr-10 w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-green-700 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600"
                  size={18}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pl-10 pr-10 w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Reset Password
            </button>
          </form>
        );
      case 4:
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-2 text-xl font-semibold text-green-800">
              Password Reset Successful
            </h3>
            <p className="mt-2 text-green-600">
              Your password has been successfully reset.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <BackButton OnClick={() => navigate("/")} />
        <div className="relative mb-6 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-green-800">Reset Password</h2>
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle className="mr-2" size={18} />
            <span>{success}</span>
          </div>
        )}
        {renderStep()}
      </div>
    </div>
  );
};

export default PasswordReset;
