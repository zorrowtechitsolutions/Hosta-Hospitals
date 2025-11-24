// import React, { useState, useMemo } from 'react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Switch } from '@/components/ui/switch';
// import { Search, Filter, Calendar } from 'lucide-react';
// import { useGetAHospitalQuery } from '@/app/service/hospital';




// const DoctorBookingPage = () => {
//   const hospitalId = "6721c4647c4f681e95c7764f";
//   const { data, isLoading, error, refetch } = useGetAHospitalQuery(hospitalId);
  
//   // State management
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedSpecialty, setSelectedSpecialty] = useState('all');
//   const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
//   const doctorsPerPage = 6;

//   // Extract all doctors from specialties
//   const allDoctors = useMemo(() => {
//     if (!data?.data?.specialties) return [];
//     return data.data.specialties.flatMap((specialty) => 
//       specialty.doctors.map(doctor => ({
//         ...doctor,
//         specialty: specialty.name,
//         specialtyId: specialty._id
//       }))
//     );
//   }, [data]);

//   // Filter doctors based on search and filters
//   const filteredDoctors = useMemo(() => {
//     return allDoctors.filter((doctor) => {
//       const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            doctor.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
//       const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialtyId === selectedSpecialty;
      
//       const matchesBookingStatus = bookingStatusFilter === 'all' || 
//         (bookingStatusFilter === 'open' && doctor.bookingOpen) ||
//         (bookingStatusFilter === 'closed' && !doctor.bookingOpen);
      
//       return matchesSearch && matchesSpecialty && matchesBookingStatus;
//     });
//   }, [allDoctors, searchTerm, selectedSpecialty, bookingStatusFilter]);

//   // Pagination
//   const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
//   const currentDoctors = filteredDoctors.slice(
//     (currentPage - 1) * doctorsPerPage,
//     currentPage * doctorsPerPage
//   );

//   // Handle booking toggle
//   const handleBookingToggle = async (doctorId, currentStatus) => {
//     try {
//       // Here you would typically make an API call to update the booking status
//       // await updateDoctorBookingStatus(doctorId, !currentStatus);
//       console.log(`Updating booking status for doctor ${doctorId} to ${!currentStatus}`);
      
//       // Refetch data to get updated state
//       refetch();
//     } catch (error) {
//       console.error('Error updating booking status:', error);
//     }
//   };

//   // Reset to first page when filters change
//   React.useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, selectedSpecialty, bookingStatusFilter]);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center text-red-600 py-8">
//         Error loading hospital data. Please try again.
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           {data?.data?.name} - Doctors
//         </h1>
//         <p className="text-gray-600">Manage doctor bookings and availability</p>
//       </div>

//       {/* Filters and Search */}
//       <Card className="mb-6">
//         <CardContent className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {/* Search */}
//             <div className="md:col-span-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   placeholder="Search doctors by name, qualification, or specialty..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>

//             {/* Specialty Filter */}
//             <div>
//               <select
//                 value={selectedSpecialty}
//                 onChange={(e) => setSelectedSpecialty(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Specialties</option>
//                 {data?.data?.specialties?.map((specialty) => (
//                   <option key={specialty._id} value={specialty._id}>
//                     {specialty.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Booking Status Filter */}
//             <div>
//               <select
//                 value={bookingStatusFilter}
//                 onChange={(e) => setBookingStatusFilter(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Status</option>
//                 <option value="open">Booking Open</option>
//                 <option value="closed">Booking Closed</option>
//               </select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Results Count */}
//       <div className="flex justify-between items-center mb-4">
//         <p className="text-gray-600">
//           Showing {currentDoctors.length} of {filteredDoctors.length} doctors
//         </p>
//       </div>

