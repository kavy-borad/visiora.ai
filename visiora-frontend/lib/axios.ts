// lib/axios.ts
import axios from "axios";

// Live Backend Server URL
const API_BASE_URL = "https://phpstack-1490006-6107283.cloudwaysapps.com/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log 401 errors but DON'T auto-logout
        // Let individual pages handle auth errors as needed
        if (error.response?.status === 401) {
            console.warn('API returned 401 Unauthorized:', error.config?.url);
            // Don't auto-logout - let the page handle it
            // This prevents unexpected logouts during normal API calls
        }
        return Promise.reject(error);
    }
);

export default api;
