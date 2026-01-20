"use client";

import Link from "@/components/Link";
import { useRouter } from "next/navigation";
import {
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
    Plus,
    ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { generateApi, GenerateFormData, Category, ModelPreset, BundleOptionsPayload } from "@/lib/generate";
import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";
import AILoader from "@/components/AILoader";
import { navigationState } from "@/lib/navigationState";

// Fallback model presets when API fails
const fallbackModelPresets: ModelPreset[] = [
    { id: "f_professional", name: "Professional Woman", description: "Natural-looking professional woman for business wear", prompt_description: "", gender: "female", age_range: "young", style: "professional", thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoJOWZv8vNa6RFDGdXnIvLaH1_pdkuYu-Agf7KHBV7dZLL6lcg3dEQbFGXKIlQS8k254SLSMGmiUvXsfxyiyDIShg3_S6o7I3rlYsqBKUCj0VB_EMEh1TtDXrCHQ2qPuJBNBAlw608JzNFnmiHNT23G9GauVMPNytrEt2AeIBiMWrVSotyFe9LHsUqOn6t6aFqPb2D7o50F3IXGSt3vaBD8clHz2Y-RHF2ndjeX1nOgYAyCbzu3eIVNWJemxHa-bj9mZ80mTFKQGcp" },
    { id: "m_professional", name: "Professional Man", description: "Natural-looking professional man for business wear", prompt_description: "", gender: "male", age_range: "young", style: "professional", thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpG9rDTml0LTJBFVE5t-U0Omgfb3Tw_BE6o52TdSubE-ysc2NDMpXscqBfiyX2KhpE4RoQ6kBC_Dj2vXNAi_fu_xtmOkXF6EM-fAPGHyaHdbCY9wbfrpGtB--He0zEzAFos5unfLFbQZ2V7kYoSytJIvUrjKL3kKOKdxJHfKr32yJtZUnWg_INO1zRvni1fcNR4nPd66JVMNwnvLhtySvbEFZrz8oqbqn-FausNQF0ldgK9O-tvkJWojn698Nu5EXkW2GRm2dnNA-" },
    { id: "f_casual", name: "Casual Woman", description: "Natural casual woman for everyday wear", prompt_description: "", gender: "female", age_range: "young", style: "casual", thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9ACO1yIxW2Q7hu0tsE3eHwUUyjVd3HyZErsD7Ap3NW63vnNqc8gOdANW1nzeQVqympPmOP2inFzBfiXvwhVGE3xpqCC1irVol8sqcNER4J-SZyXKkJDH3nNE8b2i_PkFaHMI-Hx9D0fjiEAm8dy4rzuJsRf7Zng4ZKT-oa7BjWqQF5CofzFaMSlBuoMUlJQOy3x92VoZ4R0oYRHLXUUv1wmYczzDtfp5A4PFZE2L1XvSmtqI8m4aEM2I8r8jHvsFZvvGnOiWHGwr" },
    { id: "m_athletic", name: "Athletic Man", description: "Natural fit man for sports and fitness wear", prompt_description: "", gender: "male", age_range: "young", style: "athletic", thumbnail: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1u8i7swl0DmbulakI3kpCNdVj7fB698D3HvZ_xJESOKhpQaYDaUNljdmhCvBCgWQ5XkV9oemtOMlPedi_cxlTr1Ec01YU4ytL0Pfzlg__0ERYd0znaAyjeTyIen3w4zaMUwW38VaAT5aaGg0pzAVeLmFGhu_gYQOXRKOg-Gf2EWxKsWZDB6nkY7O3aGrjB3jNlfeAlweHLdEIKlDr4ylvItyL_FHfrnySOHlrFVtk1NIu0n817Dc7E5MPGfVnIz0gcWHcG5_zRevL" },
];

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
    const [categories, setCategories] = useState<Category[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Uploaded image for loader background
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    // User profile state
    const [userName, setUserName] = useState("Jane");
    const [userInitial, setUserInitial] = useState("J");

    // Selected model preset for categories with show_model: true
    const [selectedModelPreset, setSelectedModelPreset] = useState<string | null>(null);

    // Model presets from API
    const [modelPresets, setModelPresets] = useState<ModelPreset[]>([]);
    const [modelPresetsLoading, setModelPresetsLoading] = useState(false);

    // Filter states for model presets
    const [genderFilter, setGenderFilter] = useState<'female' | 'male' | 'unisex' | 'all'>('all');
    const [styleFilter, setStyleFilter] = useState<'professional' | 'casual' | 'athletic' | 'elegant' | 'diverse' | 'all'>('all');


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

    // Load ecommerce bundle options from localStorage (for batch_image)
    const [savedBundleOptions, setSavedBundleOptions] = useState<any>(null);

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

        // Load ecommerce options for batch_image
        const ecommerceOptionsStr = localStorage.getItem("ecommerceOptions");
        if (ecommerceOptionsStr) {
            try {
                const ecommerceOptions = JSON.parse(ecommerceOptionsStr);
                setSavedBundleOptions(ecommerceOptions);
            } catch (e) {
                console.warn('Failed to parse ecommerce options:', e);
            }
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

    }, []);

    const fetchCategories = async () => {
        try {
            const response = await generateApi.getCategories();
            if (response.success && response.data && response.data.data) {
                // Extract the categories array from the CategoriesResponse
                setCategories(response.data.data);
            }
        } catch (error) {
            console.warn('Failed to fetch categories:', error);
        }
    };



    // Fetch model presets from API
    const fetchModelPresets = async () => {
        setModelPresetsLoading(true);
        try {
            const response = await generateApi.getModelPresets({
                gender: genderFilter,
                style: styleFilter
            });
            if (response.success && response.data && response.data.data) {
                setModelPresets(response.data.data);
                // Auto-select first preset if none selected
                if (!selectedModelPreset && response.data.data.length > 0) {
                    setSelectedModelPreset(response.data.data[0].id);
                }
            } else {
                // Use fallback presets if API fails - filter by gender and style
                const filteredFallbacks = filterFallbackPresets(fallbackModelPresets, genderFilter, styleFilter);
                setModelPresets(filteredFallbacks);
                // Auto-select first if available
                if (!selectedModelPreset && filteredFallbacks.length > 0) {
                    setSelectedModelPreset(filteredFallbacks[0].id);
                }
            }
        } catch (error) {
            console.warn('Failed to fetch model presets:', error);
            // Use fallback presets - filter by gender and style
            const filteredFallbacks = filterFallbackPresets(fallbackModelPresets, genderFilter, styleFilter);
            setModelPresets(filteredFallbacks);
            if (!selectedModelPreset && filteredFallbacks.length > 0) {
                setSelectedModelPreset(filteredFallbacks[0].id);
            }
        } finally {
            setModelPresetsLoading(false);
        }
    };

    // Helper function to filter fallback presets by gender and style
    const filterFallbackPresets = (
        presets: ModelPreset[],
        gender: 'female' | 'male' | 'unisex' | 'all',
        style: 'professional' | 'casual' | 'athletic' | 'elegant' | 'diverse' | 'all'
    ): ModelPreset[] => {
        return presets.filter(preset => {
            // Filter by gender
            const genderMatch = gender === 'all' || preset.gender === gender;
            // Filter by style
            const styleMatch = style === 'all' || preset.style === style;
            return genderMatch && styleMatch;
        });
    };

    // Fetch model presets when component mounts or filters change
    useEffect(() => {
        fetchModelPresets();
    }, [genderFilter, styleFilter]);

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

    // Helper to convert data URL to File
    const dataURLtoFile = (dataurl: string, filename: string) => {
        try {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        } catch (e) {
            console.error("Error converting data URL to file:", e);
            return undefined;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Get selected category to check show_model
            const selectedCategory = displayCategories.find(c => c.id === businessCategory);
            const shouldShowModel = selectedCategory?.show_model || false;

            // Build bundle options for batch_image (E-commerce bundle)
            let bundleOptionsPayload: BundleOptionsPayload | undefined = undefined;
            if (generationType === 'batch_image' && savedBundleOptions) {
                bundleOptionsPayload = {
                    product_views: savedBundleOptions.productViews || 'views_standard',
                    background: savedBundleOptions.backgroundType || 'bg_white',
                    format: savedBundleOptions.transparentBg || 'format_png_transparent',
                    platform: savedBundleOptions.platformSize || 'platform_marketplace',
                    lighting: savedBundleOptions.lightingStyle || 'lighting_soft',
                    effects: {
                        natural_shadow: savedBundleOptions.naturalShadow ?? true,
                        reflection: savedBundleOptions.reflection ?? false,
                    },
                    image_count: parseInt(savedBundleOptions.numberOfImages) || imageCount,
                };
            }

            // Convert uploaded image URL to File object if available
            let imageFile: File | undefined = undefined;
            if (uploadedImageUrl) {
                imageFile = dataURLtoFile(uploadedImageUrl, "input_image.png");
            }

            // Build form data matching new backend API format
            const formData: GenerateFormData = {
                generationType: generationType,
                uploadType: 'file',
                fileId: uploadedFileId || undefined,
                imageFile: imageFile,
                modelId: modelId,
                modelCategory: businessCategory || 'clothes',
                modelStyle: modelStyle,
                businessCategory: businessCategory || 'clothes',
                brandName: brandName || '',
                imageCount: imageCount,
                resolution: resolution,
                format: format,
                background: background,
                // New API fields
                humanModelPreset: shouldShowModel ? (selectedModelPreset || undefined) : undefined,
                showModel: shouldShowModel,
                instagramUsername: instagramUsername || undefined,
                websiteUrl: websiteUrl || undefined,
                // Bundle options for batch generation
                bundleOptions: bundleOptionsPayload,
            };

            // Call API
            const response = await generateApi.generateImages(formData);

            if (response.success && response.data) {
                // Store request ID
                if (response.data.data?.request_id) {
                    localStorage.setItem('lastRequestId', response.data.data.request_id);
                }
                // Store complete response for result page to display generated images
                localStorage.setItem('generatedResult', JSON.stringify(response.data));
                // Redirect to result page (user can then go to gallery from there)
                router.push('/generate/result');
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
    const displayCategories: Category[] = categories.length > 0 ? categories : [
        { id: "clothes", name: "Clothes & Apparel", description: "T-shirts, shirts, dresses, pants, etc.", show_model: true, recommended_model: "portrait_master", icon: null },
        { id: "furniture", name: "Furniture", description: "Chairs, tables, sofas, etc.", show_model: false, recommended_model: "interior_design", icon: null },
        { id: "electronics", name: "Electronics", description: "Phones, laptops, gadgets, etc.", show_model: false, recommended_model: "product_studio", icon: null },
        { id: "food", name: "Food & Beverage", description: "Food items, drinks, etc.", show_model: false, recommended_model: "food_photography", icon: null },
    ];

    // User credits display values (fallback)






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
        <>
            {/* AI Loader - Shows when generating */}
            <AILoader
                isLoading={isSubmitting}
                text="Generating your images..."
            />

            <div className="h-full flex overflow-hidden bg-[#f8fafc] dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
                {/* Reusable Sidebar */}
                <Sidebar activeNav="generate" />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    {/* Reusable Header with dynamic breadcrumbs */}
                    <Header
                        breadcrumbs={[
                            { label: "Home", href: "/?view=landing" },
                            { label: "Generate", href: "/generate" },
                            { label: "Details" }
                        ]}
                    />

                    {/* Main Content Area */}
                    <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-gray-900">
                        {/* Content - Scrollable on mobile, Fixed on Desktop */}
                        <div className="flex-1 p-4 sm:p-5 overflow-y-auto md:overflow-hidden flex flex-col">
                            <div className="flex flex-col gap-2 min-h-full md:min-h-0 md:flex-1">
                                {/* Page Header */}
                                <div className="mb-2 shrink-0">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">Generate Images</h1>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base font-light">Upload an image and get professional variations in minutes.</p>
                                </div>

                                {/* Progress Steps - Same style as Upload page */}
                                <div className="mb-2 shrink-0">
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

                                {/* Form Content - Compact Layout */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:flex-1 flex flex-col">
                                    <div className="p-3 sm:p-5 md:p-6 lg:p-6flex flex-col gap-1md:flex-1">
                                        {/* Row 1: Image Type, Category, Brand Info - Side by Side */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                                            {/* Image Type */}
                                            <div className="flex flex-col gap-1">
                                                <h2 className="text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5">
                                                    {generationType === 'batch_image' ? (
                                                        <ShoppingBag className="w-3.5 h-3.5 text-teal-500" />
                                                    ) : (
                                                        <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                                                    )}
                                                    Image Type
                                                </h2>
                                                <div
                                                    className="group flex items-center gap-2 h-[52px] px-3 rounded-lg cursor-pointer transition-all border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                                                >
                                                    <div className="p-1.5 rounded-lg flex-shrink-0 bg-white dark:bg-gray-800 text-teal-500">
                                                        {generationType === 'batch_image' ? (
                                                            <ShoppingBag className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <ImageIcon className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-900 dark:text-white font-semibold text-xs">
                                                            {generationType === 'batch_image' ? "E-Commerce Bundle" : "Single Image"}
                                                        </span>
                                                        <p className="text-gray-500 text-[9px]">
                                                            {generationType === 'batch_image' ? "Multiple angles & styles" : "Generate from a single source"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Category Selection */}
                                            <div className="flex flex-col gap-1">
                                                <h2 className="text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5">
                                                    <Tag className="w-3.5 h-3.5 text-teal-500" />
                                                    Category
                                                </h2>
                                                <div className="relative">
                                                    <select
                                                        value={businessCategory}
                                                        onChange={(e) => setBusinessCategory(e.target.value)}
                                                        className="w-full h-[52px] pl-3 pr-10 rounded-lg bg-white dark:bg-gray-700 border border-teal-200 dark:border-gray-600 text-teal-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 appearance-none text-sm font-medium cursor-pointer shadow-sm hover:shadow-md transition-all"
                                                    >
                                                        <option value="">Select category...</option>
                                                        {displayCategories.map((cat) => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 opacity-50 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* Brand Name */}
                                            <div className="flex flex-col gap-1">
                                                <h2 className="text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                    Brand Name
                                                </h2>
                                                <input
                                                    value={brandName}
                                                    onChange={(e) => setBrandName(e.target.value)}
                                                    className="w-full h-[52px] px-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                                                    placeholder="e.g. Acme Corp"
                                                    type="text"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Model Selection - Shows when category has show_model: true AND not batch_image */}

                                        {(generationType !== 'batch_image' && displayCategories.find(c => c.id === businessCategory)?.show_model) && (
                                            <div className="md:flex-1 md:min-h-0 flex flex-col gap-2">
                                                {/* Branding Info Row - Compact */}
                                                <div className="shrink-0 bg-gray-50 mt-4 dark:bg-gray-700/50 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <Briefcase className="w-3 h-3 text-gray-400" />
                                                        <h3 className="text-[11px] font-bold text-gray-900 dark:text-white">Additional Branding Info</h3>
                                                        <span className="text-[8px] font-normal text-gray-400 bg-white dark:bg-gray-600 px-1 py-0.5 rounded-full">Optional</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {/* Logo Upload */}
                                                        <div className="flex flex-col gap-0.5">
                                                            <label className="text-gray-600 dark:text-gray-300 text-[9px] font-medium">Brand Logo</label>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept=".svg,.png,.jpg,.jpeg"
                                                                onChange={handleLogoUpload}
                                                                className="hidden"
                                                            />
                                                            {logoPreview ? (
                                                                <div className="h-9 bg-white dark:bg-gray-800 border-2 border-teal-500 rounded-lg flex items-center justify-center px-2 relative">
                                                                    <img src={logoPreview} alt="Logo" className="max-h-6 max-w-full object-contain" />
                                                                    <button
                                                                        onClick={removeLogo}
                                                                        className="absolute top-0.5 right-0.5 size-3.5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                                    >
                                                                        <X className="w-2 h-2" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="h-9 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer hover:border-teal-400 transition-colors"
                                                                >
                                                                    <CloudUpload className="w-3.5 h-3.5 text-gray-400" />
                                                                    <span className="text-[10px] text-gray-400">Upload</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Instagram */}
                                                        <div className="flex flex-col gap-0.5">
                                                            <label className="text-gray-600 dark:text-gray-300 text-[9px] font-medium">Instagram</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 pointer-events-none text-xs">@</span>
                                                                <input
                                                                    value={instagramUsername}
                                                                    onChange={(e) => setInstagramUsername(e.target.value)}
                                                                    className="w-full h-9 pl-5 pr-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 text-xs"
                                                                    placeholder="username"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Website */}
                                                        <div className="flex flex-col gap-0.5">
                                                            <label className="text-gray-600 dark:text-gray-300 text-[9px] font-medium">Website URL</label>
                                                            <input
                                                                value={websiteUrl}
                                                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                                                className="w-full h-9 px-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 text-xs"
                                                                placeholder="https://example.com"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Models Grid - Below Branding Info */}
                                                <div className="md:flex-1 md:min-h-0 flex flex-col">
                                                    <div className="flex items-center justify-between mb-2 shrink-0">
                                                        <div className="flex items-center gap-2">
                                                            <Grid3X3 className="w-3.5 h-3.5 text-gray-400" />
                                                            <h3 className="text-xs font-bold text-gray-900 dark:text-white">Select Human Model</h3>
                                                            <span className="text-[9px] font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">Optional</span>
                                                        </div>
                                                        {/* Filter Dropdowns - Professional Teal Theme */}
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <select
                                                                    value={genderFilter}
                                                                    onChange={(e) => setGenderFilter(e.target.value as 'female' | 'male' | 'unisex' | 'all')}
                                                                    className="h-8 text-xs pl-3 pr-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 shadow-sm hover:shadow-md transition-all cursor-pointer appearance-none"
                                                                >
                                                                    <option value="all">All Genders</option>
                                                                    <option value="female">Female</option>
                                                                    <option value="male">Male</option>
                                                                    <option value="unisex">Unisex</option>
                                                                </select>
                                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 opacity-50 pointer-events-none" />
                                                            </div>
                                                            <div className="relative">
                                                                <select
                                                                    value={styleFilter}
                                                                    onChange={(e) => setStyleFilter(e.target.value as 'professional' | 'casual' | 'athletic' | 'elegant' | 'diverse' | 'all')}
                                                                    className="h-8 text-xs pl-3 pr-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 shadow-sm hover:shadow-md transition-all cursor-pointer appearance-none"
                                                                >
                                                                    <option value="all">All Styles</option>
                                                                    <option value="professional">Professional</option>
                                                                    <option value="casual">Casual</option>
                                                                    <option value="athletic">Athletic</option>
                                                                    <option value="elegant">Elegant</option>
                                                                    <option value="diverse">Diverse</option>
                                                                </select>
                                                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 opacity-50 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="md:flex-1 md:min-h-0 p-1 pb-4 overflow-y-auto">
                                                        {modelPresetsLoading ? (
                                                            <div className="flex items-center justify-center h-32">
                                                                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 2xl:grid-cols-8 gap-3">
                                                                {(modelPresets.length > 0 ? modelPresets : fallbackModelPresets).map((preset) => (
                                                                    <div
                                                                        key={preset.id}
                                                                        className="flex flex-col cursor-pointer group"
                                                                        onClick={() => setSelectedModelPreset(preset.id)}
                                                                        title={preset.description}
                                                                    >
                                                                        <div className={`relative rounded-lg bg-gray-100 dark:bg-gray-700 h-[125px] overflow-hidden transition-all ${selectedModelPreset === preset.id
                                                                            ? "ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-gray-800"
                                                                            : "border border-gray-200 dark:border-gray-600 hover:ring-2 hover:ring-teal-400 hover:ring-offset-1"
                                                                            }`}>
                                                                            {preset.thumbnail ? (
                                                                                <img
                                                                                    src={preset.thumbnail}
                                                                                    alt={preset.name}
                                                                                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                                                                                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                                                                                        {preset.gender === 'female' ? '👩' : preset.gender === 'male' ? '👨' : '🧑'}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {/* Gender & Style badges */}
                                                                            <div className="absolute top-1 left-1 flex gap-1">
                                                                                <span className="text-[7px] px-1 py-0.5 rounded bg-black/50 text-white capitalize">{preset.gender}</span>
                                                                            </div>
                                                                            {selectedModelPreset === preset.id && (
                                                                                <div className="absolute bottom-0.5 right-0.5 bg-teal-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-lg">
                                                                                    <Check className="w-2 h-2" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <p className={`text-[9px] font-medium text-center mt-1 pb-0.5 truncate ${selectedModelPreset === preset.id
                                                                            ? "text-teal-500"
                                                                            : "text-gray-500 dark:text-gray-400"
                                                                            }`}>
                                                                            {preset.name}
                                                                        </p>
                                                                    </div>
                                                                ))}

                                                                {/* Custom Add Button */}
                                                                <div className="flex flex-col cursor-pointer group">
                                                                    <div className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 transition-colors h-[125px]">
                                                                        <Plus className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-gray-400" />
                                                                    </div>
                                                                    <p className="text-[9px] font-medium text-center mt-1 pb-0.5 text-gray-400">Custom</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Row 2 Alternative: Additional Info - Shows when category doesn't have show_model or no category selected OR is batch_image */}

                                        {(generationType === 'batch_image' || !displayCategories.find(c => c.id === businessCategory)?.show_model) && (
                                            <div className="md:flex-1 md:min-h-0 flex flex-col mt-4">
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl mt-4 border border-gray-200 dark:border-gray-600 md:flex-1 flex flex-col">
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                                        Additional Branding Info
                                                        <span className="text-[10px] font-normal text-gray-400 bg-white dark:bg-gray-600 px-2 py-0.5 rounded-full">Optional</span>
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {/* Logo Upload */}
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-gray-600 dark:text-gray-300 text-[10px] font-medium">Brand Logo</label>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept=".svg,.png,.jpg,.jpeg"
                                                                onChange={handleLogoUpload}
                                                                className="hidden"
                                                            />
                                                            {logoPreview ? (
                                                                <div className="h-12 bg-white dark:bg-gray-800 border-2 border-teal-500 rounded-lg flex items-center justify-center px-3 relative">
                                                                    <img src={logoPreview} alt="Logo" className="max-h-8 max-w-full object-contain" />
                                                                    <button
                                                                        onClick={removeLogo}
                                                                        className="absolute top-1 right-1 size-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                                    >
                                                                        <X className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                    className="h-12 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-teal-400 transition-colors"
                                                                >
                                                                    <CloudUpload className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-xs text-gray-400">Upload Logo</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Instagram */}
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-gray-600 dark:text-gray-300 text-[10px] font-medium">Instagram</label>
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none text-sm">@</span>
                                                                <input
                                                                    value={instagramUsername}
                                                                    onChange={(e) => setInstagramUsername(e.target.value)}
                                                                    className="w-full h-12 pl-7 pr-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 text-sm"
                                                                    placeholder="username"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Website */}
                                                        <div className="flex flex-col gap-1">
                                                            <label className="text-gray-600 dark:text-gray-300 text-[10px] font-medium">Website URL</label>
                                                            <input
                                                                value={websiteUrl}
                                                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                                                className="w-full h-12 px-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 text-sm"
                                                                placeholder="https://example.com"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons - Fixed Footer */}
                        <div className="shrink-0 px-5 py-2 bg-[#f8fafc] dark:bg-gray-900">
                            {error && (
                                <div className="mb-2 p-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[10px] text-center">
                                    {error}
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => {
                                        navigationState.shouldShowLoader = true;
                                        router.push("/generate/upload");
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="group relative flex items-center gap-2.5 bg-gradient-to-b from-slate-800 to-slate-900 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 overflow-hidden"
                                >
                                    {/* Glossy top highlight line */}
                                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                                    {/* Glass shine overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none"></div>

                                    {/* Hover shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none"></div>

                                    <span className="relative z-10 flex items-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                Generate
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
        </>
    );
}

