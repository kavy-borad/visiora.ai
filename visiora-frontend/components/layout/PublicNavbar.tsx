"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Sun, Moon, User, LogOut, Sparkles, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { authApi, User as UserType } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

interface PublicNavbarProps {
    activePage?: "features" | "solutions" | "pricing" | "results" | "get-started" | "home";
}

export default function PublicNavbar({ activePage }: PublicNavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // User authentication state
    const [user, setUser] = useState<UserType | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Check for logged-in user on mount
    useEffect(() => {
        const currentUser = authApi.getCurrentUser();
        setUser(currentUser);

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
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
        { id: "home", label: "Home", href: "/" },
        { id: "features", label: "Features", href: "/features" },
        { id: "solutions", label: "Solutions", href: "/solutions" },
        // { id: "pricing", label: "Pricing", href: "/pricing" },
        { id: "results", label: "Results", href: "/results" },
        // { id: "get-started", label: "Get Started", href: "/get-started" }, // Removed from center nav
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-3 ${scrolled
                ? "bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-gray-800/50 shadow-sm"
                : "bg-transparent border-transparent"
                }`}
        >
            <div className="relative max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo - Minimal & Modern */}
                <Link href="/?view=landing" className="flex items-center gap-2 group relative z-50">
                    <div className="relative flex items-center justify-center size-9">
                        <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                        <img src="/logo.png" alt="Visiora Logo" className="h-8 w-auto relative z-10 opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Visiora</span>
                </Link>

                {/* Navigation - Clean, Airy, Minimal Hover */}
                <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={`relative text-[15px] font-medium transition-colors duration-300 ${activePage === link.id
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                }`}
                        >
                            {link.label}
                            {activePage === link.id && (
                                <motion.div
                                    layoutId="navbar-underline"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            {/* Subtle hover glow (invisible by default) */}
                            <span className="absolute inset-0 -z-10 bg-teal-50/0 dark:bg-teal-900/0 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 rounded-lg -m-2 p-2 transition-colors duration-200" aria-hidden="true" />
                        </Link>
                    ))}
                </nav>

                {/* Right Side - Premium Actions */}
                <div className="hidden lg:flex gap-2 items-center relative z-50">
                    {/* Theme Toggle - Minimal */}
                    <button
                        onClick={toggleTheme}
                        className="text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <div className="h-5 w-px bg-slate-200 dark:bg-gray-800" />

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-300 group"
                            >
                                <div className="size-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-inner">
                                    {user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown - Glassy & Clean */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-3 w-60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-gray-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-black/40 py-2 z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.fullName}</p>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                                        </div>
                                        <div className="p-1.5 space-y-0.5">
                                            <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                <User className="size-4" />
                                                Dashboard
                                            </Link>
                                            <Link href="/generate" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>
                                                <Sparkles className="size-4" />
                                                Generate Images
                                            </Link>
                                        </div>
                                        <div className="border-t border-slate-100 dark:border-gray-800 mt-1 p-1.5">
                                            <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full text-left">
                                                <LogOut className="size-4" />
                                                Log Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="relative px-3 py-2 text-sm font-bold text-slate-900 dark:text-white bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full transition-all shadow-sm group overflow-hidden"
                            >
                                <span className="relative z-10">Log In</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                            </Link>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="/register"
                                    className="relative px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-sm font-bold rounded-full shadow-lg shadow-slate-900/20 dark:shadow-white/10 transition-colors duration-300 overflow-hidden group flex items-center"
                                >
                                    <span className="relative z-10">Sign Up</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </Link>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button - Minimal */}
                <div className="flex lg:hidden items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-1 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu - Clean Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-gray-800/50 overflow-hidden"
                    >
                        <nav className="flex flex-col p-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-lg font-medium transition-colors ${activePage === link.id
                                        ? "text-teal-600 dark:text-teal-400"
                                        : "text-slate-600 dark:text-gray-400"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="h-px bg-slate-100 dark:bg-gray-800 w-full" />
                            {!user && (
                                <div className="flex flex-col gap-3">
                                    <Link href="/login" className="px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-800 rounded-xl">
                                        Log In
                                    </Link>
                                    <Link href="/register" className="px-4 py-3 text-center text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl shadow-md">
                                        Sign Up
                                    </Link>

                                </div>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
