import api from "./axios";

// Visiora -> ephotocart
const STORAGE_BASE_URL = "https://phpstack-1490006-6107283.cloudwaysapps.com";

/**
 * Normalize image URL - ensures URL is absolute
 * If URL is relative or just filename, prepend the backend storage URL
 */
const normalizeImageUrl = (url: string | null | undefined): string => {
    if (!url || url.trim() === '') {
        return '';
    }

    // If already an absolute URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }

    // If starts with /storage/ or /uploads/, prepend base URL
    if (url.startsWith('/storage/') || url.startsWith('/uploads/') || url.startsWith('/images/')) {
        return `${STORAGE_BASE_URL}${url}`;
    }

    // If just a filename, assume it's in /storage/gallery/
    if (!url.includes('/')) {
        return `${STORAGE_BASE_URL}/storage/gallery/${url}`;
    }

    // Otherwise prepend base URL with leading slash
    return `${STORAGE_BASE_URL}/${url.replace(/^\//, '')}`;
};

// Gallery Types
export interface GalleryImage {
    id: string;
    filename: string;
    url: string;
    type: 'generated' | 'uploaded';
    size: number;
    created_at: string;
    // Frontend mapped fields
    src?: string;
    alt?: string;
    prompt?: string;
    upscaled?: boolean;
    createdAt?: string;
}

export interface GalleryFilters {
    search?: string;
    sort?: 'newest' | 'oldest' | 'name';
    type?: 'all' | 'generated' | 'uploaded';
}

export interface GalleryPagination {
    current_page: number;
    total_pages: number;
    total_images: number;
}

export interface GalleryResponse {
    images: GalleryImage[];
    pagination: GalleryPagination;
}

// Gallery Stats Types
export interface GalleryStats {
    total_images: number;
    total_generated: number;
    total_uploaded: number;
    storage_used: number;
    storage_limit: number;
    // Frontend mapped fields
    totalImages?: number;
    totalGenerated?: number;
    totalUploaded?: number;
    storageUsed?: number;
    storageLimit?: number;
}

// Helper response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Save image request type
export interface SaveImageRequest {
    user_id?: string;
    filename: string;
    url: string;
    type: 'generated' | 'uploaded';
    prompt?: string;
    model_used?: string;
}

// Helper to get user_id from localStorage
const getUserId = (): string | null => {
    if (typeof window === 'undefined') return null;

    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id || user.user_id || user.uuid || null;
        }
    } catch (e) {
        console.error('Error parsing user from localStorage:', e);
    }
    return null;
};

