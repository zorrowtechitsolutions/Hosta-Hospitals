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
import axios from "axios";

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
    await axios
      .post(
        ` http://localhost:3000/api/hospital/specialty/${_id}`,
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
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");

  // Initialize form data
  const [formData, setFormData] = useState<Specialty>(
    specialty || {
      _id: "",
      name: "",
      description: "",
      department_info: "",
      phone: "",
      doctors: [],
    }
  );

  // Load specialties list from JSON
  useEffect(() => {
    setSpecialties(specialtiesData);
  }, []);

  // If editing, prefill form with existing specialty
  useEffect(() => {
    if (specialty) {
      setFormData(specialty);
      setSelectedSpecialty(specialty.name || "");
    }
  }, [specialty]);

  // Show suggestions when input is focused (only for adding)
  const handleInputFocus = () => {
    if (!specialty) { // Only show suggestions when adding (not editing)
      setShowSuggestions(true);
    }
  };

  // Specialty change (only for adding new specialties)
  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (specialty) return; // Disable for editing

    const value = e.target.value;
    setSelectedSpecialty(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (specialty) return; // Disable for editing

    setSelectedSpecialty(suggestion);
    setFormData((prev) => ({
      ...prev,
      name: suggestion.toUpperCase(),
    }));
    setShowSuggestions(false);
  };

  // Phone number validation - only digits and max 10 characters
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only digits
    const digitsOnly = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digitsOnly.slice(0, 10);
    
    setFormData((prev) => ({ ...prev, phone: limitedDigits }));
    
    // Set error if not exactly 10 digits (but allow empty)
    if (limitedDigits && limitedDigits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.specialty-input-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter suggestions based on input
  const filteredSuggestions = specialties.filter(s =>
    s.toLowerCase().includes(selectedSpecialty.toLowerCase())
  );


   const isValidSpecialty = () => {
    return specialties.some(s => 
      s.toLowerCase() === selectedSpecialty.toLowerCase()
    );
  };

  

  // Submit with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!specialty && !selectedSpecialty.trim()) {
      alert("Please select a specialty");
      return;
    }

      if (!isValidSpecialty()) {
        alert("Please select a valid specialty from the list");
        return;
      }

    // Validate phone number before submit
    if (formData.phone && formData.phone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return;
    }

    const submitData = specialty 
      ? {
          ...formData,
          // Keep existing specialty name when editing
        }
      : {
          ...formData,
          name: selectedSpecialty.toUpperCase(),
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
          {/* Specialty Field - Editable only when adding */}
          <div className="relative specialty-input-container">
            <label className="block text-sm font-medium text-green-700 mb-2">
              Specialty *
            </label>
            
            {specialty ? (
              // Editing mode - disabled input
              <input
                type="text"
                value={specialty.name}
                className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-700 cursor-not-allowed"
                disabled
                readOnly
              />
            ) : (
              // Adding mode - editable input with suggestions
              <>
                <input
                  type="text"
                  value={selectedSpecialty}
                  onChange={handleSpecialtyChange}
                  onFocus={handleInputFocus}
                  onClick={handleInputFocus}
                  className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Search and select specialty..."
                  required
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 bg-white w-full border border-green-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-2 hover:bg-green-50 cursor-pointer border-b border-green-100 last:border-b-0 transition-colors"
                        >
                          {s}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">
                        No specialties found
                      </div>
                    )}
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

          {/* Phone with validation */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Phone {formData.phone && (
                <span className="text-xs text-gray-500 ml-1">
                  ({formData.phone.length}/10 digits)
                </span>
              )}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:border-green-500 ${
                phoneError 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-green-300 focus:ring-green-500'
              }`}
              placeholder="Enter 10 digit phone number..."
              maxLength={10} // HTML maxLength attribute
            />
            {phoneError && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {phoneError}
              </p>
            )}
            {formData.phone && !phoneError && (
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Valid phone number
              </p>
            )}
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
              disabled={!!phoneError} // Disable submit if phone validation fails
              className={`px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                phoneError
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
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
