import axios from "axios";

const baseUrl = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // FIX (Task 5.5): gunakan custom event daripada window.location.href
      // agar React Router bisa pakai navigate() (no full reload, preserve state).
      // Listener ada di App.jsx yang akan memanggil navigate("/").
      if (window.location.pathname !== "/") {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
