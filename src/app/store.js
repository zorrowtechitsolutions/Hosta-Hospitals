import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { notificationApi } from "./service/notification";
import { bookingApi } from "./service/bookings";
import { hospitalApi } from "./service/hospital";
import { specialitesApi } from "./service/specialites";
import { doctorsApi } from "./service/doctors";

export const store = configureStore({
  reducer: {
    [notificationApi.reducerPath]: notificationApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [hospitalApi.reducerPath]: hospitalApi.reducer,
    [specialitesApi.reducerPath]: specialitesApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,

  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(notificationApi.middleware)
      .concat(bookingApi.middleware)
      .concat(specialitesApi.middleware)
      .concat(doctorsApi.middleware)
      .concat(hospitalApi.middleware),
});

setupListeners(store.dispatch);
