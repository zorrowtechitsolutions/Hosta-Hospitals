// import React, { useState } from "react";
// import { Mail, Lock, EyeOff, Eye, AlertCircle } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { BackButton, FormInput } from "../Components/Commen";
// import { apiClient } from "../Components/Axios";
// import { successToast } from "../Components/Toastify";
// import { useDispatch } from "react-redux";
// import { setHospitalData } from "../Redux/Dashboard";

// const HospitalLogin: React.FC = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!formData.email || !formData.password) {
//       setError("Please enter both email and password.");
//       return;
//     }
//     await apiClient
//       .post(
//         "/api/hospital/login",
//         { email: formData.email.toLowerCase(), password: formData.password },
//         { withCredentials: true }
//       )
//       .then((result) => {
//         dispatch(setHospitalData({ _id: result.data.data._id }));
//         successToast(result.data.message);
//         localStorage.setItem("accessToken", result.data.token);
//         navigate("/dashboard");
//       })
//       .catch((err) => {
//         console.log(err);
//         setError(err.response.data.message + ", Please try again.");
//       });
//   };

//   return (
//     <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
//         <BackButton OnClick={() => navigate("/")} />
//         <h2 className="text-3xl font-bold text-green-800 inline-block mb-6 justify-self-center">
//           User Login
//         </h2>
//         {error && (
//           <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
//             <AlertCircle className="mr-2" size={18} />
//             <span>{error}</span>
//           </div>
//         )}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-green-700 mb-1"
//             >
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600"
//                 size={18}
//               />
//               <FormInput
//                 type="email"
//                 id="email"
//                 value={formData.email}
//                 onChange={(e: any) =>
//                   setFormData({
//                     ...formData,
//                     email: e.target.value,
//                   })
//                 }
//                 placeholder="Enter your email"
//               />
//             </div>
//           </div>
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-green-700 mb-1"
//             >
//               Password
//             </label>
//             <div className="relative">
//               <Lock
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600"
//                 size={18}
//               />
//               <FormInput
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 value={formData.password}
//                 onChange={(e: any) =>
//                   setFormData({ ...formData, password: e.target.value })
//                 }
//                 placeholder="Enter your password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//           </div>
//           <div className="flex items-center justify-end">
//             <div className="text-sm">
//               <Link
//                 to="/newpassword"
//                 className="font-medium text-green-600 hover:text-green-500"
//               >
//                 Forgot your password?
//               </Link>
//             </div>
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           >
//             Sign In
//           </button>
//         </form>
//         <div className="mt-6 text-center">
//           <p className="text-sm text-green-700">
//             Don't have an account?{" "}
//             <Link
//               to="/registration"
//               className="font-medium text-green-600 hover:text-green-500"
//             >
//               Register here
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HospitalLogin;



import  { useState, useEffect } from "react";
import { Phone, X } from "lucide-react";
import { apiClient } from "../Components/Axios";
import { successToast, errorToast } from "../Components/Toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setHospitalData } from "../Redux/Dashboard";

const HospitalLogin = () => {
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

export default HospitalLogin;

