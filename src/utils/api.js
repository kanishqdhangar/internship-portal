import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshCall = originalRequest.url === "/auth/refresh/";
    const isMeCall = originalRequest.url === "/auth/me/";
    const isLoginCall = originalRequest.url === "/auth/login/"; 
    // ❌ Never try refresh for /me or /refresh or /login
    if (isRefreshCall || isMeCall || isLoginCall) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh/");
        return api(originalRequest); // retry once
      } catch (refreshError) {
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
