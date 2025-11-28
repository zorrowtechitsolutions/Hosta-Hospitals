'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DoctorsTable } from '@/components/dashboard/doctors/Doctors-table'
import { DoctorDialog } from '@/components/dashboard/doctors/Doctor-dialog'
import { useGetAHospitalQuery } from '@/app/service/hospital'
import { useGetAllSpecialityQuery } from '@/app/service/specialites'
import { 
  useAddAHospitalDoctorMutation, 
  useDeleteAHospitalDoctorMutation, 
  useUpdateAHospitalDoctorMutation 
} from '@/app/service/doctors'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function DoctorsPage() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('All Specialties')
  const [selectedDays, setSelectedDays] = useState([])
  const [specialtySearch, setSpecialtySearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

    const hospitalId = localStorage.getItem("adminId"); 


  const { 
    data: hospitalData, 
    isLoading, 
    error,
    refetch: hospitalRefetch
  } = useGetAHospitalQuery(hospitalId)

  const { 
    data: specialtiesData, 
    isLoading: specialtyLoading, 
    error: specialtyError,
    refetch: specialtyRefetch
  } = useGetAllSpecialityQuery()

  const [addAHospitalDoctor, { isLoading: isAdding }] = useAddAHospitalDoctorMutation()
  const [deleteAHospitalDoctor, { isLoading: isDeleting }] = useDeleteAHospitalDoctorMutation()
  const [updateAHospitalDoctor, { isLoading: isUpdating }] = useUpdateAHospitalDoctorMutation()

  // Filter specialties based on search
  const filteredSpecialties = useMemo(() => {
    if (!specialtiesData) return []
    
    return specialtiesData?.filter(spec => 
      spec.name.toLowerCase().includes(specialtySearch.toLowerCase())
    )
  }, [specialtiesData, specialtySearch])

  // Extract unique specialties for filter from hospital data
  const availableSpecialties = useMemo(() => {
    if (!hospitalData?.data?.specialties) return ['All Specialties']
    
    const specialties = hospitalData.data.specialties.map(spec => spec.name)
    return ['All Specialties', ...specialties]
  }, [hospitalData])

  const handleSaveDoctor = async (doctorData, existingDoctor) => {
    try {
      if (existingDoctor) {
        // Update existing doctor
        await updateAHospitalDoctor({
          hospitalId,
          specialtyId: existingDoctor.specialtyId,
          doctorId: existingDoctor._id,
          data: doctorData
        }).unwrap()
      } else {
        // Add new doctor - find specialty ID by name from specialties API
        const specialty = specialtiesData?.find(
          spec => spec.name === doctorData.specialty
        )
        
        if (!specialty) {
          throw new Error('Specialty not found')
        }

        await addAHospitalDoctor({
          hospitalId,
          specialtyId: specialty._id,
          data: doctorData
        }).unwrap()
      }

      toast.success("Docter added!")
      
      // Refresh hospital data
      hospitalRefetch()
    } catch (error) {
     
       const msg = error?.data?.message || "Server error!";
  toast.error(msg); 
    }
  }

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setIsDialogOpen(true)
  }

  const handleDeleteDoctor = async (doctor) => {
    if (confirm(`Are you sure you want to delete ${doctor.name}?`)) {
      try {
        await deleteAHospitalDoctor({
          hospitalId,
          specialtyId: doctor.specialtyId,
          doctorId: doctor._id
        }).unwrap()
        
        // Refresh hospital data
        hospitalRefetch()
        toast.success("Doctor deleted!")
      } catch (error) {
         const msg = error?.data?.message || "Server error!";
         toast.error(msg); 
      }
    }
  }

  const toggleDayFilter = (day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const clearDayFilters = () => {
    setSelectedDays([])
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-destructive">Error loading hospital data</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Doctors</h1>
          <p className="text-muted-foreground mt-2">Manage your hospital doctors</p>
        </div>
        <Button
          onClick={() => {
            setSelectedDoctor(null)
            setIsDialogOpen(true)
          }}
          className="bg-green-600 hover:bg-green-700 cursor-pointer"
          disabled={isAdding || isUpdating}
        >
          <Plus size={20} className="mr-2" />
          Add Doctor
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name or qualification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full md:w-48 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {availableSpecialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Day Filters */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Filter by Days:</label>
            {selectedDays.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDayFilters}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <Badge
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => toggleDayFilter(day)}
              >
                {day}
                {selectedDays.includes(day) && (
                  <X size={12} className="ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <DoctorsTable
        search={search}
        specialty={specialty}
        selectedDays={selectedDays}
        onEdit={handleEditDoctor}
        onDelete={handleDeleteDoctor}
        hospitalData={hospitalData}
        isDeleting={isDeleting}
      />

      {/* Dialog */}
      <DoctorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        doctor={selectedDoctor}
        specialtiesData={filteredSpecialties}
        specialtySearch={specialtySearch}
        onSpecialtySearchChange={setSpecialtySearch}
        hospitalId={hospitalId}
        onSave={handleSaveDoctor}
      />
    </div>
  )
}