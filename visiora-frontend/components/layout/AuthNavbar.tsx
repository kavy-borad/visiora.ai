"use client";

import Link from "next/link";
import { Sparkles, Sun, Moon } from "lucide-react";
import { useThemeLogo } from "@/hooks/useThemeLogo";
import logo from "@/public/Gemini_Generated_Image_8r5e1l8r5e1l8r5e_1.png";

interface AuthNavbarProps {
    isDarkMode?: boolean;
    onToggleDarkMode?: () => void;
    currentPage?: "login" | "register";
}

export default function AuthNavbar({
    isDarkMode = false,
    onToggleDarkMode,
    currentPage
}: AuthNavbarProps) {
    const themeLogoSrc = useThemeLogo(logo.src);
    return (
        <header className={`w-full backdrop-blur-sm z-50 border-b transition-colors duration-300 ${isDarkMode
            ? "bg-slate-900/80 border-slate-700/50"
            : "bg-white/80 border-slate-100/50"
            }`}>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-14 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img src={themeLogoSrc} alt="Visiora Logo" className="h-10 w-10 relative z-10 opacity-90 transition-opacity object-contain" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">ephotocart</span>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Dark Mode Toggle */}
                    {onToggleDarkMode && (
                        <button
                            onClick={onToggleDarkMode}
                            aria-label="Toggle theme"
                            className={`flex items-center justify-center size-9 rounded-full transition-colors ${isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-50 text-slate-400"
                                }`}
                        >
                            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                    )}

                    {/* Auth Buttons */}
                    {currentPage === "login" ? (
                        <Link
                            href="/register"
                            className={`flex h-9 px-4 sm:px-5 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-colors shadow-lg ${isDarkMode
                                ? "bg-white text-slate-900 hover:bg-slate-200 shadow-white/10"
                                : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20"
                                }`}
                        >
                            Get Started
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className={`flex h-9 px-4 sm:px-5 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-colors shadow-lg ${isDarkMode
                                ? "bg-white text-slate-900 hover:bg-slate-200 shadow-white/10"
                                : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20"
                                }`}
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
