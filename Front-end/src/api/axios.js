import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false, // FIX — must be FALSE because you use TOKEN header, not cookies
});
