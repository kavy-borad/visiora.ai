"use client";

import Link from "@/components/Link";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    ChevronDown,
    ChevronRight,
    Zap,
    User,
    Lock,
    Eye,
    EyeOff,
    Bell,
    Menu,
    Loader2,
    CheckCircle,
    AlertCircle,
    LogOut,
    Sun,
    Moon,
    Monitor,
} from "lucide-react";
import { useRouter } from "@/components/useRouter";
import { authApi } from "@/lib/auth";
import { useState, useEffect } from "react";
import { settingsApi, UserProfile, UserCredits } from "@/lib/settings";
import { Sidebar, Header } from "@/components/layout";
import { useTheme } from "@/lib/theme";

export default function SettingsPage() {
    // Theme state from context
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === 'dark';

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // API state
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Profile form state
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Logout state
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Dropdown states
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    // Notification preferences
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    // Fetch user data on mount
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const [profileRes, creditsRes] = await Promise.all([
                settingsApi.getProfile(),
                settingsApi.getUserCredits(),
            ]);

            if (profileRes.success && profileRes.data) {
                setUserProfile(profileRes.data);
                setEmail(profileRes.data.email);
                setPhone(profileRes.data.phone || "");
            }

            if (creditsRes.success && creditsRes.data) {
                setUserCredits(creditsRes.data);
            }
        } catch (error) {
            console.warn('Failed to fetch user data:', error);
            // Set fallback values
            setEmail("alex.designer@saas.ai");
            setPhone("+1 (555) 123-4567");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setProfileMessage(null);

        try {
            const response = await settingsApi.updateProfile({ email, phone });
            if (response.success && response.data) {
                setUserProfile(response.data);
                setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setProfileMessage({ type: 'error', text: response.error || 'Failed to update profile' });
            }
        } catch (error) {
            setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSavingProfile(false);
            // Clear message after 3 seconds
            setTimeout(() => setProfileMessage(null), 3000);
        }
    };

    const handleChangePassword = async () => {
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Please fill in all password fields' });
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
            const response = await settingsApi.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (response.success) {
                setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
                // Clear form
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPasswordMessage({ type: 'error', text: response.error || 'Failed to change password' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
        } finally {
            setIsChangingPassword(false);
            // Clear message after 5 seconds
            setTimeout(() => setPasswordMessage(null), 5000);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authApi.logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if API fails, clear local data and redirect
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Derived values with fallbacks - check localStorage for user data
    const freeCredits = userCredits?.freeCredits ?? 1;
    const balance = userCredits?.balance ?? 12.00;

    // Get user from localStorage if not from API
    const storedUser = authApi.getCurrentUser();
    const userName = userProfile?.name || storedUser?.fullName || "Jane Doe";
    const userInitial = userName.charAt(0).toUpperCase();
    const userRole = userProfile?.role || "admin";

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate" },
        { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
        { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
        { id: "settings", label: "Settings", icon: Settings, href: "/settings", active: true },
    ];

    return (
        <div className="min-h-screen flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Reusable Sidebar */}
            <Sidebar activeNav="settings" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-full overflow-x-hidden lg:overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Reusable Header with dynamic breadcrumbs */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Settings" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                />

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-gray-900 p-4 sm:p-5 flex flex-col">
                    {/* Page Header */}
                    <div className="shrink-0 mb-4">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5">Manage your account information and security</p>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
                        {/* Profile & Password & Credits Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Profile Settings Card */}
                            <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden h-full hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-default">
                                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-gray-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-teal-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Settings</h3>
                                </div>
                                <div className="p-4 flex flex-col gap-3">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Email Address</span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 h-9 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Mobile Number</span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 h-9 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                        />
                                    </label>
                                    {profileMessage && (
                                        <div className={`flex items-center gap-2 text-xs ${profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {profileMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {profileMessage.text}
                                        </div>
                                    )}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-1.5"
                                        >
                                            {isSavingProfile && <Loader2 className="w-3 h-3 animate-spin" />}
                                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Change Password Card */}
                            <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 h-full hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-default">
                                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-gray-700 flex items-center gap-2 shrink-0">
                                    <Lock className="w-4 h-4 text-teal-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
                                </div>
                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Current Password</span>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 h-9 px-3 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                {showCurrentPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-slate-700 dark:text-gray-300">New Password</span>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 h-9 px-3 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Confirm New Password</span>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 h-9 px-3 pr-9 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </label>
                                    {passwordMessage && (
                                        <div className={`flex items-center gap-2 text-xs ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {passwordMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                    <div className="flex justify-end mt-auto">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isChangingPassword}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-1.5"
                                        >
                                            {isChangingPassword && <Loader2 className="w-3 h-3 animate-spin" />}
                                            {isChangingPassword ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* User Credits Card */}
                            <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden h-full hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-default">
                                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-gray-700 flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-teal-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Credits</h3>
                                </div>
                                <div className="p-4 flex flex-col gap-3 flex-1">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-100 dark:border-teal-800">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-teal-500 fill-teal-500" />
                                            <span className="text-xs font-medium text-slate-600 dark:text-gray-400">Free Credits</span>
                                        </div>
                                        <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{freeCredits}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                                            <span className="text-xs font-medium text-slate-600 dark:text-gray-400">Wallet Balance</span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-900 dark:text-white">${balance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-end mt-auto">
                                        <Link
                                            href="/wallet"
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1.5"
                                        >
                                            <Zap className="w-3 h-3" />
                                            Add Credits
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification & Theme & Logout Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Notifications */}
                            <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden h-full hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-default">
                                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-teal-500" />
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                                    </div>
                                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">2 new</span>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-32">
                                    <div className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer border-b border-slate-100 dark:border-gray-700">
                                        <p className="text-xs text-slate-700 dark:text-gray-300 line-clamp-1">Your image generation is complete!</p>
                                        <span className="text-[10px] text-slate-500 dark:text-gray-400">2 minutes ago</span>
                                    </div>
                                    <div className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer">
                                        <p className="text-xs text-slate-700 dark:text-gray-300 line-clamp-1">Welcome to Visiora!</p>
                                        <span className="text-[10px] text-slate-500 dark:text-gray-400">1 hour ago</span>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Preferences */}
                            <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden h-full hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-default">
                                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-gray-700 flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-teal-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Theme Preferences</h3>
                                </div>
                                <div className="p-4 flex items-center justify-between flex-1">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Dark Mode</span>
                                        <span className="text-xs text-slate-500 dark:text-gray-400">{darkMode ? 'Dark theme is active' : 'Light theme is active'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Sun className={`w-4 h-4 transition-colors ${!darkMode ? 'text-amber-500' : 'text-slate-400 dark:text-gray-500'}`} />
                                        <button
                                            onClick={toggleTheme}
                                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${darkMode ? 'bg-teal-500' : 'bg-slate-300'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${darkMode ? 'left-7' : 'left-1'
                                                    }`}
                                            />
                                        </button>
                                        <Moon className={`w-4 h-4 transition-colors ${darkMode ? 'text-indigo-400' : 'text-slate-400 dark:text-gray-500'}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Logout Section */}
                            <div className="flex flex-col rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-slate-200 dark:border-gray-700 overflow-hidden h-full hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-default">
                                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-gray-700 flex items-center gap-2">
                                    <LogOut className="w-4 h-4 text-red-500" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Actions</h3>
                                </div>
                                <div className="p-4 flex items-center justify-between flex-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">Sign out of your account</span>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-md"
                                    >
                                        {isLoggingOut ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <LogOut className="w-4 h-4" />
                                        )}
                                        {isLoggingOut ? 'Signing out...' : 'Logout'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
