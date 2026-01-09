"use client";

import Link from "@/components/Link";
import { useRouter } from "@/components/useRouter";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    Bell,
    ChevronDown,
    ArrowLeft,
    ArrowRight,
    Check,
    ImageIcon,
    Grid3X3,
    Tag,
    Briefcase,
    CloudUpload,
    Loader2,
    X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { generateApi, GenerateFormData, CategoryOption, UserCredits } from "@/lib/generate";
import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";
import AILoader from "@/components/AILoader";

export default function DetailsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state - matching backend API
    const [generationType, setGenerationType] = useState<"single_image" | "batch_image">("single_image");
    const [businessCategory, setBusinessCategory] = useState("");
    const [brandName, setBrandName] = useState("");
    const [brandLogo, setBrandLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [instagramUsername, setInstagramUsername] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");

    // Model settings
    const [modelId, setModelId] = useState("studio_pro");
    const [modelCategory, setModelCategory] = useState("portrait");
    const [modelStyle, setModelStyle] = useState("professional");

    // Output settings
    const [imageCount, setImageCount] = useState(4);
    const [resolution, setResolution] = useState("1024x1024");
    const [format, setFormat] = useState("png");
    const [background, setBackground] = useState("studio");

    // Uploaded file ID from upload step
    const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);

    // API state
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Uploaded image for loader background
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    // User profile state
    const [userName, setUserName] = useState("Jane");
    const [userInitial, setUserInitial] = useState("J");

    // Load generation type and uploaded image from previous step
    useEffect(() => {
        const savedType = localStorage.getItem("generateType");
        if (savedType === "single_image" || savedType === "batch_image") {
            setGenerationType(savedType);
        }

        // Load uploaded image for loader background
        const savedImagePreview = localStorage.getItem("uploadedImage");
        if (savedImagePreview) {
            setUploadedImageUrl(savedImagePreview);
        }

        // Load uploaded file ID from upload step
        const savedFileId = localStorage.getItem("uploadedFileId");
        if (savedFileId) {
            setUploadedFileId(savedFileId);
        }
    }, []);

    // Fetch categories and user credits on mount
    useEffect(() => {
        // Load user from localStorage
        const storedUser = authApi.getCurrentUser();
        if (storedUser && storedUser.fullName) {
            const firstName = storedUser.fullName.split(' ')[0];
            setUserName(firstName);
            setUserInitial(firstName.charAt(0).toUpperCase());
        }

        fetchCategories();
        fetchUserCredits();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await generateApi.getCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.warn('Failed to fetch categories:', error);
        }
    };

    const fetchUserCredits = async () => {
        try {
            const response = await generateApi.getUserCredits();
            if (response.success && response.data) {
                setUserCredits(response.data);
            }
        } catch (error) {
            console.warn('Failed to fetch user credits:', error);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBrandLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setBrandLogo(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Get current user for user_id
            const currentUser = authApi.getCurrentUser();
            const userId = currentUser?.id || 'unknown';

            // Build form data matching backend API format
            const formData: GenerateFormData = {
                generationType: generationType,
                uploadType: 'file',
                fileId: uploadedFileId || undefined,
                modelId: modelId,
                modelCategory: modelCategory,
                modelStyle: modelStyle,
                businessCategory: businessCategory || 'business',
                brandName: brandName || 'My Brand',
                imageCount: imageCount,
                resolution: resolution,
                format: format,
                background: background,
            };

            // Call API with user info
            const response = await generateApi.generateImages(formData, userId, 'free');

            if (response.success && response.data) {
                // Store job ID and redirect to gallery or processing page
                localStorage.setItem('lastJobId', response.data.jobId);
                router.push('/gallery');
            } else {
                setError(response.error || 'Failed to generate images');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fallback categories if API fails
    const displayCategories = categories.length > 0 ? categories : [
        { value: "ecommerce", label: "E-commerce & Retail" },
        { value: "realestate", label: "Real Estate" },
        { value: "food", label: "Food & Beverage" },
        { value: "tech", label: "Technology & SaaS" },
    ];

    // User credits display values (fallback)
    const freeCredits = userCredits?.freeCredits ?? 1;
    const balance = userCredits?.balance ?? 12.00;

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate", active: true },
        { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
        { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
        { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    ];

    return (
        <>
            {/* AI Loader - Shows when generating */}
            <AILoader
                isLoading={isSubmitting}
                text="Generating your images..."
            />

            <div className="h-screen flex overflow-hidden bg-[#f8fafc] dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
                {/* Reusable Sidebar */}
                <Sidebar activeNav="generate" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    {/* Reusable Header with dynamic breadcrumbs */}
                    <Header
                        breadcrumbs={[
                            { label: "Home", href: "/?view=landing" },
                            { label: "Generate", href: "/generate" },
                            { label: "Details" }
                        ]}
                        freeCredits={freeCredits}
                        balance={balance}
                    />

                    {/* Main Content Area */}
                    <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-gray-900">
                        {/* Content - No Scroll */}
                        <div className="flex-1 p-4 sm:p-5 overflow-hidden flex flex-col">
                            <div className="flex flex-col gap-2 h-full">
                                {/* Page Header */}
                                <div className="mb-2 shrink-0">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">Generate Images</h1>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-light">Upload an image and get professional variations in minutes.</p>
                                </div>

                                {/* Progress Steps - Same style as Upload page */}
                                <div className="mb-3 sm:mb-4 shrink-0">
                                    <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                        {/* Background line */}
                                        <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700"></div>
                                        {/* Active line (all segments) */}
                                        <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-teal-500"></div>

                                        <div className="grid grid-cols-3">
                                            {/* STEP 1 - Completed */}
                                            <div className="flex flex-col items-center cursor-pointer group">
                                                <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold transition-transform group-hover:scale-110">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                                <span className="mt-2 text-xs font-bold text-teal-600 tracking-wide uppercase">
                                                    TYPE
                                                </span>
                                            </div>

                                            {/* STEP 2 - Completed */}
                                            <div className="flex flex-col items-center cursor-pointer group">
                                                <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold transition-transform group-hover:scale-110">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                                <span className="mt-2 text-xs font-bold text-teal-600 tracking-wide uppercase">
                                                    UPLOAD
                                                </span>
                                            </div>

                                            {/* STEP 3 - Current Active */}
                                            <div className="flex flex-col items-center cursor-pointer group">
                                                <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold ring-4 ring-teal-500/20 transition-transform group-hover:scale-110">
                                                    3
                                                </div>
                                                <span className="mt-2 text-xs font-bold text-teal-600 tracking-wide uppercase">
                                                    DETAILS
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1 min-h-0 flex flex-col">
                                    <div className="p-3 sm:p-4 flex flex-col gap-2 overflow-hidden flex-1">
                                        {/* Image Type & Category Selection - Side by Side */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {/* Image Type */}
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <h2 className="text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5">
                                                    <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    Image Type
                                                </h2>
                                                <div
                                                    onMouseEnter={() => setGenerationType("single_image")}
                                                    onClick={() => setGenerationType("single_image")}
                                                    className={`group relative flex items-center gap-2 p-3 rounded-lg text-left transition-all cursor-pointer ${generationType === "single_image"
                                                        ? "border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                                        : "border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                                                        }`}
                                                >
                                                    <div className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${generationType === "single_image"
                                                        ? "bg-white dark:bg-gray-800 text-teal-500 shadow-sm"
                                                        : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:text-teal-500 group-hover:shadow-sm"
                                                        }`}>
                                                        <ImageIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 dark:text-white font-bold text-xs">Single Image</span>
                                                        <span className="text-gray-500 dark:text-gray-400 text-[9px]">Generate from a single source.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Category Selection */}
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <h2 className="text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                                                    Category
                                                </h2>
                                                <div className="relative">
                                                    <select
                                                        value={businessCategory}
                                                        onChange={(e) => setBusinessCategory(e.target.value)}
                                                        className="w-full h-[52px] pl-4 pr-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-400/20 focus:shadow-md appearance-none transition-all text-sm font-medium cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm"
                                                    >
                                                        <option value="">Select category...</option>
                                                        {displayCategories.map((cat) => (
                                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Business Info & Branding */}
                                        <div className="flex flex-col gap-1.5">
                                            <div>
                                                <h2 className="text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                    Business Info & Branding
                                                </h2>
                                                <p className="text-gray-500 dark:text-gray-400 text-[10px]">Provide your brand details to customize the generated assets.</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                    {/* Logo Upload */}
                                                    <div className="sm:col-span-1 flex flex-col gap-1">
                                                        <label className="text-gray-700 dark:text-gray-300 text-[9px] font-medium">Brand Logo</label>
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept=".svg,.png,.jpg,.jpeg"
                                                            onChange={handleLogoUpload}
                                                            className="hidden"
                                                        />
                                                        {logoPreview ? (
                                                            <div className="flex-1 min-h-[60px] bg-white dark:bg-gray-800 border-2 border-teal-500 rounded-lg flex flex-col items-center justify-center p-2 relative">
                                                                <img src={logoPreview} alt="Logo preview" className="max-h-12 max-w-full object-contain" />
                                                                <button
                                                                    onClick={removeLogo}
                                                                    className="absolute top-1.5 right-1.5 size-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="flex-1 min-h-[60px] bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-2 text-center hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all cursor-pointer group"
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-1 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 transition-colors">
                                                                    <CloudUpload className="w-3 h-3 text-gray-400 group-hover:text-teal-500 transition-colors" />
                                                                </div>
                                                                <p className="text-gray-900 dark:text-white text-[9px] font-medium">Click to upload</p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-[8px]">SVG, PNG, JPG</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Form Fields - Column Layout */}
                                                    <div className="sm:col-span-1 lg:col-span-3 flex flex-col gap-2 max-w-sm">
                                                        {/* Brand Name - First */}
                                                        <div>
                                                            <label className="block text-gray-700 dark:text-gray-300 text-[10px] font-medium mb-0.5">Brand Name</label>
                                                            <input
                                                                value={brandName}
                                                                onChange={(e) => setBrandName(e.target.value)}
                                                                className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-xs"
                                                                placeholder="e.g. Acme Corp"
                                                                type="text"
                                                            />
                                                        </div>
                                                        {/* Instagram Username - Second */}
                                                        <div>
                                                            <label className="block text-gray-700 dark:text-gray-300 text-[10px] font-medium mb-0.5">Instagram Username</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-gray-400 pointer-events-none text-xs">@</span>
                                                                <input
                                                                    value={instagramUsername}
                                                                    onChange={(e) => setInstagramUsername(e.target.value)}
                                                                    className="w-full h-8 pl-6 pr-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-xs"
                                                                    placeholder="username"
                                                                    type="text"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Website URL - Third */}
                                                        <div>
                                                            <label className="block text-gray-700 dark:text-gray-300 text-[10px] font-medium mb-0.5">Website URL</label>
                                                            <input
                                                                value={websiteUrl}
                                                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                                                className="w-full h-8 px-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-xs"
                                                                placeholder="https://"
                                                                type="url"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons - Fixed Footer */}
                        <div className="shrink-0 px-5 py-2 bg-[#f8fafc] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                            {error && (
                                <div className="mb-2 p-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[10px] text-center">
                                    {error}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/generate/upload"
                                    className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Link>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            Generate
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

