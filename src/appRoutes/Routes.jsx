// import { SignIn } from "@/components/auth/Sign-in";
// import { SignUp } from "@/components/auth/Sign-up";
// import DashboardPage from "@/dashboard/Dashboard";
// import DoctorsPage from "@/dashboard/doctors/Doctors";
// import DashboardLayout from "@/dashboard/layout";
// import NotificationsPage from "@/dashboard/notification/Notification";
// import ProfilePage from "@/dashboard/profile/Profile";
// import SecurityPage from "@/dashboard/security/Security";
// import SettingsPage from "@/dashboard/settings/Settings";
// import SpecialtiesPage from "@/dashboard/specialties/Specialties";
// import ProtectedRoutes from "@/utils/ProtectedRoutes";
// import React, { useState } from "react";
// import { Route, Routes } from "react-router-dom";


// export default function AppRoutes() {


//   return (
//     <Routes>
//       <Route path="/sign-in" element={<SignIn  />} />
//             <Route path="/sign-up" element={<SignUp   />} />
//       <Route element={<ProtectedRoutes />}>
//         <Route element={<DashboardLayout />}>
//           <Route path="/" element={<DashboardPage />} />
//           <Route path="/dashboard/doctors" element={<DoctorsPage />} />
//            <Route  path='/dashboard/notifications' element= {<NotificationsPage />} />
//           <Route path="/dashboard/specialties" element={<SpecialtiesPage />} />
//           <Route path="/dashboard/profile" element={<ProfilePage />} />
//           <Route path="/dashboard/settings" element={<SettingsPage />} />
//           <Route  path='/dashboard/security' element= {<SecurityPage />} />
//         </Route>
//       </Route>
//     </Routes>
//   );
// }


import { SignIn } from "@/components/auth/Sign-in";
import { SignInOtp } from "@/components/auth/Sign-in-otp";
import { SignUp } from "@/components/auth/Sign-up";
import HospitalHomePage from "@/components/Home";
import BookingsPage from "@/dashboard/bookings/Bookings";
import DoctorBookingPage from "@/dashboard/bookings/doctor-booking/Doctorbooking";
import DashboardPage from "@/dashboard/Dashboard";
import DoctorsPage from "@/dashboard/doctors/Doctors";
import DashboardLayout from "@/dashboard/layout";
import NotificationsPage from "@/dashboard/notification/Notification";
import ProfilePage from "@/dashboard/profile/Profile";
import SecurityPage from "@/dashboard/security/Security";
import SettingsPage from "@/dashboard/settings/Settings";
import SpecialtiesPage from "@/dashboard/specialties/Specialties";
import ProtectedRoutes from "@/utils/ProtectedRoutes";
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/signin-otp" element={<SignInOtp />} />
      <Route path="/" element={<HospitalHomePage />} />

      
      <Route element={<ProtectedRoutes />}>
        <Route element={<DashboardLayout />}>
          {/* Add redirect from root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Add the missing /dashboard route */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          <Route path="/dashboard/doctors" element={<DoctorsPage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/specialties" element={<SpecialtiesPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/bookings" element={<BookingsPage />} />
          <Route path="/dashboard/bookings/doctor-mange" element={<DoctorBookingPage />} />
          <Route path="/dashboard/security" element={<SecurityPage />} />


        </Route>
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
