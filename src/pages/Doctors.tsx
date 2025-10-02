import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "../Components/UI/Button";
import { FormInput } from "../Components/Commen";
import { Select } from "../Components/UI/Select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../Components/UI/Card";
import { BackButton } from "../Components/Commen";
import { DeleteConfirmationDialog } from "../Components/DeleteConfirmation";
import { setHospitalData } from "../Redux/Dashboard";
import { RootState } from "../Redux/Store";
import { apiClient } from "../Components/Axios";

interface ConsultingSession {
  start_time: string;
  end_time: string;
}

interface ConsultingDay {
  day: string;
  sessions: ConsultingSession[];
}

interface Doctor {
  _id?: string;
  name: string;
  specialty?: string;
  qualification?: string;
  consulting: ConsultingDay[];
}

interface Specialty {
  _id: string;
  name: string;
  doctors: Doctor[];
}

const emptySession = (): ConsultingSession => ({
  start_time: "",
  end_time: "",
});
const emptyDay = (): ConsultingDay => ({ day: "", sessions: [emptySession()] });

const DoctorManagement: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // cast Dashboard slice for safer typing here (adjust if your RootState has a different shape)
  const { specialties, _id } = useSelector(
    (state: RootState) => state.Dashboard
  ) as {
    specialties: Specialty[];
    _id: string;
  };

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [doctorToDelete, setDoctorToDelete] = useState<{
    specialtyName: string;
    doctorId: string;
  } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Doctor>({
    _id: "",
    name: "",
    specialty: "",
    qualification: "",
    consulting: [emptyDay()],
  });

  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Filtered specialties (typed)
  const filteredSpecialties = (specialties || []).filter(
    (specialty: Specialty) => {
      // specialty-level filters (searchTerm, selectedSpecialty, selectedDay)
      const matchesSpecialty =
        selectedSpecialty === "" ||
        specialty.name.toLowerCase() === selectedSpecialty.toLowerCase();

      const hasDoctors = (specialty.doctors || []).length > 0;

      const matchesSearch =
        searchTerm === "" ||
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialty.doctors.some((doctor: Doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDay =
        selectedDay === "" ||
        specialty.doctors.some((doctor: Doctor) =>
          doctor.consulting.some(
            (cDay: ConsultingDay) =>
              cDay.day.toLowerCase() === selectedDay.toLowerCase()
          )
        );

      return matchesSpecialty && hasDoctors && matchesSearch && matchesDay;
    }
  );

  const handleDeleteDoctor = (specialtyName: string, doctorId: string) => {
    setDoctorToDelete({ specialtyName, doctorId });
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    try {
      const result = await apiClient.delete(
        `/api/hospital/doctor/${_id}/${doctorToDelete.doctorId}?specialty_name=${doctorToDelete.specialtyName}`,
        { withCredentials: true }
      );
      dispatch(setHospitalData({ specialties: result.data.data }));
      setShowDeleteConfirmation(false);
      setDoctorToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setFormData({
      _id: "",
      name: "",
      qualification: "",
      specialty: "",
      consulting: [emptyDay()],
    });
    setIsFormOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    // clone to avoid mutating original
    const clone = JSON.parse(JSON.stringify(doctor)) as Doctor;
    // ensure at least one day exists
    if (!clone.consulting || clone.consulting.length === 0)
      clone.consulting = [emptyDay()];
    setEditingDoctor(doctor);
    setFormData(clone);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name?.toUpperCase(),
      specialty: formData.specialty?.toUpperCase(),
      consulting: formData.consulting,
      qualification: formData.qualification?.toUpperCase(),
      _id: formData._id,
    };

    try {
      if (editingDoctor) {
        const result = await apiClient.put(
          `/api/hospital/doctor/${_id}`,
          payload,
          {
            withCredentials: true,
          }
        );
        dispatch(setHospitalData({ specialties: result.data.data }));
      } else {
        const result = await apiClient.post(
          `/api/hospital/doctor/${_id}`,
          payload,
          {
            withCredentials: true,
          }
        );
        dispatch(setHospitalData({ specialties: result.data.data }));
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Top-level inputs (name, qualification, specialty)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Day-level handlers
  const addConsultingDay = () => {
    setFormData((prev) => ({
      ...prev,
      consulting: [...prev.consulting, emptyDay()],
    }));
  };

  const removeConsultingDay = (dayIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      consulting: prev.consulting.filter((_, i) => i !== dayIndex),
    }));
  };

  const handleDayChange = (dayIndex: number, newDay: string) => {
    setFormData((prev) => {
      const newConsulting = prev.consulting.map((c, i) =>
        i === dayIndex ? { ...c, day: newDay } : c
      );
      return { ...prev, consulting: newConsulting };
    });
  };

  // Session-level handlers
  const addConsultingSession = (dayIndex: number) => {
    setFormData((prev) => {
      const newConsulting = prev.consulting.map((c, i) =>
        i === dayIndex ? { ...c, sessions: [...c.sessions, emptySession()] } : c
      );
      return { ...prev, consulting: newConsulting };
    });
  };

  const removeConsultingSession = (dayIndex: number, sessionIndex: number) => {
    setFormData((prev) => {
      const newConsulting = prev.consulting.map((c, i) => {
        if (i !== dayIndex) return c;
        const newSessions = c.sessions.filter(
          (_, sIdx) => sIdx !== sessionIndex
        );
        return {
          ...c,
          sessions: newSessions.length ? newSessions : [emptySession()],
        }; // ensure at least one session
      });
      return { ...prev, consulting: newConsulting };
    });
  };

  const handleSessionChange = (
    dayIndex: number,
    sessionIndex: number,
    field: keyof ConsultingSession,
    value: string
  ) => {
    setFormData((prev) => {
      const newConsulting = prev.consulting.map((c, i) => {
        if (i !== dayIndex) return c;
        const newSessions = c.sessions.map((s, si) =>
          si === sessionIndex ? { ...s, [field]: value } : s
        );
        return { ...c, sessions: newSessions };
      });
      return { ...prev, consulting: newConsulting };
    });
  };

  // Utility to display doctor (matches search + day)
  const doctorMatchesFilters = (doctor: Doctor): boolean => {
    const matchesName =
      searchTerm === "" ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay =
      selectedDay === "" ||
      doctor.consulting.some(
        (cDay) => cDay.day.toLowerCase() === selectedDay.toLowerCase()
      );
    return matchesName && matchesDay;
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <BackButton OnClick={() => navigate("/dashboard")} />
      <h1 className="text-3xl font-bold text-green-800 mb-6 mt-12 inline-block">
        Doctors Management
      </h1>

      <div className="mb-6">
        <div className="relative flex-grow mb-4">
          <FormInput
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10 w-full"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600"
            size={20}
          />
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="flex-grow border border-green-300 text-green-600"
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty._id} value={specialty.name}>
                {specialty.name}
              </option>
            ))}
          </Select>

          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="flex-grow border border-green-300 text-green-600"
          >
            <option value="">All Days</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </Select>

          <Button
            onClick={handleAddDoctor}
            className="border border-green-300 text-green-600 hover:bg-green-100"
          >
            <Plus size={20} className="mr-2" />
            Add Doctor
          </Button>
        </div>
      </div>

      {filteredSpecialties.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          No doctors found. Please adjust your search criteria or add a new
          doctor.
        </div>
      ) : (
        filteredSpecialties.map((specialty: Specialty) =>
          specialty.doctors.length > 0 ? (
            <Card
              key={specialty._id}
              className="mb-6 bg-white border-green-300"
            >
              <CardHeader className="bg-green-100 mb-4">
                <CardTitle className="text-green-800">
                  {specialty.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {specialty.doctors
                  .filter(doctorMatchesFilters)
                  .map((doctor: Doctor) => {
                    ;

                    return (
                      <div
                        key={doctor._id ?? doctor.name}
                        className="mb-4 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        {/* Doctor Header */}
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-semibold text-green-800">
                            {doctor.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-100"
                              onClick={() => setIsOpen((prev) => !prev)}
                            >
                              {isOpen
                                ? "Hide Consulting Hours"
                                : "Show Consulting Hours"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2 text-green-600 border-green-600 hover:bg-green-100"
                              onClick={() => handleEditDoctor(doctor)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-100"
                              onClick={() =>
                                handleDeleteDoctor(
                                  specialty.name,
                                  doctor._id as string
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        {doctor.qualification && (
                          <p className="text-green-700 mb-2">
                            Qualification: {doctor.qualification}
                          </p>
                        )}

                        {/* Collapsible Consulting Hours */}
                        {isOpen && (
                            <div>
                              <h4 className="font-semibold text-green-700 mb-3">
                                Consulting Hours:
                              </h4>
                              <div className="space-y-2">
                                {doctor.consulting.map((cDay, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="grid grid-cols-3 gap-4 items-center border-b border-green-100 pb-2"
                                  >
                                    {/* Day */}
                                    <div className="text-gray-800 font-medium">{cDay.day}</div>
                          
                                    {/* First slot */}
                                    <div className="text-green-600">
                                      {cDay.sessions[0]
                                        ? `${convertTo12HourFormat(
                                            cDay.sessions[0].start_time
                                          )} - ${convertTo12HourFormat(cDay.sessions[0].end_time)}`
                                        : "--"}
                                    </div>
                          
                                    {/* Second slot */}
                                    <div className="text-green-600">
                                      {cDay.sessions[1]
                                        ? `${convertTo12HourFormat(
                                            cDay.sessions[1].start_time
                                          )} - ${convertTo12HourFormat(cDay.sessions[1].end_time)}`
                                        : "--"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          ) : null
        )
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmationDialog
          onConfirm={confirmDeleteDoctor}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded w-full max-w-2xl mx-4 overflow-auto max-h-[calc(100vh-7rem)]">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
              </h2>

              <form onSubmit={handleFormSubmit}>
                <FormInput
                  type="text"
                  name="name"
                  placeholder="Doctor Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mb-4"
                />

                <FormInput
                  type="text"
                  name="qualification"
                  placeholder="Doctor Qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="mb-4"
                />

                <Select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="mb-4"
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialties.map((specialty) => (
                    <option key={specialty._id} value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))}
                </Select>

                <h3 className="font-semibold text-green-700 mb-2">
                  Consulting Hours:
                </h3>

                {formData.consulting.map(
                  (daySlot: ConsultingDay, dayIndex: number) => (
                    <div
                      key={dayIndex}
                      className="mb-4 p-4 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Select
                          value={daySlot.day}
                          onChange={(e) =>
                            handleDayChange(dayIndex, e.target.value)
                          }
                          className="flex-1"
                          required
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </Select>

                        <Button
                          type="button"
                          onClick={() => removeConsultingDay(dayIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} className="mr-1" />
                          Remove Day
                        </Button>
                      </div>

                      {daySlot.sessions.map(
                        (session: ConsultingSession, sessionIndex: number) => (
                          <div
                            key={sessionIndex}
                            className="mb-2 flex items-center gap-2"
                          >
                            <FormInput
                              type="time"
                              value={session.start_time}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                handleSessionChange(
                                  dayIndex,
                                  sessionIndex,
                                  "start_time",
                                  e.target.value
                                )
                              }
                              className="flex-1"
                            />
                            <FormInput
                              type="time"
                              value={session.end_time}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                handleSessionChange(
                                  dayIndex,
                                  sessionIndex,
                                  "end_time",
                                  e.target.value
                                )
                              }
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                removeConsultingSession(dayIndex, sessionIndex)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        )
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => addConsultingSession(dayIndex)}
                        >
                          <Plus size={16} className="mr-1" />
                          Add Session
                        </Button>
                      </div>
                    </div>
                  )
                )}

                <div className="mb-4">
                  <Button
                    type="button"
                    onClick={addConsultingDay}
                    className="text-green-600"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Consulting Day
                  </Button>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="bg-gray-300 text-gray-800 hover:bg-gray-400"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {editingDoctor ? "Update Doctor" : "Add Doctor"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;

// Utility: convert HH:MM (24h) -> h:mm AM/PM; returns '' on invalid input
export const convertTo12HourFormat = (time: string) => {
  if (!time) return "";
  const parts = time.split(":");
  if (parts.length < 2) return time;
  const [hoursStr, minutes] = parts;
  let hour = parseInt(hoursStr, 10);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;
  return `${hour}:${minutes} ${period}`;
};
