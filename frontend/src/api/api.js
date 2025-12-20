import axios from "axios";

const baseUrl = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
