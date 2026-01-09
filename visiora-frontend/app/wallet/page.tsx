"use client";

import Link from "@/components/Link";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    ChevronDown,
    Zap,
    Plus,
    MoreHorizontal,
    Info,
    Receipt,
    ArrowRight,
    ChevronRight,
    Filter,
    Bell,
    Menu,
    Loader2,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { walletApi, WalletBalance, Transaction, TransactionFilters, Package, WalletStats } from "@/lib/wallet";
import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";

export default function WalletPage() {
    // User profile state
    const [userName, setUserName] = useState("Jane");
    const [userInitial, setUserInitial] = useState("J");

    // API state
    const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPackages, setIsLoadingPackages] = useState(false);
    const [isAddingMoney, setIsAddingMoney] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'30' | '60' | '90' | 'all'>('30');
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // Fetch wallet data on mount
    useEffect(() => {
        // Load user from localStorage
        const storedUser = authApi.getCurrentUser();
        if (storedUser && storedUser.fullName) {
            const firstName = storedUser.fullName.split(' ')[0];
            setUserName(firstName);
            setUserInitial(firstName.charAt(0).toUpperCase());
        }

        fetchWalletData();
        fetchPackages();
    }, []);

    // Fetch transactions when filter changes
    useEffect(() => {
        fetchTransactions();
    }, [selectedFilter]);

    const fetchWalletData = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const [walletRes, balanceRes, statsRes, transactionsRes] = await Promise.all([
                walletApi.getWallet(),      // GET /api/wallet
                walletApi.getBalance(),     // GET /api/wallet/balance
                walletApi.getStats(),       // GET /api/wallet/stats
                walletApi.getTransactions(1, 20),
            ]);

            // Check for rate limit errors in any response
            const responses = [walletRes, balanceRes, statsRes, transactionsRes];
            const rateLimitError = responses.find(r =>
                r.error?.toLowerCase().includes('too many requests') ||
                r.error?.toLowerCase().includes('rate limit')
            );

            if (rateLimitError) {
                setApiError('Too many requests. Please wait a moment and try again.');
                return;
            }

            // Use wallet data, fallback to balance data
            if (walletRes.success && walletRes.data) {
                setWalletBalance(walletRes.data);
            } else if (balanceRes.success && balanceRes.data) {
                setWalletBalance(balanceRes.data);
            }

            // Set wallet stats
            if (statsRes.success && statsRes.data) {
                setWalletStats(statsRes.data);
            }

            if (transactionsRes.success && transactionsRes.data) {
                setTransactions(transactionsRes.data.transactions);
            }
        } catch (error: any) {
            console.warn('Failed to fetch wallet data:', error);
            // Check for rate limit in catch block
            if (error?.message?.includes('429') || error?.message?.includes('Too many')) {
                setApiError('Too many requests. Please wait a moment and try again.');
            } else {
                setApiError('Failed to load wallet data. Please refresh the page.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const now = new Date();
            let startDate: string | undefined;

            if (selectedFilter !== 'all') {
                const days = parseInt(selectedFilter);
                const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                startDate = start.toISOString();
            }

            const filters: TransactionFilters = startDate ? { startDate } : {};
            const response = await walletApi.getTransactions(1, 20, Object.keys(filters).length > 0 ? filters : undefined);

            if (response.success && response.data) {
                setTransactions(response.data.transactions);
            }
        } catch (error) {
            console.warn('Failed to fetch transactions:', error);
        }
    };

    const fetchPackages = async () => {
        setIsLoadingPackages(true);
        try {
            const response = await walletApi.getPackages();
            // Handle different response formats: array directly or object with packages array
            let packagesData: any[] = [];

            if (response.success && response.data) {
                const data = response.data as any;
                if (Array.isArray(data)) {
                    packagesData = data;
                } else if (data.packages && Array.isArray(data.packages)) {
                    packagesData = data.packages;
                } else if (typeof data === 'object') {
                    // If it's an object, try to convert to array or ignore
                    console.warn('Packages API returned object instead of array:', data);
                }
            }

            if (packagesData.length > 0) {
                setPackages(packagesData);
                // Auto-select popular package or first one
                const popularPkg = packagesData.find((p: any) => p.popular);
                if (popularPkg) {
                    setSelectedPackage(popularPkg.id);
                } else {
                    setSelectedPackage(packagesData[0].id);
                }
            }
        } catch (error) {
            console.warn('Failed to fetch packages:', error);
        } finally {
            setIsLoadingPackages(false);
        }
    };

    const handleAddMoney = async () => {
        // Get amount from selected package or use default
        const selectedPkg = packages.find(p => p.id === selectedPackage);
        const amount = selectedPkg?.price || 100; // Default to 100 if no package selected

        setIsAddingMoney(true);
        try {
            // Step 1: Call add-money API to create Razorpay order
            const response = await walletApi.addMoney(amount, 'razorpay', {
                packageId: selectedPackage || undefined,
                credits: selectedPkg?.credits || 0,
            });

            console.log('=== ADD MONEY API RESPONSE ===');
            console.log('Response:', response);

            if (!response.success || !response.data) {
                alert('Error: ' + (response.error || 'Failed to create order'));
                setIsAddingMoney(false);
                return;
            }

            // Step 2: Extract order details from response
            const orderData = response.data;
            const razorpayOrderId = orderData.razorpayOrderId || orderData.orderId || orderData.order_id || orderData.id;

            if (!razorpayOrderId) {
                console.error('No order ID in response:', orderData);
                alert('Error: No order ID received from server');
                setIsAddingMoney(false);
                return;
            }

            // Step 3: Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                await new Promise<void>((resolve, reject) => {
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Razorpay'));
                    document.body.appendChild(script);
                });
            }

            // Step 4: Get user details for prefill
            const user = authApi.getCurrentUser();

            // Step 5: Open Razorpay checkout
            const razorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY', // Replace with your Razorpay key
                amount: amount * 100, // Razorpay expects amount in paise
                currency: currency || 'INR',
                name: 'Visiora',
                description: selectedPkg ? `${selectedPkg.credits} Credits - ${selectedPkg.name}` : 'Add Money to Wallet',
                order_id: razorpayOrderId,
                handler: async function (razorpayResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    console.log('=== RAZORPAY SUCCESS ===');
                    console.log('Response:', razorpayResponse);

                    // Step 6: Verify payment with backend
                    try {
                        const verifyResult = await walletApi.verifyPayment({
                            orderId: razorpayResponse.razorpay_order_id,
                            paymentId: razorpayResponse.razorpay_payment_id,
                            signature: razorpayResponse.razorpay_signature,
                            method: 'razorpay',
                        });

                        if (verifyResult.success) {
                            alert('✅ Payment successful! ' + (verifyResult.data?.message || 'Credits added to your wallet.'));
                            // Refresh wallet data
                            fetchWalletData();
                        } else {
                            alert('⚠️ Payment verification failed: ' + (verifyResult.error || 'Please contact support.'));
                        }
                    } catch (verifyError) {
                        console.error('Payment verification error:', verifyError);
                        alert('⚠️ Payment completed but verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.fullName || userName,
                    email: user?.email || '',
                    contact: '',
                },
                theme: {
                    color: '#14b8a6', // Teal color matching Visiora theme
                },
                modal: {
                    ondismiss: function () {
                        console.log('Razorpay checkout dismissed');
                        setIsAddingMoney(false);
                    },
                    escape: true,
                    animation: true,
                },
            };

            const razorpay = new window.Razorpay(razorpayOptions);

            razorpay.on('payment.failed', function (response: any) {
                console.error('=== RAZORPAY PAYMENT FAILED ===');
                console.error('Error:', response.error);
                alert('❌ Payment failed: ' + (response.error?.description || 'Please try again.'));
                setIsAddingMoney(false);
            });

            razorpay.open();

        } catch (error) {
            console.error('Failed to initiate payment:', error);
            alert('An error occurred. Please try again.');
            setIsAddingMoney(false);
        }
    };


    // Derived values with fallbacks
    const balance = walletBalance?.balance ?? 0;
    const currency = walletBalance?.currency ?? 'INR';
    const freeCredits = walletBalance?.freeCredits ?? 1;
    const isActive = walletBalance?.isActive ?? true;
    const promotionalCredits = walletBalance?.promotionalCredits ?? 0;

    // Format currency based on type
    const formatCurrency = (amount: number, curr: string = currency) => {
        if (curr === 'INR') return `₹${amount.toFixed(2)}`;
        if (curr === 'USD') return `$${amount.toFixed(2)}`;
        return `${amount.toFixed(2)} ${curr}`;
    };

    // Get transaction icon
    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'credit':
            case 'promotional':
                return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
            case 'debit':
                return <ArrowUpRight className="w-4 h-4 text-red-500" />;
            case 'refund':
                return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
            default:
                return <CreditCard className="w-4 h-4 text-slate-400" />;
        }
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate" },
        { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
        { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet", active: true },
    ];

    return (
        <div className="min-h-screen flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Reusable Sidebar */}
            <Sidebar activeNav="wallet" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-full overflow-x-hidden lg:overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Reusable Header with dynamic breadcrumbs */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Wallet" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                />

                {/* Main Content Area - Fixed Layout */}
                <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
                    {/* Page Header */}
                    <div className="shrink-0 mb-3">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">Welcome back. Here's a snapshot of your wallet activity.</p>
                    </div>

                    {/* Error Banner */}
                    {apiError && (
                        <div className="shrink-0 mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">!</span>
                                </div>
                                <p className="text-amber-800 dark:text-amber-200 text-sm">{apiError}</p>
                            </div>
                            <button
                                onClick={() => { setApiError(null); fetchWalletData(); fetchPackages(); }}
                                className="px-3 py-1 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Content - Fixed Layout with flex sections */}
                    <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
                        {/* Balance Card - Compact */}
                        <div className="shrink-0 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                            <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wide">Current Balance</span>
                                        <Info className="w-3 h-3 text-slate-400 cursor-help hover:text-teal-500 transition-colors" />
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(balance)}</span>
                                        <span className="text-slate-500 font-medium bg-slate-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[9px]">{currency}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${isActive ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800' : 'bg-red-50 text-red-600 border-red-100'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                                        {promotionalCredits > 0 && (
                                            <p className="text-[9px] text-slate-500 dark:text-gray-400">Includes {formatCurrency(promotionalCredits)} promo credits</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <button
                                        onClick={handleAddMoney}
                                        disabled={isAddingMoney}
                                        className="flex-1 md:flex-none cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white h-9 px-4 text-xs font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAddingMoney ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Plus className="w-3.5 h-3.5" />
                                        )}
                                        {isAddingMoney ? 'Processing...' : 'Add Money'}
                                    </button>
                                    <button className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white h-9 w-9 transition-all shadow-sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Credit Packages Section - Compact */}
                        <div className="shrink-0 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                            <div className="px-4 py-2 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <h3 className="text-slate-900 dark:text-white text-xs font-bold">Buy Credits</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-[9px]">Select a package to add credits</p>
                                </div>
                                <Zap className="w-4 h-4 text-amber-500" />
                            </div>

                            {isLoadingPackages ? (
                                <div className="p-4 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                                </div>
                            ) : packages.length > 0 ? (
                                <div className="p-3">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {packages.map((pkg) => (
                                            <button
                                                key={pkg.id}
                                                onClick={() => setSelectedPackage(pkg.id)}
                                                className={`relative p-3 rounded-lg border-2 transition-all duration-200 text-left group hover:shadow-md ${selectedPackage === pkg.id
                                                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 ring-2 ring-teal-500/10'
                                                    : 'border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
                                                    }`}
                                            >
                                                {/* Popular Badge */}
                                                {pkg.popular && (
                                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                                                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold rounded-full uppercase tracking-wide shadow">
                                                            Popular
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Discount Badge */}
                                                {pkg.discount && pkg.discount > 0 && (
                                                    <div className="absolute -top-1.5 -right-1.5">
                                                        <span className="px-1 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full">
                                                            -{pkg.discount}%
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Credits */}
                                                <div className="mb-1">
                                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{pkg.credits}</span>
                                                    <span className="text-slate-500 dark:text-gray-400 text-[10px] ml-1">credits</span>
                                                </div>

                                                {/* Package Name */}
                                                <p className="text-[10px] font-medium text-slate-600 dark:text-gray-300 mb-1 truncate">
                                                    {pkg.name}
                                                </p>

                                                {/* Price */}
                                                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                                    {formatCurrency(pkg.price, pkg.currency)}
                                                </span>

                                                {/* Selection indicator */}
                                                {selectedPackage === pkg.id && (
                                                    <div className="absolute top-1.5 right-1.5">
                                                        <div className="size-4 bg-teal-500 rounded-full flex items-center justify-center shadow">
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-slate-500 dark:text-gray-400 text-xs">No packages available</p>
                                </div>
                            )}
                        </div>

                        {/* Transaction History - Takes remaining space */}
                        <div className="flex-1 flex flex-col rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden min-h-[150px]">
                            {/* Header */}
                            <div className="px-4 py-2 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between shrink-0">
                                <h3 className="text-slate-900 dark:text-white text-xs font-bold">Transaction History</h3>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-300 transition-all">
                                        <span>Last 30 days</span>
                                        <ChevronDown className="w-2.5 h-2.5" />
                                    </button>
                                    <button className="flex items-center justify-center size-6 rounded border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-300 transition-all">
                                        <Filter className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Transaction List or Empty State */}
                            {isLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="flex-1 overflow-auto">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                    {getTransactionIcon(tx.type)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{tx.description}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${tx.type === 'debit' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                                                </p>
                                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${tx.status === 'completed' ? 'bg-green-50 text-green-600' : tx.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/30 dark:bg-gray-800/50">
                                    <div className="size-16 bg-white dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                        <Receipt className="w-8 h-8 text-slate-300 dark:text-gray-500" />
                                    </div>
                                    <h4 className="text-slate-900 dark:text-white text-base font-bold mb-1">No transactions yet</h4>
                                    <p className="text-slate-500 dark:text-gray-400 text-xs max-w-sm leading-relaxed mb-4">
                                        When you purchase credits or generate images, your transactions will appear here.
                                    </p>
                                    <button className="text-teal-700 dark:text-teal-400 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:border-teal-500 hover:shadow-sm transition-all flex items-center gap-1.5 group">
                                        Learn about billing
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
