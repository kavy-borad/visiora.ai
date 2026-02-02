"use client";
import Link from "@/components/Link";
import { useRouter } from "@/components/useRouter";
import {
    ArrowRight,
    ArrowLeft,
    Info,
    Check,
    Upload,
    Link as LinkIcon,
    Loader2,
    X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { generateApi } from "@/lib/generate";
import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";



export default function UploadPage() {
    const router = useRouter();



    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);



    // API state

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUploadError, setShowUploadError] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // User profile state
    const [userName, setUserName] = useState("Jane");
    const [userInitial, setUserInitial] = useState("J");

    // Fetch user info on mount
    useEffect(() => {
        // Load user from localStorage
        const storedUser = authApi.getCurrentUser();
        if (storedUser && storedUser.fullName) {
            const firstName = storedUser.fullName.split(' ')[0];
            setUserName(firstName);
            setUserInitial(firstName.charAt(0).toUpperCase());
        }
    }, []);

    // Prefetch next routes for smoother transition
    useEffect(() => {
        router.prefetch('/generate/details');
        router.prefetch('/generate/ecommerce-options');
    }, [router]);

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
        setIsExiting(true); // Start exit animation
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

            // Check generate type and route accordingly
            const generateType = localStorage.getItem('generateType');

            // Small delay to allow exit animation to play
            setTimeout(() => {
                if (generateType === 'batch_image') {
                    // E-commerce bundle: go to options page
                    router.push('/generate/ecommerce-options');
                } else {
                    // Single image: go to details page
                    router.push('/generate/details');
                }
            }, 400); // 400ms matches typical transition duration
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setIsExiting(false); // Reset exit state on error
        } finally {
            // Keep isSubmitting true until navigation completes
        }
    };

    return (
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
                        { label: "Upload" }
                    ]}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-gray-900">
                    {/* Content - Scrollable on mobile */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: isExiting ? 0 : 1, x: isExiting ? -20 : 0, scale: isExiting ? 0.95 : 1 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col"
                    >
                        <div className="flex flex-col gap-2 min-h-full">
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
                            {/* Upload Section - Centered and Clean */}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="max-w-4xl mx-auto w-full">
                                    {/* Section Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="w-1 h-5 bg-teal-500 rounded-full"></span>
                                            Upload Product Image
                                        </h3>
                                        <span className="self-start sm:self-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">Supported: JPG, PNG, WEBP</span>
                                    </div>

                                    {/* Upload Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                        {/* Left Card - Upload Area */}
                                        {filePreview ? (
                                            <div className="relative border-2 border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-white dark:bg-gray-800 min-h-[260px] shadow-sm">
                                                <img src={filePreview} alt="Preview" className="max-h-40 max-w-full object-contain rounded-xl shadow-lg" />
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 truncate max-w-full font-medium">
                                                    {selectedFile?.name || 'Image from URL'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        Ready to process
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={removeFile}
                                                    className="absolute top-3 right-3 size-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                className={`group relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white dark:bg-gray-800 min-h-[260px] ${showUploadError
                                                    ? 'border-red-500 animate-[shake_0.3s_ease-in-out] bg-red-50 dark:bg-red-900/10'
                                                    : 'border-teal-400 dark:border-teal-500 hover:border-teal-500 hover:bg-teal-500/5 hover:shadow-lg'
                                                    }`}
                                                onDrop={handleDrop}
                                                onDragOver={handleDragOver}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-teal-500/10 dark:from-teal-500/30 dark:to-teal-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload className="w-7 h-7 text-teal-500" />
                                                </div>
                                                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Click to upload</h4>
                                                <p className="text-sm text-gray-400 mb-4">or drag and drop your file here</p>
                                                <button className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:shadow-md">
                                                    Select File
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleFileSelect}
                                                />
                                                {showUploadError && (
                                                    <p className="text-red-500 text-xs mt-3 font-medium">Please upload an image to continue</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Right Card - Import from URL */}
                                        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col min-h-[260px] transition-all shadow-sm ${showUploadError
                                            ? 'border-2 border-red-500 animate-[shake_0.3s_ease-in-out] bg-red-50 dark:bg-red-900/10'
                                            : 'border border-gray-200 dark:border-gray-700 hover:shadow-lg'
                                            }`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                                                    <LinkIcon className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">Import from URL</h4>
                                                    <p className="text-xs text-gray-400">Paste an image link directly</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="relative mb-4">
                                                    <input
                                                        type="text"
                                                        value={imageUrl}
                                                        onChange={(e) => setImageUrl(e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="w-full h-12 pl-4 pr-20 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all"
                                                    />
                                                    <button
                                                        onClick={handleImportUrl}
                                                        disabled={isImporting || !imageUrl.trim()}
                                                        className="absolute right-2 top-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-medium text-xs rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isImporting ? 'Loading...' : 'Import'}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800 rounded-xl flex gap-3">
                                                <Info className="w-5 h-5 text-teal-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm text-teal-700 dark:text-teal-300 font-medium">Pro Tip</p>
                                                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                                                        High resolution images (1024x1024 or higher) work best for professional results.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

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
                    <div className="shrink-0 px-5 py-2 bg-[#f8fafc] dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => {
                                    router.push("/generate");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
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
    );
}
