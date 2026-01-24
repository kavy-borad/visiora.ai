"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Loader2,
    AlertCircle,
    CheckCircle,
    User,
    Mail,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    Check,
    ArrowLeft
} from "lucide-react";
import React, { useState } from "react";
import { authApi } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import Branding from "@/components/Branding";
import MorphLoopVisuals from "@/components/MorphLoopVisuals";

export default function RegisterPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    // Redirect to dashboard if already logged in
    React.useEffect(() => {
        if (authApi.isAuthenticated()) {
            router.replace("/dashboard");
        }
    }, [router]);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id === "confirm-password" ? "confirmPassword" : id]: type === "checkbox" ? checked : value,
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (!formData.fullName.trim()) {
            setError("Please enter your full name");
            return;
        }
        if (!formData.email.trim()) {
            setError("Please enter your email");
            return;
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!formData.terms) {
            setError("Please accept the Terms and Privacy Policy");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });

            if (response.success) {
                setSuccess("Account created successfully! Redirecting...");
                // Store token if provided
                if (response.data?.token) {
                    localStorage.setItem("token", response.data.token);
                }
                // Redirect after short delay
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            } else {
                setError(response.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden flex items-stretch bg-white dark:bg-slate-900">

            {/* 1. Left Side - Compact Form with Tabs (Swapped) */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative">

                {/* Branding Mobile Only */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Branding />
                </div>

                {/* Desktop: Back to Home */}
                <Link
                    href="/"
                    className="absolute top-8 left-8 hidden lg:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span>Back to Home</span>
                </Link>

                <div className="w-full max-w-[380px] flex flex-col gap-5">

                    {/* Tab Switcher (Sign In | Sign Up) */}
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-full grid grid-cols-2 mb-2">
                        <Link href="/login" className="text-center py-2 text-sm font-medium text-slate-500 dark:text-slate-400 rounded-full hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                            Sign In
                        </Link>
                        <div className="text-center py-2 text-sm font-bold bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm rounded-full cursor-default">
                            Sign Up
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Start your creative journey with Visiora.</p>
                    </div>

                    {/* Error/Success Messages - Fixed Height Reserve */}
                    {(error || success) && (
                        <div className="w-full animate-in fade-in slide-in-from-top-2">
                            {error && (
                                <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${isDarkMode ? "bg-red-900/20 border border-red-800/50 text-red-400" : "bg-red-50 border border-red-100 text-red-600"}`}>
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${isDarkMode ? "bg-green-900/20 border border-green-800/50 text-green-400" : "bg-green-50 border border-green-100 text-green-600"}`}>
                                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{success}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form - Compact Spacing */}
                    <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="">
                            <label className="flex items-start gap-2.5 cursor-pointer group">
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${formData.terms ? "bg-emerald-600 border-emerald-600" : "border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-slate-400"}`}>
                                    {formData.terms && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="hidden"
                                />
                                <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug select-none">
                                    I agree to the <a href="#" className="font-semibold text-slate-900 dark:text-white hover:underline">Terms</a> and <a href="#" className="font-semibold text-slate-900 dark:text-white hover:underline">Privacy Policy</a>
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-10 mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.98] text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>

                    {/* Google Button - Visual Only Match */}
                    <button
                        type="button"
                        className="w-full h-10 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        onClick={() => { }} // Could hook up Google auth later
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <div className="w-full text-center text-[10px] text-slate-400">
                        © 2026 Visiora AI. All rights reserved.
                    </div>
                </div>
            </div>

            {/* 2. Right Side - Visuals (Swapped) */}
            <div className="hidden lg:block w-[55%] h-full p-4">
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <MorphLoopVisuals direction="right" />
                </div>
            </div>
        </div>
    );
}
