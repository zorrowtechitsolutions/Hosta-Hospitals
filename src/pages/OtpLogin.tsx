

import { useState, useEffect, useRef } from "react";
import { Phone, X } from "lucide-react";
import { apiClient } from "../Components/Axios";
import { successToast, errorToast } from "../Components/Toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setHospitalData } from "../Redux/Dashboard";

const HospitalOtpLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [timer, setTimer] = useState(60);
  const dispatch = useDispatch();
  const navigation = useNavigate();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // countdown effect
  useEffect(() => {
    let interval: any;
    if (showOtpModal && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  // Focus first OTP input when modal opens
  useEffect(() => {
    if (showOtpModal) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showOtpModal]);

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      errorToast("Enter a valid 10-digit phone number");
      return;
    }
    try {
      await apiClient.post("/api/hospital/login", { phone }, { withCredentials: true });
      successToast("OTP sent successfully!");
      setOtp(["", "", "", "", "", ""]);
      setShowOtpModal(true);
      setTimer(60);
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      errorToast("Please enter complete 6-digit OTP");
      return;
    }

    try {
      const result = await apiClient.post(
        "/api/hospital/otp",
        { phone, otp: otpString },
        { withCredentials: true }
      );      

      localStorage.setItem("userId", result.data.hospital._id);
      localStorage.setItem("accessToken", result.data.token);

      successToast("Login successful");
      dispatch(setHospitalData(result.data.hospital._id));
      setShowOtpModal(false);
      navigation("/dashboard"); 
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    
    // Handle paste event (multiple digits)
    if (value.length > 1) {
      const pastedDigits = value.split('').slice(0, 6 - index);
      pastedDigits.forEach((digit, digitIndex) => {
        if (index + digitIndex < 6) {
          newOtp[index + digitIndex] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus next empty input or last input
      const nextIndex = Math.min(index + pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single digit input
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        otpInputRefs.current[index - 1]?.focus();
      }
      
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      if (index > 0 && !otp[index]) {
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
      const newOtp = [...otp];
      pastedDigits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus next empty input or last input
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      errorToast("Enter a valid 10-digit phone number");
      return;
    }
    
    try {
      await apiClient.post("/api/hospital/login", { phone }, { withCredentials: true });
      successToast("OTP resent successfully!");
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-emerald-800 text-center mb-6">
          Login with Phone
        </h1>

        <div className="flex items-center border border-emerald-300 rounded-md bg-emerald-50 p-2 mb-4">
          <Phone size={20} className="text-emerald-500 mr-2" />
          <input
            type="tel"
            className="flex-1 bg-transparent outline-none text-emerald-800 placeholder-emerald-300"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
          />
        </div>

        <button
          onClick={sendOtp}
          className="block w-3/4 mx-auto bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition"
        >
          Send OTP
        </button>

        <p className="text-center text-emerald-700 text-sm mt-4">
          Don't have an account?{" "}
          <span
            className="text-emerald-800 font-semibold underline cursor-pointer"
            onClick={() => navigation("/registration")}
          >
            Register here
          </span>
        </p>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white w-11/12 max-w-sm rounded-lg p-6 text-center">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-lg font-bold text-emerald-800 mb-4">Enter OTP</h2>

            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={index === 5 ? 1 : 6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-12 text-center text-xl font-semibold border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  autoComplete="one-time-code"
                  disabled={timer <= 0}
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              disabled={timer === 0 && otp.join('').length === 0}
              className="w-3/4 bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              Verify & Login
            </button>

            {timer > 0 ? (
              <p className="text-emerald-700">Resend OTP in {timer}s</p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-emerald-800 font-semibold underline"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalOtpLogin;
