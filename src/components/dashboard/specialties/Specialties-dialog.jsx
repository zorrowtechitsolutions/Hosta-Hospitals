'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

export function SpecialtyDialog({ 
  open, 
  onOpenChange, 
  specialty, 
  availableSpecialties = [], 
  onSubmit,
  isLoading 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_info: '',
    phone: ''
  })
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (specialty) {
      // Edit mode - populate with existing data
      setFormData({
        name: specialty.name || '',
        description: specialty.description || '',
        department_info: specialty.department_info || '',
        phone: specialty.phone || ''
      })
      // In edit mode, set the selected specialty ID to the current one
      setSelectedSpecialtyId(specialty._id || '')
      setSearchTerm('')
    } else {
      // Add mode - reset form
      setFormData({
        name: '',
        description: '',
        department_info: '',
        phone: ''
      })
      setSelectedSpecialtyId('')
      setSearchTerm('')
    }
  }, [specialty, open])

  // Filter specialties based on search
  const filteredSpecialties = availableSpecialties.filter(spec =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // For edit mode, include the current specialty in available options
  const availableSpecialtiesWithCurrent = specialty 
    ? [...availableSpecialties, { 
        _id: specialty._id, 
        name: specialty.name, 
        description: specialty.description,
        department_info: specialty.department_info,
        phone: specialty.phone
      }]
    : availableSpecialties

  const filteredSpecialtiesWithCurrent = availableSpecialtiesWithCurrent.filter(spec =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSpecialtySelect = (value) => {
    setSelectedSpecialtyId(value)
    
    // Find the selected specialty
    const selected = availableSpecialtiesWithCurrent.find(spec => spec._id === value)
    if (selected) {
      // Only update the name, keep other fields as they are
      setFormData(prev => ({
        ...prev,
        name: selected.name || '' // Only update the name
        // Don't update description, department_info, phone - keep user's current values
      }))
    }
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.warning('Specialty name is required!');
      return
    }

    await onSubmit(formData)
  }

  const isFormValid = formData.name.trim() !== ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle>{specialty ? 'Edit Specialty' : 'Add Specialty'}</DialogTitle>
          <DialogDescription>
            {specialty ? 'Update the specialty details - you can change the specialty type' : 'Search and select a specialty'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* SEARCHABLE SELECT FOR BOTH ADD AND EDIT MODES */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {specialty ? 'Change Specialty' : 'Search and Select Specialty'} *
            </label>
            
            <div className="relative">
              <Select 
                open={isOpen} 
                onOpenChange={setIsOpen}
                value={selectedSpecialtyId} 
                onValueChange={handleSpecialtySelect}
              >
                <SelectTrigger 
                  className="w-full bg-input border-border h-10"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <SelectValue placeholder={specialty ? "Click to change specialty" : "Click to search and select a specialty"}>
                    {selectedSpecialtyId ? formData.name : (specialty ? "Click to change specialty" : "Click to search and select a specialty")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="p-0">
                  {/* Search Input inside dropdown */}
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Type to search specialties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-3 h-9"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  
                  {/* Specialty List */}
                  <div className="max-h-60 overflow-auto">
                    {filteredSpecialtiesWithCurrent.length > 0 ? (
                      filteredSpecialtiesWithCurrent.map((spec) => (
                        <SelectItem 
                          key={spec._id} 
                          value={spec._id}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{spec.name}</span>
                            {spec.description && (
                              <span className="text-xs text-muted-foreground truncate">
                                {spec.description}
                              </span>
                            )}
                            {specialty && spec._id === specialty._id && (
                              <span className="text-xs text-blue-600 font-medium">(Current)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-muted-foreground">
                        {searchTerm ? `No specialties found for "${searchTerm}"` : 'No specialties available'}
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              <ChevronDown 
                size={16} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              {specialty 
                ? "Changing specialty will only update the name. Other fields remain as edited."
                : availableSpecialtiesWithCurrent.length > 0 
                  ? `${availableSpecialtiesWithCurrent.length} specialties available - click to search` 
                  : 'No specialties available'
              }
            </p>

            {/* Show selected specialty preview */}
            {selectedSpecialtyId && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                <p className="text-sm font-medium text-green-800">
                  {specialty && selectedSpecialtyId === specialty._id ? '✓ Current: ' : '✓ Selected: '}
                  {formData.name}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Only specialty name will be updated. Phone, description, and department info remain as edited.
                </p>
              </div>
            )}
          </div>

          {/* Additional fields (shown for both add and edit modes) */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <Input
              id="phone"
              placeholder="Specialty contact number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe the specialty and services offered..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="department_info" className="text-sm font-medium">
              Department Information
            </label>
            <Textarea
              id="department_info"
              placeholder="Additional department information, facilities, etc."
              value={formData.department_info}
              onChange={(e) => handleInputChange('department_info', e.target.value)}
              rows={3}
              className="bg-input border-border"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className={'cursor-pointer'} onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isLoading} 
            className="bg-green-600 hover:bg-green-700 cursor-pointer"
          >
            {isLoading ? 'Saving...' : (specialty ? 'Update' : 'Add')} Specialty
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}