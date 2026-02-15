"use client";

import Link from "@/components/Link";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    User,
    Lock,
    Eye,
    EyeOff,
    Bell,
    Loader2,
    CheckCircle,
    AlertCircle,
    LogOut,
    Sun,
    Moon,
    CreditCard,
    Shield,
    Sliders,
    Zap,
    ChevronRight,
    ChevronDown,
    Mail,
    Smartphone,
    CircleHelp,
    ArrowLeft,
    KeyRound,
    X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/auth";
import { useState, useEffect, useRef } from "react";
import { settingsApi, UserProfile } from "@/lib/settings";
import { walletApi } from "@/lib/wallet";
import { helpApi, HelpCategory } from "@/lib/help";
import { Sidebar, Header } from "@/components/layout";
import { PageTransition } from "@/components/animations/PageTransition";
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";

// Inline skeleton removed - handled by TransitionProvider and /components/skeletons/SettingsSkeleton.tsx

export default function SettingsPage() {
    // Theme state
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === 'dark';

    // Router
    const router = useRouter();
    const searchParams = useSearchParams();

    // Tab State - Check URL param first
    const [activeTab, setActiveTab] = useState("profile");

    // Update tab from URL on mount and change
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['profile', 'security', 'billing', 'notifications', 'preferences', 'help'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Data State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const hasFetchedData = useRef(false);

    // Get initial user from local storage for immediate display
    const storedUser = authApi.getCurrentUser();

    // Derived state for display
    const displayName = userProfile?.name || storedUser?.fullName || "User";
    const displayRole = userProfile?.role || "User";
    const displayInitial = displayName.charAt(0).toUpperCase();

    // Profile Form State
    const [fullName, setFullName] = useState(storedUser?.fullName || "");
    const [email, setEmail] = useState(storedUser?.email || "");
    const [phone, setPhone] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Forgot Password Modal State
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [showResetNewPassword, setShowResetNewPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Logout State
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Notification Mock State
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(true);
    const [marketingNotif, setMarketingNotif] = useState(false);

    // --- Effects & Data Fetching ---

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const profileRes = await settingsApi.getProfile();
            if (profileRes.success && profileRes.data) {
                setUserProfile(profileRes.data);
                setEmail(profileRes.data.email);
                setPhone(profileRes.data.phone || "");
            }
        } catch (error) {
            console.warn('Failed to fetch user data:', error);
            // Fallback
            setEmail("alex.designer@saas.ai");
            setPhone("+1 (555) 123-4567");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers ---

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setProfileMessage(null);
        try {
            const response = await settingsApi.editProfile({ full_name: fullName });
            if (response.success) {
                // Update localStorage so name persists after refresh
                authApi.updateCurrentUser({ fullName: fullName });
                setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setProfileMessage({ type: 'error', text: response.error || 'Failed to update profile' });
            }
        } catch (error) {
            setProfileMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setIsSavingProfile(false);
            setTimeout(() => setProfileMessage(null), 3000);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setIsChangingPassword(true);
        setPasswordMessage(null);

        try {
            const response = await settingsApi.editProfile({
                old_password: currentPassword,
                new_password: newPassword,
                confirm_new_password: confirmPassword
            });
            if (response.success) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPasswordMessage({ type: 'error', text: response.error || 'Failed to change password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'Failed to change password.' });
        } finally {
            setIsChangingPassword(false);
            setTimeout(() => setPasswordMessage(null), 5000);
        }
    };

    // Forgot Password Handlers
    const handleSendOtp = async () => {
        if (!forgotEmail.trim()) {
            setForgotPasswordMessage({ type: 'error', text: 'Please enter your email address' });
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(forgotEmail)) {
            setForgotPasswordMessage({ type: 'error', text: 'Please enter a valid email address' });
            return;
        }

        setIsSendingOtp(true);
        setForgotPasswordMessage(null);

        try {
            // TODO: Call actual API endpoint
            // const response = await authApi.sendPasswordResetOtp(forgotEmail);
            console.log('[Forgot Password] Sending OTP to:', forgotEmail);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setForgotPasswordStep('otp');
            setForgotPasswordMessage({ type: 'success', text: 'OTP sent to your email!' });
            setTimeout(() => setForgotPasswordMessage(null), 3000);
        } catch (error) {
            setForgotPasswordMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otp = otpCode.join('');
        if (otp.length !== 6) {
            setForgotPasswordMessage({ type: 'error', text: 'Please enter the complete 6-digit code' });
            return;
        }

        setIsVerifyingOtp(true);
        setForgotPasswordMessage(null);

        try {
            // TODO: Call actual API endpoint
            // const response = await authApi.verifyPasswordResetOtp(forgotEmail, otp);
            console.log('[Forgot Password] Verifying OTP:', otp);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setForgotPasswordStep('reset');
            setForgotPasswordMessage({ type: 'success', text: 'OTP verified successfully!' });
            setTimeout(() => setForgotPasswordMessage(null), 3000);
        } catch (error) {
            setForgotPasswordMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetNewPassword || !resetConfirmPassword) {
            setForgotPasswordMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (resetNewPassword.length < 8) {
            setForgotPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        if (resetNewPassword !== resetConfirmPassword) {
            setForgotPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setIsResettingPassword(true);
        setForgotPasswordMessage(null);

        try {
            // TODO: Call actual API endpoint
            // const response = await authApi.resetPassword(forgotEmail, otpCode.join(''), resetNewPassword);
            console.log('[Forgot Password] Resetting password for:', forgotEmail);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Close modal and redirect to login
            setShowForgotPassword(false);
            resetForgotPasswordState();
            router.push('/login');
        } catch (error) {
            setForgotPasswordMessage({ type: 'error', text: 'Failed to reset password. Please try again.' });
        } finally {
            setIsResettingPassword(false);
        }
    };

    const resetForgotPasswordState = () => {
        setForgotPasswordStep('email');
        setForgotEmail('');
        setOtpCode(['', '', '', '', '', '']);
        setResetNewPassword('');
        setResetConfirmPassword('');
        setForgotPasswordMessage(null);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authApi.logout();
            router.push('/login');
        } catch (error) {
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Dynamic wallet state
    const [freeCredits, setFreeCredits] = useState(0);
    const [balance, setBalance] = useState(0);
    const hasFetchedWallet = useRef(false);

    // Fetch wallet credits on mount (with duplicate prevention)
    useEffect(() => {
        if (hasFetchedWallet.current) return;
        hasFetchedWallet.current = true;

        const fetchWalletCredits = async () => {
            try {
                const response = await walletApi.getUserCredits();
                if (response.success && response.data) {
                    setFreeCredits(response.data.freeCredits);
                    setBalance(response.data.balance);
                }
            } catch (error) {
                console.error('Failed to fetch wallet credits:', error);
            }
        };
        fetchWalletCredits();
    }, []);

    // Help & Support state
    const [helpCategories, setHelpCategories] = useState<HelpCategory[]>([]);
    const [isLoadingHelp, setIsLoadingHelp] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<{ question: string; answer: string } | null>(null);
    const hasFetchedHelp = useRef(false);

    // Fetch help & support data once (with duplicate prevention)
    useEffect(() => {
        if (hasFetchedHelp.current) return;
        hasFetchedHelp.current = true;

        const fetchHelpData = async () => {
            setIsLoadingHelp(true);
            try {
                const response = await helpApi.getHelpSupport();
                if (response.success && response.data) {
                    setHelpCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch help data:', error);
            } finally {
                setIsLoadingHelp(false);
            }
        };
        fetchHelpData();
    }, []);

    // Icon mapping for help categories
    const getIconForCategory = (iconName: string) => {
        switch (iconName) {
            case 'magic_wand':
                return Sparkles;
            case 'user_security':
                return User;
            case 'credit_card':
                return CreditCard;
            default:
                return CircleHelp;
        }
    };

    // Color mapping for active state
    const getColorForCategory = (iconName: string, isOpen: boolean) => {
        if (!isOpen) return 'bg-slate-100 text-slate-500 dark:bg-gray-700 dark:text-gray-400';

        switch (iconName) {
            case 'magic_wand': // Generation -> Purple
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'user_security': // Account -> Emerald/Green
                return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'credit_card': // Billing -> Amber/Orange
                return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            default: // Default -> Teal
                return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User, description: "Manage your personal information" },
        { id: "security", label: "Security", icon: Shield, description: "Password and account security" },
        { id: "billing", label: "Usage & Billing", icon: CreditCard, description: "Credits and plan details" },
        { id: "notifications", label: "Notifications", icon: Bell, description: "Configure your alerts" },
        { id: "preferences", label: "Preferences", icon: Sliders, description: "Theme and app settings" },
        { id: "help", label: "Help & Support", icon: CircleHelp, description: "FAQs and support" },
    ];

    // --- Render Components ---

    const renderProfileTab = () => (
        <div className="space-y-6 max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-2xl">
                        {displayInitial}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{displayName}</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{displayRole}</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 tracking-wider">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-slate-500 dark:text-gray-400 tracking-wider">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 text-sm cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    {profileMessage ? (
                        <div className={`flex items-center gap-2 text-sm ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {profileMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {profileMessage.text}
                        </div>
                    ) : <div></div>}
                    <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSecurityTab = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Change Password</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Ensure your account is using a long, random password to stay secure.</p>

            <div className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Current Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                        >
                            {showCurrentPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                placeholder="Min 8 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                            >
                                {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                            >
                                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
                    {passwordMessage ? (
                        <div className={`flex items-center gap-2 text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {passwordMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {passwordMessage.text}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium hover:underline transition-colors"
                        >
                            Forgot Password?
                        </button>
                    )}
                    <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );

    // Forgot Password Modal Component
    const renderForgotPasswordModal = () => (
        <AnimatePresence mode="wait">
            {showForgotPassword && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                    onClick={() => {
                        setShowForgotPassword(false);
                        resetForgotPasswordState();
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 40, rotateX: -10 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 400,
                            mass: 0.8
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-[0_25px_80px_-12px_rgba(0,0,0,0.4)] dark:shadow-[0_25px_80px_-12px_rgba(0,0,0,0.7)] overflow-hidden border border-slate-200/50 dark:border-gray-700/50"
                    >
                        {/* Modal Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="p-6 border-b border-slate-100 dark:border-gray-700 relative bg-gradient-to-b from-slate-50/50 to-transparent dark:from-gray-800/50"
                        >
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    resetForgotPasswordState();
                                }}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </motion.button>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15, duration: 0.3 }}
                                className="flex items-center gap-4"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.2 }}
                                    className={`p-3 rounded-xl ${forgotPasswordStep === 'email' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' :
                                        forgotPasswordStep === 'otp' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                                            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                    {forgotPasswordStep === 'email' && <Mail className="w-6 h-6" />}
                                    {forgotPasswordStep === 'otp' && <Smartphone className="w-6 h-6" />}
                                    {forgotPasswordStep === 'reset' && <KeyRound className="w-6 h-6" />}
                                </motion.div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {forgotPasswordStep === 'email' && 'Forgot Password'}
                                        {forgotPasswordStep === 'otp' && 'Verify OTP'}
                                        {forgotPasswordStep === 'reset' && 'Reset Password'}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
                                        {forgotPasswordStep === 'email' && 'Enter your email to receive a verification code'}
                                        {forgotPasswordStep === 'otp' && `Enter the 6-digit code sent to ${forgotEmail}`}
                                        {forgotPasswordStep === 'reset' && 'Create a new secure password'}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Progress Steps */}
                            <div className="flex items-center gap-2 mt-6">
                                {['email', 'otp', 'reset'].map((step, index) => (
                                    <div key={step} className="flex items-center flex-1">
                                        <div className={`h-1.5 flex-1 rounded-full transition-colors ${forgotPasswordStep === step ? 'bg-teal-500' :
                                            (forgotPasswordStep === 'otp' && step === 'email') || (forgotPasswordStep === 'reset' && (step === 'email' || step === 'otp'))
                                                ? 'bg-teal-500' : 'bg-slate-200 dark:bg-gray-700'
                                            }`} />
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Message Display */}
                            <AnimatePresence mode="wait">
                                {forgotPasswordMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${forgotPasswordMessage.type === 'success'
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                            }`}
                                    >
                                        {forgotPasswordMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {forgotPasswordMessage.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Step 1: Email Input */}
                            {forgotPasswordStep === 'email' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="email"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                                                placeholder="Enter your registered email"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp}
                                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSendingOtp ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Verification Code'
                                        )}
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 2: OTP Verification */}
                            {forgotPasswordStep === 'otp' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300 text-center block">Enter 6-Digit Code</label>
                                        <div className="flex justify-center gap-2">
                                            {otpCode.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { otpInputRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                                                    autoFocus={index === 0}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 text-center">
                                            Didn't receive the code?{' '}
                                            <button
                                                onClick={handleSendOtp}
                                                disabled={isSendingOtp}
                                                className="text-teal-600 dark:text-teal-400 hover:underline font-medium disabled:opacity-50"
                                            >
                                                Resend
                                            </button>
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setForgotPasswordStep('email')}
                                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-semibold hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={isVerifyingOtp || otpCode.join('').length !== 6}
                                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isVerifyingOtp ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                'Verify Code'
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Reset Password */}
                            {forgotPasswordStep === 'reset' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type={showResetNewPassword ? 'text' : 'password'}
                                                value={resetNewPassword}
                                                onChange={(e) => setResetNewPassword(e.target.value)}
                                                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                                                placeholder="Min 8 characters"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                                            >
                                                {showResetNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type={showResetConfirmPassword ? 'text' : 'password'}
                                                value={resetConfirmPassword}
                                                onChange={(e) => setResetConfirmPassword(e.target.value)}
                                                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50 text-slate-900 dark:text-white text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                                                placeholder="Confirm your new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                                            >
                                                {showResetConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isResettingPassword}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                    >
                                        {isResettingPassword ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="w-4 h-4" />
                                                Reset Password
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const renderBillingTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Balance Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex flex-col items-start justify-between h-full">
                        <div>
                            <p className="text-slate-300 text-sm font-medium mb-1">Total Balance</p>
                            <h3 className="text-3xl font-bold tracking-tight">${balance.toFixed(2)}</h3>
                        </div>
                        <div className="mt-6 w-full">
                            <Link href="/wallet" className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white text-sm font-semibold py-2 rounded-lg border border-white/10">
                                <Wallet className="w-4 h-4" />
                                <span>Wallet</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Credits Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-teal-100 dark:border-teal-900/30 p-6 shadow-sm relative overflow-hidden group hover:border-teal-300 dark:hover:border-teal-700 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 dark:bg-teal-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg text-teal-600 dark:text-teal-400">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Credits</h3>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">{freeCredits}</span>
                                <span className="text-sm text-slate-500 dark:text-gray-400">available</span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">Refreshes monthly based on plan.</p>
                        </div>
                        <Link href="/wallet" className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 rounded-lg transition-all shadow-sm hover:shadow-md">
                            Get More Credits
                        </Link>
                    </div>
                </div>

                {/* Plan Card (Mock) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Plan</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wide">Free</span>
                        </div>
                        <ul className="space-y-3 mb-6">
                            {[
                                "Basic Generation Quality",
                                "Standard Access Speed",
                                "Community Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button className="w-full py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        Upgrade Plan
                    </button>
                </div>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-sm h-full flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Preferences</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-gray-700">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex gap-3">
                            <div className="mt-0.5">
                                <Mail className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Receive updates about your account via email.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-500"></div>
                        </label>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex gap-3">
                            <div className="mt-0.5">
                                <Bell className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Push Notifications</h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Receive real-time alerts on your device.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-500"></div>
                        </label>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex gap-3">
                            <div className="mt-0.5">
                                <Sparkles className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Marketing & Offers</h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Receive updates about new features and promotions.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={marketingNotif} onChange={() => setMarketingNotif(!marketingNotif)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-sm h-full flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    <button className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline">Mark all read</button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
                    {[
                        { title: "Image Generation Complete", desc: "Your 'Futuristic City' batch has finished processing.", time: "2m ago", unread: true },
                        { title: "Welcome to Ephotocart", desc: "Thanks for joining! Start creating amazing visuals.", time: "1h ago", unread: false },
                        { title: "Credits Added", desc: "You received 5 promotional credits.", time: "1d ago", unread: false }
                    ].map((item, i) => (
                        <div key={i} className={`p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors flex gap-3 ${item.unread ? 'bg-slate-50/50 dark:bg-gray-800/80' : ''}`}>
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.unread ? 'bg-teal-500' : 'bg-slate-300 dark:bg-gray-600'}`}></div>
                            <div>
                                <h4 className={`text-sm ${item.unread ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-gray-300'}`}>{item.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.desc}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPreferencesTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Customize your visual experience</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/30 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Theme Mode</span>
                        <div className="flex items-center gap-3">
                            <Sun className={`w-4 h-4 ${!darkMode ? 'text-amber-500' : 'text-slate-400'}`} />
                            <button
                                onClick={toggleTheme}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${darkMode ? 'bg-teal-600' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${darkMode ? 'left-6' : 'left-1'}`} />
                            </button>
                            <Moon className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-slate-400'}`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-5 shadow-sm h-full flex flex-col border-l-4 border-l-red-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Session Management</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Control your login session</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col justify-end">
                    <p className="text-sm text-slate-600 dark:text-gray-400 bg-slate-50 dark:bg-gray-900/50 p-3 rounded-lg border border-slate-100 dark:border-gray-700 italic">
                        "Signing out will return you to the login screen. You will need your credentials to access your account again."
                    </p>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-50"
                    >
                        {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </button>
                </div>
            </div>
        </div>
    );

    // Help & Support State - open category
    const [helpOpen, setHelpOpen] = useState<string | null>(null);

    const toggleHelp = (id: string) => {
        setHelpOpen(helpOpen === id ? null : id);
    };

    // Set first category open when data loads
    // Set first category open when data loads - REMOVED to prevent auto-dropdown
    // useEffect(() => {
    //     if (helpCategories.length > 0 && helpOpen === null) {
    //         setHelpOpen(helpCategories[0].id);
    //     }
    // }, [helpCategories]);

    const renderHelpTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {/* Left Column - FAQ Accordion */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-teal-600 dark:text-teal-400">
                                <CircleHelp className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h3>
                                <p className="text-sm text-slate-500 dark:text-gray-400">Common questions and troubleshooting guides</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 max-h-[300px] overflow-y-auto">
                        {isLoadingHelp ? (
                            // Loading skeleton
                            <div className="space-y-2 p-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                            <div className="h-5 w-40 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : helpCategories.length === 0 ? (
                            // Empty state
                            <div className="p-8 text-center">
                                <CircleHelp className="w-12 h-12 mx-auto text-slate-300 dark:text-gray-600 mb-4" />
                                <p className="text-slate-500 dark:text-gray-400">No help topics available</p>
                            </div>
                        ) : (
                            // Dynamic categories from API
                            <div className="space-y-1">
                                {helpCategories.map((category) => {
                                    const IconComponent = getIconForCategory(category.icon);
                                    const isOpen = helpOpen === category.id;

                                    const iconColorClass = getColorForCategory(category.icon, isOpen);

                                    return (
                                        <div key={category.id} className="rounded-lg overflow-hidden transition-all duration-300">
                                            <button
                                                onClick={() => toggleHelp(category.id)}
                                                className={`w-full flex items-center justify-between p-4 transition-colors ${isOpen ? 'bg-slate-50 dark:bg-gray-700/50' : 'hover:bg-slate-50 dark:hover:bg-gray-700/30'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${iconColorClass}`}>
                                                        <IconComponent className="w-5 h-5" />
                                                    </div>
                                                    <span className={`font-semibold ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-300'}`}>{category.title}</span>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="bg-slate-50/50 dark:bg-gray-700/20"
                                                    >
                                                        <div className="px-4 pb-2">
                                                            {category.items.map((item) => (
                                                                <button
                                                                    key={item.id}
                                                                    onClick={() => setSelectedFaq({ question: item.question, answer: item.answer })}
                                                                    className="w-full text-left p-3 text-sm text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700/50 rounded-lg flex items-center justify-between group transition-colors"
                                                                >
                                                                    <span>{item.question}</span>
                                                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Support & Quick Actions */}
            <div className="flex flex-col mt-6 lg:mt-0">
                <div className="p-[1px] rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-500">
                    <div className="bg-white dark:bg-gray-900 rounded-[15px] overflow-hidden">
                        <div className="p-6 relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 pointer-events-none">
                                <CircleHelp className="w-24 h-24 text-teal-500" />
                            </div>
                            <div className="relative z-10 text-center sm:text-left">
                                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 mx-auto sm:mx-0">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Still need help?</h3>
                                <p className="text-slate-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                                    Our dedicated support team is available 24/7 to assist you with any inquiries regarding platform usage or technical issues.
                                </p>
                                <Link href="/settings/support" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-200 dark:text-slate-900 text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98]">
                                    <Mail className="w-4 h-4" />
                                    Email Support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-slate-100 dark:bg-gray-900 transition-colors duration-300 font-sans">
            <Sidebar activeNav="settings" />

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Settings" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                    disableWalletFetch={true}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <PageTransition className="max-w-5xl w-full space-y-4 pb-10">

                        {/* Page Title & Intro */}
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account <span className="text-teal-500">Settings</span></h1>
                            <p className="text-slate-500 dark:text-gray-400 mt-1 max-w-2xl">
                                Manage your profile details, security preferences, and billing information.
                            </p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="border-b border-slate-200 dark:border-gray-700">
                            <div className="flex items-center gap-1 overflow-x-auto w-full no-scrollbar pb-1">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                relative px-4 py-3 flex items-center gap-2.5 text-sm font-medium transition-all whitespace-nowrap outline-none shrink-0
                                                ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'}
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                                            {tab.label}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabIndicator"
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'profile' && renderProfileTab()}
                                    {activeTab === 'security' && renderSecurityTab()}
                                    {activeTab === 'billing' && renderBillingTab()}
                                    {activeTab === 'notifications' && renderNotificationsTab()}
                                    {activeTab === 'preferences' && renderPreferencesTab()}
                                    {activeTab === 'help' && renderHelpTab()}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </PageTransition>
                </div>
            </main>

            {renderForgotPasswordModal()}

            {/* FAQ Answer Modal */}
            <AnimatePresence>
                {selectedFaq && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedFaq(null)}
                        className="fixed inset-0 bg-black/10 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8">{selectedFaq.question}</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">{selectedFaq.answer}</p>
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900/50">
                                <button
                                    onClick={() => setSelectedFaq(null)}
                                    className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-gray-200 transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
