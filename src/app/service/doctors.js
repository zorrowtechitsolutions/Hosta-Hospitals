import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const doctorsApi = createApi({
  reducerPath: "doctors",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({


      addAHospitalDoctor: builder.mutation({
      query: ({ hospitalId,  data }) => ({
        url: `/api/hospital/doctor/${hospitalId}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
         body:  data,
      }),
    }),


       updateAHospitalDoctor: builder.mutation({
      query: ({ hospitalId,
        specialtyId,
        doctorId,
        data
        } ) => (          
          {
        url: `/api/hospital/${hospitalId}/specialty/${ specialtyId}/doctors/${doctorId}`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
         body:  data,
      }),
    }),


    



       deleteAHospitalDoctor: builder.mutation({
      query: ({ hospitalId,
        specialtyId, doctorId} ) => ({
        url: `/api/hospital/${hospitalId}/specialty/${ specialtyId}/doctors/${doctorId}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      }),
    }),


  }),
});

export const {
    useAddAHospitalDoctorMutation,
    useDeleteAHospitalDoctorMutation,
    useUpdateAHospitalDoctorMutation,

} = doctorsApi;
