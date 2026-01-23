"use client";

import Link from "@/components/Link";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    Bell,
    ChevronRight,
    ChevronDown,
    Zap,
    ArrowRight,
    Info,
    User,
    ShoppingBag,
    Check,
    Pencil,
    Menu,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";
import { navigationState } from "@/lib/navigationState";

export default function GenerateImagesPage() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<"single_image" | "batch_image">("single_image");
    const [isSubmitting, setIsSubmitting] = useState(false);


    // User profile state
    const [userName, setUserName] = useState("Jane");
    const [userInitial, setUserInitial] = useState("J");

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate", active: true },
        { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
        { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
    ];

    const steps = [
        { id: 1, label: "Type", icon: Pencil, completed: false, current: true },
        { id: 2, label: "Upload", completed: false, current: false },
        { id: 3, label: "Details", completed: false, current: false },
    ];

    // Fetch user info on mount
    useEffect(() => {
        // Check if user is authenticated
        if (!authApi.isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Load user from localStorage
        const storedUser = authApi.getCurrentUser();
        if (storedUser && storedUser.fullName) {
            const firstName = storedUser.fullName.split(' ')[0];
            setUserName(firstName);
            setUserInitial(firstName.charAt(0).toUpperCase());
        }
    }, [router]);

    const handleNextStep = async () => {
        setIsSubmitting(true);

        // Use setTimeout to allow the UI to repaint with the loader BEFORE interfering with the main thread
        // preventing the "stuck" feeling and ensuring the animation starts smoothly.
        setTimeout(() => {
            try {
                localStorage.setItem('generateType', selectedType);

                // Signal the next page to show the loader
                navigationState.shouldShowLoader = true;

                // Navigate to upload page for both types
                router.push('/generate/upload');

                // NOTE: We do NOT set isSubmitting(false) here. 
                // We want the loader to persist until the page unmounts/transitions to avoid flicker.
            } catch (error) {
                console.warn('Failed to save generation type:', error);

                // Only reset loading if there's a genuine error preventing navigation
                // But since we try to fallback-navigate, we might still want to keep it true.
                // For safety vs stuck state:
                // If router.push fails, it throws.

                localStorage.setItem('generateType', selectedType);
                if (selectedType === 'batch_image') {
                    router.push('/generate/ecommerce-options');
                } else {
                    router.push('/generate/upload');
                }
                // Only turn off if we are absolutely sure navigation is aborted, but here we assume navigation continues.
            }
        }, 50);
    };

    // User credits display values (fallback if API not available)


    // Page transition loader
    const [isPageLoading, setIsPageLoading] = useState(navigationState.shouldShowLoader);

    useEffect(() => {
        if (isPageLoading) {
            const timer = setTimeout(() => {
                setIsPageLoading(false);
            }, 800);
            navigationState.shouldShowLoader = false;
            return () => clearTimeout(timer);
        } else {
            navigationState.shouldShowLoader = false;
        }
    }, [isPageLoading]);

    if (isPageLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc] dark:bg-gray-900">
                <motion.div
                    className="w-12 h-12 rounded-full border-4 border-teal-500/30 border-t-teal-500 shadow-lg"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-x-hidden bg-slate-50 dark:bg-gray-900 antialiased transition-colors duration-300">
            <div className="flex flex-1 h-full overflow-x-hidden lg:overflow-hidden">
                {/* Reusable Sidebar */}
                <Sidebar activeNav="generate" />

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 min-w-0 bg-slate-50 dark:bg-gray-900 overflow-x-hidden transition-colors duration-300">
                    {/* Reusable Header with dynamic breadcrumbs */}
                    <Header
                        breadcrumbs={[
                            { label: "Home", href: "/?view=landing" },
                            { label: "Generate Images" }
                        ]}
                    />

                    {/* Main Content - Scrollable */}
                    <main className="flex-1 p-4 sm:p-5 md:p-6 overflow-y-auto bg-slate-50/50 dark:bg-gray-900/50 transition-colors duration-300">
                        <div className="flex flex-col min-h-full">
                            {/* Page Header */}
                            <div className="mb-6 shrink-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 tracking-tight">Generate Images</h1>
                                <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-light">Upload an image and get professional variations in minutes.</p>
                            </div>

                            {/* Progress Steps - CSS Grid for perfect alignment */}
                            <div className="mb-6 sm:mb-8 shrink-0">
                                <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                    {/* Background line */}
                                    <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700"></div>
                                    {/* Active line (first segment) */}
                                    <div className="absolute top-5 left-[16.67%] w-[33.33%] h-[2px] bg-teal-500"></div>

                                    <div className="grid grid-cols-3">
                                        {/* STEP 1 - Active */}
                                        <div className="flex flex-col items-center cursor-pointer group">
                                            <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold ring-4 ring-teal-500/20 transition-transform group-hover:scale-110">
                                                1
                                            </div>
                                            <span className="mt-2 text-xs font-bold text-teal-600 tracking-wide uppercase">
                                                TYPE
                                            </span>
                                        </div>

                                        {/* STEP 2 */}
                                        <div className="flex flex-col items-center cursor-pointer group">
                                            <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 flex items-center justify-center font-bold transition-transform group-hover:scale-110">
                                                2
                                            </div>
                                            <span className="mt-2 text-xs font-semibold text-slate-400 dark:text-gray-500 tracking-wide uppercase">
                                                UPLOAD
                                            </span>
                                        </div>

                                        {/* STEP 3 */}
                                        <div className="flex flex-col items-center cursor-pointer group">
                                            <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 flex items-center justify-center font-bold transition-transform group-hover:scale-110">
                                                3
                                            </div>
                                            <span className="mt-2 text-xs font-semibold text-slate-400 dark:text-gray-500 tracking-wide uppercase">
                                                DETAILS
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Title */}
                            <div className="mb-4 shrink-0">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    What would you like to create?
                                    <Info className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                                </h2>
                            </div>

                            {/* Type Selection Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 md:mb-0 md:flex-1 md:min-h-0 max-w-5xl mx-auto w-full">
                                {/* Single Image Card */}
                                <label className="relative group cursor-pointer h-auto md:h-full">
                                    <input
                                        type="radio"
                                        name="create_type"
                                        className="peer sr-only"
                                        checked={selectedType === "single_image"}
                                        onChange={() => setSelectedType("single_image")}
                                    />
                                    <div className="h-full p-5 rounded-xl bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-700 shadow-md transition-all duration-300 peer-checked:border-teal-500 peer-checked:ring-4 peer-checked:ring-teal-500/10 peer-checked:shadow-xl hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div className={`transition-all transform ${selectedType === "single_image" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                                                <div className="size-5 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">Single Image</h3>
                                            <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                                                Perfect for headshots, profile pictures, or avatars. Generates high-fidelity individual portraits.
                                            </p>
                                        </div>
                                    </div>
                                </label>

                                {/* E-Commerce Bundle Card */}
                                <label className="relative group cursor-pointer h-auto md:h-full">
                                    <input
                                        type="radio"
                                        name="create_type"
                                        className="peer sr-only"
                                        checked={selectedType === "batch_image"}
                                        onChange={() => setSelectedType("batch_image")}
                                    />
                                    <div className="h-full p-5 rounded-xl bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-700 shadow-md transition-all duration-300 peer-checked:border-teal-500 peer-checked:ring-4 peer-checked:ring-teal-500/10 peer-checked:shadow-xl hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                            <div className={`transition-all transform ${selectedType === "batch_image" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                                                <div className="size-5 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">E-Commerce Bundle</h3>
                                            <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                                                Multiple angles for product listings. Includes transparent backgrounds and studio lighting.
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Next Button */}
                            <div className="flex justify-end pt-5 mt-auto md:mt-5 shrink-0 pb-4 md:pb-0">
                                <button
                                    onClick={handleNextStep}
                                    disabled={isSubmitting}
                                    className="group relative flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3 rounded-full font-medium text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden ring-1 ring-white/10"
                                >
                                    {/* Top Highlight */}
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"></div>

                                    {/* Bottom Shadow/Highlight */}
                                    <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/40 to-transparent"></div>

                                    <span className="relative z-10 flex items-center gap-2.5">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <span className="tracking-wide">Next Step</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
