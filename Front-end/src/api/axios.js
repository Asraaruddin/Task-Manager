import axios from "axios";

export const api = axios.create({
  baseURL: "https://task-manager-6crr.onrender.com",
  withCredentials: false, // FIX — must be FALSE because you use TOKEN header, not cookies
});
