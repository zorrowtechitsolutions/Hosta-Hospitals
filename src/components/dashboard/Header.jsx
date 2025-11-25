'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Bell, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useGetAllnotficationHospitalUnReadQuery } from '@/app/service/notification'
import io from "socket.io-client";

const socket = io("https://www.zorrowtek.in");

export function Header({ onMenuClick, name }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')
  const navigate = useNavigate();

  const hospitalId = localStorage.getItem("adminId"); 

  const { 
    data: unreadData, 
    isLoading: unreadLoading, 
    error: unreadError, 
    refetch: refetchUnread 
  } = useGetAllnotficationHospitalUnReadQuery(hospitalId)

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        const notificationsPanel = document.querySelector('.notifications-panel');
        const bellButton = document.querySelector('.bell-button');
        
        if (notificationsPanel && 
            !notificationsPanel.contains(event.target) && 
            !bellButton?.contains(event.target)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const audioRef = useRef(null)


  // 🔔 Handle real-time push notifications
  useEffect(() => {
    if (Notification.permission === "default" || Notification.permission === "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        }
      });
    }

    socket.on("pushNotifications", (data) => {
      const hospitalId = localStorage.getItem("adminId"); 

      if (hospitalId === data.hospitalId) {
        if (Notification.permission === "granted") {
          new Notification("New Notification", {
            body: data.message,
          });
        }
 audioRef.current.play()
        .catch(err => console.log("Auto-play blocked:", err));


        const storedCount = Number(localStorage.getItem("notificationCount")) || 0;
        const newCount = storedCount + 1;
        localStorage.setItem("notificationCount", String(newCount));
      }
      refetchUnread();
    });


    socket.on("pushNotifications", (data) => {
  const hospitalId = localStorage.getItem("adminId");

  if (hospitalId === data.hospitalId) {

    // Browser allows autoplay only after 1 user click
    if (soundEnabled) {
      audioRef.current.play().catch(err => console.log("Play blocked:", err));
    }

    if (Notification.permission === "granted") {
      new Notification("New Notification", {
        body: data.message,
      });
    }

    const storedCount = Number(localStorage.getItem("notificationCount")) || 0;
    localStorage.setItem("notificationCount", storedCount + 1);
  }

  refetchUnread();
});


    return () => {
      socket.off("pushNotifications");
    };
  }, [refetchUnread]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      setCurrentDateTime(formatted)
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Safe access to unreadData
  const notifications = unreadData || []
  const unreadCount = notifications.length || 0
  const recentNotifications = notifications.slice(0, 5)

  return (
    <header className="border-b border-border sticky top-0 z-40 bg-green-50">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

      <audio ref={audioRef} src="/sound/notification.mp3" />

          <div className="flex flex-col min-w-0 flex-1">
            <h1 className="md:hidden text-xl font-bold truncate text-green-800">
              {name || "Hospital"}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Clock size={12} className="shrink-0" />
              {currentDateTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-muted rounded-lg relative transition-colors bell-button"
              disabled={unreadLoading}
            >
              <Bell size={20} className="cursor-pointer"  />
              {unreadLoading ? (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-muted-foreground rounded-full animate-pulse"></span>
              ) : unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-green-50"></span>
              ) : null}
            </button>

            {showNotifications && (
              <>
                {/* Mobile Backdrop */}
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowNotifications(false)} />
                
                {/* Notifications Panel */}
                <div className="notifications-panel fixed md:absolute inset-x-0 md:inset-x-auto top-0 md:top-full md:right-0 md:mt-2 w-full md:w-96 h-screen md:h-auto md:max-h-96 bg-card border border-border md:rounded-lg shadow-lg z-50 md:z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="h-[calc(100vh-140px)] md:h-64 overflow-y-auto">
                    {unreadLoading ? (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                        <p>Loading notifications...</p>
                      </div>
                    ) : unreadError ? (
                      <div className="flex flex-col items-center justify-center h-32 text-destructive p-4 text-center">
                        <p>Error loading notifications</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={refetchUnread}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : recentNotifications.length > 0 ? (
                      <div className="divide-y divide-border">
                        {recentNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer active:bg-muted"
                            onClick={() => {
                              setShowNotifications(false);
                              // You can add navigation to specific notification here if needed
                            }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5"></span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-4 text-center">
                        <Bell size={32} className="mb-2 opacity-50" />
                        <p>No new notifications</p>
                        <p className="text-xs mt-1">You're all caught up!</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-border bg-card sticky bottom-0">
                    <Button 
                      variant="outline" 
                      className="w-full cursor-pointer"
                      onClick={() => {
                        setShowNotifications(false); 
                        navigate("/dashboard/notifications");
                      }}
                    >
                      View All Notifications
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}