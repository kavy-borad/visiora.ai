"use client";

import Link from "@/components/Link";
import { useRouter } from "@/components/useRouter";
import {
    Sparkles,
    User,
    Mail,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    ArrowRight,
    Palette,
    Zap,
    ShieldCheck,
    Rocket,
    ShoppingBag,
    Gem,
    Loader2,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import React, { useState } from "react";
import { authApi } from "@/lib/auth";
import { AuthNavbar } from "@/components/layout";
import { useTheme } from "@/lib/theme";

export default function RegisterPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
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
                setSuccess("Account created successfully! Redirecting to login...");
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

    const features = [
        { icon: Palette, title: "Free Credits", description: "1 free credit to start", color: "teal" },
        { icon: Zap, title: "Instant Access", description: "No credit card required", color: "cyan" },
        { icon: ShieldCheck, title: "Secure & Private", description: "Data encrypted & protected", color: "sky" },
        { icon: Rocket, title: "Fast Generation", description: "Images in under 30 seconds", color: "blue" },
        { icon: ShoppingBag, title: "Ecommerce Ready", description: "Photoshoot in minutes", color: "indigo" },
        { icon: Gem, title: "Premium Quality", description: "Up to 4K resolution", color: "violet" },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; shadow: string }> = {
            teal: { bg: "bg-teal-50", text: "text-teal-600", shadow: "hover:shadow-teal-900/5" },
            cyan: { bg: "bg-cyan-50", text: "text-cyan-600", shadow: "hover:shadow-cyan-900/5" },
            sky: { bg: "bg-sky-50", text: "text-sky-600", shadow: "hover:shadow-sky-900/5" },
            blue: { bg: "bg-blue-50", text: "text-blue-600", shadow: "hover:shadow-blue-900/5" },
            indigo: { bg: "bg-indigo-50", text: "text-indigo-600", shadow: "hover:shadow-indigo-900/5" },
            violet: { bg: "bg-violet-50", text: "text-violet-600", shadow: "hover:shadow-violet-900/5" },
        };
        return colors[color] || colors.teal;
    };

    return (
        <div className={`h-screen flex flex-col relative overflow-hidden antialiased transition-colors duration-300 ${isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-hero"
            }`}>
            {/* Background Blobs */}
            <div className={`blob w-[40rem] h-[40rem] top-0 left-0 -translate-x-1/3 -translate-y-1/3 fixed ${isDarkMode ? "bg-teal-900/30" : "bg-teal-100"
                }`}></div>
            <div className={`blob w-[35rem] h-[35rem] bottom-0 right-0 translate-x-1/4 translate-y-1/4 fixed ${isDarkMode ? "bg-slate-700/30" : "bg-slate-200"
                }`}></div>
            <div className={`blob w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed ${isDarkMode ? "bg-sky-900/20" : "bg-sky-100"
                }`}></div>

            {/* Reusable Auth Navbar */}
            <AuthNavbar
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleTheme}
                currentPage="register"
            />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 md:px-6 z-10 min-h-0 py-4 sm:py-2 overflow-hidden">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-stretch my-auto">
                    {/* Left Panel - Form */}
                    <div className={`glass-panel rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-center relative overflow-visible transition-colors duration-300 ${isDarkMode
                        ? "bg-gray-800/90 border border-gray-700 shadow-2xl shadow-black/30"
                        : "bg-white/85 border border-white/60 shadow-[20px_20px_60px_-15px_rgba(13,148,136,0.1),0_8px_10px_-6px_rgba(0,0,0,0.01)]"
                        }`}>
                        {/* Top highlight line */}
                        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent ${isDarkMode ? "opacity-20" : "opacity-50"}`}></div>

                        {/* Header */}
                        <div className="text-center mb-4 relative z-10">
                            <div className={`inline-flex mb-3 p-2 rounded-xl shadow-sm transition-colors ${isDarkMode ? "bg-teal-900/50 text-teal-400" : "bg-teal-50 text-teal-500 shadow-teal-100/50"}`}>
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h1 className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 tracking-tight transition-colors ${isDarkMode ? "text-white" : "text-slate-800"}`}>Create Account</h1>
                            <p className={`text-xs transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>Join the AI revolution and start creating today</p>
                        </div>

                        {/* Error/Success Messages */}
                        <div className="min-h-[44px] mb-2">
                            {error && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${isDarkMode ? "bg-red-900/30 border border-red-800 text-red-400" : "bg-red-50 border border-red-200 text-red-600"}`}>
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${isDarkMode ? "bg-green-900/30 border border-green-800 text-green-400" : "bg-green-50 border border-green-200 text-green-600"}`}>
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                    <span>{success}</span>
                                </div>
                            )}
                        </div>

                        {/* Form */}
                        <form className="space-y-2.5 relative z-10" onSubmit={handleSubmit}>
                            {/* Full Name */}
                            <div className="space-y-0.5">
                                <label className={`text-[10px] font-semibold uppercase tracking-wider ml-1 transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`} htmlFor="fullname">
                                    Full Name
                                </label>
                                <div className="relative group/input">
                                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within/input:text-teal-500 transition-colors ${isDarkMode ? "text-gray-500" : "text-slate-400"}`} />
                                    <input
                                        className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm ${isDarkMode
                                            ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                                            : "bg-white/60 border-slate-200 text-slate-800"
                                            }`}
                                        id="fullName"
                                        placeholder="John Doe"
                                        type="text"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-0.5">
                                <label className={`text-[10px] font-semibold uppercase tracking-wider ml-1 transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`} htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative group/input">
                                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within/input:text-teal-500 transition-colors ${isDarkMode ? "text-gray-500" : "text-slate-400"}`} />
                                    <input
                                        className={`w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm ${isDarkMode
                                            ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                                            : "bg-white/60 border-slate-200 text-slate-800"
                                            }`}
                                        id="email"
                                        placeholder="you@example.com"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-0.5">
                                <label className={`text-[10px] font-semibold uppercase tracking-wider ml-1 transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`} htmlFor="password">
                                    Password
                                </label>
                                <div className="relative group/input">
                                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within/input:text-teal-500 transition-colors ${isDarkMode ? "text-gray-500" : "text-slate-400"}`} />
                                    <input
                                        className={`w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm ${isDarkMode
                                            ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                                            : "bg-white/60 border-slate-200 text-slate-800"
                                            }`}
                                        id="password"
                                        placeholder="Min 8 characters"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <button
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-slate-400 hover:text-slate-600"}`}
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className={`text-[10px] mt-1 ml-1 transition-colors ${isDarkMode ? "text-gray-500" : "text-slate-500"}`}>
                                    The password must include at least one uppercase letter, one lowercase letter and one number
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-0.5">
                                <label className={`text-[10px] font-semibold uppercase tracking-wider ml-1 transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`} htmlFor="confirm-password">
                                    Confirm Password
                                </label>
                                <div className="relative group/input">
                                    <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within/input:text-teal-500 transition-colors ${isDarkMode ? "text-gray-500" : "text-slate-400"}`} />
                                    <input
                                        className={`w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm ${isDarkMode
                                            ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                                            : "bg-white/60 border-slate-200 text-slate-800"
                                            }`}
                                        id="confirmPassword"
                                        placeholder="Re-enter password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <button
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-slate-400 hover:text-slate-600"}`}
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-2 mt-3 ml-1">
                                <div className="relative flex items-center pt-0.5">
                                    <input
                                        className={`w-3.5 h-3.5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer ${isDarkMode ? "border-gray-600 bg-gray-700" : "border-slate-300"}`}
                                        id="terms"
                                        type="checkbox"
                                        checked={formData.terms}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                </div>
                                <label className={`text-xs select-none leading-tight transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`} htmlFor="terms">
                                    I agree to the{" "}
                                    <a className={`font-medium hover:underline ${isDarkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`} href="#">
                                        Terms
                                    </a>{" "}
                                    and{" "}
                                    <a className={`font-medium hover:underline ${isDarkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`} href="#">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-slate-600 hover:from-teal-600 hover:to-slate-700 text-white font-semibold rounded-lg shadow-lg shadow-teal-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group/btn mt-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-4 text-center relative z-10">
                            <p className={`text-xs transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>
                                Already have an account?{" "}
                                <Link className={`font-semibold transition-colors ${isDarkMode ? "text-teal-400 hover:text-teal-300" : "text-teal-600 hover:text-teal-700"}`} href="/login">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Right Panel - Features */}
                    <div className={`glass-panel rounded-2xl p-4 sm:p-5 md:p-6 flex-col justify-center relative hidden lg:flex transition-colors duration-300 ${isDarkMode
                        ? "bg-gray-800/40 border border-gray-700"
                        : "bg-white/40 border border-white/50"
                        }`}>
                        <div className="relative z-10">
                            <h2 className={`text-lg font-bold mb-4 text-center lg:text-left transition-colors ${isDarkMode ? "text-white" : "text-slate-800"}`}>Why Join Us?</h2>
                            <div className="grid gap-2">
                                {features.map((feature, index) => {
                                    const colorClasses = getColorClasses(feature.color);
                                    return (
                                        <div
                                            key={index}
                                            className={`group backdrop-blur-md p-2.5 rounded-xl flex items-center gap-3 transition-all hover:-translate-y-0.5 ${isDarkMode
                                                ? "bg-gray-700/60 border border-gray-600 hover:bg-gray-700/80 hover:shadow-lg"
                                                : `bg-white/60 border border-white/60 hover:bg-white/80 hover:shadow-md ${colorClasses.shadow}`
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-lg ${isDarkMode ? "bg-opacity-30" : ""} ${colorClasses.bg} flex items-center justify-center shrink-0 ${colorClasses.text} group-hover:scale-110 transition-transform`}>
                                                <feature.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold text-sm leading-tight transition-colors ${isDarkMode ? "text-white" : "text-slate-800"}`}>{feature.title}</h3>
                                                <p className={`text-[11px] transition-colors ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}>{feature.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-2 text-[10px] text-slate-400 z-10 shrink-0">
                © 2026 Visiora AI. All rights reserved.
            </footer>
        </div>
    );
}
