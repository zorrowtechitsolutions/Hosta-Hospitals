import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, Clock } from "lucide-react";
import { DeleteConfirmationDialog } from "../Components/DeleteConfirmation";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../Components/Commen";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/Store";
import { Doctor, setHospitalData, Specialty } from "../Redux/Dashboard";
import { apiClient } from "../Components/Axios";
import { errorToast, successToast } from "../Components/Toastify";
import { convertTo12HourFormat } from "./Doctors";

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
      })
      .catch((err) => errorToast(err.response.data.message));
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <BackButton OnClick={() => navigate("/dashboard")} />
      <h1 className="text-3xl font-bold text-green-800 mb-6 mt-12 inline-block">
        Specialty Management
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow">
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
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus size={20} className="inline mr-2" />
          Add Specialty
        </button>
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

  return (
    <div>
      {specialties.length === 0 ? (
        <div className="text-center text-gray-600 mt-8">
          No Data found. Please add new specialties!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty) => (
            <div
              key={specialty._id}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                {specialty.name}
              </h2>

                  <h4 className="text-xl font-semibold text-green-800 mb-2">
                {specialty?.sub_specialt}
              </h4>

              <p className="text-green-600 mb-4">{specialty.description}</p>
              <p className="text-sm text-green-700 mb-2">
                {specialty.department_info}
              </p>
              <p className="text-sm text-green-700 mb-4">
                Phone: {specialty.phone}
              </p>
              <h3 className="font-semibold text-green-700 mb-2">Doctors:</h3>
              <ul className="space-y-1 mb-4">
                {specialty.doctors.map((doctor) => (
                  <li key={doctor._id} className="text-green-600">
                    {doctor.name}
                    <ul className="ml-4 text-sm">
                      {doctor.consulting.map((schedule: any, index : any) => (
                        <li key={index}>
                          {schedule.day}:{" "}
                          {convertTo12HourFormat(schedule.start_time)} -{" "}
                          {convertTo12HourFormat(schedule.end_time)}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onEdit(specialty)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsDeleteOpen(true);
                    setSelectedSpecialty(specialty.name);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
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
      )}
    </div>
  );
};



// Define proper TypeScript interfaces for your data
interface SpecialtyData {
  [key: string]: string[];
}

interface SpecialtyFormProps {
  specialty: Specialty | null;
  onSave: (specialty: Specialty) => void;
  onCancel: () => void;
}

const SpecialtyForm: React.FC<SpecialtyFormProps> = ({ specialty, onSave, onCancel }) => {
  const [mainSpecialties, setMainSpecialties] = useState<string[]>([]);
  const [subSpecialties, setSubSpecialties] = useState<string[]>([]);
  const [selectedMainSpecialty, setSelectedMainSpecialty] = useState<string>("");
  const [selectedSubSpecialty, setSelectedSubSpecialty] = useState<string>("");
  const [showMainSuggestions, setShowMainSuggestions] = useState(false);
  const [showSubSuggestions, setShowSubSuggestions] = useState(false);

  // Your JSON data with proper typing
 const [specialtiesData] = useState<SpecialtyData[]>(
    [
    {
      "cardiology": [
        "cardiothoracic surgeon",
        "general cardiologist",
        "echo cardiologist",
        "interventional cardiologist",
        "electrophysiologist",
        "congenital cardiologist",
        "transplant and heart failure cardiologist",
        "preventive cardiologist"
      ]
    },
    {
      "neurology": ["neurosurgery"]
    },
    {
      "nephrology": [
        "critical care nephrology",
        "critical care nephrology",
        "pediatric nephrology",
        "transplant nephrology",
        "onconephrology",
        "cardionephrology",
        "onconephrology"
      ]
    },
    {
      "urology": [
        "Endourology",
        "Urologic Oncology",
        "Functional Urology",
        "Andrology",
        "Reconstructive Urology",
        "Paediatric Urology",
        "Urogynecology"
      ]
    },
    {
      "emergency medicine": [
        "critical care medicine",
        "medical toxicology",
        "pediatric emergency medicine",
        "sports medicine",
        "pain medicine"
      ]
    },
    {
      "ENT": [
        "Otology",
        "Rhinology",
        "Laryngology",
        "Head & Neck Surgery",
        "Facial Plastics",
        "Neurotology",
        "Pediatric ENT"
      ]
    },
    {
      "ophthalmology": [
        "corneal disease",
        "glaucoma",
        "retinal disease",
        "pediatric ophthalmology",
        "neuro-ophthalmology",
        "oculoplastics",
        "ocular oncology",
        "uveitis",
        "ophthalmic pathology",
        "cataract and refractive surgery"
      ]
    },
    {
      "general medicine": [
        "cardiology",
        "neurology",
        "gastroenterology",
        "endocrinology",
        "oncology",
        "nephrology",
        "infectious Diseases"
      ]
    },
    {
      "psychiatry": [
        "child and adolescent psychiatry",
        "geriatric psychiatry",
        "addiction psychiatry",
        "forensic psychiatry",
        "neuropsychiatry",
        "emergency psychiatry"
      ]
    },
    {
      "dermatology": ["surgical dermatology", "cosmetic dermatology"]
    },
    {
      "radiology": ["diagnostic", "interventional radiology"]
    },
    {
      "pulmonology": []
    },
    {
      "general surgery": [
        "breast surgery",
        "colorectal surgery",
        "endocrine surgery",
        "upper gastrointestinal surgery",
        "transplant surgery",
        "surgical oncology",
        "vascular surgery"
      ]
    },
    {
      "orthopaedics": [
        "adult reconstructive surgery",
        "foot and ankle surgery",
        "hand surgery",
        "orthopaedic trauma",
        "orthopaedic oncology",
        "pediatric orthopaedic surgery",
        "spine surgery",
        "sports medicine"
      ]
    },
    {
      "anaesthesiology": ["cardiac", "obstetric", "pediatric", "neuro"]
    },
    {
      "paediatrics": [
        "paediatric cardiology",
        "paediatric gastroenterology",
        "paediatric endocrinology",
        "paediatric nephrology",
        "paediatric genetics",
        "paediatric neurology",
        "paediatric allergy & Immunology",
        "paediatric oncology",
        "paediatric pulmonology",
        "paediatric plastic surgeon"
      ]
    },
    {
      "obstetrics and gynecology": [
        "maternal-fetal medicine",
        "reproductive endocrinology and infertility",
        "gynecologic oncology",
        "female pelvic medicine and reconstructive surgery",
        "complex family planning"
      ]
    },
    {
      "family medicine": [
        "geriatric medicine",
        "addiction medicine",
        "hospice and palliative medicine",
        "sports medicine",
        "sleep medicine"
      ]
    },
    {
      "geriatrics": []
    },
    {
      "physical medicine and rehabilitation": [
        "brain injury medicine",
        "hospice and palliative medicine",
        "neuromuscular medicine",
        "pain medicine",
        "pediatric rehabilitation medicine",
        "spinal cord injury medicine",
        "sports medicine"
      ]
    },
    {
      "pharmacology": []
    },
    {
      "pathology": [
        "cytopathology",
        "dermatopathology",
        "forensic Pathology",
        "hematopathology",
        "microbiology",
        "immunopathology",
        "molecular pathology"
      ]
    },
    {
      "microbiology": ["bacteriology", "mycology", "virology", "protozoology"]
    },
    {
      "forensic medicine": [
        "forensic pathology",
        "clinical forensic Medicine",
        "forensic toxicology",
        "forensic psychiatry",
        "forensic odontology",
        "forensic anthropology",
        "forensic radiology",
        "forensic radiology"
      ]
    },
    {
      "community medicine": [
        "epidemiology",
        "biostatistics",
        "environmental health",
        "health management",
        "public health nutrition",
        "occupational health",
        "family and community medicine"
      ]
    },
    {
      "anatomy": ["gross anatomy", "microscopic anatomy"]
    },
    {
      "biochemistry": []
    },
    {
      "physiology": []
    },
    {
      "dental": [
        "orthodontics", "endodontics", "oral and maxillofacial surgery", "periodontics", "prosthodontics",  "pediatric dentistry"
      ]
    },
    {
      "eye": []
    }
  ]);

  // Extract main specialties from JSON data
  useEffect(() => {
    const mainSpecialtiesList = specialtiesData.map(item => {
      const key = Object.keys(item)[0];
      return key;
    });
    setMainSpecialties(mainSpecialtiesList);
  }, []);

  // Initialize form and parse existing specialty data when editing
  useEffect(() => {
    if (specialty) {
      // When editing, parse the existing specialty name to extract main and sub specialty
      const specialtyName = specialty.name.toLowerCase();
      
      // Find which main specialty this belongs to
      let foundMainSpecialty = "";
      let foundSubSpecialty = "";

      // First, try to find exact match in main specialties
      for (const mainSpec of mainSpecialties) {
        if (specialtyName.includes(mainSpec.toLowerCase())) {
          foundMainSpecialty = mainSpec;
          break;
        }
      }

      // If no exact main specialty match found, try partial matching
      if (!foundMainSpecialty) {
        for (const mainSpec of mainSpecialties) {
          const words = mainSpec.toLowerCase().split(' ');
          const hasMatch = words.some(word => 
            word.length > 3 && specialtyName.includes(word)
          );
          if (hasMatch) {
            foundMainSpecialty = mainSpec;
            break;
          }
        }
      }

      // If we found a main specialty, look for sub-specialty
      if (foundMainSpecialty) {
        const mainSpecialtyData = specialtiesData.find(item => {
          const key = Object.keys(item)[0];
          return key.toLowerCase() === foundMainSpecialty.toLowerCase();
        });

        if (mainSpecialtyData) {
          const key = Object.keys(mainSpecialtyData)[0];
          const availableSubSpecialties = mainSpecialtyData[key] || [];
          
          // Try to find matching sub-specialty
          for (const subSpec of availableSubSpecialties) {
            if (specialtyName.includes(subSpec.toLowerCase())) {
              foundSubSpecialty = subSpec;
              break;
            }
          }

          // Set the sub specialties for the selected main specialty
          setSubSpecialties(availableSubSpecialties);
        }
      }

      // Set the state values
      setSelectedMainSpecialty(foundMainSpecialty);
      setSelectedSubSpecialty(foundSubSpecialty);

      // Update form data with the parsed values
      setFormData({
        ...specialty,
        main_specialty: foundMainSpecialty,
        sub_specialt: foundSubSpecialty
      });
    } else {
      // For new specialty, reset everything
      setSelectedMainSpecialty("");
      setSelectedSubSpecialty("");
      setSubSpecialties([]);
      setFormData({
        _id: "",
        name: "",
        main_specialty: "",
        sub_specialt: "",
        description: "",
        department_info: "",
        phone: "",
        doctors: [],
      });
    }
  }, [specialty, mainSpecialties]);

  // Load sub-specialties when main specialty is selected (for new entries)
  useEffect(() => {
    if (selectedMainSpecialty && !specialty) {
      const mainSpecialtyData = specialtiesData.find(item => {
        const key = Object.keys(item)[0];
        return key.toLowerCase() === selectedMainSpecialty.toLowerCase();
      });
      
      if (mainSpecialtyData) {
        const key = Object.keys(mainSpecialtyData)[0];
        const subSpecialtiesList = mainSpecialtyData[key] || [];
        setSubSpecialties(subSpecialtiesList);
      } else {
        setSubSpecialties([]);
      }
    }
  }, [selectedMainSpecialty, specialty]);

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

  // Handle main specialty selection
  const handleMainSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedMainSpecialty(value);
    setShowMainSuggestions(true);
    
    // If main specialty is cleared, clear sub-specialty too
    if (!value) {
      setSelectedSubSpecialty("");
      setFormData(prev => ({ 
        ...prev, 
        name: "",
        sub_specialt: "",
        main_specialty: ""
      }));
    } else {
      // Update main specialty in form data immediately
      setFormData(prev => ({ 
        ...prev, 
        main_specialty: value
      }));
    }
  };

  const handleMainSuggestionClick = (suggestion: string) => {
    setSelectedMainSpecialty(suggestion);
    setSelectedSubSpecialty(""); // Clear sub-specialty when main changes
    
    // Update form data with main specialty only
    setFormData(prev => ({ 
      ...prev, 
      name: suggestion.toUpperCase(),
      main_specialty: suggestion,
      sub_specialt: ""
    }));
    setShowMainSuggestions(false);
  };

  // Handle sub-specialty selection
  const handleSubSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedSubSpecialty(value);
    setShowSubSuggestions(true);
  };

  const handleSubSuggestionClick = (suggestion: string) => {
    setSelectedSubSpecialty(suggestion);
    
    // Combine main specialty and sub-specialty for display name
    const fullSpecialtyName = selectedMainSpecialty;
    
    // Update form data with both main and sub specialty
    setFormData(prev => ({ 
      ...prev, 
      name: fullSpecialtyName.toUpperCase(),
      sub_specialt: suggestion
    }));
    setShowSubSuggestions(false);
  };

  // Filter suggestions based on input
  const getFilteredMainSuggestions = (searchText: string) => {
    if (!searchText) return mainSpecialties.slice(0, 15);
    return mainSpecialties.filter(specialty =>
      specialty.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getFilteredSubSuggestions = (searchText: string) => {
    if (!searchText) return subSpecialties.slice(0, 15);
    return subSpecialties.filter(subSpecialty =>
      subSpecialty.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // Blur handlers with delay
  const handleMainInputBlur = () => {
    setTimeout(() => setShowMainSuggestions(false), 200);
  };

  const handleSubInputBlur = () => {
    setTimeout(() => setShowSubSuggestions(false), 200);
  };

  // Focus handlers
  const handleMainInputFocus = () => {
    setShowMainSuggestions(true);
  };

  const handleSubInputFocus = () => {
    if (selectedMainSpecialty) {
      setShowSubSuggestions(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least main specialty is selected
    if (!selectedMainSpecialty) {
      alert("Please select a main specialty");
      return;
    }
    
    // Ensure the name field is properly set before saving
    const finalFormData = {
      ...formData,
      name: selectedMainSpecialty.toUpperCase()
    };
    
    onSave(finalFormData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-green-800 mb-6">
          {specialty ? "Edit Specialty" : "Add New Specialty"}
        </h2>
        
        {/* Display current specialty info when editing */}
        {specialty && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Editing:</strong> {specialty.name}
              {specialty.main_specialty && (
                <span> | Main: {specialty.main_specialty}</span>
              )}
              {specialty.sub_specialt && (
                <span> | Sub: {specialty.sub_specialt}</span>
              )}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Specialty Selection */}
          <div className="relative">
            <label className="block text-sm font-medium text-green-700 mb-2">
              Main Specialty *
            </label>
            <input
              type="text"
              value={selectedMainSpecialty}
              onChange={handleMainSpecialtyChange}
              onBlur={handleMainInputBlur}
              onFocus={handleMainInputFocus}
              className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Search and select main specialty..."
              required
              autoComplete="off"
            />
            
            {showMainSuggestions && (
              <div className="absolute z-10 bg-white w-full border border-green-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {getFilteredMainSuggestions(selectedMainSpecialty).length > 0 ? (
                  <>
                    <div className="px-3 py-2 bg-green-50 border-b border-green-200">
                      <p className="text-xs text-green-600 font-medium">
                        {selectedMainSpecialty ? 
                          `Found ${getFilteredMainSuggestions(selectedMainSpecialty).length} main specialties` : 
                          `Showing ${Math.min(mainSpecialties.length, 15)} main specialties`}
                      </p>
                    </div>
                    <ul>
                      {getFilteredMainSuggestions(selectedMainSpecialty).map((specialtyItem, index) => (
                        <li
                          key={index}
                          className="px-3 py-2 hover:bg-green-50 hover:text-green-800 cursor-pointer border-b border-green-100 last:border-b-0 transition-colors duration-150"
                          onClick={() => handleMainSuggestionClick(specialtyItem)}
                        >
                          <div className="flex items-center">
                            <span className="text-green-500 mr-2">🏥</span>
                            <span className="font-medium capitalize">{specialtyItem}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-gray-500 text-sm">No main specialties found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sub-Specialty Selection (only shown when main specialty is selected) */}
          {selectedMainSpecialty && (
            <div className="relative">
              <label className="block text-sm font-medium text-green-700 mb-2">
                Sub-Specialty (Optional)
              </label>
              <input
                type="text"
                value={selectedSubSpecialty}
                onChange={handleSubSpecialtyChange}
                onBlur={handleSubInputBlur}
                onFocus={handleSubInputFocus}
                className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Search and select sub-specialty..."
                autoComplete="off"
              />
              
              {showSubSuggestions && subSpecialties.length > 0 && (
                <div className="absolute z-10 bg-white w-full border border-green-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {getFilteredSubSuggestions(selectedSubSpecialty).length > 0 ? (
                    <>
                      <div className="px-3 py-2 bg-blue-50 border-b border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">
                          {selectedSubSpecialty ? 
                            `Found ${getFilteredSubSuggestions(selectedSubSpecialty).length} sub-specialties` : 
                            `Showing ${Math.min(subSpecialties.length, 15)} sub-specialties for ${selectedMainSpecialty}`}
                        </p>
                      </div>
                      <ul>
                        {getFilteredSubSuggestions(selectedSubSpecialty).map((subSpecialtyItem, index) => (
                          <li
                            key={index}
                            className="px-3 py-2 hover:bg-blue-50 hover:text-blue-800 cursor-pointer border-b border-blue-100 last:border-b-0 transition-colors duration-150"
                            onClick={() => handleSubSuggestionClick(subSpecialtyItem)}
                          >
                            <div className="flex items-center">
                              <span className="text-blue-500 mr-2">🎯</span>
                              <span className="font-medium capitalize">{subSpecialtyItem}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <p className="text-gray-500 text-sm">No sub-specialties found</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedMainSpecialty && subSpecialties.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No sub-specialties available for {selectedMainSpecialty}
                </p>
              )}
            </div>
          )}

          {/* Other form fields */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Brief description of the specialty..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Department Info
            </label>
            <input
              type="text"
              name="department_info"
              value={formData.department_info}
              onChange={(e) => setFormData(prev => ({ ...prev, department_info: e.target.value }))}
              className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Additional department information..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Department contact number..."
            />
          </div>

          <DoctorSchedule
            doctors={formData.doctors}
            onUpdate={(updatedDoctors) =>
              setFormData((prevData) => ({
                ...prevData,
                doctors: updatedDoctors,
              }))
            }
          />

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-green-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              {specialty ? "Update" : "Add"} Specialty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



const DoctorSchedule: React.FC<{
  doctors: Doctor[];
  onUpdate: (updatedDoctors: Doctor[]) => void;
}> = ({ doctors, onUpdate }) => {
  const addDoctor = () => {
    onUpdate([...doctors, { name: "", consulting: [] }]);
  };

  const updateDoctor = (index: number, updatedDoctor: Doctor) => {
    const newDoctors = [...doctors];
    newDoctors[index] = updatedDoctor;
    onUpdate(newDoctors);
  };

  const removeDoctor = (index: number) => {
    const newDoctors = doctors.filter((_, i) => i !== index);
    onUpdate(newDoctors);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-green-800 mb-2">Doctors</h3>
      {doctors.map((doctor, index) => (
        <div
          key={doctor._id}
          className="mb-4 p-4 border border-green-200 rounded-md"
        >
          <input
            type="text"
            value={doctor.name}
            onChange={(e) =>
              updateDoctor(index, {
                ...doctor,
                name: e.target.value.toUpperCase(),
              })
            }
            placeholder="Doctor's name"
            className="mb-2 w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          <input
            type="text"
            value={doctor.qualification}
            onChange={(e) =>
              updateDoctor(index, { ...doctor, qualification: e.target.value })
            }
            placeholder="Doctor's qualifications"
            className="mb-2 w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
          {doctor.consulting.map((schedule, scheduleIndex) => (
            <div
              key={scheduleIndex}
              className="flex items-center space-x-2 mb-2"
            >
              <select
                value={schedule.day}
                onChange={(e) => {
                  const newConsulting = [...doctor.consulting];
                  newConsulting[scheduleIndex] = {
                    ...newConsulting[scheduleIndex],
                    day: e.target.value,
                  };
                  updateDoctor(index, { ...doctor, consulting: newConsulting });
                }}
                className="border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-green-600" />
                <input
                  type="time"
                  value={schedule.start_time}
                  onChange={(e) => {
                    const newConsulting = [...doctor.consulting];
                    newConsulting[scheduleIndex] = {
                      ...newConsulting[scheduleIndex],
                      start_time: e.target.value,
                    };
                    updateDoctor(index, {
                      ...doctor,
                      consulting: newConsulting,
                    });
                  }}
                  className="border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <span>-</span>
                <input
                  type="time"
                  value={schedule.end_time}
                  onChange={(e) => {
                    const newConsulting = [...doctor.consulting];
                    newConsulting[scheduleIndex] = {
                      ...newConsulting[scheduleIndex],
                      end_time: e.target.value,
                    };
                    updateDoctor(index, {
                      ...doctor,
                      consulting: newConsulting,
                    });
                  }}
                  className="border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const newConsulting = doctor.consulting.filter(
                    (_, i) => i !== scheduleIndex
                  );
                  updateDoctor(index, { ...doctor, consulting: newConsulting });
                }}
                className="text-red-600 hover:text-red-800"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newConsulting = [
                ...doctor.consulting,
                { day: "", start_time: "", end_time: "" },
              ];
              updateDoctor(index, { ...doctor, consulting: newConsulting });
            }}
            className="mt-2 text-green-600 hover:text-green-800"
          >
            + Add Consulting Slot
          </button>
          <button
            type="button"
            onClick={() => removeDoctor(index)}
            className="mt-2 ml-2 text-red-600 hover:text-red-800"
          >
            Remove Doctor
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addDoctor}
        className="mt-2 text-green-600 hover:text-green-800"
      >
        + Add Doctor
      </button>
    </div>
  );
};

export default SpecialtyManagement;

export interface Hospital {
  _id?: string;
  name: string;
  type: string;
  address: string;
  password: string;
  phone: string;
  email: string;
  emergencyContact?: string;
  image: { imageUrl: string; public_id: string };
  latitude?: number;
  longitude?: number;
  about?: string;
  working_hours: any;
  reviews: any;
  specialties: any[];
  booking: any[];
}
