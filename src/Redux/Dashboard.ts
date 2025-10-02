import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// A session for a given day
export interface Session {
  _id?: string;
  start_time: string;
  end_time: string;
}

// A doctor's consulting availability per day
export interface ConsultingDay {
  _id?: string;
  day: string;
  sessions: Session[];
}

// A doctor belongs to a specialty
export interface Doctor {
  _id?: string;
  name: string;
  specialty?: string;
  qualification?: string;
  consulting: ConsultingDay[];
}

// A specialty contains multiple doctors
export interface Specialty {
  _id: string;
  name: string; // e.g., "CARDIOLOGY"
  main_specialty?: string; // if you want parent specialty
  sub_specialt: string; // e.g., "echo cardiologist"
  description: string;
  department_info: string;
  phone: string;
  doctors: Doctor[];
}

export interface Booking {
  user_name?: string;
  mobile?: string;
  email?: string;
  specialty?: string;
  doctor_name?: string;
  booking_date?: Date;
  booking_time: string;
  status: "pending" | "accepted" | "declained";
}

interface InitialStateType {
  _id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  emergencyContact: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  password: string;
  about: string;
  image: { imageUrl: string; deleteHash: string };
  working_hours: {
    day: string;
    opening_time: string;
    closing_time: string;
    is_holiday: boolean;
  }[];
  working_hours_clinic: any;

  reviews: any[];
  specialties: Specialty[]; // Type specialties properly here
  booking: Booking[];
}

const InitialState: InitialStateType = {
  _id: "",
  name: "",
  type: "",
  address: "",
  phone: "",
  emergencyContact: "0000000000",
  email: "",
  latitude: null,
  longitude: null,
  password: "",
  about: "",
  image: { imageUrl: "", deleteHash: "" },
  working_hours: [
    {
      day: "Monday",
      opening_time: "",
      closing_time: "",
      is_holiday: false,
    },
    {
      day: "Tuesday",
      opening_time: "",
      closing_time: "",
      is_holiday: false,
    },
    {
      day: "Wednesday",
      opening_time: "",
      closing_time: "",
      is_holiday: false,
    },
    {
      day: "Thursday",
      opening_time: "",
      closing_time: "",
      is_holiday: false,
    },
    {
      day: "Friday",
      opening_time: "",
      closing_time: "",
      is_holiday: false,
    },
    {
      day: "Saturday",
      opening_time: "",
      closing_time: "",
      is_holiday: false,
    },
    {
      day: "Sunday",
      opening_time: "",
      closing_time: "",
      is_holiday: false,
    },
  ],
  working_hours_clinic: [],
  reviews: [],
  specialties: [],
  booking: [],
};

const Dashboard = createSlice({
  name: "dashboard",
  initialState: InitialState,
  reducers: {
    setHospitalData: (state, action: PayloadAction<any>) => {
      return { ...state, ...action.payload };
    },
  },
});
// Action creators are generated for each case reducer function
export const { setHospitalData } = Dashboard.actions;
export default Dashboard.reducer;