//       {/* Doctors Grid */}
//       {currentDoctors.length === 0 ? (
//         <Card>
//           <CardContent className="p-8 text-center">
//             <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
//             <p className="text-gray-600">
//               Try adjusting your search criteria or filters.
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {currentDoctors.map((doctor) => (
//               <Card key={doctor._id} className="hover:shadow-lg transition-shadow">
//                 <CardHeader className="pb-4">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <CardTitle className="text-lg font-semibold">
//                         {doctor.name}
//                       </CardTitle>
//                       <p className="text-sm text-gray-600 mt-1">
//                         {doctor.qualification}
//                       </p>
//                     </div>
//                     <Badge
//                       variant={doctor.bookingOpen ? "default" : "secondary"}
//                       className={doctor.bookingOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
//                     >
//                       {doctor.bookingOpen ? "Open" : "Closed"}
//                     </Badge>
//                   </div>
//                   <Badge variant="outline" className="mt-2">
//                     {doctor.specialty}
//                   </Badge>
//                 </CardHeader>
//                 <CardContent className="pt-0">
//                   {/* Consulting Hours */}
//                   <div className="mb-4">
//                     <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
//                       <Calendar className="h-4 w-4 mr-1" />
//                       Consulting Hours
//                     </h4>
//                     <div className="space-y-1 max-h-32 overflow-y-auto">
//                       {doctor.consulting.map((session, index) => (
//                         <div key={index} className="text-xs text-gray-600">
//                           <span className="font-medium">{session.day}:</span>{' '}
//                           {session.sessions.map((sess, sessIndex) => (
//                             <span key={sessIndex}>
//                               {sessIndex > 0 && ', '}
//                               {sess.start} - {sess.end}
//                             </span>
//                           ))}
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Booking Toggle */}
//                   <div className="flex items-center justify-between pt-4 border-t">
//                     <span className="text-sm text-gray-600">Booking Status</span>
//                     <div className="flex items-center space-x-2">
//                       <Switch
//                         checked={doctor.bookingOpen}
//                         onCheckedChange={() => 
//                           handleBookingToggle(doctor._id, doctor.bookingOpen)
//                         }
//                       />
//                       <span className="text-sm">
//                         {doctor.bookingOpen ? 'Open' : 'Closed'}
//                       </span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-center items-center space-x-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </Button>
              
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                 <Button
//                   key={page}
//                   variant={currentPage === page ? "default" : "outline"}
//                   onClick={() => setCurrentPage(page)}
//                   className="w-10 h-10 p-0"
//                 >
//                   {page}
//                 </Button>
//               ))}
              
//               <Button
//                 variant="outline"
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default DoctorBookingPage;


import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Search, Filter, Calendar } from 'lucide-react';
import { useGetAHospitalQuery} from '@/app/service/hospital';
import { useUpdateAHospitalDoctorMutation } from '@/app/service/doctors';
import { toast } from 'sonner';

const DoctorBookingPage = () => {

     const hospitalId = localStorage.getItem("adminId"); 

  const { data, isLoading, error, refetch } = useGetAHospitalQuery(hospitalId);
  const [updateAHospitalDoctor, { isLoading: isUpdating }] = useUpdateAHospitalDoctorMutation();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const doctorsPerPage = 6;

  // Extract all doctors from specialties
  const allDoctors = useMemo(() => {
    if (!data?.data?.specialties) return [];
    return data.data.specialties.flatMap((specialty) => 
      specialty.doctors.map(doctor => ({
        ...doctor,
        specialty: specialty.name,
        specialtyId: specialty._id
      }))
    );
  }, [data]);

  // Filter doctors based on search and filters
  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doctor) => {
      const matchesSearch = doctor?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                           doctor?.qualification?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
                           doctor?.specialty?.toLowerCase()?.includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialtyId === selectedSpecialty;
      
      const matchesBookingStatus = bookingStatusFilter === 'all' || 
        (bookingStatusFilter === 'open' && doctor.bookingOpen) ||
        (bookingStatusFilter === 'closed' && !doctor.bookingOpen);
      
      return matchesSearch && matchesSpecialty && matchesBookingStatus;
    });
  }, [allDoctors, searchTerm, selectedSpecialty, bookingStatusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const currentDoctors = filteredDoctors.slice(
    (currentPage - 1) * doctorsPerPage,
    currentPage * doctorsPerPage
  );

  // Handle booking toggle
  const handleBookingToggle = async (doctorId, specialtyId, currentStatus) => {
    try {
      // Prepare the update data - only update bookingOpen field
      const doctorsData = {
        bookingOpen: !currentStatus
      };

      // Make API call to update doctor booking status
      await updateAHospitalDoctor({
        hospitalId,
        specialtyId,
        doctorId,
        doctorsData
      }).unwrap();
      refetch();
      toast.success("Doctor avilablity updated!");
    } catch (error) {
       const msg = error?.data?.message || "Server error!";
  toast.error(msg); 
    }
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty, bookingStatusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        Error loading hospital data. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          Doctors Manage
        </h1>
        <p className="text-gray-600">Manage doctor bookings and availability</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search doctors by name, qualification, or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Specialties</option>
                {data?.data?.specialties?.map((specialty) => (
                  <option key={specialty._id} value={specialty._id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Booking Status Filter */}
            <div>
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Booking Open</option>
                <option value="closed">Booking Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {currentDoctors.length} of {filteredDoctors.length} doctors
        </p>
      </div>

      {/* Doctors Grid */}
      {currentDoctors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentDoctors.map((doctor) => (
              <Card key={doctor._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {doctor.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {doctor.qualification}
                      </p>
                    </div>
                    <Badge
                      variant={doctor.bookingOpen ? "default" : "secondary"}
                      className={doctor.bookingOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {doctor.bookingOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {doctor.specialty}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Consulting Hours */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Consulting Hours
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {doctor.consulting.map((session, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          <span className="font-medium">{session.day}:</span>{' '}
                          {session.sessions.map((sess, sessIndex) => (
                            <span key={sessIndex}>
                              {sessIndex > 0 && ', '}
                              {sess.start} - {sess.end}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Booking Toggle */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-600">Booking Status</span>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={doctor.bookingOpen}
                        onCheckedChange={() => 
                          handleBookingToggle(doctor._id, doctor.specialtyId, doctor.bookingOpen)
                        }
                        disabled={isUpdating}
                      />
                      <span className="text-sm">
                        {doctor.bookingOpen ? 'Open' : 'Closed'}
                        {isUpdating && ' Updating...'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorBookingPage;