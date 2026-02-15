"use client";

import Link from "@/components/Link";
import { useEffect, useState } from "react";
import {
    Bell,
    ChevronRight,
    ChevronDown,
    Zap,
    Settings,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Home,
} from "lucide-react";
import { authApi } from "@/lib/auth";
import { useWallet } from "@/lib/WalletContext";
import { useRouter } from "@/components/useRouter";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface HeaderProps {
    breadcrumbs: BreadcrumbItem[];
    freeCredits?: number;
    balance?: number;
    disableWalletFetch?: boolean;
}

export default function Header({
    breadcrumbs,
    freeCredits: propCredits,
    balance: propBalance,
    disableWalletFetch = false
}: HeaderProps) {
    const router = useRouter();
    const [userName, setUserName] = useState("User");
    const [userInitial, setUserInitial] = useState("U");
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Notification state
    interface Notification {
        id: string;
        message: string;
        time: string;
    }
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Use global wallet context - fetched ONCE at root level
    const { freeCredits: contextCredits, balance: contextBalance } = useWallet();

    // DEBUG: Log wallet values
    console.log('Header - Wallet Context:', { contextCredits, contextBalance, propCredits, propBalance });

    // Use context values, fallback to props if provided (for backwards compatibility)
    // Use context values, fallback to props if provided (for backwards compatibility)
    const displayCredits = contextCredits ?? propCredits ?? 0;
    const displayBalance = contextBalance ?? propBalance ?? 0;

    // Navigation items for mobile menu
    const navItems = [
        { id: "home", label: "Home", icon: Home, href: "/?view=landing" },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate" },
        { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
        { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
    ];

    // Load notifications from localStorage
    useEffect(() => {
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications));
        }
    }, []);

    // Load user from localStorage on mount and check if new user
    useEffect(() => {
        const storedUser = authApi.getCurrentUser();
        if (storedUser && storedUser.fullName) {
            const firstName = storedUser.fullName.split(' ')[0];
            setUserName(firstName);
            setUserInitial(firstName.charAt(0).toUpperCase());

            // Check if this is a new login
            const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
            if (!hasSeenWelcome) {
                // Add welcome notification
                const welcomeNotification: Notification = {
                    id: Date.now().toString(),
                    message: `Welcome to ephotocart, ${firstName}!`,
                    time: 'Just now'
                };
                const newNotifications = [welcomeNotification];
                setNotifications(newNotifications);
                localStorage.setItem('notifications', JSON.stringify(newNotifications));
                localStorage.setItem('hasSeenWelcome', 'true');
            }
        }
    }, []);

    // Listen for image generation events
    useEffect(() => {
        const handleImageGenerated = () => {
            const generationNotification: Notification = {
                id: Date.now().toString(),
                message: 'Your image generation is complete!',
                time: 'Just now'
            };
            setNotifications(prev => {
                const updated = [generationNotification, ...prev];
                localStorage.setItem('notifications', JSON.stringify(updated));
                return updated;
            });
        };

        // Listen for custom event
        window.addEventListener('imageGenerated', handleImageGenerated);
        return () => window.removeEventListener('imageGenerated', handleImageGenerated);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Close mobile menu if clicking outside
            if (showMobileMenu && !target.closest('.mobile-menu-container')) {
                setShowMobileMenu(false);
            }
            // Close profile dropdown if clicking outside
            if (showProfileDropdown && !target.closest('.profile-dropdown-container')) {
                setShowProfileDropdown(false);
            }
            // Close notification dropdown if clicking outside
            if (showNotificationDropdown && !target.closest('.notification-dropdown-container')) {
                setShowNotificationDropdown(false);
            }
        };

        // Use mousedown instead of click to catch before other events
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMobileMenu, showProfileDropdown, showNotificationDropdown]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authApi.logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            router.push('/login');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(prev => !prev);
        setShowProfileDropdown(false);
        setShowNotificationDropdown(false);
    };

    return (
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-700 z-50 shrink-0 relative">
            {/* Mobile Menu Button - Only visible on mobile/tablet (hidden on lg and above) */}
            <div className="relative mobile-menu-container lg:hidden">
                <button
                    type="button"
                    onClick={toggleMobileMenu}
                    className="p-2 text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                    {showMobileMenu ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>

                {/* Mobile Menu Dropdown */}
                {showMobileMenu && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 py-2 z-[100]">
                        {/* Navigation Links */}
                        <div className="py-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-gray-700 my-1"></div>

                        {/* Settings & Logout */}
                        <div className="py-1">
                            <Link
                                href="/settings"
                                onClick={() => setShowMobileMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                            <button
                                onClick={() => {
                                    setShowMobileMenu(false);
                                    handleLogout();
                                }}
                                disabled={isLoggingOut}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left disabled:opacity-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Breadcrumbs - Only visible on desktop (md and above) */}
            <div className="hidden md:flex items-center text-sm font-medium">
                {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-600 mx-1.5" />
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="text-slate-500 dark:text-gray-400 hover:text-teal-600 cursor-pointer transition-colors flex items-center gap-1"
                            >
                                {item.label === "Home" ? <Home className="w-5 h-5 -ml-1" /> : item.label}
                            </Link>
                        ) : (
                            <span className="text-slate-900 dark:text-white flex items-center gap-1">
                                {item.label === "Home" ? <Home className="w-5 h-5 -ml-1" /> : item.label}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Right Section */}
            <div className="flex-1 lg:flex-none flex justify-end items-center gap-2 sm:gap-4">
                {/* Credits Badge */}
                <Link
                    href="/wallet"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 shadow-sm hover:border-teal-400 hover:shadow-md transition-all cursor-pointer"
                >
                    <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-300">{displayCredits} FREE</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200 dark:bg-gray-600"></div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">${displayBalance.toFixed(2)}</span>
                </Link>

                {/* Notifications */}
                <div className="relative notification-dropdown-container">
                    <button
                        onClick={() => {
                            setShowNotificationDropdown(!showNotificationDropdown);
                            setShowProfileDropdown(false);
                        }}
                        className="relative p-1.5 text-slate-500 dark:text-gray-400 hover:text-teal-600 transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                    </button>
                    {showNotificationDropdown && (
                        <div className="absolute right-[-60px] sm:right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 py-2 z-50">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-700">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer border-b border-slate-100 dark:border-gray-700 last:border-b-0">
                                            <p className="text-sm text-slate-700 dark:text-gray-300">{notification.message}</p>
                                            <span className="text-xs text-slate-500 dark:text-gray-400">{notification.time}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center">
                                        <p className="text-sm text-slate-500 dark:text-gray-400">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-gray-700 profile-dropdown-container">
                    <button
                        onClick={() => {
                            setShowProfileDropdown(!showProfileDropdown);
                            setShowNotificationDropdown(false);
                        }}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="size-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {userInitial}
                        </div>
                        <div className="hidden md:flex flex-col text-left">
                            <div className="flex items-center gap-0.5">
                                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{userName}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                    </button>
                    {showProfileDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 py-2 z-50">
                            <Link
                                href="/settings"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                                onClick={() => setShowProfileDropdown(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                            <button
                                onClick={() => {
                                    setShowProfileDropdown(false);
                                    handleLogout();
                                }}
                                disabled={isLoggingOut}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                {isLoggingOut ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
