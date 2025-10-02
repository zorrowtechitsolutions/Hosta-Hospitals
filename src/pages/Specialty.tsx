import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "../Components/DeleteConfirmation";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../Components/Commen";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/Store";
import { setHospitalData, Specialty } from "../Redux/Dashboard";
import { apiClient } from "../Components/Axios";
import { errorToast, successToast } from "../Components/Toastify";
import specialtiesData from "../Data/Specialties";

const SpecialtyManagement: React.FC = () => {
  const { specialties, _id } = useSelector(
    (state: RootState) => state.Dashboard
  );
  const [filteredSpecialties, setFilteredSpecialties] =
    useState<Specialty[]>(specialties);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(
    null
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    filterSpecialties();
  }, [searchTerm, specialties]);

  const filterSpecialties = () => {
    const filtered: any = specialties.filter(
      (specialty) =>
        specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialty?.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSpecialties(filtered);
  };

  // Add a new specialty.
  const handleAddSpecialty = async (newSpecialty: Omit<Specialty, "id">) => {
    await apiClient
      .post(
        `/api/hospital/specialty/${_id}`,
        { ...newSpecialty },
        { withCredentials: true }
      )
      .then((result) => {
        dispatch(setHospitalData({ specialties: result.data.data }));
        setIsFormOpen(false);
        successToast("Added new specialty");
      })
      .catch((err) => {
        errorToast(err.response.data.message);
      });
  };

  // Edit a specialty.
  const handleUpdateSpecialty = async (updatedSpecialty: Specialty) => {
    await apiClient
      .put(
        `/api/hospital/specialty/${_id}`,
        { ...updatedSpecialty },
        { withCredentials: true }
      )
      .then((result) => {
        dispatch(setHospitalData({ specialties: result.data.data }));
        setIsFormOpen(false);
        setEditingSpecialty(null);
        successToast("Data updated");
      })
      .catch((err) => errorToast(err.response.data.message));
  };

  const handleDeleteSpecialty = async (name: string) => {
    await apiClient
      .delete(`/api/hospital/specialty/${_id}?name=${name}`, {
        withCredentials: true,
      })
      .then((result) => {
        dispatch(setHospitalData({ specialties: result.data.data }));
        successToast("Specialty deleted successfully");
      })
      .catch((err) => errorToast(err.response.data.message));
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      <BackButton OnClick={() => navigate("/dashboard")} />
      <h1 className="text-3xl font-bold text-green-800 mb-6 mt-12 inline-block">
        Specialty Management
      </h1>

      <div className="mb-6">
        <div className="relative flex-grow mb-4">
          <input
            type="text"
            placeholder="Search specialties..."
            className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600"
            size={20}
          />
        </div>

        <div className="flex justify-end">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={20} className="inline mr-2" />
            Add Specialty
          </button>
        </div>
      </div>

      <SpecialtyList
        specialties={filteredSpecialties}
        onEdit={setEditingSpecialty}
        onDelete={handleDeleteSpecialty}
      />

      {(isFormOpen || editingSpecialty) && (
        <SpecialtyForm
          specialty={editingSpecialty}
          onSave={editingSpecialty ? handleUpdateSpecialty : handleAddSpecialty}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingSpecialty(null);
          }}
        />
      )}
    </div>
  );
};

