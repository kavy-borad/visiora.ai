import api from "./axios";

// Wallet Types
export interface WalletBalance {
    balance: number;
    currency: string;
    freeCredits: number;
    maxFreeCredits: number;
    promotionalCredits: number;
    isActive: boolean;
}

export interface Transaction {
    id: string;
    type: 'credit' | 'debit' | 'refund' | 'promotional';
    amount: number;
    currency: string;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
    metadata?: {
        generationId?: string;
        paymentMethod?: string;
        promoCode?: string;
    };
}

export interface TransactionFilters {
    type?: 'credit' | 'debit' | 'refund' | 'promotional';
    status?: 'completed' | 'pending' | 'failed';
    startDate?: string;
    endDate?: string;
}

export interface TransactionResponse {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface PaymentMethod {
    id: string;
    type: 'card' | 'upi' | 'netbanking' | 'wallet';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    upiId?: string;
}

export interface AddMoneyRequest {
    amount: number;
    gateway: 'razorpay' | 'stripe' | 'paypal';
    notes?: Record<string, any>;
}

export interface AddMoneyResponse {
    success?: boolean;
    message?: string;
    data?: any;
    // Razorpay order fields (different backends may return different field names)
    razorpayOrderId?: string;
    orderId?: string;
    order_id?: string;
    id?: string;
    amount?: number;
    currency?: string;
}

// Wallet Package Types
export interface Package {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    description?: string;
    popular?: boolean;
    discount?: number;
    features?: string[];
}

// Wallet Stats Types
export interface WalletStats {
    totalSpent: number;
    totalCreditsUsed: number;
    totalTransactions: number;
    averageSpending: number;
    lastTransaction?: string;
    monthlySpending?: number;
    weeklySpending?: number;
}

// Helper response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Wallet API functions
export const walletApi = {
    // Get wallet stats
    getStats: async (): Promise<ApiResponse<WalletStats>> => {
        try {
            const res = await api.get('/wallet/stats');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load stats' };
        }
    },

    // Get main wallet info
    getWallet: async (): Promise<ApiResponse<WalletBalance>> => {
        try {
            const res = await api.get('/wallet');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load wallet' };
        }
    },

    // Get wallet balance
    getBalance: async (): Promise<ApiResponse<WalletBalance>> => {
        try {
            const res = await api.get('/wallet/balance');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load balance' };
        }
    },

    // Check if user has sufficient balance for an amount
    checkBalance: async (amount: number): Promise<ApiResponse<{ sufficient: boolean; currentBalance: number; requiredAmount: number }>> => {
        try {
            const res = await api.post('/wallet/check-balance', { amount });
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to check balance' };
        }
    },

    // Get transactions
    getTransactions: async (
        page: number = 1,
        limit: number = 20,
        filters?: TransactionFilters
    ): Promise<ApiResponse<TransactionResponse>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (filters?.type) params.append('type', filters.type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        try {
            const res = await api.get(`/wallet/transactions?${params.toString()}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load transactions' };
        }
    },

    // Get single transaction
    getTransaction: async (id: string): Promise<ApiResponse<Transaction>> => {
        try {
            const res = await api.get(`/wallet/transactions/${id}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load transaction' };
        }
    },

    // Add money to wallet
    addMoney: async (amount: number, gateway: 'razorpay' | 'stripe' | 'paypal' = 'razorpay', notes: Record<string, any> = {}): Promise<ApiResponse<AddMoneyResponse>> => {
        try {
            console.log('=== ADD MONEY REQUEST ===');
            console.log('Amount:', amount);
            console.log('Gateway:', gateway);
            console.log('Token exists:', typeof window !== 'undefined' ? !!localStorage.getItem('token') : 'SSR');


            const res = await api.post('/wallet/add-money', {
                amount,
                gateway,
                notes
            });
            console.log('=== ADD MONEY SUCCESS ===');
            console.log('Response:', res.data);
            return { success: true, data: res.data };
        } catch (err: any) {
            console.log('=== ADD MONEY ERROR ===');
            console.log('Status:', err.response?.status);
            console.log('Status Text:', err.response?.statusText);
            console.log('Response Data:', JSON.stringify(err.response?.data, null, 2));
            console.log('Error Message:', err.message);

            // Extract error message from various possible response formats
            const errorMsg = err.response?.data?.message
                || err.response?.data?.error
                || err.response?.data?.errors?.[0]?.message
                || `HTTP ${err.response?.status}: ${err.response?.statusText}`
                || err.message
                || 'Failed to add money';

            return { success: false, error: errorMsg };
        }
    },

    // Get payment methods
    getPaymentMethods: async (): Promise<ApiResponse<PaymentMethod[]>> => {
        try {
            const res = await api.get('/wallet/payment-methods');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load payment methods' };
        }
    },

    // Add payment method
    addPaymentMethod: async (data: {
        type: string;
        token?: string;
        upiId?: string;
    }): Promise<ApiResponse<PaymentMethod>> => {
        try {
            const res = await api.post('/wallet/payment-methods', data);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to add payment method' };
        }
    },

    // Remove payment method
    removePaymentMethod: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
        try {
            const res = await api.delete(`/wallet/payment-methods/${id}`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to remove payment method' };
        }
    },

    // Set default payment method
    setDefaultPaymentMethod: async (id: string): Promise<ApiResponse<PaymentMethod>> => {
        try {
            const res = await api.put(`/wallet/payment-methods/${id}/default`);
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to set default' };
        }
    },

    // Apply promo code
    applyPromoCode: async (code: string): Promise<ApiResponse<{
        valid: boolean;
        discount?: number;
        message: string;
    }>> => {
        try {
            const res = await api.post('/wallet/promo-code', { code });
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Invalid promo code' };
        }
    },

    // Get user credits (same as other pages for consistency)
    getUserCredits: async (): Promise<ApiResponse<{ freeCredits: number; balance: number }>> => {
        try {
            const res = await api.get('/user/credits');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to get credits' };
        }
    },

    // Get available wallet packages
    getPackages: async (): Promise<ApiResponse<Package[]>> => {
        try {
            const res = await api.get('/wallet/packages');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load packages' };
        }
    },

    // Verify Razorpay payment
    verifyPayment: async (paymentData: {
        orderId: string;
        paymentId: string;
        signature: string;
        method: string;
    }): Promise<ApiResponse<{ success: boolean; message: string; transactionId?: string }>> => {
        try {
            console.log('=== VERIFY PAYMENT REQUEST ===');
            console.log('Order ID:', paymentData.orderId);
            console.log('Payment ID:', paymentData.paymentId);

            const res = await api.post('/wallet/verify-payment', paymentData);

            console.log('=== VERIFY PAYMENT SUCCESS ===');
            console.log('Response:', res.data);
            return { success: true, data: res.data };
        } catch (err: any) {
            console.log('=== VERIFY PAYMENT ERROR ===');
            console.log('Status:', err.response?.status);
            console.log('Response Data:', JSON.stringify(err.response?.data, null, 2));

            const errorMsg = err.response?.data?.message
                || err.response?.data?.error
                || `HTTP ${err.response?.status}: ${err.response?.statusText}`
                || err.message
                || 'Payment verification failed';

            return { success: false, error: errorMsg };
        }
    },
};
