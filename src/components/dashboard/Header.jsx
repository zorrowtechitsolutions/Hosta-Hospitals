'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Bell, X, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { 
  useGetAllnotficationHospitalUnReadQuery, 
  useUpdatenotficationHospitalAllMutation,
  useUpdateAnotficationHospitalMutation 
} from '@/app/service/notification'
import io from "socket.io-client";

const socket = io("https://www.zorrowtek.in");

export function Header({ onMenuClick, name }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [updatingNotificationId, setUpdatingNotificationId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [pendingPopups, setPendingPopups] = useState([]);

  const navigate = useNavigate();
  const audioRef = useRef(null);
  const popupRef = useRef(null);

  const hospitalId = typeof window !== "undefined"
    ? localStorage.getItem("adminId")
    : null;

  const {
    data: unreadData,
    isLoading: unreadLoading,
    error: unreadError,
    refetch: refetchUnread
  } = useGetAllnotficationHospitalUnReadQuery(hospitalId);

  const [updatenotficationHospitalAll, { isLoading: isPostingAll }] = useUpdatenotficationHospitalAllMutation()
  const [updateAnotficationHospital, { isLoading: isPostingNotification }] = useUpdateAnotficationHospitalMutation()

  // Enable sound only after first user interaction (Safari/iOS rule)
  useEffect(() => {
    const enableSound = () => {
      setSoundEnabled(true);
      window.removeEventListener("click", enableSound);
    };
    window.addEventListener("click", enableSound);

    return () => window.removeEventListener("click", enableSound);
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        const notificationsPanel = document.querySelector('.notifications-panel');
        const bellButton = document.querySelector('.bell-button');

        if (
          notificationsPanel &&
          !notificationsPanel.contains(event.target) &&
          !bellButton?.contains(event.target)
        ) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Safe Notification checker for iOS Safari
  const isNotificationSupported =
    typeof window !== "undefined" && "Notification" in window;

  // Request permission safely
  useEffect(() => {
    if (!isNotificationSupported) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [isNotificationSupported]);

  // Handle socket notifications safely
  useEffect(() => {
    socket.on("pushNotifications", (data) => {
      const currentId = localStorage.getItem("adminId");

      if (currentId === data.hospitalId) {

        // Play sound only if user interacted once
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        // Safe Notification for iOS + Safari
        if (isNotificationSupported && Notification.permission === "granted") {
          new Notification("New Notification", { body: data.message });
        }

        // Show popup for new booking notifications - PERSISTENT
        if (data.message && data.message.toLowerCase().includes('booking')) {
          const newPopup = {
            message: data.message,
            timestamp: new Date().toISOString(),
            id: data.notificationId || Date.now(),
            notificationId: data.notificationId
          };
          
          // Add to pending popups
          setPendingPopups(prev => [...prev, newPopup]);
          
          // If no popup is currently showing, show this one
          if (!showPopup) {
            setPopupData(newPopup);
            setShowPopup(true);
          }
        }

        // Update counter
        const storedCount = Number(localStorage.getItem("notificationCount")) || 0;
        localStorage.setItem("notificationCount", storedCount + 1);
      }

      refetchUnread();
    });

    return () => {
      socket.off("pushNotifications");
    };
  }, [soundEnabled, refetchUnread, isNotificationSupported, showPopup]);

  // Live date/time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Function to mark a single notification as read
  const markAsRead = async (notificationId) => {
    try {
      setUpdatingNotificationId(notificationId);
      await updateAnotficationHospital(notificationId).unwrap();
      
      // Update local storage counter
      const storedCount = Number(localStorage.getItem("notificationCount")) || 0;
      localStorage.setItem("notificationCount", Math.max(0, storedCount - 1));
      
      // Refetch unread notifications
      await refetchUnread();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setUpdatingNotificationId(null);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await updatenotficationHospitalAll(hospitalId).unwrap();
      
      // Reset notification counter
      localStorage.setItem("notificationCount", "0");
      
      // Close dropdown and navigate
      setShowNotifications(false);
      navigate("/dashboard/notifications");
      
      // Refetch unread notifications
      await refetchUnread();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    setShowNotifications(false);
    
    if (notification.message && notification.message.toLowerCase().includes('booking')) {
      navigate("/dashboard/bookings");
    } else {
      navigate("/dashboard/notifications");
    }
  };

  // Handle view all click
  const handleViewAllClick = () => {
    if (unreadData?.length > 0) {
      markAllAsRead();
    } else {
      setShowNotifications(false);
      navigate("/dashboard/notifications");
    }
  };

  // Handle popup view click
  const handlePopupView = async () => {
    if (popupData) {
      // Mark this specific notification as read
      if (popupData.notificationId) {
        try {
          await markAsRead(popupData.notificationId);
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
        }
      }
      
      // Remove current popup from pending list
      setPendingPopups(prev => prev.filter(p => p.id !== popupData.id));
      
      // Hide popup
      setShowPopup(false);
      
      // Show next pending popup if any
      if (pendingPopups.length > 1) {
        const nextPopup = pendingPopups[1];
        setPopupData(nextPopup);
        setShowPopup(true);
      } else {
        setPopupData(null);
      }
      
      // Navigate to bookings page and reload
      navigate("/dashboard/bookings");
      window.location.reload();
    }
  };

  // Handle popup cancel click
  const handlePopupCancel = () => {
    if (popupData) {
      // Remove current popup from pending list
      setPendingPopups(prev => prev.filter(p => p.id !== popupData.id));
      
      // Hide popup
      setShowPopup(false);
      
      // Show next pending popup if any
      if (pendingPopups.length > 1) {
        const nextPopup = pendingPopups[1];
        setPopupData(nextPopup);
        setShowPopup(true);
      } else {
        setPopupData(null);
      }
    }
  };

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

          {/* Notification sound */}
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
              <Bell size={20} className="cursor-pointer" />
              {unreadLoading ? (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-muted-foreground rounded-full animate-pulse"></span>
              ) : unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-green-50"></span>
              ) : null}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setShowNotifications(false)} />

                <div className="notifications-panel fixed md:absolute inset-x-0 md:inset-x-auto top-0 md:top-full md:right-0 md:mt-2 w-full md:w-96 h-screen md:h-auto md:max-h-96 bg-card border border-border md:rounded-lg shadow-lg z-50 md:z-50">

                  {/* Panel Header */}
                  <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0">
                    <h3 className="font-semibold text-lg">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({unreadCount} unread)
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="h-[calc(100vh-140px)] md:h-64 overflow-y-auto">
                    {unreadLoading ? (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                        <p>Loading notifications...</p>
                      </div>
                    ) : unreadError ? (
                      <div className="flex flex-col items-center justify-center h-32 text-destructive p-4 text-center">
                        <p>Error loading notifications</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={refetchUnread}>Try Again</Button>
                      </div>
                    ) : recentNotifications.length > 0 ? (
                      <div className="divide-y divide-border">
                        {recentNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer active:bg-muted relative"
                          >
                            {updatingNotificationId === notif._id && (
                              <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                              </div>
                            )}
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
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-1.5"></span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif._id);
                                    }}
                                    className="text-xs text-primary hover:text-primary/80 font-medium"
                                    disabled={updatingNotificationId === notif._id}
                                  >
                                    Mark read
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground p-4 text-center">
                        <Bell size={32} className="mb-2 opacity-50" />
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-border bg-card sticky bottom-0">
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer"
                      onClick={handleViewAllClick}
                      disabled={isPostingAll}
                    >
                      {isPostingAll ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Marking all as read...
                        </>
                      ) : (
                        'View All Notifications'
                      )}
                    </Button>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Popup Notification for New Bookings */}
      {showPopup && popupData && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div 
            ref={popupRef}
            className="bg-white rounded-lg shadow-2xl border-l-4 border-green-500 w-80 md:w-96 overflow-hidden"
          >
            {/* Popup Header */}
            <div className="bg-green-50 px-4 py-3 flex items-center justify-between border-b border-green-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">New Booking Alert!</h4>
              </div>
              <button
                onClick={handlePopupCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Popup Body */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                {popupData.message}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Received: {new Date(popupData.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>

              {/* Popup Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handlePopupView}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  View Booking
                </Button>
                <Button
                  onClick={handlePopupCancel}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Dismiss
                </Button>
              </div>
            </div>

            {/* Queue Indicator - Shows if there are more pending popups */}
            {pendingPopups.length > 1 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {pendingPopups.length - 1} more notification{pendingPopups.length - 1 > 1 ? 's' : ''} waiting
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}