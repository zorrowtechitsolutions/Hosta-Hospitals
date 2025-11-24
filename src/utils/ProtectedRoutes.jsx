import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes() {
  const admin = localStorage.getItem("adminId"); 

  return admin ? <Outlet /> : <Navigate to="/sign-in" replace />;
}
