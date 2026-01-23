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
} from "lucide-react";
import { useState, useEffect } from "react";
import { authApi } from "@/lib/auth";
import { generateApi, BundleOptionsData, BundleOption, BundleEffects } from "@/lib/generate";
import { Sidebar, Header } from "@/components/layout";

// Module-level caching
let globalBundlePromise: Promise<any> | null = null;

export default function EcommerceOptionsPage() {
    const router = useRouter();


    // Form state
    const [productViews, setProductViews] = useState("standard_4");
    const [backgroundType, setBackgroundType] = useState("white");
    const [transparentBg, setTransparentBg] = useState("transparent_png");
    const [naturalShadow, setNaturalShadow] = useState(true);
    const [reflection, setReflection] = useState(false);
    const [platformSize, setPlatformSize] = useState("marketplace_standard");
    const [lightingStyle, setLightingStyle] = useState("soft_studio");

    // Dropdown states
    const [showViewsDropdown, setShowViewsDropdown] = useState(false);
    const [showBgDropdown, setShowBgDropdown] = useState(false);
    const [showTransparentDropdown, setShowTransparentDropdown] = useState(false);
    const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
    const [showLightingDropdown, setShowLightingDropdown] = useState(false);

    // Bundle options from API
    const [bundleOptions, setBundleOptions] = useState<BundleOptionsData | null>(null);
    const [bundleEffects, setBundleEffects] = useState<BundleEffects | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const steps = [
        { id: 1, label: "Type", completed: true, current: false },
        { id: 2, label: "Upload", completed: false, current: true },
        { id: 3, label: "Details", completed: false, current: false },
    ];

    // Module-level cache for the active fetch request to prevent duplicates
    // and ensure data loads even if component remounts immediately (Strict Mode)

    useEffect(() => {
        console.log('[Bundle Options] Page mounted, checking auth...');

        if (!authApi.isAuthenticated()) {
            console.log('[Bundle Options] Not authenticated, redirecting to login');
            router.push('/login');
            return;
        }

        console.log('[Bundle Options] Authenticated, fetching options...');
        // Reset cached promise to force fresh API call (useful for debugging)
        globalBundlePromise = null;

        fetchBundleOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch bundle options from API
    const fetchBundleOptions = async () => {
        // Prevent duplicate calls - if already loaded, skip
        if (bundleOptions !== null) {
            console.log('[Bundle Options] Already loaded, skipping API call');
            return;
        }

        setIsLoading(true);
        try {
            // Use existing promise or create new one (prevents duplicate API calls)
            if (!globalBundlePromise) {
                console.log('[Bundle Options] Calling API: /generate/bundle-options');
                globalBundlePromise = generateApi.getBundleOptions();
            } else {
                console.log('[Bundle Options] Using cached promise, no new API call');
            }

            const response = await globalBundlePromise;

            // Log full response to console
            console.log('[Bundle Options] API Response:', response);

            if (response.success && response.data && response.data.data) {
                console.log('[Bundle Options] Data loaded successfully:', {
                    product_views: response.data.data.product_views?.length || 0,
                    background: response.data.data.background?.length || 0,
                    format: response.data.data.format?.length || 0,
                    platform: response.data.data.platform?.length || 0,
                    lighting: response.data.data.lighting?.length || 0,
                    effects: response.data.effects
                });

                setBundleOptions(response.data.data);
                setBundleEffects(response.data.effects);

                // Set defaults from API
                const data = response.data.data;

                const defaultView = data.product_views.find((v: any) => v.is_default);
                if (defaultView) {
                    setProductViews(defaultView.id);
                    console.log('[Bundle Options] Default product_views:', defaultView.id);
                }

                const defaultBg = data.background.find((b: any) => b.is_default);
                if (defaultBg) {
                    setBackgroundType(defaultBg.id);
                    console.log('[Bundle Options] Default background:', defaultBg.id);
                }

                const defaultFormat = data.format.find((f: any) => f.is_default);
                if (defaultFormat) {
                    setTransparentBg(defaultFormat.id);
                    console.log('[Bundle Options] Default format:', defaultFormat.id);
                }

                const defaultPlatform = data.platform.find((p: any) => p.is_default);
                if (defaultPlatform) {
                    setPlatformSize(defaultPlatform.id);
                    console.log('[Bundle Options] Default platform:', defaultPlatform.id);
                }

                const defaultLighting = data.lighting.find((l: any) => l.is_default);
                if (defaultLighting) {
                    setLightingStyle(defaultLighting.id);
                    console.log('[Bundle Options] Default lighting:', defaultLighting.id);
                }

                // Set effects
                if (response.data.effects) {
                    setNaturalShadow(response.data.effects.natural_shadow?.default ?? true);
                    setReflection(response.data.effects.reflection?.default ?? false);
                    console.log('[Bundle Options] Effects set:', {
                        natural_shadow: response.data.effects.natural_shadow?.default,
                        reflection: response.data.effects.reflection?.default
                    });
                }
            } else {
                console.warn('[Bundle Options] API returned unsuccessful or empty response:', response);
            }
        } catch (error) {
            console.error('[Bundle Options] Failed to fetch:', error);
            globalBundlePromise = null; // Reset on error to allow retry
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextStep = () => {
        // Save options to localStorage
        const ecommerceOptions = {
            productViews,
            backgroundType,
            transparentBg,
            naturalShadow,
            reflection,
            platformSize,
            lightingStyle,
        };
        localStorage.setItem('ecommerceOptions', JSON.stringify(ecommerceOptions));
        router.push('/generate/details');
    };



    // Fallback options if API fails
    const fallbackViewsOptions: BundleOption[] = [
        { id: "views_standard", name: "Standard (4 views)", description: "Front, back, side & detail shots", is_default: true },
        { id: "views_basic", name: "Basic (2 views)", description: "Front & back shots", is_default: false },
        { id: "views_extended", name: "Extended (6 views)", description: "All angles + detail shots", is_default: false },
    ];

    const fallbackPlatformOptions: BundleOption[] = [
        { id: "platform_marketplace", name: "Marketplace Standard", description: "Amazon / Shopify", is_default: true },
        { id: "platform_social", name: "Social Media", description: "Instagram / Facebook", is_default: false },
    ];

    const fallbackLightingOptions: BundleOption[] = [
        { id: "lighting_soft", name: "Soft Studio (Recommended)", is_default: true },
        { id: "lighting_high_contrast", name: "High Contrast", is_default: false },
    ];

    const fallbackBackgroundOptions: BundleOption[] = [
        { id: "bg_white", name: "White", description: "Pure white background", is_default: true },
        { id: "bg_gray", name: "Light Gray", description: "Modern stores", is_default: false },
        { id: "bg_transparent", name: "Transparent", description: "Cutout background", is_default: false },
    ];

    const fallbackFormatOptions: BundleOption[] = [
        { id: "format_png_transparent", name: "Transparent (PNG)", is_default: true },
        { id: "format_jpg", name: "JPG", is_default: false },
    ];

    // Use API data or fallbacks
    const viewsOptions = bundleOptions?.product_views || fallbackViewsOptions;
    const platformOptions = bundleOptions?.platform || fallbackPlatformOptions;
    const lightingOptions = bundleOptions?.lighting || fallbackLightingOptions;
    const backgroundOptions = bundleOptions?.background || fallbackBackgroundOptions;
    const formatOptions = bundleOptions?.format || fallbackFormatOptions;

    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden bg-[#f8fafc] dark:bg-gray-900 antialiased transition-colors duration-300">
            <div className="flex flex-1 min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden">
                {/* Sidebar */}
                <Sidebar activeNav="generate" />

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 min-w-0 bg-[#f8fafc] dark:bg-gray-900 overflow-x-hidden lg:overflow-hidden transition-colors duration-300">
                    {/* Header */}
                    <Header
                        breadcrumbs={[
                            { label: "Home", href: "/?view=landing" },
                            { label: "Generate Images", href: "/generate" },
                            { label: "E-Commerce Options" }
                        ]}
                        disableWalletFetch={true}
                    />

                    {/* Main Content */}
                    <main className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-gray-900">
                        {/* Content - No Scroll */}
                        {/* Content & Form Container */}
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                            <div className="flex-1 flex flex-col gap-2 p-4 sm:p-5 min-h-0">
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

                                {/* Main Content Card - Scrollable */}
                                <div className="flex-1 min-h-0 max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/60 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5">
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-gray-700/50">
                                            <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">E-Commerce Bundle Options</h2>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                                {/* Product Views */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1.5">
                                                        <Layers className="w-3.5 h-3.5 text-teal-500" />
                                                        Product Views
                                                    </label>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                                                            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-left hover:border-teal-500 dark:hover:border-teal-500 transition-all focus:ring-2 focus:ring-teal-500/20 group"
                                                        >
                                                            <span className="text-slate-900 dark:text-white font-semibold text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                                {viewsOptions.find(v => v.id === productViews)?.name}
                                                            </span>
                                                            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-transform duration-300 ${showViewsDropdown ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {showViewsDropdown && (
                                                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                                    {viewsOptions.map((option) => (
                                                                        <button
                                                                            key={option.id}
                                                                            onClick={() => {
                                                                                setProductViews(option.id);
                                                                                setShowViewsDropdown(false);
                                                                            }}
                                                                            className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors border-b border-slate-50 dark:border-gray-700/50 last:border-0 ${productViews === option.id ? 'bg-teal-50/60 dark:bg-teal-900/10' : ''}`}
                                                                        >
                                                                            <p className={`font-semibold text-sm ${productViews === option.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{option.name}</p>
                                                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{option.description}</p>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Background */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1.5">
                                                        <Images className="w-3.5 h-3.5 text-teal-500" />
                                                        Background
                                                    </label>
                                                    <div className="space-y-3">
                                                        {/* Background Selection */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setShowBgDropdown(!showBgDropdown)}
                                                                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-left hover:border-teal-500 dark:hover:border-teal-500 transition-all focus:ring-2 focus:ring-teal-500/20 group"
                                                            >
                                                                <span className="text-slate-900 dark:text-white font-semibold text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                                    {backgroundOptions.find(b => b.id === backgroundType)?.name || 'White'}
                                                                </span>
                                                                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-transform duration-300 ${showBgDropdown ? 'rotate-180' : ''}`} />
                                                            </button>
                                                            {showBgDropdown && (
                                                                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                                                                    {backgroundOptions.map((option) => (
                                                                        <button
                                                                            key={option.id}
                                                                            onClick={() => {
                                                                                setBackgroundType(option.id);
                                                                                setShowBgDropdown(false);
                                                                            }}
                                                                            className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors border-b border-slate-50 dark:border-gray-700/50 last:border-0 ${backgroundType === option.id ? 'bg-teal-50/60 dark:bg-teal-900/10' : ''}`}
                                                                        >
                                                                            <span className={`font-semibold text-sm ${backgroundType === option.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{option.name}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Download Format */}
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-1.5 ml-1">Download Format</label>
                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => setShowTransparentDropdown(!showTransparentDropdown)}
                                                                    className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-left hover:border-teal-500 dark:hover:border-teal-500 transition-all focus:ring-2 focus:ring-teal-500/20 group"
                                                                >
                                                                    <span className="text-slate-900 dark:text-white font-semibold text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                                        {formatOptions.find(f => f.id === transparentBg)?.name || 'Transparent (PNG)'}
                                                                    </span>
                                                                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-transform duration-300 ${showTransparentDropdown ? 'rotate-180' : ''}`} />
                                                                </button>
                                                                {showTransparentDropdown && (
                                                                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                                                                        {formatOptions.map((option) => (
                                                                            <button
                                                                                key={option.id}
                                                                                onClick={() => {
                                                                                    setTransparentBg(option.id);
                                                                                    setShowTransparentDropdown(false);
                                                                                }}
                                                                                className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors border-b border-slate-50 dark:border-gray-700/50 last:border-0 ${transparentBg === option.id ? 'bg-teal-50/60 dark:bg-teal-900/10' : ''}`}
                                                                            >
                                                                                <span className={`font-semibold text-sm ${transparentBg === option.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{option.name}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Effects */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                                                        Effects
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {/* Natural Shadow Toggle */}
                                                        <div
                                                            onClick={() => setNaturalShadow(!naturalShadow)}
                                                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${naturalShadow
                                                                ? 'bg-teal-50/50 border-teal-200 dark:bg-teal-900/10 dark:border-teal-900/30'
                                                                : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`size-5 rounded-full flex items-center justify-center transition-colors ${naturalShadow ? 'bg-teal-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-gray-700 text-slate-300'}`}>
                                                                    {naturalShadow && <Check className="w-3 h-3" />}
                                                                </div>
                                                                <span className={`text-xs font-semibold ${naturalShadow ? 'text-teal-900 dark:text-teal-100' : 'text-slate-600 dark:text-gray-400'}`}>Natural shadow</span>
                                                            </div>
                                                            <div className={`relative w-8 h-4.5 rounded-full transition-colors duration-300 ${naturalShadow ? 'bg-teal-500' : 'bg-slate-200 dark:bg-gray-600'}`}>
                                                                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${naturalShadow ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                                                            </div>
                                                        </div>

                                                        {/* Reflection Toggle */}
                                                        <div
                                                            onClick={() => setReflection(!reflection)}
                                                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${reflection
                                                                ? 'bg-teal-50/50 border-teal-200 dark:bg-teal-900/10 dark:border-teal-900/30'
                                                                : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`size-5 rounded-full flex items-center justify-center transition-colors ${reflection ? 'bg-teal-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-gray-700 text-slate-300'}`}>
                                                                    {reflection && <Check className="w-3 h-3" />}
                                                                </div>
                                                                <span className={`text-xs font-semibold ${reflection ? 'text-teal-900 dark:text-teal-100' : 'text-slate-600 dark:text-gray-400'}`}>Reflection</span>
                                                            </div>
                                                            <div className={`relative w-8 h-4.5 rounded-full transition-colors duration-300 ${reflection ? 'bg-teal-500' : 'bg-slate-200 dark:bg-gray-600'}`}>
                                                                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${reflection ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                                {/* Platform / Image Size */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1.5">
                                                        <Monitor className="w-3.5 h-3.5 text-teal-500" />
                                                        Platform / Image Size
                                                    </label>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                                                            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-left hover:border-teal-500 dark:hover:border-teal-500 transition-all focus:ring-2 focus:ring-teal-500/20 group"
                                                        >
                                                            <div className="flex-1">
                                                                <span className="block text-slate-900 dark:text-white font-semibold text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                                    {platformOptions.find(p => p.id === platformSize)?.name}
                                                                </span>
                                                                <span className="block text-xs text-slate-500 dark:text-gray-400 mt-0.5 font-medium">
                                                                    {platformOptions.find(p => p.id === platformSize)?.description}
                                                                </span>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-transform duration-300 ${showPlatformDropdown ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {showPlatformDropdown && (
                                                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                                    {platformOptions.map((option) => (
                                                                        <button
                                                                            key={option.id}
                                                                            onClick={() => {
                                                                                setPlatformSize(option.id);
                                                                                setShowPlatformDropdown(false);
                                                                            }}
                                                                            className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors border-b border-slate-50 dark:border-gray-700/50 last:border-0 ${platformSize === option.id ? 'bg-teal-50/60 dark:bg-teal-900/10' : ''}`}
                                                                        >
                                                                            <p className={`font-semibold text-sm ${platformSize === option.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{option.name}</p>
                                                                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{option.description}</p>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Lighting Style */}
                                                <div>
                                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-1.5">
                                                        <Lightbulb className="w-3.5 h-3.5 text-teal-500" />
                                                        Lighting Style
                                                    </label>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowLightingDropdown(!showLightingDropdown)}
                                                            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-left hover:border-teal-500 dark:hover:border-teal-500 transition-all focus:ring-2 focus:ring-teal-500/20 group"
                                                        >
                                                            <span className="text-slate-900 dark:text-white font-semibold text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                                {lightingOptions.find(l => l.id === lightingStyle)?.name}
                                                            </span>
                                                            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-transform duration-300 ${showLightingDropdown ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        {showLightingDropdown && (
                                                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                                    {lightingOptions.map((option) => (
                                                                        <button
                                                                            key={option.id}
                                                                            onClick={() => {
                                                                                setLightingStyle(option.id);
                                                                                setShowLightingDropdown(false);
                                                                            }}
                                                                            className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors border-b border-slate-50 dark:border-gray-700/50 last:border-0 ${lightingStyle === option.id ? 'bg-teal-50/60 dark:bg-teal-900/10' : ''}`}
                                                                        >
                                                                            <p className={`font-semibold text-sm ${lightingStyle === option.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>{option.name}</p>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Buttons - Footer */}
                            <div className="shrink-0 px-5 py-0.5 bg-[#f8fafc] dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <Link
                                        href="/generate"
                                        className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back
                                    </Link>
                                    <button
                                        onClick={handleNextStep}
                                        className="group relative flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3 rounded-full font-medium text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 overflow-hidden ring-1 ring-white/10"
                                    >
                                        {/* Top Highlight */}
                                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-70"></div>

                                        {/* Bottom Shadow/Highlight */}
                                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/40 to-transparent"></div>

                                        <span className="relative z-10 flex items-center gap-2.5">
                                            <span className="tracking-wide">Next Step</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}