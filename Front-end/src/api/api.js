// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://task-manager-6crr.onrender.com/api", // ✔ CORRECT
  withCredentials: false, // You use token, so no cookies
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
