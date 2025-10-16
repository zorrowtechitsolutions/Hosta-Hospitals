import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X, Bell } from "lucide-react";
import { BackButton } from "../Components/Commen";
import { useNavigate } from "react-router-dom";
import { Booking } from "../Redux/Dashboard";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/Store";
import { apiClient } from "../Components/Axios";

const AppointmentsManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "declained">("all");
  const [newAppointment, setNewAppointment] = useState<Booking | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string>("");

  const navigate = useNavigate();
  const { _id: hospitalId, booking: bookings } = useSelector((state: RootState) => state.Dashboard);

  const appointmentsPerPage = 5;

  // Fetch and sort appointments
  const fetchAppointments = () => {
    const sorted = [...bookings].sort((a, b) =>
      new Date(b.booking_date ?? "").getTime() - new Date(a.booking_date ?? "").getTime()
    );

    setAppointments(sorted);
    setFilteredAppointments(sorted);

    const pending = sorted.find((b) => b.status === "pending");
    setNewAppointment(pending || null);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (
    appointmentId: string,
    status: "accepted" | "declained",
    booking_time?: string
  ) => {
    try {
      const res = await apiClient.put(`/api/bookings/${appointmentId}/hospital/${hospitalId}`, {
        status,
        ...(status === "accepted" && booking_time ? { booking_time } : {}),
      },{withCredentials:true});

      const updated = res.data.data;
      console.log(updated,"UPdpaf")

      const updatedList = appointments.map((a) =>
        a._id === appointmentId ? { ...a, status: updated.status, booking_time: updated.booking_time } : a
      );

      setAppointments(updatedList);

      const filtered =
        filterStatus === "all"
          ? updatedList
          : updatedList.filter((a) => a.status === filterStatus);

      setFilteredAppointments(filtered);
      setSelectedAppointment(null);
      setNewAppointment(null);
      setAppointmentTime("");
    } catch (err) {
      console.error("Failed to update booking:", err);
    }
  };

  const handleNewAppointment = async (action: "accept" | "decline") => {
    if (!newAppointment) return;

    if (action === "accept" && !appointmentTime) return;

    await updateStatus(
      newAppointment._id!,
      action === "accept" ? "accepted" : "declained",
      action === "accept" ? appointmentTime : undefined
    );
  };

  const filterAppointments = (
    status: "all" | "pending" | "accepted" | "declained"
  ) => {
    setFilterStatus(status);
    if (status === "all") {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter((a) => a.status === status));
    }
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirst, indexOfLast);

  const paginate = (page: number) => setCurrentPage(page);

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton OnClick={() => navigate("/Dashboard")} />
      <h1 className="text-3xl font-bold text-green-800 mb-4">Appointments Management</h1>

      {/* New Appointment Alert */}
      {newAppointment && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
          <div className="flex items-center">
            <Bell className="text-yellow-500 mr-2" />
            <p className="text-yellow-700">
              New appointment request for{" "}
              <strong>{newAppointment.specialty}</strong> with{" "}
              <strong>{newAppointment.doctor_name}</strong> on{" "}
              {new Date(newAppointment.booking_date!).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="border border-yellow-300 px-2 py-1 rounded-md"
            />
            <button
              onClick={() => handleNewAppointment("accept")}
              disabled={!appointmentTime}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => handleNewAppointment("decline")}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "pending", "accepted", "declained"].map((status) => (
          <button
            key={status}
            onClick={() => filterAppointments(status as any)}
            className={`px-4 py-2 rounded-md ${
              filterStatus === status
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-800"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-green-200">
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Specialty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-green-200">
            {currentAppointments.map((appointment) => (
              <tr key={appointment._id}>
                <td className="px-6 py-4">{appointment.specialty}</td>
                <td className="px-6 py-4">{appointment.doctor_name}</td>
                <td className="px-6 py-4">
                  {new Date(appointment.booking_date!).toLocaleDateString()}{" "}
                  {appointment.booking_time || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      appointment.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "declained"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setAppointmentTime("");
                    }}
                    className="text-green-600 hover:text-green-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-green-700">
          Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredAppointments.length)} of {filteredAppointments.length} appointments
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-green-100 text-green-800 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-green-800">Page {currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLast >= filteredAppointments.length}
            className="px-3 py-1 rounded-md bg-green-100 text-green-800 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Appointment Details</h2>
            <p><strong>Specialty:</strong> {selectedAppointment.specialty}</p>
            <p><strong>Doctor:</strong> {selectedAppointment.doctor_name}</p>
            <p><strong>Date:</strong> {new Date(selectedAppointment.booking_date!).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedAppointment.booking_time || "N/A"}</p>
            <p><strong>Status:</strong> <span className="capitalize">{selectedAppointment.status}</span></p>

            {selectedAppointment.status === "pending" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Appointment Time</label>
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 w-full"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-2">
              {selectedAppointment.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      updateStatus(selectedAppointment._id!, "accepted", appointmentTime)
                    }
                    disabled={!appointmentTime}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="inline mr-2" size={20} />
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      updateStatus(selectedAppointment._id!, "declained")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <X className="inline mr-2" size={20} />
                    Decline
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagement;