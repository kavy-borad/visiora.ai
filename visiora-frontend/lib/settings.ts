import api from "./axios";

// Settings Types
export interface UserProfile {
    id: string;
    email: string;
    phone?: string;
    name?: string;
    avatar?: string;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface UserCredits {
    freeCredits: number;
    balance: number;
}

export interface UpdateProfileRequest {
    email?: string;
    phone?: string;
    name?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    generationUpdates: boolean;
    weeklyDigest: boolean;
}

export interface AccountSettings {
    language: string;
    timezone: string;
    currency: string;
    defaultImageFormat: 'png' | 'jpg' | 'webp';
    defaultImageQuality: 'low' | 'medium' | 'high';
}

// Helper response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Settings API functions
export const settingsApi = {
    // Get user profile
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
        try {
            const res = await api.get('/user/profile');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load profile' };
        }
    },

    // Update user profile
    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
        try {
            const res = await api.put('/user/profile', data);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to update profile' };
        }
    },

    // Change password
    changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<{ success: boolean; message: string }>> => {
        try {
            const res = await api.put('/user/password', data);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to change password' };
        }
    },

    // Get notification settings
    getNotificationSettings: async (): Promise<ApiResponse<NotificationSettings>> => {
        try {
            const res = await api.get('/user/notifications');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load settings' };
        }
    },

    // Update notification settings
    updateNotificationSettings: async (data: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> => {
        try {
            const res = await api.put('/user/notifications', data);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to update settings' };
        }
    },

    // Get account settings
    getAccountSettings: async (): Promise<ApiResponse<AccountSettings>> => {
        try {
            const res = await api.get('/user/settings');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load settings' };
        }
    },

    // Update account settings
    updateAccountSettings: async (data: Partial<AccountSettings>): Promise<ApiResponse<AccountSettings>> => {
        try {
            const res = await api.put('/user/settings', data);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to update settings' };
        }
    },

    // Get user credits (for header)
    getUserCredits: async (): Promise<ApiResponse<UserCredits>> => {
        try {
            const res = await api.get('/user/credits');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to get credits' };
        }
    },

    // Upload avatar
    uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await api.post('/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to upload avatar' };
        }
    },

    // Delete account
    deleteAccount: async (password: string): Promise<ApiResponse<{ success: boolean }>> => {
        try {
            const res = await api.delete('/user/account', { data: { password } });
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to delete account' };
        }
    },

    // Export user data
    exportData: async (): Promise<ApiResponse<{ downloadUrl: string }>> => {
        try {
            const res = await api.get('/user/export');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to export data' };
        }
    },
};
