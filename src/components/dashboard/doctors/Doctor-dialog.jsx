'use client'

import { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Clock, Search } from 'lucide-react'
import { toast } from 'sonner'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function DoctorDialog({ 
  open, 
  onOpenChange, 
  doctor, 
  specialtiesData,
  specialtySearch,
  onSpecialtySearchChange,
  hospitalId,
  onSave 
}) {
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    specialty: '',
    consulting: daysOfWeek.map(day => ({
      day,
      sessions: [{ start_time: '09:00', end_time: '17:00' }]
    }))
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (doctor && open) {
      console.log("Editing doctor specialty:", doctor.specialty);
      // Merge with default consulting days to ensure all days are present
      const existingConsulting = doctor.consulting || []
      const mergedConsulting = daysOfWeek.map(day => {
        const existingDay = existingConsulting.find(c => c.day === day)
        return existingDay || {
          day,
          sessions: [{ start_time: '09:00', end_time: '17:00' }]
        }
      })

      setFormData({
        name: doctor.name || '',
        qualification: doctor.qualification || '',
        specialty: doctor.specialty || '', // Make sure this is set correctly
        consulting: mergedConsulting
      })
    } else if (!doctor && open) {
      setFormData({
        name: '',
        qualification: '',
        specialty: '',
        consulting: daysOfWeek.map(day => ({
          day,
          sessions: [{ start_time: '09:00', end_time: '17:00' }]
        }))
      })
    }
  }, [doctor, open])

  useEffect(() => {
    // Clear search when dialog closes
    if (!open) {
      onSpecialtySearchChange('')
    }
  }, [open, onSpecialtySearchChange])

  const handleTimeChange = (dayIndex, sessionIndex, field, value) => {
    const updatedConsulting = [...formData.consulting]
    updatedConsulting[dayIndex].sessions[sessionIndex][field] = value
    setFormData(prev => ({ ...prev, consulting: updatedConsulting }))
  }

  const addSession = (dayIndex) => {
    const updatedConsulting = [...formData.consulting]
    updatedConsulting[dayIndex].sessions.push({
      start_time: '09:00',
      end_time: '17:00'
    })
    setFormData(prev => ({ ...prev, consulting: updatedConsulting }))
  }

  const removeSession = (dayIndex, sessionIndex) => {
    const updatedConsulting = [...formData.consulting]
    updatedConsulting[dayIndex].sessions.splice(sessionIndex, 1)
    setFormData(prev => ({ ...prev, consulting: updatedConsulting }))
  }

  const toggleDayActive = (dayIndex) => {
    const updatedConsulting = [...formData.consulting]
    if (updatedConsulting[dayIndex].sessions.length === 0) {
      updatedConsulting[dayIndex].sessions = [{ start_time: '09:00', end_time: '17:00' }]
    } else {
      updatedConsulting[dayIndex].sessions = []
    }
    setFormData(prev => ({ ...prev, consulting: updatedConsulting }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.qualification || !formData.specialty) {
      toast.warning('Please fill in all required fields!')
      return
    }

    setLoading(true)
    try {
      await onSave(formData, doctor)
      onOpenChange(false)
    } catch (error) {
           const msg = error?.data?.message || "Server error!";
        toast.error(msg); 
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border max-h-screen overflow-y-auto max-w-4xl">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor ? 'Update doctor information and schedule' : 'Add a new doctor to the system'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Dr. Full Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification *</Label>
              <Input
                id="qualification"
                placeholder="MBBS, MD, etc."
                value={formData.qualification}
                onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty *</Label>
            <Select 
              value={formData.specialty} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select specialty">
                  {formData.specialty || "Select specialty..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {/* Search Input */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search specialties..."
                      value={specialtySearch}
                      onChange={(e) => onSpecialtySearchChange(e.target.value)}
                      className="pl-8 h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                {/* Specialty List */}
                <div className="max-h-60 overflow-y-auto">
                  {specialtiesData?.map((spec) => (
                    <SelectItem key={spec._id} value={spec.name}>
                      {spec.name}
                    </SelectItem>
                  ))}
                  {specialtiesData?.length === 0 && (
                    <div className="py-2 px-3 text-sm text-muted-foreground">
                      No specialties found
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Consulting Schedule */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Consulting Schedule</Label>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.consulting.map((daySchedule, dayIndex) => (
                <div key={daySchedule.day} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={daySchedule.sessions.length > 0}
                        onChange={() => toggleDayActive(dayIndex)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`font-semibold ${daySchedule.sessions.length === 0 ? 'text-muted-foreground' : ''}`}>
                        {daySchedule.day}
                      </span>
                    </Label>
                    {daySchedule.sessions.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSession(dayIndex)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Session
                      </Button>
                    )}
                  </div>

                  {daySchedule.sessions.length > 0 ? (
                    <div className="space-y-2">
                      {daySchedule.sessions.map((session, sessionIndex) => (
                        <div key={sessionIndex} className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Clock size={16} className="text-muted-foreground" />
                            <Input
                              type="time"
                              value={session.start_time}
                              onChange={(e) => handleTimeChange(dayIndex, sessionIndex, 'start_time', e.target.value)}
                              className="flex-1"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={session.end_time}
                              onChange={(e) => handleTimeChange(dayIndex, sessionIndex, 'end_time', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                          {daySchedule.sessions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSession(dayIndex, sessionIndex)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No consulting on this day</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className={'cursor-pointer'}  onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 cursor-pointer">
            {loading ? 'Saving...' : doctor ? 'Update Doctor' : 'Add Doctor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}