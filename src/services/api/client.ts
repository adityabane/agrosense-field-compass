import axios from "axios";
import { getAccessToken, handleSessionExpired } from "@/services/auth/auth";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

/** DEMO MODE is on whenever no FastAPI backend URL is configured. */
export const DEMO_MODE = !API_BASE_URL;

export const http = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401) await handleSessionExpired();
    return Promise.reject(error);
  },
);

/** Simulated latency so loading states are visible in demo mode. */
export const delay = <T,>(v: T, ms = 350) => new Promise<T>((r) => setTimeout(() => r(v), ms));
