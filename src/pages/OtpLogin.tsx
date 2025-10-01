
import  { useState, useEffect } from "react";
import { Phone, X } from "lucide-react";
import { apiClient } from "../Components/Axios";
import { successToast, errorToast } from "../Components/Toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setHospitalData } from "../Redux/Dashboard";

const HospitalOtpLogin = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [timer, setTimer] = useState(60);
  const dispatch = useDispatch();
  const navigation = useNavigate();

  // countdown effect
  useEffect(() => {
    let interval: any ;
    if (showOtpModal && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  const sendOtp = async () => {
    if (!/^\d{10}$/.test(phone)) {
      errorToast("Enter a valid 10-digit phone number");
      return;
    }
    try {
      await apiClient.post("/api/hospital/login", { phone }, { withCredentials: true });
      successToast("OTP sent successfully!");
      setOtp("");
      setShowOtpModal(true);
      setTimer(60);
    } catch (err: any) {
      errorToast(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await apiClient.post(
        "/api/hospital/otp",
        { phone, otp },
        { withCredentials: true }
      );      

      localStorage.setItem("userId", result.data.hospital._id);
      localStorage.setItem("accessToken", result.data.token);

      successToast("Login successful");
      dispatch(setHospitalData (result.data.hospital._id));
      setShowOtpModal(false);
      navigation("/dashboard"); 
    } catch (err: any) {
      errorToast(err.response || "Invalid OTP");
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
          />
        </div>

        <button
          onClick={sendOtp}
          className="block w-3/4 mx-auto bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition"
        >
          Send OTP
        </button>

        <p className="text-center text-emerald-700 text-sm mt-4">
          Don’t have an account?{" "}
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

            <input
              type="number"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-3/4 mx-auto text-center text-xl border border-emerald-300 rounded-md bg-emerald-50 text-emerald-800 tracking-widest p-2 mb-4 outline-none"
              placeholder="Enter OTP"
              disabled={timer <= 0}
            />

            <button
              onClick={verifyOtp}
              disabled={timer === 0 && otp === ""}
              className="w-3/4 bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              Verify & Login
            </button>

            {timer > 0 ? (
              <p className="text-emerald-700">Resend OTP in {timer}s</p>
            ) : (
              <button
                onClick={sendOtp}
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

