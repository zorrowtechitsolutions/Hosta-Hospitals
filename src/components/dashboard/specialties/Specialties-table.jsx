'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

const ITEMS_PER_PAGE = 5

export function SpecialtiesTable({ specialties, search, onEdit, onDelete, isLoading }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState(null)

  const filteredSpecialties = useMemo(() => {
    if (!specialties) return []
    
    return specialties.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
    )
  }, [specialties, search])

  const totalPages = Math.ceil(filteredSpecialties.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedSpecialties = filteredSpecialties.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId)
      toast.success("Specialitie deleted!");
      setDeleteId(null)
    }
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader>
          <CardTitle>All Specialties ({specialties?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Department Info</th>
                  <th className="text-center py-3 px-4 font-medium">Doctors</th>
                  <th className="text-center py-3 px-4 font-medium">Phone</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSpecialties.map((specialty) => (
                  <tr
                    key={specialty._id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{specialty?.name?.toUpperCase()}</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {specialty.description || 'No description'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {specialty.department_info || 'No department info'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {specialty.doctors?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {specialty.phone || 'No phone'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(specialty)}
                          className="hover:bg-primary/10 text-primary"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(specialty._id)}
                          className="hover:bg-destructive/10 text-destructive"
                          disabled={isLoading}
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

          {paginatedSpecialties.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              {specialties?.length === 0 ? 'No specialties added yet' : 'No specialties found'}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredSpecialties.length} total)
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the specialty
              and remove it from your hospital.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}