const SpecialtyList: React.FC<{
  specialties: Specialty[];
  onEdit: (specialty: Specialty) => void;
  onDelete: (id: string) => void;
}> = ({ specialties, onEdit, onDelete }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  if (specialties.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-8">
        No Data found. Please add new specialties!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {specialties.map((specialty) => (
        <div
          key={specialty._id}
          className="bg-white p-6 rounded-lg border border-green-200 hover:border-green-300 transition-colors shadow-sm hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                {specialty.name}
              </h2>
              {specialty.sub_specialt && (
                <h4 className="text-lg font-medium text-green-700 mb-2">
                  {specialty.sub_specialt}
                </h4>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onEdit(specialty)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                title="Edit specialty"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => {
                  setIsDeleteOpen(true);
                  setSelectedSpecialty(specialty.name);
                }}
                className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                title="Delete specialty"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {specialty.description && (
            <p className="text-green-600 mb-3 text-sm line-clamp-2">
              {specialty.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            {specialty.department_info && (
              <div>
                <span className="font-medium text-green-700">Department: </span>
                <span className="text-green-600">
                  {specialty.department_info}
                </span>
              </div>
            )}
            {specialty.phone && (
              <div>
                <span className="font-medium text-green-700">Phone: </span>
                <span className="text-green-600">{specialty.phone}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {isDeleteOpen && (
        <DeleteConfirmationDialog
          onCancel={() => {
            setIsDeleteOpen(false);
            setSelectedSpecialty("");
          }}
          onConfirm={() => {
            onDelete(selectedSpecialty);
            setIsDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
};

interface SpecialtyFormProps {
  specialty: Specialty | null;
  onSave: (specialty: Specialty) => void;
  onCancel: () => void;
}

const SpecialtyForm: React.FC<SpecialtyFormProps> = ({
  specialty,
  onSave,
  onCancel,
}) => {
  const [mainSpecialties, setMainSpecialties] = useState<string[]>([]);
  const [subSpecialties, setSubSpecialties] = useState<string[]>([]);
  const [selectedMainSpecialty, setSelectedMainSpecialty] =
    useState<string>("");
  const [selectedSubSpecialty, setSelectedSubSpecialty] = useState<string>("");
  const [showMainSuggestions, setShowMainSuggestions] = useState(false);
  const [showSubSuggestions, setShowSubSuggestions] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState<Specialty>(
    specialty || {
      _id: "",
      name: "",
      main_specialty: "",
      sub_specialt: "",
      description: "",
      department_info: "",
      phone: "",
      doctors: [],
    }
  );

  // Load main specialties list from JSON
  useEffect(() => {
    const mainSpecialtiesList = specialtiesData.map((item) => {
      const key = Object.keys(item)[0];
      return key;
    });
    setMainSpecialties(mainSpecialtiesList);
  }, []);

  // If editing, prefill form with existing specialty
  useEffect(() => {
    if (specialty) {
      setFormData(specialty);
      setSelectedMainSpecialty(specialty.main_specialty || "");
      setSelectedSubSpecialty(specialty.sub_specialt || "");

      // Load sub-specialties for the existing main specialty
      const mainSpecialtyData = specialtiesData.find((item) => {
        const key = Object.keys(item)[0];
        return key.toLowerCase() === specialty.main_specialty?.toLowerCase();
      });
      if (mainSpecialtyData) {
        const key = Object.keys(mainSpecialtyData)[0];
        setSubSpecialties(mainSpecialtyData[key] || []);
      }
    }
  }, [specialty]);

  // Main specialty change (only for new specialties)
  const handleMainSpecialtyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (specialty) return; // Disable for editing

    const value = e.target.value;
    setSelectedMainSpecialty(value);
    setShowMainSuggestions(true);
    setFormData((prev) => ({ ...prev, main_specialty: value }));
  };

  const handleMainSuggestionClick = (suggestion: string) => {
    if (specialty) return; // Disable for editing

    setSelectedMainSpecialty(suggestion);
    setFormData((prev) => ({
      ...prev,
      name: suggestion.toUpperCase(),
      main_specialty: suggestion,
      sub_specialt: "",
    }));

    // load sub-specialties
    const mainSpecialtyData = specialtiesData.find((item) => {
      const key = Object.keys(item)[0];
      return key.toLowerCase() === suggestion.toLowerCase();
    });
    if (mainSpecialtyData) {
      const key = Object.keys(mainSpecialtyData)[0];
      setSubSpecialties(mainSpecialtyData[key] || []);
    }
    setShowMainSuggestions(false);
  };

  // Sub-specialty change (only when allowed)
  const handleSubSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only for new specialties OR when editing and no sub-specialty exists
    if (specialty && specialty.sub_specialt) return;

    const value = e.target.value;
    setSelectedSubSpecialty(value);
    setShowSubSuggestions(true);
  };

  const handleSubSuggestionClick = (suggestion: string) => {
    // Allow only for new specialties OR when editing and no sub-specialty exists
    if (specialty && specialty.sub_specialt) return;

    setSelectedSubSpecialty(suggestion);
    setFormData((prev) => ({
      ...prev,
      sub_specialt: suggestion,
    }));
    setShowSubSuggestions(false);
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!specialty && !selectedMainSpecialty) {
      alert("Please select a main specialty");
      return;
    }

    const submitData = specialty
      ? {
          ...formData,
          // Only include sub_specialt if we're editing and user added one
          sub_specialt: specialty.sub_specialt || selectedSubSpecialty,
        }
      : {
          ...formData,
          name: selectedMainSpecialty.toUpperCase(),
          main_specialty: selectedMainSpecialty,
          sub_specialt: selectedSubSpecialty,
        };

    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-800 mb-6">
          {specialty ? "Edit Specialty" : "Add New Specialty"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Specialty - Disabled when editing */}
          <div className="relative">
            <label className="block text-sm font-medium text-green-700 mb-2">
              Main Specialty {!specialty && "*"}
            </label>
            {specialty ? (
              <input
                type="text"
                value={specialty.name}
                className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 cursor-not-allowed"
                disabled
              />
            ) : (
              <>
                <input
                  type="text"
                  value={selectedMainSpecialty}
                  onChange={handleMainSpecialtyChange}
                  className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Search and select main specialty..."
                  required
                  autoComplete="off"
                />
                {showMainSuggestions && (
                  <div className="absolute z-10 bg-white w-full border border-green-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {mainSpecialties
                      .filter((s) =>
                        s
                          .toLowerCase()
                          .includes(selectedMainSpecialty.toLowerCase())
                      )
                      .map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleMainSuggestionClick(s)}
                          className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-green-100 last:border-b-0"
                        >
                          {s}
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sub Specialty */}
          <div className="relative">
            <label className="block text-sm font-medium text-green-700 mb-2">
              Sub-Specialty (Optional)
            </label>
            {specialty ? (
              // When editing
              specialty.sub_specialt ? (
                // If sub-specialty exists, show as disabled
                <input
                  type="text"
                  value={specialty.sub_specialt}
                  className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 cursor-not-allowed"
                  disabled
                />
              ) : (
                // If no sub-specialty exists, allow adding one
                <>
                  <input
                    type="text"
                    value={selectedSubSpecialty}
                    onChange={handleSubSpecialtyChange}
                    className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Search and select sub-specialty..."
                    autoComplete="off"
                  />
                  {showSubSuggestions && subSpecialties.length > 0 && (
                    <div className="absolute z-10 bg-white w-full border border-green-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                      {subSpecialties
                        .filter((s) =>
                          s
                            .toLowerCase()
                            .includes(selectedSubSpecialty.toLowerCase())
                        )
                        .map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSubSuggestionClick(s)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-green-100 last:border-b-0"
                          >
                            {s}
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )
            ) : (
              // When adding new specialty
              <>
                <input
                  type="text"
                  value={selectedSubSpecialty}
                  onChange={handleSubSpecialtyChange}
                  className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Search and select sub-specialty..."
                  autoComplete="off"
                />
                {showSubSuggestions && subSpecialties.length > 0 && (
                  <div className="absolute z-10 bg-white w-full border border-green-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {subSpecialties
                      .filter((s) =>
                        s
                          .toLowerCase()
                          .includes(selectedSubSpecialty.toLowerCase())
                      )
                      .map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSubSuggestionClick(s)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-green-100 last:border-b-0"
                        >
                          {s}
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Brief description of the specialty..."
            />
          </div>

          {/* Department Info */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Department Info
            </label>
            <input
              type="text"
              value={formData.department_info}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  department_info: e.target.value,
                }))
              }
              className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Additional department information..."
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Department contact number..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-green-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {specialty ? "Update" : "Add"} Specialty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialtyManagement;
