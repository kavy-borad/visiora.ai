"use client";

import Link from "@/components/Link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    ArrowRight,
    Play,
    CheckCircle,
    Images,
    Zap,
    Users,
    Shield,
} from "lucide-react";
import { landingApi, LandingStats } from "@/lib/landing";
import { PublicNavbar } from "@/components/layout";
import { authApi } from "@/lib/auth";

export default function LandingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Auth check state - start with checking auth
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    // Stats state
    const [stats, setStats] = useState<LandingStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth on mount - redirect to dashboard if logged in
    // But allow viewing if user explicitly navigated here (via Home link)
    useEffect(() => {
        const checkAuth = () => {
            const viewLanding = searchParams.get('view') === 'landing';
            if (authApi.isAuthenticated() && !viewLanding) {
                router.replace("/dashboard");
            } else {
                setIsCheckingAuth(false);
            }
        };
        checkAuth();
    }, [router, searchParams]);

    // Fetch stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await landingApi.getStats();
                if (response.success && response.data) {
                    setStats(response.data);
                }
            } catch (error) {
                console.warn('Failed to fetch landing stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Show loading state while checking auth
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-white via-teal-50/50 to-teal-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // Fallback values if API fails
    const imagesGenerated = stats?.imagesGenerated ?? 10000;
    const avgGenerationTime = stats?.avgGenerationTime ?? 30;
    const activeUsers = stats?.activeUsers ?? 2000;

    // Format numbers for display
    const formatNumber = (num: number): string => {
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
        return `${num}+`;
    };


    return (
        <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-white via-teal-50/50 to-teal-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-slate-900 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
            {/* Navbar */}
            <PublicNavbar activePage="home" />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center relative px-4 sm:px-6 py-6 sm:py-0 overflow-y-auto lg:overflow-hidden">
                {/* Background Blurs */}
                <div className="absolute top-10 left-1/4 w-72 h-72 bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-emerald-100/30 dark:bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

                <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 2xl:gap-16 items-center">
                    {/* Left Column - Hero Text */}
                    <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-teal-100 dark:border-gray-700 mb-3 sm:mb-5 shadow-sm">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-gray-400 tracking-wide uppercase">AI-Powered Technology</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold leading-[1.1] mb-3 sm:mb-4 tracking-tight text-slate-900 dark:text-white">
                            Transform Products into <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-teal-500 to-teal-700 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent">Stunning Visuals</span>
                        </h1>

                        {/* Description */}
                        <p className="text-sm sm:text-base 2xl:text-lg text-slate-500 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6 max-w-md 2xl:max-w-lg mx-auto lg:mx-0">
                            Create professional product photography instantly. No studio required. Just upload your product and let our AI generate photorealistic scenes.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center lg:justify-start gap-3 mb-4 sm:mb-5">
                            <Link
                                href="/register"
                                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-slate-700 dark:from-teal-600 dark:to-slate-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:brightness-110 hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                            >
                                Start Creating Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/solutions" className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 font-medium rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm">
                                <Play className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                                See How it Works
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 dark:text-gray-400">
                            <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                            <span>No credit card required</span>
                            <span className="mx-1.5 text-slate-300 dark:text-gray-600">•</span>
                            <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                            <span>14-day free trial</span>
                        </div>
                    </div>

                    {/* Right Column - Stats Cards */}
                    <div className="relative hidden md:block">
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 relative z-10">
                            {/* Card 1 - Images Generated */}
                            <div className="opacity-0 animate-fade-in-up bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-teal-100/50 dark:border-gray-700 shadow-lg shadow-black/5 p-5 rounded-xl flex flex-col gap-4 group hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300">
                                <div className="size-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
                                    <Images className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{formatNumber(imagesGenerated)}</div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-gray-400">Images Generated</div>
                                </div>
                            </div>

                            {/* Card 2 - Generation Time */}
                            <div className="opacity-0 animate-fade-in-up-delay-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-teal-100/50 dark:border-gray-700 shadow-lg shadow-black/5 p-5 rounded-xl flex flex-col gap-4 mt-6 group hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300">
                                <div className="size-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{avgGenerationTime}s</div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-gray-400">Generation Time</div>
                                </div>
                            </div>

                            {/* Card 3 - Active Users */}
                            <div className="opacity-0 animate-fade-in-up-delay-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-teal-100/50 dark:border-gray-700 shadow-lg shadow-black/5 p-5 rounded-xl flex flex-col gap-4 group hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300">
                                <div className="size-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{formatNumber(activeUsers)}</div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-gray-400">Active Users</div>
                                </div>
                            </div>

                            {/* Card 4 - Secure */}
                            <div className="opacity-0 animate-fade-in-up-delay-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-teal-100/50 dark:border-gray-700 shadow-lg shadow-black/5 p-5 rounded-xl flex flex-col gap-4 mt-6 group hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300">
                                <div className="size-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">100%</div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-gray-400">Secure & Private</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Security Bar */}
            <div className="shrink-0 w-full bg-white dark:bg-gray-800 border-t border-slate-100 dark:border-gray-700 py-2 sm:py-3 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">Enterprise Security Grade</p>
                            <p className="text-[10px] text-slate-500 dark:text-gray-400">SOC2 Compliant & GDPR Ready</p>
                        </div>
                    </div>
                    <Link href="#" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center gap-1 group">
                        Learn more about security
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

