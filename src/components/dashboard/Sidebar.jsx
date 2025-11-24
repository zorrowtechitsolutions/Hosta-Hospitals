'use client'

import { LayoutDashboard, Users, Stethoscope, Bell, Settings, LogOut, User, Lock, Phone } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom' // Changed from useSearchParams to useLocation

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Stethoscope, label: 'Doctors', href: '/dashboard/doctors' },
  { icon: Users, label: 'Specialties', href: '/dashboard/specialties' },
    { icon: Lock, label: 'Bookings', href: '/dashboard/bookings' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: Lock, label: 'Security', href: '/dashboard/security' },
]

export function Sidebar({name, imageUrl }) {
  const location = useLocation() // Get location object
  const pathname = location.pathname // Extract pathname from location
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    navigate("sign-in");
  }

  return (
    <div className="h-screen flex flex-col bg-green-900">
      {/* Logo */}
      <div className="p-6  border-sidebar-border">
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

          <div>
            <h1 className="font-bold text-sidebar-foreground">{name || "Hospital"}  </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.slice(0, -1).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href 
          return (
            <Link
              key={item.href}
              to={item.href} // Changed from href to to for React Router Link
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

      <div className="p-4  border-sidebar-border">
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
        <button onClick={handleLogout} className="cursor-pointer flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
}