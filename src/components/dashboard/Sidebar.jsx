'use client'

import { LayoutDashboard, Users, Stethoscope, Bell, Settings, LogOut, User,  Phone, X, CalendarCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Stethoscope, label: 'Doctors', href: '/dashboard/doctors' },
  { icon: Users, label: 'Specialties', href: '/dashboard/specialties' },
  { icon: CalendarCheck, label: 'Bookings', href: '/dashboard/bookings' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar({ name, imageUrl, onLinkClick }) {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("adminId")
    navigate("/sign-in")
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-green-900">

        {/* Logo */}
        <div className="p-6 border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-white">
                  {name ? name.charAt(0).toUpperCase() : "H"}
                </span>
              )}
            </div>

            <h1 className="font-bold text-sidebar-foreground truncate w-full" >
  { name || "Hospital"}
   </h1>

          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onLinkClick}     // 🔥 CLOSE SIDEBAR ON CLICK
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-green-600'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Support Box */}
        <div className="p-4 border-sidebar-border">
          <div className="bg-gradient-to-r from-sidebar-primary to-blue-600 rounded-xl p-4 mb-4 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Phone size={20} className="text-white" />
              <span className="text-xs font-semibold text-white uppercase tracking-wider">24/7 Support</span>
            </div>
            <p className="text-2xl font-bold text-white">Hosta</p>
            <p className="text-2xl font-bold text-white">+91 8714412090</p>
            <p className="text-xs text-white/80 mt-1">Call anytime for help</p>
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => setShowLogoutPopup(true)}
            className="cursor-pointer flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-green-700 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 mx-4 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
              <button 
                onClick={() => setShowLogoutPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-700 mb-6">Are you sure you want to logout?</p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
