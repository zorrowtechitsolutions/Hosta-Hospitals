import { useEffect, useState } from "react";
import moment from "moment";
import { Calendar, X } from "lucide-react";
import { apiClient } from "../Components/Axios";
import { BackButton } from "../Components/Commen";
import { useNavigate } from "react-router-dom";

interface NotificationItem {
  _id: string;
  doctor_name: string;
  specialty: string;
  booking_date: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

type ReadFilter = "read" | "unread";

const NotificationPage = () => {
  const [unReadNotifications, setUnReadNotifications] = useState<NotificationItem[]>([]);
  const [readNotifications, setReadNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState<ReadFilter>("unread");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const [unreadRes, readRes] = await Promise.all([
          apiClient.get(`/api/notifications/hospital/no-read/${hospitalId}`),
          apiClient.get(`/api/notifications/hospital/read/${hospitalId}`),
        ]);

        setUnReadNotifications(unreadRes.data || []);
        setReadNotifications(readRes.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [hospitalId]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/api/notifications/hospital/${id}`);
      const notificationToMove = unReadNotifications.find((n) => n._id === id);
      if (notificationToMove) {
        const updated = { ...notificationToMove, isRead: true };
        setUnReadNotifications((prev) => prev.filter((n) => n._id !== id));
        setReadNotifications((prev) => [updated, ...prev]);
      }
          const storedCount = Number(localStorage.getItem("notificationCount")) || 0;
        const newCount = storedCount - 1;
        localStorage.setItem("notificationCount", String(newCount));

    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!hospitalId || unReadNotifications.length === 0) return;
    try {
      await apiClient.patch(`/api/notifications/hospital/read-all/${hospitalId}`);
      const updatedRead = unReadNotifications.map((n) => ({ ...n, isRead: true }));
      setReadNotifications((prev) => [...updatedRead, ...prev]);
      setUnReadNotifications([]);
        const newCount = 0;
        localStorage.setItem("notificationCount", String(newCount));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const filteredNotifications =
    (readFilter === "unread" ? unReadNotifications : readNotifications).filter((n) =>
      dateFilter ? moment(n.createdAt).isSame(moment(dateFilter), "day") : true
    );

  const renderItem = (item: NotificationItem) => (
    <div
      key={item._id}
      onClick={() => !item.isRead && markAsRead(item._id)}
      className={`rounded-xl p-4 shadow-sm border transition-all duration-200 ${
        item.isRead
          ? "bg-gray-50 border-gray-200"
          : "bg-green-50 border-green-500"
      } hover:shadow-md cursor-pointer`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <p className="text-gray-800 font-medium text-sm sm:text-base">{item.specialty}</p>
        <p className="text-xs text-gray-500">{moment(item.createdAt).format("MMM D, YYYY • h:mm A")}</p>
      </div>
      <p className="text-gray-700 text-sm mt-1 leading-5">{item.message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-3xl mx-auto p-3 sm:p-5">
        {/* Header & Filters */}
        <div className="sticky top-0 bg-white border border-gray-200 shadow-sm rounded-xl p-4 mb-4 z-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BackButton OnClick={() => navigate("/dashboard")} />
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">Notifications</h1>
            </div>

            {readFilter === "unread" && unReadNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs sm:text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {/* Tabs and Filters */}
          <div className="mt-4 flex flex-wrap gap-3 justify-between">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["unread", "read"] as ReadFilter[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setReadFilter(tab)}
                  className={`px-3 py-2 text-sm sm:text-base rounded-md font-medium transition-all duration-200 ${
                    readFilter === tab
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                  {tab === "unread"
                    ? unReadNotifications.length
                    : readNotifications.length}
                  )
                </button>
              ))}
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                  dateFilter
                    ? "bg-green-50 border-green-600 text-green-700"
                    : "bg-white border-gray-300 text-gray-700 hover:border-green-600"
                }`}
                onClick={() => setShowDatePicker(true)}
              >
                <Calendar size={16} />
                {dateFilter
                  ? moment(dateFilter).format("MMM D, YYYY")
                  : "Filter by Date"}
              </button>

              {dateFilter && (
                <button
                  onClick={() => setDateFilter(null)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-5 rounded-xl w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-3">Select Date</h3>
              <input
                type="date"
                value={dateFilter ? moment(dateFilter).format("YYYY-MM-DD") : ""}
                onChange={(e) => {
                  setDateFilter(e.target.value ? new Date(e.target.value) : null);
                  setShowDatePicker(false);
                }}
                max={moment().format("YYYY-MM-DD")}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDateFilter(new Date());
                    setShowDatePicker(false);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification List */}
        <div className="mt-2 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => renderItem(item))
          ) : (
            <div className="text-center py-12 bg-white border rounded-xl">
              <Calendar className="mx-auto text-gray-400" size={40} />
              <p className="text-gray-600 mt-3 text-sm sm:text-base">
                No {readFilter} notifications found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
