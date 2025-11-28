import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notification",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({


    //  Get all notfication unread owner

    getAllnotficationHospitalUnRead: builder.query({
      query: (id) => `/api/notifications/hospital/no-read/${id}`,
    }),

        //  Get all notfication unread admin


    getAllnotficationHospitalRead: builder.query({
      query: (id) => `/api/notifications/hospital/read/${id}`,
    }),



    // Update a notfication admin

    updatenotficationHospitalAll: builder.mutation({
      query: ( id ) => ({
        url: `/api/notifications/hospital/read-all/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }),
    }),

      updateAnotficationHospital: builder.mutation({
      query: ( id ) => ({
        url: `/api/notifications/hospital/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }),
    }),


  }),
});

export const {
useGetAllnotficationHospitalReadQuery,
useGetAllnotficationHospitalUnReadQuery,
useUpdatenotficationHospitalAllMutation,
useUpdateAnotficationHospitalMutation,

} = notificationApi;
