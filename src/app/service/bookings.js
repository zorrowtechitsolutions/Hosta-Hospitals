import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bookingApi = createApi({
  reducerPath: "bookings",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({


     getAllHospitalBooking: builder.query({
      query: (id) => `/api/bookings/hospital/${id}`,
    }),


    updatebooking: builder.mutation({
        query: ({ bookingId, hospitalId, updatebooking }) => {
          return {
            url: `/api/bookings/${bookingId}/hospital/${hospitalId}`,
            method: 'PUT',
            body: updatebooking,
          };
        },
      }),

  }),
});

export const {
   useGetAllHospitalBookingQuery,
   useUpdatebookingMutation
  } =  bookingApi; 
  