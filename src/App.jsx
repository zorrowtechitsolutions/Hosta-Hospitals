// 'use client'


// import AppRoutes from './appRoutes/Routes'

// export default function App() {
//   return (
//      < AppRoutes />

//   )
// }


import axios from "axios";
import React, { useState } from "react";

export default function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent)  => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);
   const response = await axios.post("https://zorrowtek.in/api/hospital/login", {
    email,
    password
   },   {
    withCredentials: true,
  });

   console.log(response, "iiiii");
   
    // API call here
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
        }}
      >
        <h2>Email Login</h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "10px",
          }}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "10px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
