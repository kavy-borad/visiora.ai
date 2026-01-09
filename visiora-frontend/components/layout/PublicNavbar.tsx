"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, User, LogOut, Sparkles, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { authApi, User as UserType } from "@/lib/auth";

interface PublicNavbarProps {
    activePage?: "features" | "solutions" | "pricing" | "results" | "get-started" | "home";
}

export default function PublicNavbar({ activePage }: PublicNavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // User authentication state
    const [user, setUser] = useState<UserType | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Check for logged-in user on mount
    useEffect(() => {
        const currentUser = authApi.getCurrentUser();
        setUser(currentUser);
    }, []);

    // Handle logout
    const handleLogout = async () => {
        await authApi.logout();
        setUser(null);
        setIsProfileOpen(false);
        // Redirect to login page after logout
        window.location.href = '/login';
    };

    const navLinks = [
        { id: "features", label: "Features", href: "/features" },
        { id: "solutions", label: "Solutions", href: "/solutions" },
        { id: "pricing", label: "Pricing", href: "/pricing" },
        { id: "results", label: "Results", href: "/results" },
        { id: "get-started", label: "Get Started", href: "/get-started" },
    ];

    return (
        <header className="shrink-0 border-b border-slate-200/60 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm z-50 relative transition-colors duration-300">
            <div className="px-4 sm:px-6 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/?view=landing" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Visiora Logo" className="h-9 sm:h-10 w-auto" />
                    <h2 className="text-slate-900 dark:text-white text-base sm:text-lg font-bold leading-tight tracking-tight">Visiora</h2>
                </Link>

                {/* Navigation Links - Desktop */}
                <nav className="hidden lg:flex flex-1 justify-center gap-6 xl:gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={`text-sm font-medium transition-colors ${activePage === link.id
                                ? "text-teal-600 dark:text-teal-400"
                                : "text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Side - Desktop */}
                <div className="hidden lg:flex gap-3 items-center">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {user ? (
                        // Logged in - Show user profile
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-white/40 dark:bg-white/10 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(20,184,166,0.15)] dark:hover:shadow-[0_8px_32px_rgba(20,184,166,0.2)] hover:border-teal-200/50 dark:hover:border-teal-400/30"
                            >
                                <div className="size-7 sm:size-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-md shadow-teal-500/30">
                                    <span className="text-xs sm:text-sm font-bold text-white">
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-gray-200 hidden sm:block max-w-[100px] truncate">
                                    {user.fullName}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-lg py-2 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-700">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.fullName}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/generate"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => setIsProfileOpen(false)}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Generate Images
                                    </Link>
                                    <div className="border-t border-slate-100 dark:border-gray-700 mt-1 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Not logged in - Show login/register buttons
                        <>
                            <Link
                                href="/login"
                                className="flex cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-transparent border border-slate-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 text-slate-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 text-sm font-medium transition-colors"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className={`flex cursor-pointer items-center justify-center rounded-lg h-9 px-4 text-sm font-bold shadow-md transition-all ${activePage === "get-started"
                                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                                    : "bg-slate-800 dark:bg-teal-600 hover:bg-slate-900 dark:hover:bg-teal-500 text-white"
                                    }`}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden flex items-center justify-center p-2 -mr-2 text-slate-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                    {mobileMenuOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-lg z-50">
                    <nav className="flex flex-col p-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === link.id
                                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                                    : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {/* Mobile Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>

                        {user ? (
                            // Logged in - Show user info and logout
                            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-gray-700 space-y-2">
                                <div className="px-4 py-2 flex items-center gap-3">
                                    <div className="size-8 bg-teal-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.fullName}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/generate"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generate Images
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            // Not logged in - Show login/register buttons
                            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-gray-700 space-y-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-transparent border border-slate-200 dark:border-gray-600 text-slate-700 dark:text-gray-300 text-sm font-medium"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center rounded-lg h-10 px-4 bg-teal-500 text-white text-sm font-bold shadow-md"
                                >
                                    Get Started Free
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
