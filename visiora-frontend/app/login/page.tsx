"use client";

import React, { useState } from "react";
import Link from "@/components/Link";
import { useRouter } from "@/components/useRouter";
import {
    Sparkles,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { authApi } from "@/lib/auth";
import { AuthNavbar } from "@/components/layout";
import { useTheme } from "@/lib/theme";

export default function LoginPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Redirect to dashboard if already logged in
    React.useEffect(() => {
        if (authApi.isAuthenticated()) {
            router.replace("/dashboard");
        }
    }, [router]);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!formData.email.trim()) {
            setError("Please enter your email");
            return;
        }
        if (!formData.password) {
            setError("Please enter your password");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.login({
                email: formData.email,
                password: formData.password,
            });

            if (response.success) {
                setSuccess("Login successful! Redirecting to dashboard...");
                // Token and user are already saved by authApi.login()
                // Redirect after short delay
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1000);
            } else {
                setError(response.error || "Invalid email or password. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            {/* Custom gradient background */}
            <div className={`fixed inset-0 -z-10 transition-colors duration-300 ${isDarkMode
                ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                : "bg-gradient-to-br from-teal-50 via-white to-slate-50"
                }`} />

            {/* Decorative blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className={`absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[100px] transition-colors duration-300 ${isDarkMode ? "bg-teal-900/20 opacity-40" : "bg-teal-100/30 opacity-60"
                    }`} />
                <div className={`absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[80px] transition-colors duration-300 ${isDarkMode ? "bg-slate-700/30 opacity-30" : "bg-emerald-50/40 opacity-40"
                    }`} />
            </div>

            {/* Reusable Auth Navbar */}
            <AuthNavbar
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleTheme}
                currentPage="login"
            />

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-4 py-6 sm:py-4 overflow-y-auto">
                <div className={`w-full max-w-[440px] rounded-2xl border p-4 sm:p-6 flex flex-col items-center transition-all duration-300 ${isDarkMode
                    ? "bg-slate-800/90 border-slate-700/50 shadow-2xl shadow-black/40"
                    : "bg-white border-slate-100 shadow-[0_8px_40px_rgba(20,184,166,0.15),0_4px_20px_rgba(0,0,0,0.08)]"
                    }`}>
                    {/* Icon */}
                    <div className={`mb-3 flex items-center justify-center size-10 rounded-xl transition-colors duration-300 ${isDarkMode ? "bg-teal-900/50 text-teal-400" : "bg-teal-50 text-teal-600"
                        }`}>
                        <Sparkles className="w-5 h-5" />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-4 w-full">
                        <h1 className={`text-xl sm:text-2xl font-bold mb-2 tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-800"
                            }`}>Welcome Back</h1>
                        <p className={`text-sm transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                            }`}>Sign in to your account to continue generating.</p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className={`w-full flex items-center gap-2 p-3 rounded-lg text-sm mb-2 ${isDarkMode ? "bg-red-900/30 border border-red-800 text-red-400" : "bg-red-50 border border-red-200 text-red-600"}`}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className={`w-full flex items-center gap-2 p-3 rounded-lg text-sm mb-2 ${isDarkMode ? "bg-green-900/30 border border-green-800 text-green-400" : "bg-green-50 border border-green-200 text-green-600"}`}>
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"
                                }`} htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${isDarkMode ? "text-slate-500 group-focus-within:text-teal-400" : "text-slate-400 group-focus-within:text-teal-600"
                                    }`}>
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    className={`w-full h-12 pl-11 pr-4 rounded-xl border transition-all outline-none text-sm font-medium ${isDarkMode
                                        ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 hover:border-slate-500"
                                        : "bg-white border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 hover:border-slate-300"
                                        }`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="name@company.com"
                                    type="email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"
                                }`} htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${isDarkMode ? "text-slate-500 group-focus-within:text-teal-400" : "text-slate-400 group-focus-within:text-teal-600"
                                    }`}>
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    className={`w-full h-12 pl-11 pr-11 rounded-xl border transition-all outline-none text-sm font-medium ${isDarkMode
                                        ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 hover:border-slate-500"
                                        : "bg-white border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/10 hover:border-slate-300"
                                        }`}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min 8 characters"
                                    type={showPassword ? "text" : "password"}
                                    minLength={8}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-300 hover:text-slate-500"
                                        }`}
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me + Forgot password */}
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    className={`size-4 rounded cursor-pointer ${isDarkMode
                                        ? "border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500/20"
                                        : "border-slate-300 text-teal-600 focus:ring-teal-500/20"
                                        }`}
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span className={`text-sm transition-colors ${isDarkMode ? "text-slate-400 group-hover:text-slate-300" : "text-slate-500 group-hover:text-slate-700"
                                    }`}>Remember me</span>
                            </label>
                            <Link className={`text-sm font-semibold transition-colors ${isDarkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"
                                }`} href="#">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="mt-1 w-full h-12 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-1 items-center justify-center">
                            <span className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? "text-slate-500" : "text-slate-400"
                                }`}>
                                or continue with
                            </span>
                        </div>

                        {/* Google Sign In */}
                        <button
                            className={`w-full h-12 border font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm ${isDarkMode
                                ? "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                }`}
                            type="button"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm">Sign in with Google</span>
                        </button>
                    </form>

                    {/* Footer Link */}
                    <p className={`mt-4 text-center text-sm transition-colors duration-300 ${isDarkMode ? "text-slate-500" : "text-slate-400"
                        }`}>
                        Don't have an account?{" "}
                        <Link className={`font-bold transition-colors ${isDarkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"
                            }`} href="/register">
                            Sign up
                        </Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className={`w-full py-2 text-center text-xs transition-colors duration-300 ${isDarkMode ? "text-slate-600" : "text-slate-400"
                }`}>
                © {new Date().getFullYear()} Visiora. All rights reserved.
            </footer>
        </div>
    );
}
