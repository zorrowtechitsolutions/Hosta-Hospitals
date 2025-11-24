'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ITEMS_PER_PAGE = 5

export function DoctorsTable({ 
  search, 
  specialty, 
  selectedDays, 
  onEdit, 
  onDelete, 
  hospitalData, 
  isDeleting 
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [consultingDialogOpen, setConsultingDialogOpen] = useState(false)

  // Extract all doctors from specialties
  const allDoctors = useMemo(() => {
    if (!hospitalData?.data?.specialties) return []
    
    const doctors = []
    hospitalData.data.specialties.forEach(specialty => {
      specialty.doctors.forEach(doctor => {
        doctors.push({
          ...doctor,
          specialty: specialty.name,
          specialtyId: specialty._id
        })
      })
    })
    return doctors
  }, [hospitalData])

  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doctor) => {
      // Search filter
      const matchesSearch =
        doctor?.name?.toLowerCase().includes(search.toLowerCase()) ||
        doctor?.qualification?.toLowerCase().includes(search.toLowerCase())
      
      // Specialty filter
      const matchesSpecialty = specialty === 'All Specialties' || doctor.specialty === specialty
      
      // Day filter
      const matchesDays = selectedDays.length === 0 || 
        selectedDays.some(day => 
          doctor.consulting?.some(schedule => 
            schedule.day === day && schedule.sessions?.length > 0
          )
        )

      return matchesSearch && matchesSpecialty && matchesDays
    })
  }, [allDoctors, search, specialty, selectedDays])

  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleViewConsultingTime = (doctor) => {
    setSelectedDoctor(doctor)
    setConsultingDialogOpen(true)
  }

  const ConsultingTimeDialog = () => (
    <Dialog open={consultingDialogOpen} onOpenChange={setConsultingDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Consulting Schedule - {selectedDoctor?.name}</DialogTitle>
          <DialogDescription>
            {selectedDoctor?.qualification} - {selectedDoctor?.specialty}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {selectedDoctor?.consulting?.map((daySchedule, index) => (
            <div key={daySchedule._id || index} className="border rounded-lg p-4">
              <h4 className={`font-semibold text-lg mb-3 ${
                daySchedule.sessions?.length === 0 ? 'text-muted-foreground' : ''
              }`}>
                {daySchedule.day}
                {daySchedule.sessions?.length === 0 && ' (No consulting)'}
              </h4>
              {daySchedule.sessions?.length > 0 && (
                <div className="space-y-2">
                  {daySchedule.sessions.map((session, sessionIndex) => (
                    <div key={sessionIndex} className="flex items-center justify-between bg-muted/50 p-3 rounded">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span className="font-medium">
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Session {sessionIndex + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(!selectedDoctor?.consulting || selectedDoctor.consulting.length === 0) && (
            <p className="text-center text-muted-foreground py-8">
              No consulting schedule available
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <CardTitle>
            All Doctors ({filteredDoctors.length})
            {selectedDays.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                • Filtered by {selectedDays.length} day{selectedDays.length > 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Qualification</th>
                  <th className="text-left py-3 px-4 font-medium">Specialty</th>
                  <th className="text-left py-3 px-4 font-medium">Consulting Time</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDoctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{doctor?.name?.toUpperCase()}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {doctor.qualification || 'Not specified'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {doctor.specialty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewConsultingTime(doctor)}
                        className="hover:bg-primary/10 text-primary"
                      >
                        <Calendar size={16} className="mr-1" />
                        View Schedule
                      </Button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(doctor)}
                          className="hover:bg-primary/10 text-primary"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(doctor)}
                          disabled={isDeleting}
                          className="hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedDoctors.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No doctors found matching your criteria
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredDoctors.length} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-primary' : ''}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConsultingTimeDialog />
    </>
  )
}