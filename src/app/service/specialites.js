import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const specialitesApi = createApi({
  reducerPath: "specialites",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({


    //  Get all notfication unread owner

    getAllSpeciality: builder.query({
      query: () => `/api/speciality`,
    }),

      addAHospitalSpeciality: builder.mutation({
      query: ({ hospitalId, specialtyData }) => ({
        url: `/api/hospital/specialty/${hospitalId}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
         body: specialtyData,
      }),
    }),


       updateAHospitalSpeciality: builder.mutation({
      query: ({ hospitalId,
        specialtyId,
        specialtyData} ) => ({
        url: `/api/hospital/${hospitalId}/specialty/${ specialtyId}`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
         body: specialtyData,
      }),
    }),



       deleteAHospitalSpeciality: builder.mutation({
      query: ({ hospitalId,
        specialtyId} ) => ({
        url: `/api/hospital/${hospitalId}/specialty/${ specialtyId}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      }),
    }),


  }),
});

export const {
useGetAllSpecialityQuery,
useAddAHospitalSpecialityMutation,
useDeleteAHospitalSpecialityMutation,
useUpdateAHospitalSpecialityMutation
} = specialitesApi;
