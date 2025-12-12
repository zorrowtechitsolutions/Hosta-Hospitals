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
      console.log("Editing doctor:", doctor);
      console.log("Existing consulting data:", doctor.consulting);
      
      // Create a complete consulting array with all days
      const mergedConsulting = daysOfWeek.map(day => {
        // Find if this day exists in doctor's consulting
        const existingDay = doctor.consulting?.find(c => c.day === day);
        
        if (existingDay && existingDay.sessions && existingDay.sessions.length > 0) {
          return {
            day,
            sessions: existingDay.sessions.map(session => ({
              start_time: session.start_time || '09:00',
              end_time: session.end_time || '17:00'
            }))
          };
        } else {
          // Day not in consulting or has no sessions
          return {
            day,
            sessions: []
          };
        }
      });

      console.log("Merged consulting:", mergedConsulting);

      setFormData({
        name: doctor.name || '',
        qualification: doctor.qualification || '',
        specialty: doctor.specialty || '',
        consulting: mergedConsulting
      });
    } else if (!doctor && open) {
      setFormData({
        name: '',
        qualification: '',
        specialty: '',
        consulting: daysOfWeek.map(day => ({
          day,
          sessions: [{ start_time: '09:00', end_time: '17:00' }]
        }))
      });
    }
  }, [doctor, open]);

  useEffect(() => {
    // Clear search when dialog closes
    if (!open) {
      onSpecialtySearchChange('')
    }
  }, [open, onSpecialtySearchChange])

  const handleTimeChange = (dayIndex, sessionIndex, field, value) => {
    setFormData(prev => {
      const newConsulting = [...prev.consulting];
      const day = { ...newConsulting[dayIndex] };
      
      // Make sure we have a sessions array
      if (!day.sessions) {
        day.sessions = [];
      }
      
      // Create a copy of sessions
      day.sessions = [...day.sessions];
      
      // Make sure the session exists
      if (!day.sessions[sessionIndex]) {
        day.sessions[sessionIndex] = { start_time: '09:00', end_time: '17:00' };
      } else {
        // Create a copy of the session
        day.sessions[sessionIndex] = { ...day.sessions[sessionIndex] };
      }
      
      // Update the time
      day.sessions[sessionIndex][field] = value;
      
      // Update the day in consulting array
      newConsulting[dayIndex] = day;
      
      return {
        ...prev,
        consulting: newConsulting
      };
    });
  }

  const addSession = (dayIndex) => {
    setFormData(prev => {
      const newConsulting = [...prev.consulting];
      const day = { ...newConsulting[dayIndex] };
      
      // Initialize sessions array if it doesn't exist
      if (!day.sessions) {
        day.sessions = [];
      } else {
        // Create a copy of sessions
        day.sessions = [...day.sessions];
      }
      
      // Add new session
      day.sessions.push({
        start_time: '09:00',
        end_time: '17:00'
      });
      
      // Update the day
      newConsulting[dayIndex] = day;
      
      return {
        ...prev,
        consulting: newConsulting
      };
    });
  }

  const removeSession = (dayIndex, sessionIndex) => {
    setFormData(prev => {
      const newConsulting = [...prev.consulting];
      const day = { ...newConsulting[dayIndex] };
      
      if (day.sessions) {
        // Create a copy of sessions
        day.sessions = [...day.sessions];
        
        // Remove the session
        day.sessions.splice(sessionIndex, 1);
        
        // If no sessions left, set to empty array
        if (day.sessions.length === 0) {
          day.sessions = [];
        }
      }
      
      // Update the day
      newConsulting[dayIndex] = day;
      
      return {
        ...prev,
        consulting: newConsulting
      };
    });
  }

  const toggleDayActive = (dayIndex) => {
    setFormData(prev => {
      const newConsulting = [...prev.consulting];
      const day = { ...newConsulting[dayIndex] };
      
      // Check if day has sessions
      const hasSessions = day.sessions && day.sessions.length > 0;
      
      if (hasSessions) {
        // Remove all sessions - create new empty array
        day.sessions = [];
      } else {
        // Add a default session - create new array
        day.sessions = [{ start_time: '09:00', end_time: '17:00' }];
      }
      
      console.log(`Toggled ${day.day}:`, day.sessions);
      
      // Update the day
      newConsulting[dayIndex] = day;
      
      return {
        ...prev,
        consulting: newConsulting
      };
    });
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.qualification || !formData.specialty) {
      toast.warning('Please fill in all required fields!')
      return
    }

    // Filter out days with no sessions for cleaner data
    const cleanedConsulting = formData.consulting
      .filter(day => day.sessions && day.sessions.length > 0)
      .map(day => ({
        day: day.day,
        sessions: day.sessions.map(session => ({
          start_time: session.start_time || '09:00',
          end_time: session.end_time || '17:00'
        }))
      }));

    const finalData = {
      name: formData.name,
      qualification: formData.qualification,
      specialty: formData.specialty,
      consulting: cleanedConsulting
    };

    console.log("Submitting data:", finalData);

    setLoading(true)
    try {
      await onSave(finalData, doctor)
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
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {formData.consulting.map((daySchedule, dayIndex) => {
                // Calculate if day has sessions
                const hasSessions = daySchedule.sessions && daySchedule.sessions.length > 0;
                
                return (
                  <div key={daySchedule.day} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasSessions}
                          onChange={() => toggleDayActive(dayIndex)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span 
                          className={`font-semibold ${!hasSessions ? 'text-muted-foreground' : ''}`}
                        >
                          {daySchedule.day}
                        </span>
                      </div>
                      {hasSessions && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSession(dayIndex)}
                          className="cursor-pointer"
                        >
                          <Plus size={16} className="mr-1" />
                          Add Session
                        </Button>
                      )}
                    </div>

                    {hasSessions ? (
                      <div className="space-y-2">
                        {daySchedule.sessions.map((session, sessionIndex) => (
                          <div key={sessionIndex} className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <Clock size={16} className="text-muted-foreground" />
                              <Input
                                type="time"
                                value={session.start_time || '09:00'}
                                onChange={(e) => handleTimeChange(dayIndex, sessionIndex, 'start_time', e.target.value)}
                                className="flex-1 cursor-pointer"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={session.end_time || '17:00'}
                                onChange={(e) => handleTimeChange(dayIndex, sessionIndex, 'end_time', e.target.value)}
                                className="flex-1 cursor-pointer"
                              />
                            </div>
                            {daySchedule.sessions.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSession(dayIndex, sessionIndex)}
                                className="text-destructive hover:text-destructive/90 cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No consulting on this day</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className='cursor-pointer' onClick={() => onOpenChange(false)}>
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