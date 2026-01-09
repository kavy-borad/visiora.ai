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
    Zap,
    ArrowRight,
    ArrowLeft,
    Info,
    Check,
    Upload,
    Link as LinkIcon,
    Plus,
    Moon,
    Sun,
    Landmark,
    Loader2,
    X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { generateApi, UserCredits } from "@/lib/generate";
import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";

export interface ModelOption {
    id: number;
    name: string;
    image: string;
}

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    // Model state
    const [selectedModel, setSelectedModel] = useState<number | null>(1);

    // API state
    const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUploadError, setShowUploadError] = useState(false);

    // User profile state
    const [userName, setUserName] = useState("Jane");
    const [userInitial, setUserInitial] = useState("J");

    // Fetch user credits on mount
    useEffect(() => {
        // Load user from localStorage
        const storedUser = authApi.getCurrentUser();
        if (storedUser && storedUser.fullName) {
            const firstName = storedUser.fullName.split(' ')[0];
            setUserName(firstName);
            setUserInitial(firstName.charAt(0).toUpperCase());
        }

        fetchUserCredits();
    }, []);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImageUrl(""); // Clear URL if file is selected
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setImageUrl("");
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleImportUrl = async () => {
        if (!imageUrl.trim()) return;

        setIsImporting(true);
        setError(null);

        try {
            // Validate URL
            const url = new URL(imageUrl);
            setFilePreview(imageUrl);
            setSelectedFile(null);
        } catch (err) {
            setError('Please enter a valid URL');
        } finally {
            setIsImporting(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setImageUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleNextStep = async () => {
        // Validate: Must upload image first
        if (!filePreview) {
            // Show visual shake effect on upload area
            setShowUploadError(true);
            setTimeout(() => setShowUploadError(false), 500);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // If there's a file, upload to backend first
            if (selectedFile) {
                const uploadResponse = await generateApi.uploadImage(selectedFile);
                if (uploadResponse.success && uploadResponse.data) {
                    // Save the file_id from backend
                    localStorage.setItem('uploadedFileId', uploadResponse.data.file_id);
                    console.log('File uploaded, file_id:', uploadResponse.data.file_id);
                } else {
                    // Upload endpoint not available - use test file_id for now
                    // TODO: Replace with actual upload when backend endpoint is ready
                    console.warn('Using test file_id (upload endpoint not available)');
                    localStorage.setItem('uploadedFileId', '12');  // Test file_id that backend accepts
                }
            } else if (imageUrl) {
                // For URL, use test file_id
                localStorage.setItem('uploadedFileId', '12');
                localStorage.setItem('uploadedImageUrl', imageUrl);
            }

            // Store upload data in localStorage for next step
            if (filePreview) {
                localStorage.setItem('uploadedImage', filePreview);
            }
            if (selectedModel) {
                localStorage.setItem('selectedModel', selectedModel.toString());
            }

            // Navigate to details page
            router.push('/generate/details');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const models: ModelOption[] = [
        { id: 1, name: "Studio Pro", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoJOWZv8vNa6RFDGdXaIvLaH1_pdkuYu-Agf7KHBV7dZLL6lcg3dEQbFGXKIlQS8k254SLSMQmiUvXsfxyiyDIShg3_S6o7I3rlYsqBKUCj0VB_EMEh1TtDXrCHQ2qPuJBNBAlw608JzNFmmiHNT23G9GauVMPNytrEt2AeIBiMWrVSotyFe9LHsUqOn6t6aFqPb2D7o50F3IXGSt3vaBD8clHz2Y-RHF2ndjeX1nOgYAyCbzu3eIVNWJemxHa-bj9mZ80mTFKQGcp" },
        { id: 2, name: "Executive", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpG9rDTml0LTJBFVE5t-U0Omqgfb3Tw_BE6o52TdSubE-ysc2NDMpXscqBfiyX2KhpE4RoQ6kBC_Dj2vXNAi_fu_xtmOkXF6EM-fAPGHyaHdbCY9wbfrpGtB--He0zEzAFos5unfLFbQZ2V7kYoSytJIvUrjKL3kKOKdxJHfKr32yJtZUnWg_INO1zRvni1fcNR4nPd66JVMNwnvLhtySvbEFZrz8oqbqn-FausNQF0ldgK9O-tvkJWojn698Nu5EXkW2GRm2dnNA-" },
        { id: 3, name: "Lifestyle", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9ACO1yIxW2Q7hu0tsE3eHwUUyjVdJ3HyZErsD7Ap3NW63vnNqc8gOdANW1nzeQVqympPmOP2inFzBfiXvwhVGE3xpqCC1irVol8sqcNER4J-SZyXKkJDH3nNE8b2i_PkFaHMI-Hx9D0fjiEAm8dy4rzuJsRf7Zng4ZKT-oa7BjWqQF5CofzFaMSlBuoMUlJQOy3x92VoZ4R0oYRHLXUUv1wmYczzDtfp5A4PFZE2L1XvSmtqI8m4aEM2I8r8jHvsFZvvGnOiWHGwr" },
        { id: 4, name: "Creative", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1u8i7swl0DmbulakI3kpCNdVj7fB698D3HvZ_xJESOKhpQaYDaUNljdmhCvBCgWQ5XkV9oemtOMlPedi_cxlTr1Ec01YU4ytL0Pfzlg__0ERYd0znaAyjeTyIen3w4zaMUwW38VaAT5aaGg0pzAVeLmFGhu_gYQOXRKOg-Gf2EWxKsWZDB6nkY7O3aGrjB3jNlfeAlweHLdEIKlDr4ylvItyL_FHfrnySOHlrFVtk1NIu0n817Dc7E5MPGfVnIz0gcWHcG5_zRevL" },
    ];

    return (
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
                        { label: "Upload" }
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

                            {/* Progress Steps - Same style as Generate page */}
                            <div className="mb-3 sm:mb-4 shrink-0">
                                <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                    {/* Background line */}
                                    <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700"></div>
                                    {/* Active line (first two segments) */}
                                    <div className="absolute top-5 left-[16.67%] w-[66.66%] h-[2px] bg-teal-500"></div>

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

                                        {/* STEP 2 - Current Active */}
                                        <div className="flex flex-col items-center cursor-pointer group">
                                            <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold ring-4 ring-teal-500/20 transition-transform group-hover:scale-110">
                                                2
                                            </div>
                                            <span className="mt-2 text-xs font-bold text-teal-600 tracking-wide uppercase">
                                                UPLOAD
                                            </span>
                                        </div>

                                        {/* STEP 3 - Pending */}
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
                            {/* Two Row Layout */}
                            <div className="flex-1 min-h-0 flex flex-col gap-2">
                                {/* Row 1: Upload Section - Two Equal Columns */}
                                <div className="shrink-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
                                            Upload Product Image
                                        </h3>
                                        <span className="text-xs text-gray-400">Supported: JPG, PNG, WEBP</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Left Card - Upload Area */}
                                        {filePreview ? (
                                            <div className="relative border-2 border-teal-500 rounded-xl p-4 flex flex-col items-center justify-center bg-white dark:bg-gray-800 min-h-[110px]">
                                                <img src={filePreview} alt="Preview" className="max-h-20 max-w-full object-contain rounded-lg" />
                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 truncate max-w-full">
                                                    {selectedFile?.name || 'Image from URL'}
                                                </p>
                                                <button
                                                    onClick={removeFile}
                                                    className="absolute top-2 right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                className={`group relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white dark:bg-gray-800 min-h-[110px] ${showUploadError
                                                    ? 'border-red-500 animate-[shake_0.3s_ease-in-out] bg-red-50 dark:bg-red-900/10'
                                                    : 'border-teal-400 dark:border-teal-500 hover:border-teal-500 hover:bg-teal-500/5'
                                                    }`}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="w-8 h-10 bg-teal-500/10 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-4 h-4 text-teal-500" />
                                                </div>
                                                <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Click to upload</h4>
                                                <p className="text-[10px] text-gray-400 mt-0.5 mb-2">or drag and drop your file here</p>
                                                <button className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                    Select File
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleFileSelect}
                                                />
                                            </div>
                                        )}

                                        {/* Right Card - Import from URL */}
                                        <div className={`bg-white dark:bg-gray-800 rounded-xl p-3 flex flex-col min-h-[110px] transition-all ${showUploadError
                                            ? 'border-2 border-red-500 animate-[shake_0.3s_ease-in-out] bg-red-50 dark:bg-red-900/10'
                                            : 'border border-gray-200 dark:border-gray-700'
                                            }`}>
                                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5 flex items-center gap-2">
                                                <LinkIcon className="w-3 h-3 text-gray-400" />
                                                Import from URL
                                            </h4>
                                            <p className="text-[10px] text-gray-400 mb-2">Paste an image link directly.</p>
                                            <div className="relative mb-2">
                                                <input
                                                    type="text"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    placeholder="https://"
                                                    className="w-full h-8 pl-3 pr-14 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-500 outline-none"
                                                />
                                                <button
                                                    onClick={handleImportUrl}
                                                    disabled={isImporting || !imageUrl.trim()}
                                                    className="absolute right-2 top-1.5 text-teal-500 hover:text-teal-600 font-semibold text-[10px] uppercase disabled:opacity-50"
                                                >
                                                    {isImporting ? 'Loading...' : 'Import'}
                                                </button>
                                            </div>
                                            <div className="mt-auto p-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-lg flex gap-1.5">
                                                <Info className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-[9px] text-teal-700 dark:text-teal-300 leading-tight">
                                                    High resolution images work best.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Row 2: Model Selection - Takes remaining space */}
                                <div className="flex-1 min-h-0 flex flex-col">
                                    <div className="flex items-center justify-between mb-1 shrink-0">
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                Select Model
                                                <span className="text-[10px] font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">Optional</span>
                                            </h3>
                                            <p className="text-[10px] text-gray-400">Choose a base model style for your generation</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                All Genders
                                            </button>
                                            <button className="text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                All Categories
                                            </button>
                                        </div>
                                    </div>

                                    {/* Model Grid - Fixed aspect ratio cards */}
                                    <div className="flex-1 min-h-0">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
                                            {models.map((model) => (
                                                <div
                                                    key={model.id}
                                                    className="flex flex-col cursor-pointer group"
                                                    onClick={() => setSelectedModel(model.id)}
                                                >
                                                    <div className={`relative rounded-xl bg-gray-100 dark:bg-gray-800 h-[140px] overflow-hidden transition-all ${selectedModel === model.id
                                                        ? "ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-gray-900"
                                                        : "border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-teal-400 hover:ring-offset-2 dark:hover:ring-offset-gray-900"
                                                        }`}>
                                                        <img
                                                            src={model.image}
                                                            alt={model.name}
                                                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                                                        />
                                                        {selectedModel === model.id && (
                                                            <div className="absolute bottom-1.5 right-1.5 bg-teal-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] font-medium text-center mt-1.5 ${selectedModel === model.id
                                                        ? "text-teal-500"
                                                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                                        }`}>
                                                        {model.name}
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Custom Add Button */}
                                            <div className="flex flex-col cursor-pointer group">
                                                <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-colors h-[140px]">
                                                    <Plus className="w-5 h-5 text-gray-300 dark:text-gray-500 group-hover:text-gray-400 transition-colors" />
                                                </div>
                                                <p className="text-[11px] font-medium text-center mt-1.5 text-gray-400 group-hover:text-gray-500">Custom</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons - Fixed Footer */}
                    <div className="shrink-0 px-5 py-2 bg-[#f8fafc] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
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
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Next Step
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
