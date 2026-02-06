"use client";

import Link from "@/components/Link";
import { useRouter } from "@/components/useRouter";
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Monitor,
    Lightbulb,
    Images,
    Layers,
    Sparkles,
    Info,
    Check,
    Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/auth";
import { generateApi, UserCredits } from "@/lib/generate";
import { Sidebar, Header } from "@/components/layout";

export default function EcommerceOptionsPage() {
    const router = useRouter();
    const [userCredits, setUserCredits] = useState<UserCredits | null>(null);

    // Form state
    const [productViews, setProductViews] = useState("standard_4");
    const [backgroundType, setBackgroundType] = useState("white");
    const [transparentBg, setTransparentBg] = useState("transparent_png");
    const [naturalShadow, setNaturalShadow] = useState(true);
    const [reflection, setReflection] = useState(false);
    const [platformSize, setPlatformSize] = useState("marketplace_standard");
    const [lightingStyle, setLightingStyle] = useState("soft_studio");
    const [numberOfImages, setNumberOfImages] = useState("1");

    // Dropdown states
    const [showViewsDropdown, setShowViewsDropdown] = useState(false);
    const [showBgDropdown, setShowBgDropdown] = useState(false);
    const [showTransparentDropdown, setShowTransparentDropdown] = useState(false);
    const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
    const [showImagesDropdown, setShowImagesDropdown] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const steps = [
        { id: 1, label: "Type", completed: true, current: false },
        { id: 2, label: "Upload", completed: true, current: false },
        { id: 3, label: "Options", completed: false, current: true },
        { id: 4, label: "Details", completed: false, current: false },
    ];

    useEffect(() => {
        if (!authApi.isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchUserCredits();
    }, [router]);

    const fetchUserCredits = async () => {
        try {
            const response = await generateApi.getUserCredits();
            if (response.success && response.data) {
                setUserCredits(response.data);
            }
        } catch (error) {
            // Silently ignore
        }
    };

    // Prefetch next route for smoother transition
    useEffect(() => {
        router.prefetch('/generate/details');
    }, [router]);

    const handleNextStep = () => {
        setIsExiting(true); // Start exit animation

        // Save options to localStorage
        const ecommerceOptions = {
            productViews,
            backgroundType,
            transparentBg,
            naturalShadow,
            reflection,
            platformSize,
            lightingStyle,
            numberOfImages,
        };
        localStorage.setItem('ecommerceOptions', JSON.stringify(ecommerceOptions));

        // Small delay to allow exit animation to play
        setTimeout(() => {
            router.push('/generate/details');
        }, 400);
    };

    const freeCredits = userCredits?.freeCredits ?? 1;
    const balance = userCredits?.balance ?? 12.00;

    const viewsOptions = [
        { value: "standard_4", label: "Standard (4 views)", desc: "Front, back, side & detail shots" },
        { value: "basic_2", label: "Basic (2 views)", desc: "Front & back shots" },
        { value: "premium_6", label: "Premium (6 views)", desc: "All angles + detail shots" },
        { value: "complete_8", label: "Complete (8 views)", desc: "Full 360° coverage" },
    ];

    const platformOptions = [
        { value: "marketplace_standard", label: "Marketplace Standard", desc: "Amazon / Shopify" },
        { value: "social_media", label: "Social Media", desc: "Instagram / Facebook" },
        { value: "custom", label: "Custom Size", desc: "Define your own dimensions" },
    ];

    const lightingOptions = [
        { value: "soft_studio", label: "Soft studio (Recommended)" },
        { value: "high_contrast", label: "High contrast" },
    ];

    return (
        <div className="h-screen flex overflow-hidden bg-[#f8fafc] dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
            {/* Sidebar */}
            <Sidebar activeNav="generate" />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Header */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Generate Images", href: "/generate" },
                        { label: "E-Commerce Options" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                />

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-gray-900">
                    {/* Content - Scrollable on mobile, Fixed on Desktop */}
                    <div className="flex-1 p-4 sm:p-5 overflow-y-auto lg:overflow-hidden flex flex-col">
                        <div className="flex flex-col gap-2 min-h-full lg:min-h-0 lg:h-full">
                            {/* Page Header */}
                            <div className="mb-2 shrink-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">Generate Images</h1>
                                <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-light">Upload an image and get professional variations in minutes.</p>
                            </div>

                            {/* Progress Steps - Same style as Details page */}
                            <div className="mb-2 shrink-0">
                                <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                    {/* Background line */}
                                    <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700"></div>
                                    {/* Active line */}
                                    <div className="absolute top-5 left-[16.67%] w-[33.33%] h-[2px] bg-teal-500"></div>

                                    <div className="grid grid-cols-3">
                                        {/* STEP 1 - Completed */}
                                        <div className="flex flex-col items-center cursor-pointer group">
                                            <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold transition-transform group-hover:scale-110">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            <span className="mt-2 text-xs font-bold text-teal-600 tracking-wide uppercase">TYPE</span>
                                        </div>

                                        {/* STEP 2 - Current */}
                                        <div className="flex flex-col items-center cursor-pointer group">
                                            <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold ring-4 ring-teal-500/20 transition-transform group-hover:scale-110">
                                                2
                                            </div>
                                            <span className="mt-2 text-xs font-bold text-teal-600 tracking-wide uppercase">UPLOAD</span>
                                        </div>

                                        {/* STEP 3 */}
                                        <div className="flex flex-col items-center cursor-pointer group">
                                            <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400 flex items-center justify-center font-bold transition-transform group-hover:scale-110">
                                                3
                                            </div>
                                            <span className="mt-2 text-xs font-semibold text-slate-400 dark:text-gray-500 tracking-wide uppercase">DETAILS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Card */}
                            <div className="lg:flex-1 lg:min-h-0 max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 rounded-2xl  border border-slate-200/60 dark:border-gray-700 p-3 lg:overflow-hidden">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">E-Commerce Bundle Options</h2>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
                                    {/* Left Column */}
                                    <div className="space-y-1.5">
                                        {/* Product Views */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">Product Views</label>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                                                    className="w-full flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-left hover:border-teal-400 transition-colors text-sm"
                                                >
                                                    <span className="text-slate-900 dark:text-white font-medium">
                                                        {viewsOptions.find(v => v.value === productViews)?.label}
                                                    </span>
                                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showViewsDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                                {showViewsDropdown && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                                                        {viewsOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                onClick={() => {
                                                                    setProductViews(option.value);
                                                                    setShowViewsDropdown(false);
                                                                }}
                                                                className={`w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors ${productViews === option.value ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                                                            >
                                                                <p className="font-medium text-slate-900 dark:text-white text-sm">{option.label}</p>
                                                                <p className="text-[10px] text-slate-500 dark:text-gray-400">{option.desc}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">Front, back, side & detail shots</p>
                                        </div>

                                        {/* Background */}
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">Background</label>
                                            <div className="space-y-1.5">
                                                {/* White Background */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowBgDropdown(!showBgDropdown)}
                                                        className="w-full flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-left hover:border-teal-400 transition-colors text-sm"
                                                    >
                                                        <span className="text-slate-900 dark:text-white font-medium">White</span>
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showBgDropdown ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {showBgDropdown && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                                                            {['White', 'Light gray (modern stores)', 'Gray', 'Black', 'Custom Color'].map((color) => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() => {
                                                                        setBackgroundType(color.toLowerCase());
                                                                        setShowBgDropdown(false);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors text-slate-900 dark:text-white text-sm"
                                                                >
                                                                    {color}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500 dark:text-gray-400 -mt-0.5">Download Format</p>

                                                {/* Download Format */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setShowTransparentDropdown(!showTransparentDropdown)}
                                                        className="w-full flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-left hover:border-teal-400 transition-colors text-sm"
                                                    >
                                                        <span className="text-slate-900 dark:text-white font-medium">{transparentBg === 'transparent_png' ? 'Transparent (PNG)' : 'JPG'}</span>
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showTransparentDropdown ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {showTransparentDropdown && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                                                            {[{ value: 'transparent_png', label: 'Transparent (PNG)' }, { value: 'jpg', label: 'JPG' }].map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => {
                                                                        setTransparentBg(option.value);
                                                                        setShowTransparentDropdown(false);
                                                                    }}
                                                                    className={`w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors text-slate-900 dark:text-white text-sm ${transparentBg === option.value ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Effects */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-gray-300 mb-2">
                                                <Sparkles className="w-3 h-3" />
                                                Effects
                                            </label>
                                            <div className="space-y-1.5">
                                                {/* Natural Shadow Toggle */}
                                                <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-5 rounded-full flex items-center justify-center ${naturalShadow ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-gray-600'}`}>
                                                            {naturalShadow && <Check className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Natural shadow</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setNaturalShadow(!naturalShadow)}
                                                        className={`relative w-10 h-5 rounded-full transition-colors ${naturalShadow ? 'bg-teal-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${naturalShadow ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                                                    </button>
                                                </div>

                                                {/* Reflection Toggle */}
                                                <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-5 rounded-full flex items-center justify-center ${reflection ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-gray-600'}`}>
                                                            {reflection && <Check className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Reflection</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setReflection(!reflection)}
                                                        className={`relative w-10 h-5 rounded-full transition-colors ${reflection ? 'bg-teal-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${reflection ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-1.5">
                                        {/* Platform / Image Size */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
                                                <Monitor className="w-3 h-3" />
                                                Platform / Image Size
                                            </label>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                                                    className="w-full flex items-center justify-between px-3 py-1.5 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-left hover:border-teal-400 transition-colors text-sm"
                                                >
                                                    <div>
                                                        <span className="block text-slate-900 dark:text-white font-medium text-sm">
                                                            {platformOptions.find(p => p.value === platformSize)?.label}
                                                        </span>
                                                        <span className="block text-[10px] text-slate-500 dark:text-gray-400 -mt-0.5">
                                                            {platformOptions.find(p => p.value === platformSize)?.desc}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showPlatformDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                                {showPlatformDropdown && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl shadow-lg z-10 overflow-hidden">
                                                        {platformOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                onClick={() => {
                                                                    setPlatformSize(option.value);
                                                                    setShowPlatformDropdown(false);
                                                                }}
                                                                className={`w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors ${platformSize === option.value ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                                                            >
                                                                <p className="font-medium text-slate-900 dark:text-white text-sm">{option.label}</p>
                                                                <p className="text-[10px] text-slate-500 dark:text-gray-400">{option.desc}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-gray-400">Optimized for Amazon & Shopify</p>
                                        </div>

                                        {/* Lighting Style */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-gray-300 mb-0.5">
                                                <Lightbulb className="w-3 h-3" />
                                                Lighting Style
                                            </label>
                                            <div className="space-y-1.5">
                                                {lightingOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setLightingStyle(option.value)}
                                                        className={`w-full flex items-center gap-3 p-1.5 rounded-lg border transition-all ${lightingStyle === option.value
                                                            ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 ring-1 ring-teal-200 dark:ring-teal-800'
                                                            : 'bg-slate-50 dark:bg-gray-700/50 border-transparent hover:border-slate-200 dark:hover:border-gray-600'
                                                            }`}
                                                    >
                                                        <div className={`shrink-0 size-5 rounded-full flex items-center justify-center ${lightingStyle === option.value
                                                            ? 'bg-teal-500 text-white shadow-sm'
                                                            : 'bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500'
                                                            }`}>
                                                            {lightingStyle === option.value && <Check className="w-3 h-3" />}
                                                        </div>
                                                        <div className="text-left">
                                                            <span className={`block text-xs font-medium ${lightingStyle === option.value ? 'text-teal-900 dark:text-teal-100' : 'text-slate-700 dark:text-gray-300'
                                                                }`}>
                                                                {option.label}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Transition Loader Overlay */}
                {isExiting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                            <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Loading...</p>
                        </div>
                    </motion.div>
                )}

                {/* Navigation Buttons - Fixed Footer */}
                <div className="shrink-0 px-3 py-2 bg-[#f8fafc] dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/generate/upload"
                            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>
                        <button
                            onClick={handleNextStep}
                            className="group relative flex items-center gap-2.5 bg-gradient-to-b from-slate-800 to-slate-900 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 overflow-hidden"
                        >
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none"></div>
                            <span className="relative z-10 flex items-center gap-2">
                                Next Step
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
