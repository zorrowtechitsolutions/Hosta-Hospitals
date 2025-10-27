import React, { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Bell,
  Clock,
  User,
  Calendar,
  Phone,
  Settings,
  MapPin,
} from "lucide-react";
import { BackButton } from "../Components/Commen";
import { useNavigate } from "react-router-dom";
import { Booking } from "../Redux/Dashboard";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/Store";
import { apiClient } from "../Components/Axios";

// Types for better type safety
type BookingStatus = "pending" | "accepted" | "declained" | "cancel";
type FilterStatus = "all" | BookingStatus;

interface UpdateBookingPayload {
  status?: BookingStatus;
  booking_date?: string;
  booking_time?: string;
}

// Skeleton Loading Component
const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Patient & Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Service Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="ml-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Skeleton for New Appointments Alert
const NewAppointmentsSkeleton: React.FC = () => {
  return (
    <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-6 w-6 bg-blue-200 rounded mr-3"></div>
          <div className="h-6 bg-blue-200 rounded w-48"></div>
        </div>
        <div className="h-8 bg-blue-200 rounded w-32"></div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="p-4 bg-white rounded-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-3">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AppointmentsManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Booking[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [newAppointments, setNewAppointments] = useState<Booking[]>([]); // Multiple new appointments
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const { _id: hospitalId, booking: bookings } = useSelector(
    (state: RootState) => state.Dashboard
  );

  const appointmentsPerPage = 10;

  // Memoized appointment fetching and sorting
  const fetchAppointments = useCallback(() => {
    const sorted = [...bookings].sort((a, b) => {
      const dateA = new Date(a.booking_date ?? "").getTime();
      const dateB = new Date(b.booking_date ?? "").getTime();
      return dateB - dateA;
    });

    setAppointments(sorted);

    // Find all pending appointments for new appointments alert
    const pendingAppointments = sorted.filter((b) => b.status === "pending");
    setNewAppointments(pendingAppointments);
    
    // Simulate initial loading delay for better UX
    setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
  }, [bookings]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Update filtered appointments when appointments or filter changes
  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((a) => a.status === filterStatus)
      );
    }
    setCurrentPage(1);
  }, [appointments, filterStatus]);

  const updateStatus = async (
    appointmentId: string,
    status: BookingStatus,
    booking_time?: string
  ) => {
    setLoading((prev) => ({ ...prev, [appointmentId]: true }));
    setError(null);

    try {
      const payload: UpdateBookingPayload = { status };

      if (status === "accepted" && booking_time) {
        payload.booking_time = booking_time;
      }

      const res = await apiClient.put(
        `/api/bookings/${appointmentId}/hospital/${hospitalId}`,
        payload,
        { withCredentials: true }
      );

      const updatedBooking = res.data.booking;

      // Update appointments list
      const updatedAppointments = appointments.map((a) =>
        a._id === appointmentId ? { ...a, ...updatedBooking } : a
      );

      setAppointments(updatedAppointments);

      // Remove from new appointments if it was pending
      if (status !== "pending") {
        setNewAppointments((prev) =>
          prev.filter((app) => app._id !== appointmentId)
        );
      }

      // Close modal if open
      if (selectedAppointment?._id === appointmentId) {
        setSelectedAppointment(null);
        setAppointmentTime("");
      }
    } catch (err: any) {
      console.error("Failed to update booking:", err);
      setError(err.response?.data?.message || "Failed to update appointment");
    } finally {
      setLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  function getAge(dob: any) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust if birthday hasn't occurred yet this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  const handleNewAppointmentAction = async (
    appointment: Booking,
    action: "accept" | "decline"
  ) => {
    if (action === "accept" && !appointmentTime) {
      setError("Please set appointment time before accepting");
      return;
    }

    await updateStatus(
      appointment._id!,
      action === "accept" ? "accepted" : "declained",
      action === "accept" ? appointmentTime : undefined
    );
  };

  const filterAppointments = (status: FilterStatus) => {
    setFilterStatus(status);
  };

  // Navigation to Doctor Booking Management
  const navigateToDoctorManagement = () => {
    navigate("/doctor-booking-management");
  };

  // Pagination calculations
  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );

  const paginate = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      accepted: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Accepted",
      },
      declained: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Declined",
      },
      cancel: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <BackButton OnClick={() => navigate("/Dashboard")} />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Appointments Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and track all patient appointments
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3 items-center">
              {!isInitialLoading && (
                <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
                  Total: {appointments.length} appointments
                </span>
              )}
              <button
                onClick={navigateToDoctorManagement}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Settings size={18} />
                Manage Doctor Booking
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <X className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* New Appointments Alert - Show skeleton when loading */}
        {isInitialLoading ? (
          <NewAppointmentsSkeleton />
        ) : newAppointments.length > 0 ? (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Bell className="text-blue-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-blue-900">
                  New Appointment Requests ({newAppointments.length})
                </h3>
              </div>
              <button
                onClick={navigateToDoctorManagement}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-white text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
              >
                <Settings size={14} />
                Doctor Settings
              </button>
            </div>
            <div className="space-y-3">
              {newAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-blue-100"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                      <span className="font-medium text-gray-900">
                        {appointment?.patient_name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {appointment.specialty} with Dr.{" "}
                        {appointment.doctor_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(
                          appointment.booking_date!
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {appointment.userId?.phone && (
                        <span className="flex items-center">
                          <Phone size={16} className="mr-1" />
                          {appointment.patient_phone}
                        </span>
                      )}
                      {appointment.userId?.email && (
                        <span className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          {getAge(appointment.patient_dob)}
                        </span>
                      )}
                      {appointment.userId?.email && (
                        <span className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          {appointment.patient_place}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-3">
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      onClick={() =>
                        handleNewAppointmentAction(appointment, "accept")
                      }
                      disabled={!appointmentTime || loading[appointment._id!]}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading[appointment._id!] ? "Processing..." : "Accept"}
                    </button>
                    <button
                      onClick={() =>
                        handleNewAppointmentAction(appointment, "decline")
                      }
                      disabled={loading[appointment._id!]}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading[appointment._id!] ? "Processing..." : "Decline"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Filter Tabs */}
        {!isInitialLoading && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: "all" as const,
                  label: "All Appointments",
                  count: appointments.length,
                },
                {
                  key: "pending" as const,
                  label: "Pending",
                  count: appointments.filter((a) => a.status === "pending")
                    .length,
                },
                {
                  key: "accepted" as const,
                  label: "Accepted",
                  count: appointments.filter((a) => a.status === "accepted")
                    .length,
                },
                {
                  key: "declained" as const,
                  label: "Declined",
                  count: appointments.filter((a) => a.status === "declained")
                    .length,
                },
                {
                  key: "cancel" as const,
                  label: "Cancelled",
                  count: appointments.filter((a) => a.status === "cancel").length,
                },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => filterAppointments(key)}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    filterStatus === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      filterStatus === key
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Table - Show skeleton when loading */}
        {isInitialLoading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Patient & Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Service Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAppointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setAppointmentTime(appointment.booking_time || "");
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <User className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient_name || "N/A"}
                            </div>
                            {appointment.userId?.email && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {getAge(appointment.patient_dob)}
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              {appointment.patient_phone || "No phone"}
                            </div>
                            {appointment.userId?.email && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {appointment.patient_place}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {appointment.specialty}
                        </div>
                        <div className="text-sm text-gray-500">
                          Dr. {appointment.doctor_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="mr-2 text-gray-400" size={16} />
                          {new Date(
                            appointment.booking_date!
                          ).toLocaleDateString()}
                        </div>
                        {appointment.booking_time && (
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="mr-2 text-gray-400" size={16} />
                            {appointment.booking_time}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={appointment.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setAppointmentTime(appointment.booking_time || "");
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium text-sm transition-colors"
                          >
                            View Details
                          </button>
                          {appointment.status === "pending" && (
                            <>
                              <button
                                onClick={() => {
                                  if (!appointment.booking_time) {
                                    setError(
                                      "Please set appointment time before accepting"
                                    );
                                    setSelectedAppointment(appointment);
                                    return;
                                  }
                                  updateStatus(
                                    appointment._id!,
                                    "accepted",
                                    appointment.booking_time
                                  );
                                }}
                                disabled={
                                  loading[appointment._id!] ||
                                  !appointment.booking_time
                                }
                                className="text-green-600 hover:text-green-900 font-medium text-sm transition-colors disabled:opacity-50"
                              >
                                {loading[appointment._id!] ? "..." : "Accept"}
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(appointment._id!, "declained")
                                }
                                disabled={loading[appointment._id!]}
                                className="text-red-600 hover:text-red-900 font-medium text-sm transition-colors disabled:opacity-50"
                              >
                                {loading[appointment._id!] ? "..." : "Decline"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {currentAppointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No appointments found
                </h3>
                <p className="mt-2 text-gray-500">
                  {filterStatus === "all"
                    ? "No appointments have been scheduled yet."
                    : `No ${filterStatus} appointments found.`}
                </p>
                <button
                  onClick={navigateToDoctorManagement}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings size={18} />
                  Manage Doctor Availability
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination - Only show when not loading and there are appointments */}
        {!isInitialLoading && filteredAppointments.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLast, filteredAppointments.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">{filteredAppointments.length}</span>{" "}
              results
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Appointment Details Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Appointment Details
                  </h2>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Patient Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Patient Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {selectedAppointment?.patient_name || "N/A"}
                        </span>
                      </div>
                           <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">
                          {getAge(selectedAppointment.patient_dob)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-medium">
                          {selectedAppointment?.patient_phone || "N/A"}
                        </span>
                      </div>
                 
                      <div className="flex justify-between">
                        <span className="text-gray-600">Place:</span>
                        <span className="font-medium">
                          {selectedAppointment.patient_place}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Appointment Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specialty:</span>
                        <span className="font-medium">
                          {selectedAppointment.specialty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="font-medium">
                          Dr. {selectedAppointment.doctor_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Date(
                            selectedAppointment.booking_date!
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {selectedAppointment.booking_time || "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <StatusBadge status={selectedAppointment.status} />
                      </div>
                    </div>
                  </div>

                  {/* Action Section for Pending Appointments */}
                  {selectedAppointment.status === "pending" && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">
                        Manage Appointment
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            Set Appointment Time *
                          </label>
                          <input
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                            className="w-full border border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            * Time is required to accept appointment
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              updateStatus(
                                selectedAppointment._id!,
                                "accepted",
                                appointmentTime
                              )
                            }
                            disabled={
                              !appointmentTime ||
                              loading[selectedAppointment._id!]
                            }
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Check className="mr-2" size={20} />
                            {loading[selectedAppointment._id!]
                              ? "Processing..."
                              : "Accept"}
                          </button>
                          <button
                            onClick={() =>
                              updateStatus(
                                selectedAppointment._id!,
                                "declained"
                              )
                            }
                            disabled={loading[selectedAppointment._id!]}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <X className="mr-2" size={20} />
                            {loading[selectedAppointment._id!]
                              ? "Processing..."
                              : "Decline"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsManagement;
