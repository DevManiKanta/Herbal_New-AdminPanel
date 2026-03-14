import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// REQUEST → attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE → handle 401 globally only
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const token = localStorage.getItem("token");

    // 🔥 Redirect ONLY if token exists (session expired case)
    if (status === 401 && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Session expired. Please login again.", {
        duration: 4000,
        position: "top-right",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }

    // Log the full error response for debugging

    // Don't handle other errors here - let components handle them
    // This allows components to show custom error messages with toast

    return Promise.reject(error);
  },
);

export default api;
