import api from "./axios";

// Landing Page Types
export interface LandingStats {
    imagesGenerated: number;
    avgGenerationTime: number; // in seconds
    activeUsers: number;
}

// Helper response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Landing API functions (public - no auth required)
export const landingApi = {
    // Get public landing page stats
    getStats: async (): Promise<ApiResponse<LandingStats>> => {
        try {
            const res = await api.get('/public/stats');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load stats' };
        }
    },
};
