import api from "./axios";

// Gallery Types
export interface GalleryImage {
    id: string;
    src: string;
    thumbnailUrl?: string;
    alt: string;
    prompt: string;
    upscaled: boolean;
    createdAt: string;
    style?: string;
    model?: string;
}

export interface GalleryFilters {
    search?: string;
    style?: string;
    upscaled?: boolean;
    dateFrom?: string;
    dateTo?: string;
}

export interface GalleryResponse {
    images: GalleryImage[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface UserCredits {
    freeCredits: number;
    maxFreeCredits: number;
    balance: number;
}

// Gallery Stats Types
export interface GalleryStats {
    totalImages: number;
    totalUpscaled: number;
    totalDownloads: number;
    storageUsed: number;
    storageLimit: number;
    recentActivity?: string;
}

// Helper response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Save Image Request
export interface SaveImageRequest {
    user_id: string;
    filename: string;
    url: string;
    type: 'generated' | 'uploaded' | 'upscaled';
    prompt: string;
    model_used: string;
}

// Gallery API functions
export const galleryApi = {
    // Save image to gallery
    saveImage: async (data: SaveImageRequest): Promise<ApiResponse<GalleryImage>> => {
        try {
            const res = await api.post('/gallery/save', data);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to save image' };
        }
    },

    // Get gallery stats
    getStats: async (): Promise<ApiResponse<GalleryStats>> => {
        try {
            const res = await api.get('/gallery/stats');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load stats' };
        }
    },

    // Get all gallery images
    getImages: async (
        page: number = 1,
        limit: number = 20,
        filters?: GalleryFilters
    ): Promise<ApiResponse<GalleryResponse>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (filters?.search) params.append('search', filters.search);
        if (filters?.style) params.append('style', filters.style);
        if (filters?.upscaled !== undefined) params.append('upscaled', filters.upscaled.toString());
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);

        try {
            const res = await api.get(`/gallery?${params.toString()}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load gallery' };
        }
    },

    // Get single image details
    getImage: async (id: string): Promise<ApiResponse<GalleryImage>> => {
        try {
            const res = await api.get(`/gallery/${id}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load image' };
        }
    },

    // Delete an image
    deleteImage: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
        try {
            const res = await api.delete(`/gallery/${id}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete image' };
        }
    },

    // Delete multiple images (bulk delete)
    deleteImages: async (imageIds: string[]): Promise<ApiResponse<{ success: boolean; deleted: number }>> => {
        try {
            const res = await api.post('/gallery/bulk-delete', { image_ids: imageIds });
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete images' };
        }
    },

    // Toggle favorite status
    toggleFavorite: async (id: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
        try {
            const res = await api.post(`/gallery/${id}/favorite`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to toggle favorite' };
        }
    },

    // Copy prompt to clipboard (client-side, but we can track usage)
    copyPrompt: async (id: string): Promise<ApiResponse<{ prompt: string }>> => {
        try {
            const res = await api.get(`/gallery/${id}/prompt`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to get prompt' };
        }
    },

    // Download image - returns download URL
    getDownloadUrl: async (id: string): Promise<ApiResponse<{ downloadUrl: string }>> => {
        try {
            const res = await api.get(`/gallery/${id}/download`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to get download URL' };
        }
    },

    // Upscale an image
    upscaleImage: async (id: string): Promise<ApiResponse<{ jobId: string }>> => {
        try {
            const res = await api.post(`/gallery/${id}/upscale`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to upscale image' };
        }
    },

    // Get user credits
    getUserCredits: async (): Promise<ApiResponse<UserCredits>> => {
        try {
            const res = await api.get('/user/credits');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to get credits' };
        }
    },

    // Search images
    searchImages: async (query: string): Promise<ApiResponse<GalleryImage[]>> => {
        try {
            const res = await api.get(`/gallery/search?q=${encodeURIComponent(query)}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Search failed' };
        }
    },
};
