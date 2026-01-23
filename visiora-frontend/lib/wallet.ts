import api from "./axios";

// Wallet Types
export interface WalletBalance {
    balance: number;
    currency: string;
    freeCredits: number;
    maxFreeCredits: number;
    promotionalCredits: number;
    isActive: boolean;
    stats?: {
        totalTransactions: number;
        totalCredits: number;
        totalDebits: number;
        imagesGenerated: number;
        monthlySpending: number;
        monthlyImages: number;
    };
}

export interface Transaction {
    id: string;
    type: 'credit' | 'debit' | 'refund' | 'bonus';
    category?: 'top_up' | 'image_generation' | 'subscription' | 'refund' | 'bonus' | 'referral' | 'adjustment';
    amount: number;
    currency: string;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;      // Frontend uses camelCase
    created_at?: string;    // Backend returns snake_case
    metadata?: {
        generationId?: string;
        paymentMethod?: string;
        promoCode?: string;
        orderId?: string;
    };
}

export interface TransactionFilters {
    type?: 'credit' | 'debit' | 'refund' | 'bonus';
    category?: 'top_up' | 'image_generation' | 'subscription' | 'refund' | 'bonus' | 'referral' | 'adjustment';
    status?: 'completed' | 'pending' | 'failed';
    days?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
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
    description: string;
    amount: number;
    credits: number;
    bonusCredits: number;
    totalCredits: number;
    currency: string;
    isPopular: boolean;
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

// Clear all caches (Placeholder now as caching is removed)
export const clearWalletCache = () => {
    // No-op as requested by user to remove caching logic
};

// Wallet API functions
export const walletApi = {
    // Get wallet stats
    getStats: async (): Promise<ApiResponse<WalletStats>> => {
        try {
            console.log('🌐 Fetching stats from API...');
            const res = await api.get('/wallet/stats');
            return { success: true, data: res.data };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.message || 'Failed to load stats' };
        }
    },

    // Get main wallet info including stats
    getWallet: async (): Promise<ApiResponse<WalletBalance>> => {
        try {
            console.log('🌐 Fetching wallet data from API...');
            const res = await api.get('/wallet');

            // Parse nested response structure
            if (res.data?.success && res.data?.data?.wallet) {
                const w = res.data.data.wallet;
                const s = res.data.data.statistics;

                const walletData: WalletBalance = {
                    balance: Number(w.balance || 0),
                    currency: w.currency || 'INR',
                    freeCredits: Number(w.freeCredits || 0),
                    maxFreeCredits: Number(w.maxFreeCredits ?? w.max_free_credits ?? 1),
                    promotionalCredits: 0,
                    isActive: w.status === 'active',
                    stats: s
                };

                return { success: true, data: walletData };
            }

            return { success: true, data: res.data };
        } catch (err: any) {
            console.error('getWallet error:', err);
            return { success: false, error: err.response?.data?.message || 'Failed to load wallet' };
        }
    },

    // Get wallet balance - Explicit endpoint
    getBalance: async (): Promise<ApiResponse<WalletBalance>> => {
        try {
            console.log('🌐 Fetching balance from /wallet/balance...');
            const res = await api.get('/wallet/balance');
            return { success: true, data: res.data };
        } catch (err: any) {
            // Don't fallback to getWallet() to avoid duplicate calls
            // Just return error - caller should use getWallet() directly if needed
            console.warn('Failed to fetch balance from /wallet/balance');
            return { success: false, error: err.response?.data?.message || 'Failed to fetch balance' };
        }
    },

    // Get user credits specifically - for navbar/header display
    getUserCredits: async (): Promise<ApiResponse<{ freeCredits: number; balance: number; maxFreeCredits: number }>> => {
        try {
            const walletRes = await walletApi.getWallet();
            if (walletRes.success && walletRes.data) {
                return {
                    success: true,
                    data: {
                        freeCredits: walletRes.data.freeCredits ?? 0,
                        balance: walletRes.data.balance ?? 0,
                        maxFreeCredits: walletRes.data.maxFreeCredits ?? 1
                    }
                };
            }
            return { success: false, error: 'Failed to fetch wallet data' };
        } catch (err: any) {
            console.error('Failed to get user credits:', err);
            return { success: false, error: err.message || 'Failed to fetch credits' };
        }
    },

