// import axios from "axios";

// export const apiClient = axios.create({
//   baseURL: import.meta.env.VITE_AxiosBaseURL,
// });

// let isRefreshing = false; // Flag to track the refresh process
// let failedQueue: any[] = []; // Queue to hold requests while token is being refreshed

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     if (token) {
//       prom.resolve(token);
//     } else {
//       prom.reject(error);
//     }
//   });

//   failedQueue = [];
// };

// const refreshAccessToken = async () => {
//   try {
//     const response = await apiClient.get("/api/refresh", {
//       withCredentials: true,
//     });
//     const newAccessToken = response.data.accessToken;
//     localStorage.setItem("accessToken", newAccessToken);

//     return newAccessToken;
//   } catch (error) {
//     localStorage.removeItem("accessToken");
//     throw error;
//   }
// };

// // Axios request interceptor to include access token from localStorage
// apiClient.interceptors.request.use(
//   (config) => {
//     const accessToken = localStorage.getItem("accessToken");
//     if (accessToken) {
//       config.headers["Authorization"] = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Axios response interceptor to handle token expiration
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // Check for 401/403 error (token expiration)
//     if (error.response.status === 401 || error.response.status === 403) {
//       if (!originalRequest._retry) {
//         originalRequest._retry = true;

//         if (isRefreshing) {
//           // If a refresh is already happening, queue the request
//           return new Promise(function (resolve, reject) {
//             failedQueue.push({ resolve, reject });
//           })
//             .then((token) => {
//               originalRequest.headers["Authorization"] = `Bearer ${token}`;
//               return apiClient(originalRequest);
//             })
//             .catch((err) => {
//               return Promise.reject(err);
//             });
//         }

//         // Start refresh process
//         isRefreshing = true;

//         try {
//           const newAccessToken = await refreshAccessToken();
//           processQueue(null, newAccessToken); // Process queued requests
//           originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
//           return apiClient(originalRequest);
//         } catch (refreshError) {
//           processQueue(refreshError, null); // Reject queued requests
//           return Promise.reject(refreshError);
//         } finally {
//           isRefreshing = false;
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );



import axios from "axios";

export const apiClient = axios.create({
  // baseURL: "https://hosta-server.vercel.app",
    // baseURL: "https://hostaserver.onrender.com",
  baseURL: "http://51.21.135.18",
  withCredentials: true, // ✅ Important for refresh/login cookies
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  try {
    const response = await apiClient.get("/api/refresh", { withCredentials: true });
    const newAccessToken = response.data.accessToken;
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    localStorage.removeItem("accessToken");
    throw error;
  }
};

// ✅ Request interceptor (add token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (handle token refresh)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🛑 If no response (network error)
    if (!error.response) {
      return Promise.reject(new Error("Network error, please check your connection."));
    }

    // 🛑 Skip retry for login/refresh endpoints
    if (
      originalRequest.url.includes("/login") ||
      originalRequest.url.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    // 🧩 Handle 401/403 — expired access token
    if (error.response.status === 401 || error.response.status === 403) {
      if (originalRequest._retry) return Promise.reject(error);
      originalRequest._retry = true;

      if (isRefreshing) {
        // queue request while refresh is happening
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

