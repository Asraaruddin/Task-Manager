import axios from "axios";

const API = axios.create({
  baseURL: "https://task-manager-6crr.onrender.com", // backend URL
});

// Add token to every request if exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