    // Check if user has sufficient balance for an amount
    checkBalance: async (amount: number): Promise<ApiResponse<{
        canProceed: boolean;
        hasFreeCredits: boolean;
        freeCredits: number;
        balance: number;
        requiredAmount: number;
        shortfall: number;
    }>> => {
        try {
            console.log('=== CHECK BALANCE REQUEST ===');
            console.log('Amount:', amount);

            const res = await api.post('/wallet/check-balance', { amount });

            console.log('=== CHECK BALANCE RESPONSE ===');
            console.log('Response:', res.data);

            // Handle nested response { success: true, data: {...} }
            if (res.data?.success && res.data?.data) {
                return { success: true, data: res.data.data };
            }
            return { success: true, data: res.data };
        } catch (err: any) {
            console.log('=== CHECK BALANCE ERROR ===');
            console.log('Error:', err.response?.data);
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

        // Add filter parameters matching backend API
        if (filters?.days) params.append('days', filters.days.toString());
        if (filters?.type) params.append('type', filters.type);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        try {
            console.log('[Wallet] Fetching transactions with params:', params.toString());
            const res = await api.get(`/wallet/transactions?${params.toString()}`);
            console.log('[Wallet] Transactions API response:', res.data);

            // Parse response - handle different response structures
            let transactionsData: Transaction[] = [];
            let total = 0;
            let hasMore = false;

            // Actual API response: { success: true, data: [...], pagination: {...} }
            if (res.data?.success && res.data?.data) {
                const data = res.data.data;
                const pagination = res.data.pagination;

                // data is directly the transactions array
                if (Array.isArray(data)) {
                    transactionsData = data;
                    total = pagination?.total || data.length;
                    hasMore = pagination?.hasNext || false;
                    console.log('[Wallet] Parsed from { success, data: [...], pagination }:', data.length, 'transactions');
                } else if (data.transactions && Array.isArray(data.transactions)) {
                    // Fallback: { success, data: { transactions: [...] } }
                    transactionsData = data.transactions;
                    total = data.total || pagination?.total || data.transactions.length;
                    hasMore = data.hasMore || pagination?.hasNext || false;
                }
            } else if (res.data?.transactions && Array.isArray(res.data.transactions)) {
                // Direct: { transactions: [...], total, ... }
                transactionsData = res.data.transactions;
                total = res.data.total || res.data.transactions.length;
                hasMore = res.data.hasMore || false;
            } else if (Array.isArray(res.data)) {
                // Direct array
                transactionsData = res.data;
                total = res.data.length;
            }

            // Normalize fields for each transaction
            const normalizedTransactions: Transaction[] = transactionsData.map((tx: any) => ({
                id: tx.id,
                type: tx.type,
                category: tx.category,
                amount: Number(tx.amount || 0),
                currency: tx.currency || 'INR',
                description: tx.description || tx.title || '',
                status: tx.paymentStatus || tx.status || 'completed', // Use paymentStatus from API
                createdAt: tx.createdAt || tx.created_at || new Date().toISOString(),
                metadata: tx.metadata || {},
            }));

            console.log('[Wallet] Parsed transactions:', normalizedTransactions.length);

            return {
                success: true,
                data: {
                    transactions: normalizedTransactions,
                    total,
                    page,
                    limit,
                    hasMore,
                }
            };
        } catch (err: any) {
            console.error('[Wallet] getTransactions error:', err);
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
        return Promise.resolve({ success: true, data: [] });
    },

    // Add payment method
    addPaymentMethod: async (data: any): Promise<ApiResponse<PaymentMethod>> => {
        return Promise.resolve({ success: false, error: 'Not implemented' });
    },

    // Remove payment method
    removePaymentMethod: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
        return Promise.resolve({ success: true, data: { success: true } });
    },

    // Set default payment method
    setDefaultPaymentMethod: async (id: string): Promise<ApiResponse<PaymentMethod>> => {
        return Promise.resolve({ success: false, error: 'Not implemented' });
    },

    // Apply promo code
    applyPromoCode: async (code: string): Promise<ApiResponse<{
        valid: boolean;
        discount?: number;
        message: string;
    }>> => {
        return Promise.resolve({ success: true, data: { valid: true, discount: 10, message: 'Promo applied' } });
    },



    // Get available wallet packages
    getPackages: async (): Promise<ApiResponse<Package[]>> => {
        try {
            console.log('🌐 Fetching fresh packages from API...');
            const res = await api.get('/wallet/packages');

            let packagesData: Package[] = [];

            // API returns { success: true, data: [...packages] }
            if (res.data?.success && Array.isArray(res.data?.data)) {
                packagesData = res.data.data;
            } else if (Array.isArray(res.data)) {
                packagesData = res.data;
            } else {
                packagesData = res.data?.data || res.data || [];
            }

            return { success: true, data: packagesData };
        } catch (err: any) {
            console.error('getPackages error:', err);
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
