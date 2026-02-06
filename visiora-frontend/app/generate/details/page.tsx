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
    Monitor,
    Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { generateApi, GenerateFormData, Category, ModelPreset, BundleOptionsPayload, UserCredits } from "@/lib/generate";
import { authApi } from "@/lib/auth";
import { walletApi } from "@/lib/wallet";
import { Sidebar, Header } from "@/components/layout";
import ImageGenerationLoader from "@/components/loaders/ImageGenerationLoader";
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
    const [imageCount, setImageCount] = useState(1);
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

    // User Credits
    const [userCredits, setUserCredits] = useState<UserCredits | null>(null);

    // Filter states for model presets
    const [genderFilter, setGenderFilter] = useState<'female' | 'male' | 'unisex' | 'all'>('all');
    const [styleFilter, setStyleFilter] = useState<'professional' | 'casual' | 'athletic' | 'elegant' | 'diverse' | 'all'>('all');

    // Custom Dropdown State
    const [activeDropdown, setActiveDropdown] = useState<'gender' | 'style' | 'category' | null>(null);
    const filterDropdownRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check Category Dropdown
            if (activeDropdown === 'category' && categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
            // Check Filter Dropdowns (Gender/Style)
            if ((activeDropdown === 'gender' || activeDropdown === 'style') && filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);



    // Load ecommerce bundle options from localStorage (for batch_image)
    const [savedBundleOptions, setSavedBundleOptions] = useState<any>(null);

    // Helper to get image count from views
    const getImageCountFromViews = (views: string): number => {
        switch (views) {
            case 'standard_4':
            case 'views_standard': return 4;

            case 'basic_2':
            case 'views_basic': return 2;

            case 'premium_6':
            case 'views_extended': return 6;

            case 'complete_8':
            case 'views_360': return 8;

            default: return 4; // Default to standard
        }
    };

    useEffect(() => {
        const savedType = localStorage.getItem("generateType");
        if (savedType === "single_image" || savedType === "batch_image") {
            setGenerationType(savedType);
            // Default to 1 image if single_image is selected
            if (savedType === 'single_image') {
                setImageCount(1);
            }
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

                // Update image count based on saved options if in batch mode
                if (savedType === 'batch_image' && ecommerceOptions.productViews) {
                    setImageCount(getImageCountFromViews(ecommerceOptions.productViews));
                } else if (savedType === 'single_image') {
                    setImageCount(1);
                }
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
        fetchUserCredits();
    }, []);

    const fetchUserCredits = async () => {
        try {
            const response = await walletApi.getUserCredits();
            if (response.success && response.data) {
                // Ensure the shape matches UserCredits interface
                setUserCredits({
                    freeCredits: response.data.freeCredits,
                    maxFreeCredits: response.data.maxFreeCredits,
                    balance: response.data.balance
                });
            }
        } catch (error) {
            console.warn('Failed to fetch credits');
        }
    };

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
                // Derive image count from product views
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
                    image_count: getImageCountFromViews(savedBundleOptions.productViews || 'views_standard'),
                };
            }

            // Check if user has enough credits
            const totalCredits = (userCredits?.freeCredits || 0) + (userCredits?.balance || 0);
            const requiredCredits = bundleOptionsPayload ? bundleOptionsPayload.image_count : imageCount;

            if (totalCredits < requiredCredits) {
                setError(`Insufficient credits. You need ${requiredCredits} credits but have ${totalCredits}.`);
                setIsSubmitting(false);
                return;
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

                // DON'T set isSubmitting to false - keep loader visible during navigation
                // This prevents details page from flickering before result page loads
                router.push('/generate/result');
            } else {
                setError(response.error || 'Failed to generate images');
                setIsSubmitting(false); // Only hide loader on error
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsSubmitting(false); // Only hide loader on error
        }
    };

    // Fallback categories if API fails
    const displayCategories: Category[] = categories.length > 0 ? categories : [
        { id: "clothes", name: "Clothes & Apparel", description: "T-shirts, shirts, dresses, pants, etc.", show_model: true, recommended_model: "portrait_master", icon: null },
        { id: "footwear", name: "Footwear", description: "Shoes, sneakers, sandals, boots, etc.", show_model: false, recommended_model: "product_studio", icon: null },
        { id: "beauty", name: "Beauty & Cosmetics", description: "Makeup, skincare, perfume, etc.", show_model: true, recommended_model: "beauty_portrait", icon: null },
        { id: "accessories", name: "Accessories", description: "Bags, jewelry, watches, hats, etc.", show_model: true, recommended_model: "close_up", icon: null },
        { id: "furniture", name: "Furniture", description: "Chairs, tables, sofas, etc.", show_model: false, recommended_model: "interior_design", icon: null },
        { id: "home_decor", name: "Home Decor", description: "Vases, lamps, wall art, rugs, etc.", show_model: false, recommended_model: "interior_design", icon: null },
        { id: "electronics", name: "Electronics", description: "Phones, laptops, gadgets, etc.", show_model: false, recommended_model: "product_studio", icon: null },
        { id: "toys", name: "Toys & Games", description: "Action figures, dolls, puzzles, etc.", show_model: false, recommended_model: "product_studio", icon: null },
        { id: "sports", name: "Sports & Outdoors", description: "Equipment, gear, athletic wear, etc.", show_model: true, recommended_model: "action_shot", icon: null },
        { id: "food", name: "Food & Beverage", description: "Food items, drinks, etc.", show_model: false, recommended_model: "food_photography", icon: null },
    ];



    return (
        <>
            {/* Image Generation Loader - Shows premium sparkle animation when generating */}
            <ImageGenerationLoader
                isLoading={isSubmitting}
                text="Generating your images..."
            />

            <div className="h-screen flex overflow-hidden bg-[#f8fafc] dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
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
                        <div className="flex-1 p-4 sm:p-5 overflow-y-auto lg:overflow-hidden flex flex-col">
                            <div className="flex flex-col gap-2 min-h-full lg:min-h-0 lg:flex-1">
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

                                {/* Form Content - 2 Column Layout */}
                                <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 pb-2">
                                    {/* Left Column - Configuration & Inputs */}
                                    <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col gap-4 lg:overflow-y-auto custom-scrollbar lg:pr-1 pb-10">

                                        {/* Image Type / Context Card */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 shrink-0">
                                                    {generationType === 'batch_image' ? <ShoppingBag className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {generationType === 'batch_image' ? "E-commerce Bundle" : "Single Image"}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                        {generationType === 'batch_image'
                                                            ? "Generate multiple variations for products"
                                                            : "Generate a single professional image"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Brand Information */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Briefcase className="w-4 h-4 text-slate-900 dark:text-white" />
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Brand Information</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Brand Name</label>
                                                    <input
                                                        value={brandName}
                                                        onChange={(e) => setBrandName(e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                                                        placeholder="e.g. Acme Corp"
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Category</label>
                                                    <div className="relative" ref={categoryDropdownRef}>
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-all
                                                                ${activeDropdown === 'category'
                                                                    ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-slate-900 dark:text-white'
                                                                    : 'bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white hover:border-teal-500 dark:hover:border-teal-500 hover:ring-2 hover:ring-teal-500/10'
                                                                }`}
                                                        >
                                                            <span className={!businessCategory ? "text-slate-400" : ""}>
                                                                {displayCategories.find(c => c.id === businessCategory)?.name || "Select category..."}
                                                            </span>
                                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {activeDropdown === 'category' && (
                                                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                                                                    {displayCategories.map((cat) => (
                                                                        <button
                                                                            key={cat.id}
                                                                            onClick={() => {
                                                                                setBusinessCategory(cat.id);
                                                                                if (cat.recommended_model) {
                                                                                    setModelId(cat.recommended_model);
                                                                                }
                                                                                setActiveDropdown(null);
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group
                                                                                ${businessCategory === cat.id
                                                                                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-medium'
                                                                                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50'
                                                                                }`}
                                                                        >
                                                                            <span>{cat.name}</span>
                                                                            {businessCategory === cat.id && <Check className="w-4 h-4 text-teal-500" />}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Branding Info */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ImageIcon className="w-4 h-4 text-slate-900 dark:text-white" />
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Additional Branding Info</h3>
                                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Optional</span>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Logo */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Brand Logo</label>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".svg,.png,.jpg,.jpeg"
                                                        onChange={handleLogoUpload}
                                                        className="hidden"
                                                    />
                                                    {logoPreview ? (
                                                        <div className="relative group">
                                                            <div className="h-16 w-full rounded-xl border-2 border-teal-500 bg-teal-50/10 dark:bg-teal-900/10 flex items-center justify-center p-2">
                                                                <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                                                            </div>
                                                            <button
                                                                onClick={removeLogo}
                                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="w-full h-16 rounded-xl border border-dashed border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-900/50 hover:bg-slate-100 dark:hover:bg-gray-800 hover:border-teal-500 dark:hover:border-teal-500 text-slate-400 dark:text-gray-500 flex flex-col items-center justify-center gap-1 transition-all group"
                                                        >
                                                            <CloudUpload className="w-5 h-5 group-hover:text-teal-500 transition-colors" />
                                                            <span className="text-xs font-medium">Upload logo file</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Website */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Website URL</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                                                        </div>
                                                        <input
                                                            value={websiteUrl}
                                                            onChange={(e) => setWebsiteUrl(e.target.value)}
                                                            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                                                            placeholder="https://example.com"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Instagram */}
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400">Instagram</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <span className="text-slate-400 font-bold">@</span>
                                                        </div>
                                                        <input
                                                            value={instagramUsername}
                                                            onChange={(e) => setInstagramUsername(e.target.value)}
                                                            className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                                                            placeholder="username"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Model Selection */}
                                    <div className="flex-1 min-h-0 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Grid3X3 className="w-5 h-5 text-slate-900 dark:text-white" />
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Human Model</h3>
                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Optional</span>
                                            </div>

                                            <div className="flex items-center gap-3" ref={filterDropdownRef}>
                                                {/* Gender Filter */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === 'gender' ? null : 'gender')}
                                                        className={`pl-3 pr-8 py-2 rounded-xl border text-xs font-semibold flex items-center shadow-sm transition-all
                                                            ${activeDropdown === 'gender'
                                                                ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-teal-700 dark:text-teal-400'
                                                                : 'bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                                    >
                                                        <span className="truncate">
                                                            {{
                                                                'all': 'All Genders',
                                                                'female': 'Female',
                                                                'male': 'Male',
                                                                'unisex': 'Unisex'
                                                            }[genderFilter]}
                                                        </span>
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'gender' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                                        </div>
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {activeDropdown === 'gender' && (
                                                        <div className="absolute top-full right-0 mt-2 w-32 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-teal-100 dark:border-teal-900/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                            <div className="p-1 px-1.5 flex flex-col gap-0.5">
                                                                {[
                                                                    { value: 'all', label: 'All Genders' },
                                                                    { value: 'female', label: 'Female' },
                                                                    { value: 'male', label: 'Male' },
                                                                    { value: 'unisex', label: 'Unisex' }
                                                                ].map((option) => (
                                                                    <button
                                                                        key={option.value}
                                                                        onClick={() => {
                                                                            setGenderFilter(option.value as any);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between
                                                                            ${genderFilter === option.value
                                                                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                                                                : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                            }`}
                                                                    >
                                                                        {option.label}
                                                                        {genderFilter === option.value && <Check className="w-3 h-3 text-teal-500" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Style Filter */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveDropdown(activeDropdown === 'style' ? null : 'style')}
                                                        className={`pl-3 pr-8 py-2 rounded-xl border text-xs font-semibold flex items-center shadow-sm transition-all
                                                            ${activeDropdown === 'style'
                                                                ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-teal-700 dark:text-teal-400'
                                                                : 'bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                                    >
                                                        <span className="truncate">
                                                            {{
                                                                'all': 'All Styles',
                                                                'professional': 'Professional',
                                                                'casual': 'Casual',
                                                                'athletic': 'Athletic',
                                                                'elegant': 'Elegant',
                                                                'diverse': 'Diverse'
                                                            }[styleFilter]}
                                                        </span>
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'style' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                                        </div>
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {activeDropdown === 'style' && (
                                                        <div className="absolute top-full right-0 mt-2 w-32 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-teal-100 dark:border-teal-900/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                            <div className="p-1 px-1.5 flex flex-col gap-0.5">
                                                                {[
                                                                    { value: 'all', label: 'All Styles' },
                                                                    { value: 'professional', label: 'Professional' },
                                                                    { value: 'casual', label: 'Casual' },
                                                                    { value: 'athletic', label: 'Athletic' },
                                                                    { value: 'elegant', label: 'Elegant' },
                                                                    { value: 'diverse', label: 'Diverse' }
                                                                ].map((option) => (
                                                                    <button
                                                                        key={option.value}
                                                                        onClick={() => {
                                                                            setStyleFilter(option.value as any);
                                                                            setActiveDropdown(null);
                                                                        }}
                                                                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between
                                                                            ${styleFilter === option.value
                                                                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                                                                : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                            }`}
                                                                    >
                                                                        {option.label}
                                                                        {styleFilter === option.value && <Check className="w-3 h-3 text-teal-500" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Model Grid or Empty State */}
                                        {/* Model Grid or Empty State */}
                                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm p-5 lg:overflow-y-auto custom-scrollbar pb-10">
                                            {(!displayCategories.find(c => c.id === businessCategory)?.show_model && displayCategories.find(c => c.id === businessCategory)) ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                                    <div className="w-16 h-16 bg-slate-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                                                        <ImageIcon className="w-8 h-8 opacity-50" />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No models needed</h3>
                                                    <p className="text-xs max-w-[200px]">The selected category typically doesn't use human models. You can proceed without selecting one.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                                    {(modelPresets.length > 0 ? modelPresets : fallbackModelPresets).map((preset) => (
                                                        <div
                                                            key={preset.id}
                                                            className="flex flex-col cursor-pointer group"
                                                            onClick={() => setSelectedModelPreset(preset.id)}
                                                        >
                                                            <div className={`relative aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 ${selectedModelPreset === preset.id
                                                                ? "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-gray-800 shadow-md"
                                                                : "border border-slate-200 dark:border-gray-700 hover:border-teal-400 hover:shadow-lg"
                                                                }`}>
                                                                {preset.thumbnail ? (
                                                                    <img
                                                                        src={preset.thumbnail}
                                                                        alt={preset.name}
                                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                    />
                                                                ) : (
                                                                    <div className={`w-full h-full flex items-center justify-center ${selectedModelPreset === preset.id ? "bg-teal-50 dark:bg-teal-900/20" : "bg-slate-100 dark:bg-gray-700"}`}>
                                                                        <span className="text-3xl filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                                            {preset.gender === 'female' ? '👩' : preset.gender === 'male' ? '👨' : '🧑'}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {/* Selection Check */}
                                                                {selectedModelPreset === preset.id && (
                                                                    <div className="absolute top-2 right-2 size-6 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200">
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    </div>
                                                                )}

                                                                {/* Hover Overlay */}
                                                                <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${selectedModelPreset === preset.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                                    <p className="text-white text-xs font-bold text-center line-clamp-1">{preset.name}</p>
                                                                    <p className="text-white/80 text-[10px] text-center capitalize mt-0.5">{preset.gender}</p>
                                                                </div>
                                                            </div>
                                                            {selectedModelPreset !== preset.id && (
                                                                <div className="mt-2 text-center">
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-gray-200 truncate group-hover:text-teal-600 transition-colors">{preset.name}</p>
                                                                    <p className="text-[10px] text-slate-500 dark:text-gray-400 capitalize">{preset.gender}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 fill-white text-white" />
                                                <span className="tracking-wide">Generate</span>
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
