import api from "./axios";

// Dashboard Types
export interface DashboardStats {
    totalImages: number;
    freeCredits: number;
    maxFreeCredits: number;
    totalSpent: number;
    favoriteStyle: string;
    favoriteStyleUsage: number;
    imageTrend: number;
    spendingTrend: number;
}

export interface RecentImage {
    id: string;
    url: string;
    prompt?: string;
    createdAt: string;
}

export interface ChartDataPoint {
    day: string;
    value: number;
}

export interface DashboardData {
    stats: DashboardStats;
    recentImages: RecentImage[];
    imageGenerationChart: ChartDataPoint[];
    spendingChart: ChartDataPoint[];
}

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    balance: number;
    freeCredits: number;
}

// Helper response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Dashboard API functions
export const dashboardApi = {
    // Get dashboard overview data
    getDashboardData: async (): Promise<ApiResponse<DashboardData>> => {
        try {
            const res = await api.get('/dashboard');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load dashboard' };
        }
    },

    // Get dashboard overview
    getOverview: async (): Promise<ApiResponse<DashboardData>> => {
        try {
            const res = await api.get('/dashboard/overview');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load overview' };
        }
    },

    // Get dashboard stats only
    getStats: async (): Promise<ApiResponse<DashboardStats>> => {
        try {
            const res = await api.get('/dashboard/stats');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load stats' };
        }
    },

    // Get recent generated images
    getRecentImages: async (limit: number = 5): Promise<ApiResponse<RecentImage[]>> => {
        try {
            const res = await api.get(`/dashboard/recent-images?limit=${limit}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load images' };
        }
    },

    // Get recent activity/images (alternative endpoint)
    getRecent: async (): Promise<ApiResponse<RecentImage[]>> => {
        try {
            const res = await api.get('/dashboard/recent');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load recent' };
        }
    },

    // Get all charts data
    getCharts: async (): Promise<ApiResponse<{ imageGeneration: ChartDataPoint[]; spending: ChartDataPoint[] }>> => {
        try {
            const res = await api.get('/dashboard/charts');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load charts' };
        }
    },

    // Get image generation chart data
    getImageGenerationChart: async (days: number = 7): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get(`/dashboard/charts/image-generation?days=${days}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load chart' };
        }
    },

    // Get daily generation chart data
    getDailyGenerationChart: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get('/dashboard/charts/daily-generation');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load daily generation chart' };
        }
    },

    // Get spending chart data
    getSpendingChart: async (days: number = 7): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get(`/dashboard/charts/spending?days=${days}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load chart' };
        }
    },

    // Get daily spending chart data
    getDailySpendingChart: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get('/dashboard/charts/daily-spending');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load daily spending chart' };
        }
    },

    // Get user profile
    getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
        try {
            const res = await api.get('/user/profile');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load profile' };
        }
    },
};
