import api from "./axios";

// Generate Types based on backend API
export type GenerationType = 'single_image' | 'batch_image';
export type UploadType = 'file' | 'url';

// Request payload matching backend API exactly
export interface GenerateRequest {
    generation_type: string;
    workflow: {
        step: string;
    };
    source: {
        upload_type: string;
        file_id?: string;
        image_url?: string;
    };
    model: {
        model_id: string;
        category: string;
        style: string;
    };
    business: {
        category: string;
        brand_name: string;
        brand_logo_id?: string;
        instagram_username?: string;
        website_url?: string;
    };
    output: {
        image_count: number;
        resolution: string;
        format: string;
        background: string;
    };
    user: {
        user_id: string;
        plan: string;
    };
}

// Form data for frontend use
export interface GenerateFormData {
    generationType: GenerationType;
    uploadType: UploadType;
    fileId?: string;
    imageUrl?: string;
    modelId: string;
    modelCategory: string;
    modelStyle: string;
    businessCategory: string;
    brandName: string;
    imageCount: number;
    resolution: string;
    format: string;
    background: string;
}

export interface GeneratedImage {
    id: string;
    url: string;
    thumbnailUrl?: string;
    prompt?: string;
    style?: string;
    createdAt: string;
}

export interface GenerateResult {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    images?: GeneratedImage[];
    message?: string;
    estimatedTime?: number;
}

export interface CategoryOption {
    value: string;
    label: string;
}

export interface UserCredits {
    freeCredits: number;
    maxFreeCredits: number;
    balance: number;
}

// Helper response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Generate API functions
export const generateApi = {
    // Get available business categories
    getCategories: async (): Promise<ApiResponse<CategoryOption[]>> => {
        try {
            const res = await api.get('/generate/categories');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load categories' };
        }
    },

    // Get user credits info
    getUserCredits: async (): Promise<ApiResponse<UserCredits>> => {
        try {
            const res = await api.get('/user/credits');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load credits' };
        }
    },

    // Validate generation request before processing - POST /generate/validate
    validateGeneration: async (formData: GenerateFormData, userId: string, userPlan: string = 'free'): Promise<ApiResponse<{ valid: boolean; message?: string; errors?: string[] }>> => {
        const requestPayload: GenerateRequest = {
            generation_type: formData.generationType,
            workflow: {
                step: formData.uploadType === 'file' ? 'upload' : 'details'
            },
            source: {
                upload_type: formData.uploadType,
                file_id: formData.fileId || '',
                image_url: formData.imageUrl || ''
            },
            model: {
                model_id: formData.modelId || 'studio_pro',
                category: formData.modelCategory || 'portrait',
                style: formData.modelStyle || 'professional'
            },
            business: {
                category: formData.businessCategory || '',
                brand_name: formData.brandName || '',
                brand_logo_id: '',
                instagram_username: '',
                website_url: ''
            },
            output: {
                image_count: formData.imageCount || 1,
                resolution: formData.resolution || '1024x1024',
                format: formData.format || 'png',
                background: formData.background || 'studio'
            },
            user: {
                user_id: userId,
                plan: userPlan
            }
        };

        try {
            console.log('Validate API Request:', JSON.stringify(requestPayload, null, 2));
            const res = await api.post('/generate/validate', requestPayload);
            console.log('Validate API Response:', res.data);
            return { success: true, data: res.data };
        } catch (err: any) {
            console.error('Validate API Error:', err.response?.data);
            return { success: false, error: err.response?.data?.message || 'Validation failed' };
        }
    },

    // Submit image generation request - Using exact backend JSON format
    generateImages: async (formData: GenerateFormData, userId: string, userPlan: string = 'free'): Promise<ApiResponse<GenerateResult>> => {
        // Build request payload matching backend API exactly
        const requestPayload: GenerateRequest = {
            generation_type: formData.generationType,
            workflow: {
                step: "details"
            },
            source: {
                upload_type: formData.uploadType,
                file_id: formData.fileId || '',
                image_url: formData.imageUrl || ''
            },
            model: {
                model_id: formData.modelId,
                category: formData.modelCategory,
                style: formData.modelStyle
            },
            business: {
                category: formData.businessCategory,
                brand_name: formData.brandName,
                brand_logo_id: '',
                instagram_username: '',
                website_url: ''
            },
            output: {
                image_count: formData.imageCount,
                resolution: formData.resolution,
                format: formData.format,
                background: formData.background
            },
            user: {
                user_id: userId,
                plan: userPlan
            }
        };

        try {
            console.log('Generate API Request:', JSON.stringify(requestPayload, null, 2));
            const res = await api.post('/generate', requestPayload);
            console.log('Generate API Response:', res.data);
            return { success: true, data: res.data };
        } catch (err: any) {
            console.error('Generate API Error:', err.response?.data);
            return { success: false, error: err.response?.data?.message || 'Generation failed' };
        }
    },

    // Check generation job status
    checkJobStatus: async (jobId: string): Promise<ApiResponse<GenerateResult>> => {
        try {
            const res = await api.get(`/generate/status/${jobId}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to check status' };
        }
    },

    // Upload image file and get file_id
    uploadImage: async (file: File): Promise<ApiResponse<{ file_id: string; url: string }>> => {
        const data = new FormData();
        data.append('image', file);

        try {
            const response = await api.post('/upload/image', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { success: true, data: response.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Upload failed'
            };
        }
    },

    // Upload brand logo
    uploadLogo: async (file: File): Promise<ApiResponse<{ url: string }>> => {
        const data = new FormData();
        data.append('logo', file);

        try {
            const response = await api.post('/upload/logo', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { success: true, data: response.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Upload failed'
            };
        }
    },

    // Save generation type selection (step 1)
    saveGenerationType: async (type: GenerationType): Promise<ApiResponse<{ sessionId: string }>> => {
        try {
            const res = await api.post('/generate/session', { generation_type: type });
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to save' };
        }
    },

    // Get current generation session
    getSession: async (): Promise<ApiResponse<Partial<GenerateFormData>>> => {
        try {
            const res = await api.get('/generate/session');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load session' };
        }
    },
};
