import api from "./axios";

// Backend base URL for image storage
const STORAGE_BASE_URL = "https://phpstack-1490006-6107283.cloudwaysapps.com";

// Normalize image URL to ensure it's absolute
const normalizeImageUrl = (url: string | null | undefined): string => {
    if (!url || url.trim() === '') return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.startsWith('/storage/') || url.startsWith('/uploads/') || url.startsWith('/images/')) {
        return `${STORAGE_BASE_URL}${url}`;
    }
    if (!url.includes('/')) return `${STORAGE_BASE_URL}/storage/gallery/${url}`;
    return `${STORAGE_BASE_URL}/${url.replace(/^\//, '')}`;
};

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
    paid?: number;
    free?: number;
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

// Clear all dashboard caches (Placeholder now as caching is removed)
export const clearDashboardCache = () => {
    // No-op as requested by user to remove caching logic
};

// Dashboard API functions
export const dashboardApi = {
    // Get dashboard overview data
    getDashboardData: async (): Promise<ApiResponse<DashboardData>> => {
        try {
            console.log('🌐 Fetching fresh dashboard data from API...');
            const res = await api.get('/dashboard');
            const data = res.data?.data || res.data || {};

            // Helper to safely get free credits
            let freeCredits = 0;
            // Check all possible locations and casing
            if (data.header?.freeCredits !== undefined) freeCredits = data.header.freeCredits;
            else if (data.header?.free_credits !== undefined) freeCredits = data.header.free_credits;
            else if (data.overview?.freeCredits !== undefined) {
                if (typeof data.overview.freeCredits === 'object') freeCredits = data.overview.freeCredits.available ?? 0;
                else freeCredits = data.overview.freeCredits;
            }
            else if (data.overview?.free_credits !== undefined) {
                if (typeof data.overview.free_credits === 'object') freeCredits = data.overview.free_credits.available ?? 0;
                else freeCredits = data.overview.free_credits;
            }
            else if (data.freeCredits !== undefined) freeCredits = data.freeCredits;
            else if (data.free_credits !== undefined) freeCredits = data.free_credits;

            // Get maxFreeCredits dynamically from API
            let maxFreeCredits = 11; // Default fallback (user's max is 11)
            if (data.overview?.maxFreeCredits !== undefined) maxFreeCredits = data.overview.maxFreeCredits;
            else if (data.overview?.max_free_credits !== undefined) maxFreeCredits = data.overview.max_free_credits;
            else if (data.header?.maxFreeCredits !== undefined) maxFreeCredits = data.header.maxFreeCredits;
            else if (data.header?.max_free_credits !== undefined) maxFreeCredits = data.header.max_free_credits;
            else if (data.maxFreeCredits !== undefined) maxFreeCredits = data.maxFreeCredits;
            else if (data.max_free_credits !== undefined) maxFreeCredits = data.max_free_credits;

            // Map Backend 'overview' to Frontend 'stats'
            const stats: DashboardStats = {
                totalImages: data.overview?.totalImages || 0,
                freeCredits: freeCredits,
                maxFreeCredits: maxFreeCredits,
                totalSpent: data.overview?.totalSpent || 0,
                favoriteStyle: data.overview?.favoriteStyle || 'None',
                favoriteStyleUsage: 0,
                imageTrend: 0,
                spendingTrend: 0
            };

            // Map Backend 'recentGenerations' to Frontend 'recentImages'
            const recentImages: RecentImage[] = Array.isArray(data.recentGenerations)
                ? data.recentGenerations
                    .map((img: any) => ({
                        id: img?.id || 'unknown',
                        url: normalizeImageUrl(img?.url),
                        prompt: img?.prompt || img?.filename || 'Generated Image',
                        createdAt: img?.createdAt || new Date().toISOString()
                    }))
                    .filter((img: RecentImage) => img.url && img.url.trim() !== '') // Filter out empty URLs
                : [];

            // Map Backend 'charts.dailyImageGeneration' to Frontend 'imageGenerationChart'
            const dailyGenData = data.charts?.dailyImageGeneration?.data;
            const imageGenerationChart: ChartDataPoint[] = Array.isArray(dailyGenData)
                ? dailyGenData.map((d: any) => ({
                    day: d?.date || d?.day || '',
                    value: d?.count ?? d?.value ?? 0
                }))
                : [];

            // Map Backend 'charts.dailySpending' to Frontend 'spendingChart'
            const dailySpendData = data.charts?.dailySpending?.data;
            const spendingChart: ChartDataPoint[] = Array.isArray(dailySpendData)
                ? dailySpendData.map((d: any) => ({
                    day: d?.date || d?.day || '',
                    value: (d?.paid ?? 0) + (d?.free ?? 0),
                    paid: d?.paid ?? 0,
                    free: d?.free ?? 0
                }))
                : [];

            const dashboardData: DashboardData = {
                stats,
                recentImages,
                imageGenerationChart,
                spendingChart
            };

            return {
                success: true,
                data: dashboardData
            };
        } catch (err: any) {
            console.error('getDashboardData error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load dashboard' };
        }
    },

    // Get dashboard overview
    getOverview: async (): Promise<ApiResponse<DashboardData>> => {
        try {
            const res = await api.get('/dashboard/overview');
            const data = res.data?.data || res.data || {};

            // Helper to safely get free credits
            let freeCredits = 0;
            // Check all possible locations and casing
            if (data.freeCredits !== undefined && typeof data.freeCredits === 'object') freeCredits = data.freeCredits.available ?? 0;
            else if (data.freeCredits !== undefined) freeCredits = data.freeCredits;
            else if (data.free_credits !== undefined) {
                if (typeof data.free_credits === 'object') freeCredits = data.free_credits.available ?? 0;
                else freeCredits = data.free_credits;
            }

            // Get maxFreeCredits dynamically
            const maxFreeCredits = data.maxFreeCredits ?? data.max_free_credits ?? 11;

            const stats: DashboardStats = {
                totalImages: data.totalImages ?? 0,
                freeCredits: freeCredits,
                maxFreeCredits: maxFreeCredits,
                totalSpent: data.totalSpent ?? 0,
                favoriteStyle: data.favoriteStyle ?? 'None',
                favoriteStyleUsage: 0,
                imageTrend: 0,
                spendingTrend: 0
            };

            // Return as full DashboardData structure with empty charts/images
            return {
                success: true,
                data: {
                    stats,
                    recentImages: [],
                    imageGenerationChart: [],
                    spendingChart: []
                }
            };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load overview' };
        }
    },

    // Get dashboard stats only
    getStats: async (): Promise<ApiResponse<DashboardStats>> => {
        try {
            // Using /dashboard/overview as it provides the stats efficiently
            const res = await api.get('/dashboard/overview');
            const data = res.data?.data || res.data || {};

            // Same safe mapping as getOverview
            let freeCredits = 0;
            if (data.freeCredits !== undefined && typeof data.freeCredits === 'object') freeCredits = data.freeCredits.available ?? 0;
            else if (data.freeCredits !== undefined) freeCredits = data.freeCredits;
            else if (data.free_credits !== undefined) {
                if (typeof data.free_credits === 'object') freeCredits = data.free_credits.available ?? 0;
                else freeCredits = data.free_credits;
            }

            // Get maxFreeCredits dynamically
            const maxFreeCredits = data.maxFreeCredits ?? data.max_free_credits ?? 11;

            const stats: DashboardStats = {
                totalImages: data.totalImages ?? 0,
                freeCredits: freeCredits,
                maxFreeCredits: maxFreeCredits,
                totalSpent: data.totalSpent ?? 0,
                favoriteStyle: data.favoriteStyle ?? 'None',
                favoriteStyleUsage: 0,
                imageTrend: 0,
                spendingTrend: 0
            };

            return { success: true, data: stats };
        } catch (err: any) {
            console.error('getStats error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load stats' };
        }
    },

    // Get recent generated images
    getRecentImages: async (limit: number = 5): Promise<ApiResponse<RecentImage[]>> => {
        try {
            // Using the correct endpoint provided by user
            const res = await api.get('/dashboard/recent');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load recent images' };
        }
    },

    // Get recent activity/images (alternative endpoint)
    getRecent: async (): Promise<ApiResponse<RecentImage[]>> => {
        try {
            const res = await api.get('/dashboard/recent');

            // User JSON shows { success: true, data: [...], viewAllUrl: "..." }
            // So res.data.data is the array.
            const data = res.data?.data;
            const items = Array.isArray(data) ? data : [];

            const recentImages: RecentImage[] = items
                .map((img: any) => ({
                    id: img.id,
                    url: normalizeImageUrl(img.url),
                    prompt: img.filename || 'Generated Image',
                    createdAt: img.createdAt || new Date().toISOString()
                }))
                .filter((img: RecentImage) => img.url && img.url.trim() !== ''); // Filter out empty URLs

            return { success: true, data: recentImages };
        } catch (err: any) {
            console.error('getRecent error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load recent' };
        }
    },

    // Get dashboard activity
    getActivity: async (): Promise<ApiResponse<{ imagesGeneratedToday: number; imagesGeneratedThisWeek: number; imagesGeneratedThisMonth: number; spentThisMonth: number }>> => {
        try {
            const res = await api.get('/dashboard/activity');
            const data = res.data?.data || res.data || {};

            // Map strictly to expected structure known from user JSON
            const activityData = {
                imagesGeneratedToday: data.imagesGeneratedToday ?? 0,
                imagesGeneratedThisWeek: data.imagesGeneratedThisWeek ?? 0,
                imagesGeneratedThisMonth: data.imagesGeneratedThisMonth ?? 0,
                spentThisMonth: data.spentThisMonth ?? 0
            };

            return { success: true, data: activityData };
        } catch (err: any) {
            console.error('getActivity error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load activity' };
        }
    },

    // Get analytics by style
    getStyleAnalytics: async (): Promise<ApiResponse<{ style: string; count: number }[]>> => {
        try {
            const res = await api.get('/dashboard/analytics/by-style');
            const data = res.data?.data || res.data || [];

            // Handle if it's an array directly or nested
            const items = Array.isArray(data) ? data : (data.data || []);

            const analytics = items.map((item: any) => ({
                style: item.style || item.name || 'Unknown',
                count: item.count || item.value || 0
            }));

            return { success: true, data: analytics };
        } catch (err: any) {
            console.error('getStyleAnalytics error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load style analytics' };
        }
    },

    // Get analytics by type
    getTypeAnalytics: async (): Promise<ApiResponse<{ type: string; count: number }[]>> => {
        try {
            const res = await api.get('/dashboard/analytics/by-type');
            const data = res.data?.data || res.data || [];

            // Handle if it's an array directly or nested
            const items = Array.isArray(data) ? data : (data.data || []);

            const analytics = items.map((item: any) => ({
                type: item.type || item.name || 'Unknown',
                count: item.count || item.value || 0
            }));

            return { success: true, data: analytics };
        } catch (err: any) {
            console.error('getTypeAnalytics error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load type analytics' };
        }
    },

    // Get all charts data
    getCharts: async (): Promise<ApiResponse<{ imageGeneration: ChartDataPoint[]; spending: ChartDataPoint[] }>> => {
        try {
            const res = await api.get('/dashboard/charts');
            console.log('🔍 RAW /dashboard/charts response:', JSON.stringify(res.data, null, 2));
            const data = res.data?.data || res.data || {};

            // Helper function to format date as "M 14" (day abbreviation + date)
            const formatDateLabel = (dateStr: string): string => {
                if (!dateStr) return '';
                try {
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return dateStr;
                    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                    const dayAbbr = dayNames[date.getDay()];
                    const dayNum = date.getDate();
                    return `${dayAbbr} ${dayNum}`;
                } catch {
                    return dateStr;
                }
            };

            // Helper mapping function with date formatting
            const mapChart = (list: any[]) => Array.isArray(list) ? list.map((d: any) => {
                const rawDate = d?.date || d?.day || '';
                return {
                    day: formatDateLabel(rawDate),
                    value: (d?.paid !== undefined && d?.free !== undefined) ? (d.paid + d.free) : (d?.value ?? d?.count ?? 0),
                    paid: d?.paid ?? 0,
                    free: d?.free ?? 0
                };
            }) : [];

            // Robustly find the chart arrays
            const imgData = data.imageGeneration || data.dailyImageGeneration?.data || data.dailyImageGeneration || [];
            const spendData = data.spending || data.dailySpending?.data || data.dailySpending || [];

            console.log('🔍 Parsed imgData:', imgData);
            console.log('🔍 Parsed spendData:', spendData);

            const mappedImg = mapChart(imgData);
            const mappedSpend = mapChart(spendData);

            console.log('📊 Mapped Image Generation:', mappedImg);
            console.log('📊 Mapped Spending:', mappedSpend);

            return {
                success: true,
                data: {
                    imageGeneration: mappedImg,
                    spending: mappedSpend
                }
            };
        } catch (err: any) {
            console.error('getCharts error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load charts' };
        }
    },

    // Get image generation chart data
    getImageGenerationChart: async (days: number = 7): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get(`/dashboard/charts/image-generation?days=${days}`);
            // Handle response wrapping
            const data = res.data?.data || res.data;
            // Map if necessary, assuming backend returns { date: string, count: number }[]
            const points = Array.isArray(data) ? data.map((d: any) => ({
                day: d.date || d.day,
                value: d.count ?? d.value ?? 0
            })) : [];

            return { success: true, data: points };
        } catch (err: any) {
            console.error('getImageGenerationChart error:', err);
            // Return empty array on error instead of mock
            return { success: false, error: err.response?.data?.message || 'Failed to load chart' };
        }
    },

    // Get daily generation chart data
    getDailyGenerationChart: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get('/dashboard/charts/daily-generation');
            const data = res.data?.data || res.data || {};

            // Extract the chart array from 'chartData' based on provided JSON
            const items = data.chartData || (Array.isArray(data) ? data : []);

            const chartPoints: ChartDataPoint[] = items.map((d: any) => ({
                day: d.date || d.day || '',
                value: d.count ?? d.value ?? 0
            }));

            return { success: true, data: chartPoints };
        } catch (err: any) {
            console.error('getDailyGenerationChart error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load daily generation chart' };
        }
    },

    // Get spending chart data
    getSpendingChart: async (days: number = 7): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get(`/dashboard/charts/spending?days=${days}`);
            // Handle response wrapping
            const data = res.data?.data || res.data;
            // Map if necessary
            const points = Array.isArray(data) ? data.map((d: any) => ({
                day: d.date || d.day,
                value: d.count ?? d.value ?? 0
            })) : [];

            return { success: true, data: points };
        } catch (err: any) {
            console.error('getSpendingChart error:', err);
            // Return empty array on error instead of mock
            return { success: false, error: err.response?.data?.message || 'Failed to load chart' };
        }
    },

    // Get daily spending chart data
    getDailySpendingChart: async (): Promise<ApiResponse<ChartDataPoint[]>> => {
        try {
            const res = await api.get('/dashboard/charts/daily-spending');
            const data = res.data?.data || res.data || {};

            // Extract the chart array from 'chartData' based on provided JSON
            const items = data.chartData || (Array.isArray(data) ? data : []);

            const chartPoints: ChartDataPoint[] = items.map((d: any) => ({
                day: d.date || d.day || '',
                value: (d.paid ?? 0) + (d.free ?? 0),
                paid: d.paid ?? 0,
                free: d.free ?? 0
            }));

            return { success: true, data: chartPoints };
        } catch (err: any) {
            console.error('getDailySpendingChart error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load daily spending chart' };
        }
    },

    // Get user profile
    getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
        try {
            // Use /auth/me instead of /user/profile
            const res = await api.get('/auth/me');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load profile' };
        }
    },
};
