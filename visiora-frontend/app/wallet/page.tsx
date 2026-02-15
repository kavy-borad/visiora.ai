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
    Check,
    Calendar,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { walletApi, WalletBalance, Transaction, TransactionFilters, Package, WalletStats } from "@/lib/wallet";
import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";
import { PageTransition } from "@/components/animations/PageTransition";

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
    const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit' | 'refund' | 'bonus'>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'top_up' | 'image_generation' | 'subscription' | 'refund' | 'bonus' | 'referral' | 'adjustment'>('all');
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    // Transaction Details State
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loadingTransactionId, setLoadingTransactionId] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [totalTransactions, setTotalTransactions] = useState(0);

    // Custom Dropdown State
    const [activeDropdown, setActiveDropdown] = useState<'days' | 'type' | 'category' | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter Options
    const daysOptions = [
        { value: '30', label: 'Last 30 Days' },
        { value: '60', label: 'Last 60 Days' },
        { value: '90', label: 'Last 90 Days' },
        { value: 'all', label: 'Lifetime History' }
    ];

    const typeOptions = [
        { value: 'all', label: 'All Transaction Types' },
        { value: 'credit', label: 'Credits Added (+)' },
        { value: 'debit', label: 'Credits Used (-)' },
        { value: 'refund', label: 'Refunds' },
        { value: 'bonus', label: 'Bonus Rewards' }
    ];

    const categoryOptions = [
        { value: 'all', label: 'All Categories' },
        { value: 'top_up', label: 'Wallet Top-up' },
        { value: 'image_generation', label: 'Image Generation' },
        { value: 'subscription', label: 'Subscription Plan' },
        { value: 'refund', label: 'Refund Processed' },
        { value: 'bonus', label: 'Bonus Credits' },
        { value: 'referral', label: 'Referral Reward' },
        { value: 'adjustment', label: 'Admin Adjustment' }
    ];

    const handleViewTransaction = async (id: string) => {
        setLoadingTransactionId(id);
        try {
            const response = await walletApi.getTransaction(id);
            if (response.success && response.data) {
                setSelectedTransaction(response.data);
                setShowDetailsModal(true);
            } else {
                // If fetching specific details fails, try to find in current list or show error
                const inList = transactions.find(t => t.id === id);
                if (inList) {
                    setSelectedTransaction(inList);
                    setShowDetailsModal(true);
                } else {
                    console.error("Failed to load transaction details:", response.error);
                }
            }
        } catch (error) {
            console.error("Error fetching transaction:", error);
        } finally {
            setLoadingTransactionId(null);
        }
    };

    const [apiError, setApiError] = useState<string | null>(null);

    // Track if fetch was initiated (not completed) to prevent duplicate calls
    const fetchInitiated = useRef(false);

    // Fetch wallet data on mount
    useEffect(() => {
        // If fetch already initiated, skip
        if (fetchInitiated.current) return;
        fetchInitiated.current = true;

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

    // Fetch transactions when any filter changes (but not on initial mount - that's handled above)
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return; // Skip first run - initial transactions are fetched in fetchWalletData
        }
        // When filters change, reset to page 1
        setCurrentPage(1);
        fetchTransactions(1);
    }, [selectedFilter, typeFilter, categoryFilter]);

    // Fetch when page changes
    useEffect(() => {
        // Trigger fetch only when page changes (and it's not the initial mount/filter reset which implies page 1)
        if (!isInitialMount.current) {
            fetchTransactions(currentPage);
        }
    }, [currentPage]);

    const fetchWalletData = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            // Determine filters based on state
            const days = selectedFilter === 'all' ? undefined : parseInt(selectedFilter);
            const type = typeFilter === 'all' ? undefined : typeFilter;
            const category = categoryFilter === 'all' ? undefined : categoryFilter;

            const [walletRes, statsRes, transactionsRes] = await Promise.all([
                walletApi.getWallet(),      // GET /api/wallet - contains balance data
                walletApi.getStats(),       // GET /api/wallet/stats
                walletApi.getTransactions(1, 20, {
                    days,
                    type,
                    category,
                    sortBy: 'created_at',
                    sortOrder: 'DESC'
                }),
            ]);

            // Check for rate limit errors in any response
            const responses = [walletRes, statsRes, transactionsRes];
            const rateLimitError = responses.find(r =>
                r.error?.toLowerCase().includes('too many requests') ||
                r.error?.toLowerCase().includes('rate limit')
            );

            if (rateLimitError) {
                setApiError('Too many requests. Please wait a moment and try again.');
                return;
            }

            // Use wallet data for balance (getWallet already includes balance)
            if (walletRes.success && walletRes.data) {
                setWalletBalance(walletRes.data);
            }

            // Set wallet stats
            if (statsRes.success && statsRes.data) {
                setWalletStats(statsRes.data);
            }

            if (transactionsRes.success && transactionsRes.data) {
                const txData = transactionsRes.data;
                // The API layer now returns { transactions: [...], total, page, limit, hasMore }
                if (txData.transactions && Array.isArray(txData.transactions)) {
                    console.log('[WalletPage] Setting transactions:', txData.transactions.length);
                    setTransactions(txData.transactions);

                    // Set pagination data
                    const total = txData.total || txData.transactions.length;
                    setTotalTransactions(total);
                    setTotalPages(Math.ceil(total / 20)); // Assuming limit 20
                } else if (Array.isArray(txData)) {
                    setTransactions(txData as Transaction[]);
                    setTotalTransactions(txData.length);
                    setTotalPages(1);
                } else {
                    console.warn('[WalletPage] Unexpected transactions format:', txData);
                    setTransactions([]);
                    setTotalTransactions(0);
                    setTotalPages(0);
                }
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

    const fetchTransactions = async (pageVal: number = currentPage) => {
        try {
            setIsLoading(true);
            // Build filters from state
            const days = selectedFilter === 'all' ? undefined : parseInt(selectedFilter);
            const type = typeFilter === 'all' ? undefined : typeFilter;
            const category = categoryFilter === 'all' ? undefined : categoryFilter;

            console.log('[WalletPage] Fetching transactions:', { page: pageVal, days, type, category });

            const response = await walletApi.getTransactions(pageVal, 20, {
                days,
                type,
                category,
                sortBy: 'created_at',
                sortOrder: 'DESC'
            });

            if (response.success && response.data) {
                const txData = response.data;
                // The API layer now returns { transactions: [...], total, page, limit, hasMore }
                if (txData.transactions && Array.isArray(txData.transactions)) {
                    console.log('[WalletPage] Transactions loaded:', txData.transactions.length);
                    setTransactions(txData.transactions);

                    // Update pagination
                    const total = txData.total || txData.transactions.length;
                    setTotalTransactions(total);
                    setTotalPages(Math.ceil(total / 20));
                } else if (Array.isArray(txData)) {
                    setTransactions(txData as Transaction[]);
                    setTotalTransactions(txData.length);
                    setTotalPages(1);
                } else {
                    setTransactions([]);
                    setTotalTransactions(0);
                    setTotalPages(0);
                }
            }
        } catch (error) {
            console.warn('Failed to fetch transactions:', error);
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPackages = async () => {
        setIsLoadingPackages(true);
        try {
            // First, load from cache if available (instant load)
            const cached = localStorage.getItem('wallet_packages');
            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    if (Array.isArray(cachedData) && cachedData.length > 0) {
                        console.log('📦 Loading packages from cache:', cachedData.length);
                        setPackages(cachedData);
                        // Auto-select popular package or first one
                        const popularPkg = cachedData.find((p: any) => p.isPopular);
                        if (popularPkg) {
                            setSelectedPackage(popularPkg.id);
                        } else {
                            setSelectedPackage(cachedData[0].id);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse cached packages:', e);
                }
            }

            // Then fetch fresh data from API
            const response = await walletApi.getPackages();
            console.log('=== PACKAGES API RESPONSE ===', response);

            // Handle different response formats: array directly or object with packages array
            let packagesData: any[] = [];

            if (response.success && response.data) {
                const data = response.data as any;
                console.log('Packages data type:', typeof data, Array.isArray(data) ? 'isArray' : 'notArray');
                console.log('Packages data:', data);

                if (Array.isArray(data)) {
                    packagesData = data;
                } else if (data.packages && Array.isArray(data.packages)) {
                    packagesData = data.packages;
                } else if (data.data && Array.isArray(data.data)) {
                    // Handle nested data.data structure
                    packagesData = data.data;
                } else if (typeof data === 'object') {
                    // If it's an object, try to convert to array or ignore
                    console.warn('Packages API returned object instead of array:', data);
                }
            }

            console.log('Final packagesData:', packagesData, 'length:', packagesData.length);

            if (packagesData.length > 0) {
                setPackages(packagesData);
                // Cache packages in localStorage for next time
                localStorage.setItem('wallet_packages', JSON.stringify(packagesData));
                console.log('✅ Packages cached for future loads');

                // Auto-select popular package or first one
                const popularPkg = packagesData.find((p: any) => p.isPopular);
                if (popularPkg) {
                    setSelectedPackage(popularPkg.id);
                } else {
                    setSelectedPackage(packagesData[0].id);
                }
            } else {
                console.warn('No packages found in response - keeping existing packages');
                // Don't clear packages if we already have some
                // setPackages([]); // REMOVED - keep existing data
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            // Don't clear packages on error - keep existing data
            // setPackages([]); // REMOVED - keep existing data
        } finally {
            setIsLoadingPackages(false);
        }
    };

    const handleAddMoney = async () => {
        // Get amount from selected package or use default
        const selectedPkg = packages.find(p => p.id === selectedPackage);
        const amount = selectedPkg?.amount || 100; // Default to 100 if no package selected

        setIsAddingMoney(true);
        try {
            // Step 1: Call add-money API to create Razorpay order
            const response = await walletApi.addMoney(amount, 'razorpay', {
                packageId: selectedPackage || undefined,
                credits: selectedPkg?.totalCredits || 0,
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
                name: 'ephotocart',
                description: selectedPkg ? `${selectedPkg.totalCredits} Credits - ${selectedPkg.name}` : 'Add Money to Wallet',
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
                            // Sync Header
                            window.dispatchEvent(new Event('wallet-updated'));
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
                    color: '#14b8a6', // Teal color matching ephotocart theme
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
    const freeCredits = walletBalance?.freeCredits ?? 0;
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
            case 'bonus':  // Changed from 'promotional' to match backend API
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

    const renderPackagesList = () => (
        <div className="flex flex-col gap-3">
            {isLoadingPackages ? (
                <div className="p-8 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
                    <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                </div>
            ) : packages.length > 0 ? (
                packages.map((pkg) => (
                    <Link
                        key={pkg.id}
                        href={`/wallet/add-money?amount=${pkg.amount}&credits=${pkg.totalCredits}&bonus=${pkg.bonusCredits || 0}`}
                        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-5 border-2 text-left transition-all hover:-translate-y-1 hover:shadow-lg group ${selectedPackage === pkg.id
                            ? 'border-teal-500 shadow-md ring-2 ring-teal-500/10'
                            : 'border-white dark:border-gray-800 shadow-sm hover:border-teal-100 dark:hover:border-teal-200'
                            }`}
                    >
                        {pkg.isPopular && (
                            <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-teal-500 to-teal-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                                Popular
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{pkg.totalCredits}</span>
                                    <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Credits</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{pkg.name}</p>
                            </div>
                            <span className="text-lg font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-lg group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                {formatCurrency(pkg.amount, pkg.currency)}
                            </span>
                        </div>

                        {pkg.bonusCredits > 0 && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md inline-flex">
                                <Plus className="w-3 h-3" />
                                {pkg.bonusCredits} Bonus Credits
                            </div>
                        )}
                    </Link>
                ))
            ) : (
                <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
                    <p className="text-slate-500 text-sm">No packages available</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
            {/* Reusable Sidebar */}
            <Sidebar activeNav="wallet" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
                {/* Reusable Header with dynamic breadcrumbs */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Wallet" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                    disableWalletFetch={true}
                />

                {/* Main Content Area - Scrollable on mobile */}
                <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6">
                    <PageTransition className="flex flex-col min-h-full">
                        {/* Page Header */}
                        <div className="shrink-0 mb-3">
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Wallet <span className="text-teal-500">Overview</span></h1>
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
                        {/* Main Split Layout */}
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 lg:overflow-hidden overflow-visible scroll-smooth h-auto lg:h-full">

                            {/* LEFT COLUMN - Balance & Transactions */}
                            <div className="w-full flex flex-col gap-5 min-h-0 lg:overflow-hidden overflow-visible lg:flex-1 h-auto lg:h-full">

                                {/* Balance Card */}
                                <div className="shrink-0 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden p-6 transition-all hover:shadow-md">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="space-y-1 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Current Balance</span>
                                                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help hover:text-teal-500 transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{formatCurrency(balance)}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-[10px] font-bold">{currency}</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                            <Link
                                                href="/wallet/add-money"
                                                className="relative flex-1 md:flex-none cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-white h-10 px-6 text-sm font-bold shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/40 transition-all duration-300 active:scale-[0.98] overflow-hidden group border border-emerald-300/20"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    <Plus className="w-4 h-4 stroke-[2.5]" />
                                                    Add Money
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                            </Link>
                                            <button className="cursor-pointer inline-flex items-center justify-center rounded-2xl border border-slate-200 dark:border-gray-700 bg-transparent hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 h-10 w-10 transition-all hover:border-slate-300 dark:hover:border-gray-600">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Packages Section (Injected between Balance and History) */}
                                <div className="lg:hidden flex flex-col gap-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <h3 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">Buy Credits</h3>
                                    </div>
                                    {renderPackagesList()}
                                </div>

                                {/* Transaction History Card */}
                                <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm lg:overflow-hidden overflow-visible min-h-[300px] lg:flex-1 h-auto lg:h-full">
                                    {/* Header with Filters */}
                                    <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-700 shrink-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-500">
                                                    <Receipt className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-slate-900 dark:text-white text-base font-bold">Transaction History</h3>
                                            </div>
                                        </div>
                                        {/* Filter Row */}
                                        <div className="flex flex-wrap items-center gap-3" ref={dropdownRef}>
                                            {/* Days Filter Dropdown */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === 'days' ? null : 'days')}
                                                    className={`pl-9 pr-10 py-2.5 rounded-xl border text-xs font-semibold flex items-center shadow-sm transition-all
                                                    ${activeDropdown === 'days'
                                                            ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-teal-700 dark:text-teal-400'
                                                            : 'bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                                >
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <Calendar className={`w-3.5 h-3.5 transition-colors ${activeDropdown === 'days' ? 'text-teal-500' : 'text-slate-500 dark:text-gray-400'}`} />
                                                    </div>
                                                    <span className="truncate max-w-[120px]">
                                                        {daysOptions.find(o => o.value === selectedFilter)?.label}
                                                    </span>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'days' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                                    </div>
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdown === 'days' && (
                                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-teal-100 dark:border-teal-900/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                        <div className="p-1.5 flex flex-col gap-0.5">
                                                            {daysOptions.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => {
                                                                        setSelectedFilter(option.value as any);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between
                                                                    ${selectedFilter === option.value
                                                                            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                                                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                        }`}
                                                                >
                                                                    {option.label}
                                                                    {selectedFilter === option.value && <Check className="w-3 h-3 text-teal-500" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Type Filter Dropdown */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                                                    className={`pl-9 pr-10 py-2.5 rounded-xl border text-xs font-semibold flex items-center shadow-sm transition-all
                                                    ${activeDropdown === 'type'
                                                            ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-teal-700 dark:text-teal-400'
                                                            : 'bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                                >
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <CreditCard className={`w-3.5 h-3.5 transition-colors ${activeDropdown === 'type' ? 'text-teal-500' : 'text-slate-500 dark:text-gray-400'}`} />
                                                    </div>
                                                    <span className="truncate max-w-[140px]">
                                                        {typeOptions.find(o => o.value === typeFilter)?.label}
                                                    </span>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'type' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                                    </div>
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdown === 'type' && (
                                                    <div className="absolute top-full left-0 mt-2 w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-teal-100 dark:border-teal-900/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                        <div className="p-1.5 flex flex-col gap-0.5">
                                                            {typeOptions.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => {
                                                                        setTypeFilter(option.value as any);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between
                                                                    ${typeFilter === option.value
                                                                            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                                                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                        }`}
                                                                >
                                                                    {option.label}
                                                                    {typeFilter === option.value && <Check className="w-3 h-3 text-teal-500" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Category Filter Dropdown */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                                                    className={`pl-9 pr-10 py-2.5 rounded-xl border text-xs font-semibold flex items-center shadow-sm transition-all
                                                    ${activeDropdown === 'category'
                                                            ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-teal-700 dark:text-teal-400'
                                                            : 'bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                                >
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <Filter className={`w-3.5 h-3.5 transition-colors ${activeDropdown === 'category' ? 'text-teal-500' : 'text-slate-500 dark:text-gray-400'}`} />
                                                    </div>
                                                    <span className="truncate max-w-[140px]">
                                                        {categoryOptions.find(o => o.value === categoryFilter)?.label}
                                                    </span>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                                    </div>
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdown === 'category' && (
                                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-teal-100 dark:border-teal-900/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                        <div className="p-1.5 flex flex-col gap-0.5">
                                                            {categoryOptions.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => {
                                                                        setCategoryFilter(option.value as any);
                                                                        setActiveDropdown(null);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between
                                                                    ${categoryFilter === option.value
                                                                            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                                                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                        }`}
                                                                >
                                                                    {option.label}
                                                                    {categoryFilter === option.value && <Check className="w-3 h-3 text-teal-500" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* List */}
                                    {isLoading ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6">
                                            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                        </div>
                                    ) : transactions.length > 0 ? (
                                        <div className="lg:flex-1 lg:overflow-y-auto h-auto">
                                            {transactions.map((tx) => (
                                                <div
                                                    key={tx.id}
                                                    onClick={() => handleViewTransaction(tx.id)}
                                                    className="group cursor-pointer flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-gray-700/50 hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-all last:border-0"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {getTransactionIcon(tx.type)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description}</p>
                                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-base font-bold ${tx.type === 'debit' ? 'text-slate-900 dark:text-white' : 'text-green-600'}`}>
                                                            {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                                                        </p>
                                                        <span className={`inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${tx.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                                            }`}>
                                                            {tx.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                                            <div className="size-20 bg-slate-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                                <Receipt className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                                            </div>
                                            <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-1">No transactions yet</h4>
                                            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                                Your purchase history and credit usage will appear here.
                                            </p>
                                        </div>
                                    )}

                                    {/* Pagination Controls */}
                                    {transactions.length > 0 && totalPages > 1 && (
                                        <div className="px-6 py-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50/30 dark:bg-gray-800/30 flex items-center justify-between">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                                                Page <span className="text-slate-900 dark:text-white">{currentPage}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1 || isLoading}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages || isLoading}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-200 dark:hover:border-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN - Fixed Sidebar (Desktop Only) */}
                            <div className="hidden lg:flex w-full lg:w-[320px] 2xl:w-[360px] shrink-0 flex-col gap-4 overflow-y-auto pb-4 h-full">
                                <div className="flex items-center gap-2 px-1">
                                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <h3 className="text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">Buy Credits</h3>
                                </div>

                                {renderPackagesList()}
                            </div>
                        </div>
                    </PageTransition>
                </div>

                {/* Transaction Details Modal */}
                {
                    showDetailsModal && selectedTransaction && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>
                            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Transaction Details</h3>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5">
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="size-14 bg-slate-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-3">
                                            {getTransactionIcon(selectedTransaction?.type || 'card')}
                                        </div>
                                        <h2 className={`text-2xl font-bold ${selectedTransaction?.type === 'debit' ? 'text-slate-900 dark:text-white' : 'text-green-600 dark:text-green-400'}`}>
                                            {selectedTransaction?.type === 'debit' ? '-' : '+'}{formatCurrency(selectedTransaction?.amount || 0, selectedTransaction?.currency)}
                                        </h2>
                                        <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">{selectedTransaction?.description}</p>
                                        <div className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedTransaction?.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : selectedTransaction?.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {selectedTransaction?.status?.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-slate-50 dark:bg-gray-700/30 rounded-xl p-4 border border-slate-100 dark:border-gray-700/50">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 dark:text-gray-400">Date</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{selectedTransaction?.createdAt ? new Date(selectedTransaction.createdAt).toLocaleString() : '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 dark:text-gray-400">Transaction ID</span>
                                            <span className="font-mono font-medium text-slate-700 dark:text-gray-300 text-xs">{selectedTransaction?.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 dark:text-gray-400">Type</span>
                                            <span className="capitalize font-semibold text-slate-900 dark:text-white">{selectedTransaction?.type}</span>
                                        </div>
                                        {selectedTransaction?.metadata?.paymentMethod && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 dark:text-gray-400">Gateway</span>
                                                <span className="capitalize font-semibold text-slate-900 dark:text-white">{selectedTransaction.metadata.paymentMethod}</span>
                                            </div>
                                        )}
                                        {/* Order ID - from metadata */}
                                        {selectedTransaction?.metadata?.orderId && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 dark:text-gray-400">Order ID</span>
                                                <span className="font-mono text-slate-700 dark:text-gray-300 text-xs">{selectedTransaction.metadata.orderId}</span>
                                            </div>
                                        )}
                                        {/* Generation ID - from metadata */}
                                        {selectedTransaction?.metadata?.generationId && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 dark:text-gray-400">Generation ID</span>
                                                <span className="font-mono text-slate-700 dark:text-gray-300 text-xs truncate max-w-[180px]" title={selectedTransaction.metadata.generationId}>
                                                    {selectedTransaction.metadata.generationId}
                                                </span>
                                            </div>
                                        )}
                                        {/* Promo Code - from metadata */}
                                        {selectedTransaction?.metadata?.promoCode && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 dark:text-gray-400">Promo Code</span>
                                                <span className="font-mono text-teal-600 dark:text-teal-400 text-xs font-bold bg-teal-50 dark:bg-teal-900/20 px-1.5 py-0.5 rounded">
                                                    {selectedTransaction.metadata.promoCode}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 flex gap-3">
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="flex-1 py-2.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                                    >
                                        Close
                                    </button>
                                    <button className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm shadow-teal-500/20">
                                        Download Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}
