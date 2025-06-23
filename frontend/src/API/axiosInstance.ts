// src/services/axiosInstance.ts (New File)
import axios from 'axios';
import config from './config'; // Assuming you have your config file here

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// // Optional: Response Interceptor (for global error handling, refreshing tokens etc.)
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     // Example: Handle 401 Unauthorized errors globally
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true; // Mark as retried to prevent infinite loops

//       // You might want to try refreshing the token here if you have a refresh token mechanism.
//       // For now, let's just redirect to login if the token is truly invalid/expired.
//       console.error("Unauthorized request. Redirecting to login...");
//       localStorage.removeItem('jwtToken'); // Clear invalid token
//       // Redirect to your login page
//       // window.location.href = '/login'; // Or use your router's navigate/push method

//       // You can also dispatch a Redux action or update context here
//       // store.dispatch(logoutUser());
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;