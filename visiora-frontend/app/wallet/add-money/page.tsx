"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Zap,
    CreditCard,
    Building2,
    CheckCircle,
    Loader2,
    HelpCircle,
    ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar, Header } from '@/components/layout';
import { walletApi } from '@/lib/wallet';
import { authApi } from '@/lib/auth';

type PaymentMethod = 'razorpay' | 'bank_transfer';

export default function AddMoneyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [amount, setAmount] = useState<string>('100');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track if user came from package selection (amount should be fixed)
    const [isPackageSelected, setIsPackageSelected] = useState(false);
    const [packageCredits, setPackageCredits] = useState<number | null>(null);
    const [bonusCredits, setBonusCredits] = useState<number>(0);

    // Wallet data
    const [balance, setBalance] = useState(0);
    const [freeCredits, setFreeCredits] = useState(0);
    const currency = 'INR';

    // Read amount, credits, and bonus from URL params on mount
    useEffect(() => {
        const urlAmount = searchParams.get('amount');
        const urlCredits = searchParams.get('credits');
        const urlBonus = searchParams.get('bonus');
        if (urlAmount && !isNaN(Number(urlAmount))) {
            setAmount(urlAmount);
            setIsPackageSelected(true); // Mark as package selection - amount is locked
            if (urlCredits && !isNaN(Number(urlCredits))) {
                setPackageCredits(Number(urlCredits)); // Use package credits instead of calculated
            }
            if (urlBonus && !isNaN(Number(urlBonus))) {
                setBonusCredits(Number(urlBonus)); // Bonus credits from package
            }
        }
    }, [searchParams]);

    // Conversion rate: ₹10 = 1 Credit
    const CONVERSION_RATE = 10;
    const MIN_AMOUNT = 10;

    // Calculate credits based on amount (fallback when not from package)
    const calculatedCredits = useMemo(() => {
        // If package credits are set, use them
        if (packageCredits !== null) {
            return packageCredits;
        }
        // Otherwise calculate from amount
        const numAmount = parseFloat(amount) || 0;
        return Math.floor(numAmount / CONVERSION_RATE);
    }, [amount, packageCredits]);

    // Validate amount
    const isValidAmount = useMemo(() => {
        const numAmount = parseFloat(amount) || 0;
        return numAmount >= MIN_AMOUNT;
    }, [amount]);

    // Check if amount is entered but invalid (for showing validation message)
    const showAmountError = useMemo(() => {
        const numAmount = parseFloat(amount) || 0;
        return amount.length > 0 && numAmount > 0 && numAmount < MIN_AMOUNT;
    }, [amount]);

    // Track if fetch was initiated to prevent duplicate calls
    const fetchInitiated = useRef(false);

    // Fetch wallet balance on mount
    useEffect(() => {
        if (fetchInitiated.current) return;
        fetchInitiated.current = true;

        const fetchBalance = async () => {
            try {
                // Use getWallet() directly instead of getBalance() to avoid fallback double-call
                const response = await walletApi.getWallet();
                if (response.success && response.data) {
                    setBalance(response.data.balance || 0);
                    setFreeCredits(response.data.freeCredits || 0);
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            }
        };
        fetchBalance();
    }, []);

    // Handle amount input
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            setAmount(value);
            setError(null);
        }
    };

    // Handle payment submission
    const handleCreateOrder = async () => {
        const numAmount = parseFloat(amount) || 0;

        if (numAmount < MIN_AMOUNT) {
            setError(`Minimum amount is ₹${MIN_AMOUNT}`);
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Create order via API
            // Only razorpay is supported as payment method for the API
            const response = await walletApi.addMoney(numAmount, 'razorpay', {
                notes: notes || undefined,
                credits: calculatedCredits,
            });

            // Handle network/wrapper level errors
            if (!response.success) {
                setError(response.error || 'Failed to connect to server');
                setIsProcessing(false);
                return;
            }

            // Handle backend logic errors (success: false in body)
            // walletApi.addMoney returns { success: true, data: response.data } where response.data is the body
            const responseBody = response.data;

            if (!responseBody || !responseBody.success || !responseBody.data) {
                setError(responseBody?.message || 'Failed to create payment order');
                setIsProcessing(false);
                return;
            }

            const orderData = responseBody.data;
            // Map the order ID carefully. 
            // Ideally, Razorpay expects an order ID starting with 'order_'.
            // We'll use razorpayOrderId if available, otherwise fallback to orderId or id.
            const razorpayOrderId = orderData.razorpayOrderId || orderData.orderId || orderData.id;

            if (paymentMethod === 'razorpay') {
                // Load Razorpay script if needed
                if (!window.Razorpay) {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.async = true;
                    await new Promise<void>((resolve, reject) => {
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
                        document.body.appendChild(script);
                    });
                }

                // Get user details
                const user = authApi.getCurrentUser();

                // Open Razorpay checkout
                const razorpayOptions = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
                    amount: orderData.amount ? orderData.amount * 100 : numAmount * 100, // Amount is in paise
                    currency: orderData.currency || currency,
                    name: 'ephotocart',
                    description: `${calculatedCredits} Credits`,
                    order_id: razorpayOrderId, // Pass the ID received from backend
                    handler: async function (razorpayResponse: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                        try {
                            const verifyResult = await walletApi.verifyPayment({
                                orderId: razorpayResponse.razorpay_order_id,
                                paymentId: razorpayResponse.razorpay_payment_id,
                                signature: razorpayResponse.razorpay_signature,
                                method: 'razorpay',
                            });

                            if (verifyResult.success) {
                                // Sync wallet updated event
                                window.dispatchEvent(new Event('wallet-updated'));
                                // Redirect to wallet with success
                                router.push('/wallet?payment=success');
                            } else {
                                setError('Payment verification failed. Please contact support.');
                            }
                        } catch (verifyError) {
                            console.error('Payment verification error:', verifyError);
                            setError('Payment completed but verification failed.');
                        }
                        setIsProcessing(false);
                    },
                    prefill: {
                        name: user?.fullName || '',
                        email: user?.email || '',
                        contact: '',
                    },
                    theme: {
                        color: '#14b8a6',
                    },
                    modal: {
                        ondismiss: function () {
                            setIsProcessing(false);
                        },
                        escape: true,
                        animation: true,
                    },
                };

                const razorpay = new window.Razorpay(razorpayOptions);
                razorpay.on('payment.failed', function (response: any) {
                    console.error('Razorpay payment failed:', response.error);
                    setError(response.error?.description || 'Payment failed. Please try again.');
                    setIsProcessing(false);
                });
                razorpay.open();
            } else {
                // Bank Transfer flow - Show instructions or redirect
                router.push('/wallet?payment=pending&method=bank_transfer');
            }
        } catch (error) {
            console.error('Failed to create order:', error);
            setError('An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar activeNav="wallet" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-x-hidden lg:overflow-hidden bg-slate-50 dark:bg-gray-900">
                {/* Header */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Wallet", href: "/wallet" },
                        { label: "Add Money" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                    disableWalletFetch={true}
                />

                {/* Content Area - Fixed Layout */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-full flex flex-col"
                    >
                        {/* Page Header */}
                        <div className="flex items-center justify-between mb-6 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/wallet?ref=add_money"
                                    className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add Money Order</h1>
                            </div>
                            <Link
                                href="/settings?tab=help"
                                className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span>Help & Support</span>
                            </Link>
                        </div>

                        {/* Main Card - Two Column Layout */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden max-w-5xl mx-auto w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-2">

                                {/* LEFT COLUMN */}
                                <div className="p-6 lg:border-r border-slate-100 dark:border-gray-700 flex flex-col">

                                    {/* Enter Amount Section */}
                                    <div className="mb-6">
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Enter Amount</h2>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Amount</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    placeholder="100"
                                                    readOnly={isPackageSelected}
                                                    disabled={isPackageSelected}
                                                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-2xl font-bold outline-none transition-all placeholder:text-slate-300 ${showAmountError || error
                                                        ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                        : isPackageSelected
                                                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 cursor-not-allowed'
                                                            : 'border-slate-200 dark:border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                                                        }`}
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 font-semibold text-xl">
                                                    ₹
                                                </div>
                                            </div>

                                            {/* Validation Message */}
                                            {showAmountError ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-1.5 text-red-500 dark:text-red-400"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-xs font-medium">Minimum deposit amount is ₹{MIN_AMOUNT}</span>
                                                </motion.div>
                                            ) : (
                                                <p className="text-xs text-slate-400 dark:text-gray-500">Minimum deposit amount is ₹{MIN_AMOUNT}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Conversion Rate / Package Credits Card */}
                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-xl border border-teal-100 dark:border-teal-800/30 mb-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Zap className="w-16 h-16 text-teal-500 transform rotate-12" />
                                        </div>
                                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20 relative z-10">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 relative z-10">
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                                {isPackageSelected ? 'Package Credits' : 'Conversion Rate'}
                                            </p>
                                            {isPackageSelected && bonusCredits > 0 ? (
                                                <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                                                    {(packageCredits || 0) - bonusCredits} <span className="text-slate-500">Credits</span> <span className="text-emerald-500 font-bold">+ {bonusCredits} Bonus</span>
                                                </p>
                                            ) : (
                                                <p className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                                                    {isPackageSelected ? `${calculatedCredits} Credits` : `₹ ${CONVERSION_RATE} = 1 Credit`}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right relative z-10">
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">You Will Get</p>
                                            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                                {calculatedCredits} <span className="text-sm font-medium">Credits</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Info Message */}
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 mt-auto">
                                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                            <span className="text-white text-xs font-bold">i</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                                            Credits are added to your wallet instantly upon successful payment. Please ensure your internet connection is stable.
                                        </p>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="p-6 flex flex-col bg-slate-50/30 dark:bg-gray-800/50">

                                    {/* Payment Gateway Selection */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Payment Gateway</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Razorpay Option */}
                                            <motion.button
                                                onClick={() => setPaymentMethod('razorpay')}
                                                whileTap={{ scale: 0.98 }}
                                                animate={paymentMethod === 'razorpay' ? { scale: 1.02, y: -2 } : { scale: 1, y: 0 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'razorpay'
                                                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 shadow-lg shadow-teal-500/10'
                                                    : 'border-slate-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800 bg-white dark:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        animate={paymentMethod === 'razorpay'
                                                            ? { backgroundColor: '#14b8a6', scale: 1.05 }
                                                            : { backgroundColor: '#f1f5f9', scale: 1 }
                                                        }
                                                        transition={{ duration: 0.2 }}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'razorpay'
                                                            ? 'text-white shadow-md shadow-teal-500/30'
                                                            : 'text-slate-500 dark:text-gray-400 dark:bg-gray-700'
                                                            }`}
                                                    >
                                                        <CreditCard className="w-5 h-5" />
                                                    </motion.div>
                                                    <div className="text-left">
                                                        <p className="font-semibold text-slate-900 dark:text-white">Razorpay</p>
                                                        <p className="text-xs text-slate-500 dark:text-gray-400">Cards, UPI, Netbanking & More</p>
                                                    </div>
                                                </div>
                                                <motion.div
                                                    animate={paymentMethod === 'razorpay'
                                                        ? { scale: 1, borderColor: '#14b8a6', backgroundColor: '#14b8a6' }
                                                        : { scale: 1, borderColor: '#cbd5e1', backgroundColor: 'transparent' }
                                                    }
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                                >
                                                    {paymentMethod === 'razorpay' && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            </motion.button>

                                            {/* Bank Transfer Option */}
                                            <motion.button
                                                onClick={() => setPaymentMethod('bank_transfer')}
                                                whileTap={{ scale: 0.98 }}
                                                animate={paymentMethod === 'bank_transfer' ? { scale: 1.02, y: -2 } : { scale: 1, y: 0 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${paymentMethod === 'bank_transfer'
                                                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/10 shadow-lg shadow-teal-500/10'
                                                    : 'border-slate-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800 bg-white dark:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        animate={paymentMethod === 'bank_transfer'
                                                            ? { backgroundColor: '#14b8a6', scale: 1.05 }
                                                            : { backgroundColor: '#f1f5f9', scale: 1 }
                                                        }
                                                        transition={{ duration: 0.2 }}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'bank_transfer'
                                                            ? 'text-white shadow-md shadow-teal-500/30'
                                                            : 'text-slate-500 dark:text-gray-400 dark:bg-gray-700'
                                                            }`}
                                                    >
                                                        <Building2 className="w-5 h-5" />
                                                    </motion.div>
                                                    <div className="text-left">
                                                        <p className="font-semibold text-slate-900 dark:text-white">Bank Transfer</p>
                                                        <p className="text-xs text-slate-500 dark:text-gray-400">Manual Verification Required</p>
                                                    </div>
                                                </div>
                                                <motion.div
                                                    animate={paymentMethod === 'bank_transfer'
                                                        ? { scale: 1, borderColor: '#14b8a6', backgroundColor: '#14b8a6' }
                                                        : { scale: 1, borderColor: '#cbd5e1', backgroundColor: 'transparent' }
                                                    }
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                                >
                                                    {paymentMethod === 'bank_transfer' && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Payment Notes */}
                                    <div className="mb-6">
                                        <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                                            Payment Notes (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Enter details about this transaction..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-slate-900 dark:text-white text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 placeholder:text-slate-400 resize-none shadow-sm"
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-400 text-sm"
                                        >
                                            <span>⚠️</span>
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="mt-auto">
                                        <button
                                            onClick={handleCreateOrder}
                                            disabled={isProcessing || !isValidAmount}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-base rounded-xl shadow-lg shadow-teal-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-5 h-5" />
                                                    <span>Create Payment Order</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
