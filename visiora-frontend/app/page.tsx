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
    ArrowUpRight,
} from "lucide-react";
import { landingApi, LandingStats } from "@/lib/landing";
import { PublicNavbar } from "@/components/layout";
import { authApi } from "@/lib/auth";
import { motion, useMotionValue, useSpring, useMotionTemplate, AnimatePresence } from "framer-motion";
import ComparisonSlider from "@/components/ComparisonSlider"; // Keeping as it might be used inside
import LandingVisuals from "@/components/LandingVisuals";

export default function LandingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Auth check state - start with checking auth
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    // Stats state
    const [stats, setStats] = useState<LandingStats | null>(null);

    // Interactive Background State
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 30, stiffness: 150 });
    const springY = useSpring(mouseY, { damping: 30, stiffness: 150 });

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }
    const [isLoading, setIsLoading] = useState(true);

    // Sliding Text State
    const [index, setIndex] = useState(0);
    const words = ["Stunning Visuals", "Marketing Assets", "Viral Content", "Product Photos"];

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Check auth on mount - redirect to dashboard if logged in
    // But allow viewing if user explicitly navigated here (via Home link)
    useEffect(() => {
        const checkAuth = () => {
            const viewLanding = searchParams.get('view') === 'landing';
            // Temporary: Disable redirect to allow viewing design changes
            if (authApi.isAuthenticated() && !viewLanding) {
                // router.replace("/dashboard");
                setIsCheckingAuth(false); // Allow viewing even if logged in for now
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
            <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 10
            }
        }
    };

    const cardContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.6 // Start after hero text
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        }
    };


    return (
        <div className="min-h-screen lg:h-screen w-screen overflow-x-hidden bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-slate-900 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
            {/* Navbar */}
            <PublicNavbar activePage="home" />

            {/* Main Content */}
            <main
                onMouseMove={handleMouseMove}
                className="flex-1 flex items-start justify-start lg:items-center lg:justify-center relative px-4 sm:px-6 pt-28 pb-12 lg:pt-32 lg:pb-20 overflow-y-auto lg:overflow-hidden group w-full"
            >
                {/* Interactive Background: Mouse Spotlight */}
                {/* Interactive Background: Tech Grid Reveal */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    {/* Base Grid (Clearly Visible) */}
                    <div
                        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.08)_1px,transparent_1px)] bg-[size:32px_32px]"
                    />

                    {/* Interactive Spotlight (Safe Implementation) - Hidden on mobile to prevent crashes */}
                    <motion.div
                        className="absolute hidden sm:block w-[500px] h-[500px] bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-[100px]"
                        style={{
                            left: springX,
                            top: springY,
                            x: "-50%",
                            y: "-50%"
                        }}
                    />

                    {/* Radiant Top Light (Static) */}
                    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-teal-50/60 via-transparent to-transparent dark:from-teal-900/20 pointer-events-none" />
                </div>

                <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Left Column - Hero Text */}
                    {/* Left Column - Hero Text */}
                    <div className="max-w-xl mx-auto lg:mx-0 lg:ml-20 text-center lg:text-left relative z-10">
                        {/* Restored Static Color Effect (Glow) - Reduced Intensity */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-[80px] -z-10" />

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-teal-100 dark:border-gray-700 mb-3 sm:mb-5 shadow-sm mt-8"
                        >
                            <span className="flex h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 tracking-wide uppercase">AI-POWERED TECHNOLOGY</span>
                        </motion.div>

                        {/* 1. Main Heading - Transform Products into */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold leading-[1.2] mb-2 sm:mb-4 tracking-tight text-slate-900 dark:text-white"
                        >
                            Elevate Products into <br className="hidden sm:block" />

                            <span className="block overflow-hidden relative">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={index}
                                        initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
                                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                        exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
                                        transition={{ duration: 0.6, ease: "circOut" }}
                                        className="absolute left-0 top-0 w-full block text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-400 dark:from-teal-400 dark:to-teal-300 pb-4 pt-1"
                                    >
                                        {words[index]}
                                    </motion.span>
                                </AnimatePresence>
                                {/* Invisible copy to hold width and height */}
                                <span className="block opacity-0 pb-4 pt-1" aria-hidden="true">Stunning Visuals</span>
                            </span>
                        </motion.h1>

                        {/* 3. Description Paragraph - Gentle Fade */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.8 }} // 0.8s total delay
                            className="text-base sm:text-lg 2xl:text-xl text-slate-500 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6 max-w-md 2xl:max-w-lg mx-auto lg:mx-0"
                        >
                            Generate professional product visuals instantly — no studio required. Simply upload your product and let our AI create photorealistic scenes optimized for ads, websites, and e-commerce.
                        </motion.p>

                        {/* 4. & 5. CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center lg:justify-start gap-4 mb-6 sm:mb-8">
                            {/* Primary CTA - Premium Teal Gradient with Shine */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
                                whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link
                                    href="/register"
                                    className="relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-2 text-base overflow-hidden group border border-emerald-400/20"
                                >
                                    <span className="relative z-10">Get Started</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </Link>
                            </motion.div>

                            {/* Secondary CTA - Structured Surface (Not just flat white) */}
                            {/* Pricing Button - Temporarily Hidden */}
                            {/* <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 1.2, ease: "easeOut" }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="/pricing"
                                    className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-full transition-all border border-slate-200 dark:border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-teal-500/10 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2 text-base"
                                >
                                    Pricing
                                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                </Link>
                            </motion.div> */}
                        </div>

                        {/* 6. Trust Indicators - Staggered */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.4 }}
                            className="flex flex-col items-start justify-start gap-4 text-sm text-slate-500 dark:text-gray-400"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 1.5 }}
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span>Start with 1 free credit</span>
                            </motion.div>

                            <div className="flex flex-col items-start gap-1">
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 1.6 }}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span>Upgrade anytime with our best-value plans</span>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 1.7 }}
                                    className="pl-6"
                                >
                                    <span>Built for businesses of every size</span>
                                </motion.div>
                            </div>
                        </motion.div>


                    </div>

                    {/* Right Column - Comparison Slider & Stats */}
                    <motion.div
                        className="relative block mt-12 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0 flex justify-center"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        {/* Background Glow Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-br from-teal-400/20 to-emerald-300/20 dark:from-teal-500/10 dark:to-emerald-500/10 blur-[90px] rounded-full -z-10 pointer-events-none" />

                        {/* Comparison Slider - Blended Background (No Border) */}
                        <div className="relative z-10 rounded-3xl p-4 sm:p-5 mb-8 transform hover:scale-[1.01] transition-transform duration-500 max-w-md lg:max-w-full mx-auto h-[600px] flex items-center">
                            <LandingVisuals />
                        </div>
                    </motion.div>
                </div>

            </main >
        </div >
    );
}

