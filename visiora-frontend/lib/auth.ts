import api from "./axios";

// Auth Types
export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    id: string;
    fullName: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token?: string;
    message?: string;
}

// Auth API functions
export const authApi = {
    // POST /api/auth/register
    register: async (userData: RegisterData) => {
        try {
            // Transform field names to match PHP backend expectations
            const response = await api.post("/auth/register", {
                fullName: userData.fullName,
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.confirmPassword,
            });
            return { success: true, data: response.data };
        } catch (err: any) {
            // Log the full error response to see what the backend says
            console.log("Register Error Response:", err.response?.data);
            console.log("Register Error Status:", err.response?.status);

            // Extract clean error message
            const errorData = err.response?.data;
            let errorMessage = "Registration failed";

            if (errorData) {
                // Check for message directly
                if (errorData.message && typeof errorData.message === 'string') {
                    errorMessage = errorData.message;
                }
                // Check for details array (validation errors)
                else if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
                    // Get the first validation error message
                    errorMessage = errorData.details[0].message || errorMessage;
                }
                // Check for error field
                else if (errorData.error && typeof errorData.error === 'string') {
                    errorMessage = errorData.error;
                }
            }

            return { success: false, error: errorMessage };
        }
    },

    // POST /api/auth/login
    login: async (credentials: LoginData) => {
        try {
            const response = await api.post("/auth/login", credentials);
            console.log("=== LOGIN FULL RESPONSE ===");
            console.log("response.data:", JSON.stringify(response.data, null, 2));
            console.log("===========================");

            // Store user data on successful login
            if (response.data && typeof window !== 'undefined') {
                // Handle token - could be at root or nested (backend returns accessToken)
                const token = response.data.accessToken || response.data.token || response.data.access_token || response.data.data?.token || response.data.data?.accessToken;
                console.log("Token found:", token ? "YES" : "NO", "Token value:", token?.substring(0, 20) + "...");

                if (token) {
                    localStorage.setItem('token', token);
                    console.log('Token saved to localStorage');
                } else {
                    console.warn('NO TOKEN FOUND IN RESPONSE!');
                }

                // Handle user - could be at root, nested in 'user', or nested in 'data'
                const userData = response.data.user || response.data.data?.user || response.data.data || {
                    fullName: response.data.fullName || response.data.name || response.data.full_name,
                    email: response.data.email,
                    id: response.data.id || response.data.user_id,
                };

                if (userData && (userData.fullName || userData.name || userData.email)) {
                    // Normalize user data
                    const normalizedUser = {
                        id: userData.id || userData.user_id || '',
                        fullName: userData.fullName || userData.name || userData.full_name || '',
                        email: userData.email || '',
                    };
                    console.log("Storing user:", normalizedUser); // Debug log
                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                }
            }
            return { success: true, data: response.data };
        } catch (err: any) {
            console.log("Login Error:", err.response?.data); // Debug log
            return { success: false, error: err.response?.data?.message || "Login failed" };
        }
    },

    // POST /api/auth/logout
    logout: async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            // Ignore errors, clear storage anyway
        }
        // Clear local storage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
        }
        return { success: true };
    },

    // GET /api/auth/me
    getMe: async () => {
        try {
            const response = await api.get("/auth/me");
            return { success: true, data: response.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || "Failed to get user" };
        }
    },

    // Get current user from localStorage (client-side)
    getCurrentUser: (): User | null => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    },

    // Check if user is logged in
    isAuthenticated: (): boolean => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('token');
        }
        return false;
    },
};

export default authApi;