// Gallery API functions
export const galleryApi = {
    /**
     * Get gallery images
     * GET /api/gallery
     * 
     * @param page - Page number (default: 1)
     * @param limit - Images per page (default: 20)
     * @param filters - Optional filters (search, sort, type)
     */
    getImages: async (
        page: number = 1,
        limit: number = 20,
        filters?: GalleryFilters
    ): Promise<ApiResponse<GalleryResponse>> => {
        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            // Add user_id for authentication fallback
            const userId = getUserId();
            if (userId) {
                params.append('user_id', userId);
            }

            // Add optional filters
            if (filters?.search) {
                params.append('search', filters.search);
            }
            if (filters?.sort) {
                params.append('sort', filters.sort);
            }
            if (filters?.type && filters.type !== 'all') {
                params.append('type', filters.type);
            }

            console.log('🌐 Fetching gallery images:', `/gallery?${params.toString()}`);

            const res = await api.get(`/gallery?${params.toString()}`);

            console.log('✅ Gallery API Response:', res.data);

            if (res.data?.success && res.data?.data) {
                const apiData = res.data.data;
                const apiImages = apiData.images || [];
                const pagination = apiData.pagination || {
                    current_page: page,
                    total_pages: 1,
                    total_images: apiImages.length
                };

                // Map backend response to frontend format
                const mappedImages: GalleryImage[] = apiImages.map((img: any) => {
                    const normalizedUrl = normalizeImageUrl(img.url);
                    return {
                        // Original backend fields
                        id: img.id,
                        filename: img.filename,
                        url: normalizedUrl,
                        type: img.type,
                        size: img.size,
                        created_at: img.created_at,
                        // Mapped frontend fields
                        src: normalizedUrl,
                        alt: img.filename || 'Generated Image',
                        prompt: img.filename || 'Generated Image',
                        upscaled: false,
                        createdAt: img.created_at
                    };
                });

                // Filter out any images with empty URLs
                const validImages = mappedImages.filter(img => img.url && img.url.trim() !== '');

                return {
                    success: true,
                    data: {
                        images: validImages,
                        pagination: pagination
                    }
                };
            }

            // Fallback for unexpected response format
            return {
                success: false,
                error: 'Unexpected response format'
            };

        } catch (err: any) {
            console.error('❌ Gallery API Error:', err.response?.data || err.message);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to load gallery'
            };
        }
    },

    /**
     * Get gallery stats
     * GET /api/gallery/stats
     */
    getStats: async (): Promise<ApiResponse<GalleryStats>> => {
        try {
            console.log('🌐 Fetching gallery stats...');

            // Build query parameters
            const params = new URLSearchParams();

            // Add user_id for authentication fallback
            const userId = getUserId();
            if (userId) {
                params.append('user_id', userId);
            }

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const res = await api.get(`/gallery/stats${queryString}`);

            console.log('✅ Gallery Stats Response:', res.data);

            if (res.data?.success && res.data?.data) {
                const data = res.data.data;

                // Map backend snake_case to frontend camelCase
                const stats: GalleryStats = {
                    // Original backend fields
                    total_images: data.total_images ?? 0,
                    total_generated: data.total_generated ?? 0,
                    total_uploaded: data.total_uploaded ?? 0,
                    storage_used: data.storage_used ?? 0,
                    storage_limit: data.storage_limit ?? 0,
                    // Mapped frontend fields
                    totalImages: data.total_images ?? data.totalImages ?? 0,
                    totalGenerated: data.total_generated ?? data.totalGenerated ?? 0,
                    totalUploaded: data.total_uploaded ?? data.totalUploaded ?? 0,
                    storageUsed: data.storage_used ?? data.storageUsed ?? 0,
                    storageLimit: data.storage_limit ?? data.storageLimit ?? 0,
                };

                return { success: true, data: stats };
            }

            return {
                success: false,
                error: 'Unexpected response format'
            };

        } catch (err: any) {
            console.error('❌ Gallery Stats Error:', err.response?.data || err.message);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to load stats'
            };
        }
    },

    /**
     * Get single image details
     * GET /api/gallery/{id}
     * 
     * @param id - Image ID
     */
    getImage: async (id: string): Promise<ApiResponse<GalleryImage>> => {
        try {
            console.log('🌐 Fetching image details:', `/gallery/${id}`);

            const res = await api.get(`/gallery/${id}`);

            console.log('✅ Image Details Response:', res.data);

            if (res.data?.success && res.data?.data) {
                const img = res.data.data;
                const normalizedUrl = normalizeImageUrl(img.url);

                // Map backend response to frontend format
                const mappedImage: GalleryImage = {
                    // Original backend fields
                    id: img.id,
                    filename: img.filename,
                    url: normalizedUrl,
                    type: img.type,
                    size: img.size,
                    created_at: img.created_at,
                    // Mapped frontend fields
                    src: normalizedUrl,
                    alt: img.filename || 'Generated Image',
                    prompt: img.prompt || img.filename || 'Generated Image',
                    upscaled: img.upscaled || false,
                    createdAt: img.created_at
                };

                return { success: true, data: mappedImage };
            }

            return {
                success: false,
                error: 'Image not found'
            };

        } catch (err: any) {
            console.error('❌ Get Image Error:', err.response?.data || err.message);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to load image'
            };
        }
    },

    /**
     * Delete image
     * DELETE /api/gallery/{id}
     * 
     * @param id - Image ID to delete
     */
    deleteImage: async (id: string): Promise<ApiResponse<{ id: string; filename: string; deleted_at: string }>> => {
        try {
            console.log('🗑️ Deleting image:', `/gallery/${id}`);

            const res = await api.delete(`/gallery/${id}`);

            console.log('✅ Delete Response:', res.data);

            if (res.data?.success) {
                return {
                    success: true,
                    data: {
                        id: res.data.data?.id || id,
                        filename: res.data.data?.filename || '',
                        deleted_at: res.data.data?.deleted_at || new Date().toISOString()
                    }
                };
            }

            return {
                success: false,
                error: res.data?.message || 'Failed to delete image'
            };

        } catch (err: any) {
            console.error('❌ Delete Image Error:', err.response?.data || err.message);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to delete image'
            };
        }
    },

    /**
     * Bulk delete images
     * POST /api/gallery/bulk-delete
     * 
     * @param imageIds - Array of image IDs to delete
     */
    bulkDelete: async (imageIds: string[]): Promise<ApiResponse<{
        deleted: { id: string; filename?: string }[];
        failed: { id: string; reason?: string }[];
        not_found: string[];
    }>> => {
        try {
            console.log('🗑️ Bulk deleting images:', imageIds.length, 'images');

            const res = await api.post('/gallery/bulk-delete', {
                image_ids: imageIds
            });

            console.log('✅ Bulk Delete Response:', res.data);

            if (res.data?.success) {
                const data = res.data.data || {};
                return {
                    success: true,
                    data: {
                        deleted: data.deleted || [],
                        failed: data.failed || [],
                        not_found: data.not_found || []
                    }
                };
            }

            return {
                success: false,
                error: res.data?.message || 'Failed to delete images'
            };

        } catch (err: any) {
            console.error('❌ Bulk Delete Error:', err.response?.data || err.message);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to delete images'
            };
        }
    },

    /**
     * Save image to gallery
     * POST /api/gallery/save
     * 
     * @param imageData - Image data to save
     */
    saveImage: async (imageData: SaveImageRequest): Promise<ApiResponse<GalleryImage>> => {
        try {
            // Get user_id from localStorage if not provided
            const userId = imageData.user_id || getUserId();

            const payload = {
                user_id: userId || '',
                filename: imageData.filename,
                url: imageData.url,
                type: imageData.type || 'generated',
                prompt: imageData.prompt || '',
                model_used: imageData.model_used || ''
            };

            console.log('💾 Saving image to gallery:', payload);

            const res = await api.post('/gallery/save', payload);

            console.log('✅ Save Response:', res.data);

            if (res.data?.success && res.data?.data) {
                const img = res.data.data;
                const normalizedUrl = normalizeImageUrl(img.url);

                // Map response to GalleryImage format
                const savedImage: GalleryImage = {
                    id: img.id,
                    filename: img.filename,
                    url: normalizedUrl,
                    type: img.type,
                    size: img.size || 0,
                    created_at: img.created_at || new Date().toISOString(),
                    // Frontend mapped fields
                    src: normalizedUrl,
                    alt: img.filename || 'Saved Image',
                    prompt: img.prompt || imageData.prompt || '',
                    upscaled: img.upscaled || false,
                    createdAt: img.created_at || new Date().toISOString()
                };

                return { success: true, data: savedImage };
            }

            return {
                success: false,
                error: res.data?.message || 'Failed to save image'
            };

        } catch (err: any) {
            console.error('❌ Save Image Error:', err.response?.data || err.message);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to save image'
            };
        }
    },

    /**
     * Toggle favorite status of an image
     * POST /api/gallery/{id}/favorite
     * 
     * @param id - Image ID
     */
    toggleFavorite: async (id: string): Promise<ApiResponse<{ id: string; isFavorite: boolean }>> => {
        try {
            console.log('❤️ Toggling favorite:', `/gallery/${id}/favorite`);

            const res = await api.post(`/gallery/${id}/favorite`);

            console.log('✅ Toggle Favorite Response:', res.data);

            if (res.data?.success) {
                return {
                    success: true,
                    data: {
                        id: res.data.data?.id || id,
                        isFavorite: res.data.data?.is_favorite ?? res.data.data?.isFavorite ?? true
                    }
                };
            }

            return {
                success: false,
                error: res.data?.message || 'Failed to toggle favorite'
            };

        } catch (err: any) {
            console.error('❌ Toggle Favorite Error:', err.response?.data || err.message);
            return {
                success: false,
                error: err.response?.data?.message || err.message || 'Failed to toggle favorite'
            };
        }
    },

    /**
     * Download image - fetches image blob through API for CORS-safe download
     * GET /api/gallery/{id}/download
     * 
     * @param id - Image ID
     * @param imageUrl - Direct image URL (fallback for direct download)
     * @param filename - Filename for download
     */
    downloadImage: async (id: string, imageUrl: string, filename: string): Promise<ApiResponse<{ downloaded: boolean }>> => {
        const safeFilename = `${(filename || 'ephotocart_image').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${id}.jpg`;

        try {
            console.log('⬇️ Downloading image:', id);

            // Method 1: Try API download endpoint (if backend supports it)
            try {
                const res = await api.get(`/gallery/${id}/download`, {
                    responseType: 'blob'
                });

                if (res.data) {
                    const blob = new Blob([res.data], { type: 'image/jpeg' });
                    const blobUrl = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = safeFilename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();

                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 100);

                    console.log('✅ Download via API successful:', safeFilename);
                    return { success: true, data: { downloaded: true } };
                }
            } catch (apiError) {
                console.warn('API download endpoint not available, trying direct fetch...', apiError);
            }

            // Method 2: Try fetching directly with no-cors workaround
            try {
                const response = await fetch(imageUrl, {
                    mode: 'cors',
                    credentials: 'omit'
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = safeFilename;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();

                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 100);

                    console.log('✅ Direct fetch download successful:', safeFilename);
                    return { success: true, data: { downloaded: true } };
                }
            } catch (fetchError) {
                console.warn('Direct fetch failed, trying anchor download...', fetchError);
            }

            // Method 3: Open in new tab for manual download
            console.log('⚠️ Opening image in new tab for manual download');
            window.open(imageUrl, '_blank');
            return { success: true, data: { downloaded: true } };

        } catch (err: any) {
            console.error('❌ Download Error:', err);
            // Last resort: open in new tab
            window.open(imageUrl, '_blank');
            return {
                success: false,
                error: err.message || 'Download failed, opened in new tab'
            };
        }
    },
};
