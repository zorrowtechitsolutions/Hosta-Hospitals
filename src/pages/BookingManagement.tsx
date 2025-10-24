// DoctorBookingManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Building,
  Stethoscope,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { BackButton } from "../Components/Commen";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/Store";
import { apiClient } from "../Components/Axios";
import { Specialty } from "../Redux/Dashboard";


const DoctorBookingManagement: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const navigate = useNavigate();
  const hospitalData = useSelector((state: RootState) => state.Dashboard);

  // Load doctors from Redux store
  useEffect(() => {
    if (hospitalData.specialties && hospitalData.specialties.length > 0) {
      setSpecialties(hospitalData.specialties);
      setLoading(false);
    }
  }, [hospitalData.specialties]);

  const updateDoctorBookingStatus = async (
    specialtyId: string,
    doctorId: string,
    bookingOpen: boolean
  ) => {
    setUpdating((prev) => ({ ...prev, [doctorId]: true }));
    setMessage(null);

    try {
        
      const res = await apiClient.put(
        `/api/hospital/${hospitalData._id}/specialty/${specialtyId}/doctor/${doctorId}/booking-status`,
        { bookingOpen },
        { withCredentials: true }
      );
console.log(res.data);

      // Update local state
      setSpecialties((prev) =>
        prev.map((specialty) =>
          specialty._id === specialtyId
            ? {
                ...specialty,
                doctors: specialty.doctors.map((doctor) =>
                  doctor._id === doctorId ? { ...doctor, bookingOpen } : doctor
                ),
              }
            : specialty
        )
      );

      setMessage({
        type: "success",
        text:
          res.data.message ||
          `Booking ${bookingOpen ? "opened" : "closed"} successfully`,
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to update booking status",
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [doctorId]: false }));
    }
  };

  const toggleBookingStatus = (
    specialtyId: string,
    doctorId: string,
    currentStatus: boolean
  ) => {
    updateDoctorBookingStatus(specialtyId, doctorId, !currentStatus);
  };

  const getConsultingDays = (consulting: any[]) => {
    if (!consulting || consulting.length === 0) return "Not specified";
    return consulting.map((c) => c.day).join(", ");
  };

  const getStatusBadge = (isOpen: boolean) => {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isOpen
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}
      >
        {isOpen ? (
          <>
            <CheckCircle size={14} className="mr-1" />
            Accepting Bookings
          </>
        ) : (
          <>
            <XCircle size={14} className="mr-1" />
            Bookings Closed
          </>
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <BackButton OnClick={() => navigate(-1)} />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building className="mr-3 text-blue-600" size={32} />
                Doctor Booking Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage booking availability for your doctors
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border">
              <span className="font-semibold">{specialties.length}</span>{" "}
              Specialties •{" "}
              <span className="font-semibold">
                {specialties.reduce(
                  (total, spec) => total + spec.doctors.length,
                  0
                )}
              </span>{" "}
              Doctors
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <CheckCircle size={20} className="mr-2" />
              ) : (
                <AlertCircle size={20} className="mr-2" />
              )}
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-auto hover:opacity-70"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Specialties List */}
        <div className="space-y-6">
          {specialties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Doctors Found
              </h3>
              <p className="text-gray-500">
                Add doctors to your specialties to manage their booking
                availability.
              </p>
            </div>
          ) : (
            specialties.map((specialty) => (
              <div
                key={specialty._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Specialty Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Stethoscope className="text-blue-600 mr-3" size={24} />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {specialty.name}
                        </h2>
                        <p className="text-gray-600 text-sm">
                          {specialty.doctors.length} doctor
                          {specialty.doctors.length !== 1 ? "s" : ""} in this
                          specialty
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                      Department
                    </div>
                  </div>
                </div>

                {/* Doctors List */}
                <div className="divide-y divide-gray-100">
                  {specialty.doctors.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <Users className="mx-auto h-8 w-8 mb-2" />
                      No doctors in this specialty
                    </div>
                  ) : (
                    specialty.doctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Dr. {doctor.name}
                                  </h3>
                                  {getStatusBadge(doctor.bookingOpen as boolean)}
                                </div>

                                {doctor.qualification && (
                                  <p className="text-gray-600 text-sm mb-2">
                                    {doctor.qualification}
                                  </p>
                                )}

                                {doctor.consulting &&
                                  doctor.consulting.length > 0 && (
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Calendar size={14} className="mr-1" />
                                      <span>
                                        Available on:{" "}
                                        {getConsultingDays(doctor.consulting)}
                                      </span>
                                    </div>
                                  )}
                              </div>

                              {/* Toggle Switch */}
                              <div className="flex items-center gap-4 ml-6">
                                <div className="text-right">
                                  <button
                                    onClick={() =>
                                      toggleBookingStatus(
                                        specialty._id,
                                        doctor._id as string,
                                        doctor.bookingOpen as boolean
                                      )
                                    }
                                    disabled={updating[doctor._id as string]}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                      doctor.bookingOpen
                                        ? "bg-green-600"
                                        : "bg-gray-300"
                                    } ${
                                      updating[doctor._id as string]
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        doctor.bookingOpen
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {updating[doctor._id as string] ? (
                                      <span className="flex items-center">
                                        <RefreshCw
                                          size={12}
                                          className="animate-spin mr-1"
                                        />
                                        Updating...
                                      </span>
                                    ) : doctor.bookingOpen ? (
                                      "Click to close bookings"
                                    ) : (
                                      "Click to open bookings"
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle
              className="text-blue-500 mr-3 mt-0.5 flex-shrink-0"
              size={18}
            />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  When booking is{" "}
                  <span className="font-semibold text-green-700">OPEN</span>,
                  patients can book appointments with this doctor
                </li>
                <li>
                  When booking is{" "}
                  <span className="font-semibold text-red-700">CLOSED</span>,
                  patients cannot book new appointments
                </li>
                <li>Existing appointments are not affected by this setting</li>
                <li>
                  Use this to manage doctor availability during vacations,
                  leaves, or high workload periods
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorBookingManagement;
