import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const hospitalApi = createApi({
  reducerPath: "hospital",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({


    //  Get all notfication unread owner

    getAHospital: builder.query({
      query: (id) => `/api/hospital/${id}`,
    }),


       addAHospital: builder.mutation({
      query: ({ data }) => ({
        url: `/api/hospital/registration`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      }),
    }),


    //   updateHospital: builder.mutation({
    //   query: ({ id, data }) => (
    //     console.log(data, "hiii"),
        
    //     {
    //     url: `/api/hospital/details/${id}`,
    //     method: "PUT",
    //     headers: { "Content-Type": "application/json" },
    //     body: data,
    //   }),
    // }),

//     updateHospital: builder.mutation({
//   query: ({ id, data }) => {
//     console.log("Update hospital data:", JSON.stringify(data));
//      console.log("Is FormData?", data instanceof FormData);
    
    
//     return {
//       url: `/api/hospital/details/${id}`,
//       method: "PUT",
//       body: JSON.stringify(data),
//     };
//   },
// }),


updateHospital: builder.mutation({
  query: ({ id, data }) => {    
    return {
      url: `/api/hospital/details/${id}`,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    };
  },
}),

loginHospitalEmail: builder.mutation({
  query: (credentials) => ({
    url: `/api/hospital/login/mail`,
    method: "POST",
    body: credentials, // This should be the correct way
  }),
}),


   loginHospital: builder.mutation({
      query: ( phone ) => ({
        url: `/api/hospital/login`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
         body: phone,
      }),
    }),

      otpHospital: builder.mutation({
      query: ({ phone, otp} ) => ({
        url: `/api/hospital/otp`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
         body: {phone, otp},
      }),
    }),
    


  }),
});

export const {
useGetAHospitalQuery,
useUpdateHospitalMutation,
useLoginHospitalMutation,
useOtpHospitalMutation,
useLoginHospitalEmailMutation,
useAddAHospitalMutation,

} = hospitalApi;
