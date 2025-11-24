'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { SpecialtyDialog } from '@/components/dashboard/specialties/Specialties-dialog'
import { SpecialtiesTable } from '@/components/dashboard/specialties/Specialties-table'
import { useGetAHospitalQuery } from '@/app/service/hospital'
import { 
  useAddAHospitalSpecialityMutation, 
  useDeleteAHospitalSpecialityMutation, 
  useGetAllSpecialityQuery, 
  useUpdateAHospitalSpecialityMutation 
} from '@/app/service/specialites'
import { toast } from 'sonner'

export default function SpecialtiesPage() {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState(null)

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

  

  const [addAHospitalSpeciality, { isLoading: isAdding }] = useAddAHospitalSpecialityMutation()
  const [deleteAHospitalSpeciality, { isLoading: isDeleting }] = useDeleteAHospitalSpecialityMutation()
  const [updateAHospitalSpeciality, { isLoading: isUpdating }] = useUpdateAHospitalSpecialityMutation()

  // Get hospital specialties from hospital data
  const hospitalSpecialties = hospitalData?.data?.specialties || []

  // Get all available specialties from the endpoint
  const allSpecialties = specialtiesData || []

  // Filter out specialties that are already added to the hospital
  const availableSpecialties = useMemo(() => {
    if (!allSpecialties.length || !hospitalSpecialties.length) return allSpecialties
    
    const hospitalSpecialtyNames = hospitalSpecialties.map(spec => spec.name.toLowerCase())
    return allSpecialties.filter(spec => 
      !hospitalSpecialtyNames.includes(spec.name.toLowerCase())
    )
  }, [allSpecialties, hospitalSpecialties])

  const handleAddSpecialty = async (specialtyData) => {
    try {
      await addAHospitalSpeciality({
        hospitalId,
        specialtyData: {
          ...specialtyData,
          doctors: [] // Initialize with empty doctors array
        }
      }).unwrap()
      
      toast.success('Specialty added successfully')
      hospitalRefetch()
      setIsDialogOpen(false)
    } catch (error) {
          const msg = error?.data?.message || "Server error!";
       toast.error(msg);
    }
  }

  const handleUpdateSpecialty = async (specialtyId, specialtyData) => {
    try {
      await updateAHospitalSpeciality({
        hospitalId,
        specialtyId,
        specialtyData
      }).unwrap()
      
      toast.success('Specialty updated successfully')
      hospitalRefetch()
      setIsDialogOpen(false)
    } catch (error) {
          const msg = error?.data?.message || "Server error!";
       toast.error(msg);
    }
  }

  const handleDeleteSpecialty = async (specialtyId) => {
    try {
      await deleteAHospitalSpeciality({
        hospitalId,
        specialtyId
      }).unwrap()
      
      toast.success('Specialty deleted successfully')
      hospitalRefetch()
    } catch (error) { 
       const msg = error?.data?.message || "Server error!";
       toast.error(msg);
    }
  }

  const handleEdit = (specialty) => {
    setSelectedSpecialty(specialty)
    setIsDialogOpen(true)
  }

  if (isLoading || specialtyLoading) {
    return <div className="flex justify-center items-center h-64">Loading specialties...</div>
  }

  if (error || specialtyError) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading data</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Specialties</h1>
          <p className="text-muted-foreground mt-2">Manage medical specialties</p>
        </div>
        <Button
          onClick={() => {
            setSelectedSpecialty(null)
            setIsDialogOpen(true)
          }}
          className="bg-green-600 hover:bg-green-700 cursor-pointer"
          disabled={isAdding} // Only disable when actually adding, not based on available specialties
        >
          <Plus size={20} className="mr-2" />
          {isAdding ? 'Adding...' : 'Add Specialty'}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search specialties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
      </div>

      {/* Table */}
      <SpecialtiesTable
        specialties={hospitalSpecialties}
        search={search}
        onEdit={handleEdit}
        onDelete={handleDeleteSpecialty}
        isLoading={isDeleting}
      />

      {/* Dialog */}
      <SpecialtyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        specialty={selectedSpecialty}
        availableSpecialties={availableSpecialties}
        onSubmit={selectedSpecialty ? 
          (data) => handleUpdateSpecialty(selectedSpecialty._id, data) : 
          handleAddSpecialty
        }
        isLoading={isAdding || isUpdating}
      />
    </div>
  )
}