// src/api/api.js

import axios from "axios";

const API = axios.create({
  baseURL: "https://task-manager-6crr.onrender.com/api", // FIXED: Added /api
  withCredentials: false, // You use JWT token, no cookies needed
});

// Add token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
