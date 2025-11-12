import React, { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  Calendar,
  Menu,
  Phone,
  Mail,
  MapPin,
  Bell,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../Redux/SideBar";
import SideBar from "../Components/SideBar";
import { RootState } from "../Redux/Store";
import { setHospitalData } from "../Redux/Dashboard";
import { fetchData } from "../Components/FetchData";
import io from "socket.io-client";
import { apiClient } from "../Components/Axios";

const socket = io("https://hostaserver.onrender.com");

const HospitalDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { name, image, address, phone, email, specialties, booking } =
    useSelector((state: RootState) => state.Dashboard);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const hospitalId = localStorage.getItem("hospitalId");
      try {
        const notificationData: any = await apiClient.get(
          `/api/notifications/hospital/no-read/${hospitalId}`
        );
        setNotifications(notificationData?.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  // 🔔 Handle real-time push notifications
  useEffect(() => {
    // Request permission once
    if (
      Notification.permission === "default" ||
      Notification.permission === "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        } else {
          console.log("Notification permission denied");
        }
      });
    }

    socket.on("pushNotification", (data) => {
      console.log("hii", data);

      const hospitalId = localStorage.getItem("hospitalId");

      if (hospitalId === data.hospitalId) {
        // Show system notification
        if (Notification.permission === "granted") {
          new Notification("New Notification", {
            body: data.message,
            // icon: "./icons/notification.png", // ✅ Your custom icon
          });
        }

        // Update localStorage count
        const storedCount =
          Number(localStorage.getItem("notificationCount")) || 0;
        const newCount = storedCount + 1;
        localStorage.setItem("notificationCount", String(newCount));
      }
    });

    return () => {
      socket.off("pushNotification");
    };
  }, []);

  // 🔄 Fetch hospital data on mount
  useEffect(() => {
    fetchData(dispatch, setHospitalData);
  }, [dispatch]);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      year: "numeric",
      month: "short",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex h-screen bg-green-50">
      <SideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ================= HEADER ================= */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between p-4">
            {/* Sidebar Toggle */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="md:hidden p-2 rounded-md border border-green-600 text-green-600 hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Menu size={24} />
            </button>

            {/* Dashboard Title */}
            <h1 className="text-xl font-semibold text-green-800">Dashboard</h1>

            {/* Right Side: Date/Time + Notifications */}
            <div className="flex items-center space-x-6">
              {/* Date & Time */}
              <div className="text-green-600 text-sm text-right">
                <div className="font-medium">{formatTime(currentTime)}</div>
                <div>{formatDate(currentTime)}</div>
              </div>

              {/* Notification Bell with Count */}
              <div className="relative cursor-pointer p-2 rounded-full hover:bg-green-100 transition-colors">
                <Bell
                  size={26}
                  className="text-green-700"
                  onClick={() => navigate("/notification")}
                />
                {Number(localStorage.getItem("notificationCount")) !== 0 ? (
                  Number(localStorage.getItem("notificationCount")) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {localStorage.getItem("notificationCount")}
                    </span>
                  )
                ) : (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications?.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-green-50 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Hospital Info Card */}
            <div className="bg-white p-8 rounded-lg shadow-md mb-6">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={image.imageUrl}
                  alt={name}
                  className="w-32 h-32 rounded-full object-cover mb-4 border border-green-950"
                />
                <h2 className="text-2xl font-bold text-green-800">{name}</h2>
              </div>
              <div className="space-y-2">
                <p className="text-green-600 flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {address}
                </p>
                <p className="text-green-600 flex items-center">
                  <Phone size={16} className="mr-2" />
                  {phone}
                </p>
                <p className="text-green-600 flex items-center">
                  <Mail size={16} className="mr-2" />
                  {email}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Link to="/doctors" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">
                    Doctors
                  </h3>
                  <div className="flex items-center justify-between">
                    <Users size={48} className="text-green-600" />
                    <span className="text-3xl font-bold text-green-800">
                      {specialties.reduce(
                        (acc, curr) => acc + curr.doctors.length,
                        0
                      )}
                    </span>
                  </div>
                  <div className="text-green-600 mt-4 inline-block">
                    Manage Doctors
                  </div>
                </div>
              </Link>

              <Link to="/specialties" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">
                    Specialties
                  </h3>
                  <div className="flex items-center justify-between">
                    <Stethoscope size={48} className="text-green-600" />
                    <span className="text-3xl font-bold text-green-800">
                      {specialties.length}
                    </span>
                  </div>
                  <div className="text-green-600 mt-4 inline-block">
                    Manage Specialties
                  </div>
                </div>
              </Link>

              <Link to="/appointments" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">
                    Today's Appointments
                  </h3>
                  <div className="flex items-center justify-between">
                    <Calendar size={48} className="text-green-600" />
                    <span className="text-3xl font-bold text-green-800">
                      {booking.length}
                    </span>
                  </div>
                  <div className="text-green-600 mt-4 inline-block">
                    Manage Schedule
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
