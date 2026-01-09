"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Grid,
    List,
    Download,
    Copy,
    Trash2,
    Loader2,
    Heart,
} from "lucide-react";
import { galleryApi, GalleryImage, UserCredits, GalleryStats } from "@/lib/gallery";
import { Sidebar, Header } from "@/components/layout";

export default function GalleryPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // API state
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [galleryStats, setGalleryStats] = useState<GalleryStats | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Fallback images if API fails
    const fallbackImages: GalleryImage[] = [
        {
            id: "1",
            src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
            alt: "Abstract 3D rendering",
            prompt: "Abstract 3D rendering of blue and purple shapes...",
            upscaled: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: "2",
            src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
            alt: "Portrait with dramatic lighting",
            prompt: "Portrait with dramatic lighting, cinematic style...",
            upscaled: true,
            createdAt: new Date().toISOString(),
        },
        {
            id: "3",
            src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop",
            alt: "Abstract fluid art",
            prompt: "Fluid oil painting mixing blue and orange...",
            upscaled: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: "4",
            src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=400&fit=crop",
            alt: "Neon city landscape",
            prompt: "Cyberpunk city street at night with neon...",
            upscaled: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: "5",
            src: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=400&h=400&fit=crop",
            alt: "Geometric architecture",
            prompt: "Modern minimalist architecture...",
            upscaled: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: "6",
            src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
            alt: "Floating islands landscape",
            prompt: "Fantasy landscape with floating islands...",
            upscaled: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: "7",
            src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
            alt: "Robot face digital art",
            prompt: "Portrait of a cute robot with glowing eyes...",
            upscaled: false,
            createdAt: new Date().toISOString(),
        },
        {
            id: "8",
            src: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&h=400&fit=crop",
            alt: "Abstract dark texture",
            prompt: "Dark abstract texture with golden veins...",
            upscaled: false,
            createdAt: new Date().toISOString(),
        },
    ];

    // Fetch images and user credits on mount
    useEffect(() => {
        fetchGalleryData();
        fetchUserCredits();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch images when search changes
    useEffect(() => {
        if (debouncedSearch) {
            searchImages(debouncedSearch);
        } else {
            fetchGalleryData();
        }
    }, [debouncedSearch]);

    const fetchGalleryData = async () => {
        setIsLoading(true);
        try {
            const [imagesRes, statsRes] = await Promise.all([
                galleryApi.getImages(1, 20),
                galleryApi.getStats(),  // GET /api/gallery/stats
            ]);

            if (imagesRes.success && imagesRes.data) {
                setImages(imagesRes.data.images);
            } else {
                setImages(fallbackImages);
            }

            if (statsRes.success && statsRes.data) {
                setGalleryStats(statsRes.data);
            }
        } catch (error) {
            console.warn('Failed to fetch gallery data:', error);
            setImages(fallbackImages);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserCredits = async () => {
        try {
            const response = await galleryApi.getUserCredits();
            if (response.success && response.data) {
                setUserCredits(response.data);
            }
        } catch (error) {
            console.warn('Failed to fetch user credits:', error);
        }
    };

    const searchImages = async (query: string) => {
        setIsLoading(true);
        try {
            const response = await galleryApi.searchImages(query);
            if (response.success && response.data) {
                setImages(response.data);
            }
        } catch (error) {
            console.warn('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const response = await galleryApi.deleteImage(id);
            if (response.success) {
                setImages(prev => prev.filter(img => img.id !== id));
            }
        } catch (error) {
            console.warn('Delete failed:', error);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleDownload = async (id: string, src: string, alt: string) => {
        try {
            // Try to get download URL from API first
            const response = await galleryApi.getDownloadUrl(id);
            const downloadUrl = response.success && response.data ? response.data.downloadUrl : src;

            // Fetch the image and download it
            const imageResponse = await fetch(downloadUrl);
            const blob = await imageResponse.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${alt.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'image'}_${id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.warn('Download failed:', error);
            // Fallback: open in new tab if download fails
            window.open(src, '_blank');
        }
    };

    const handleCopyPrompt = async (id: string, prompt: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
            // Could show a toast notification here
        } catch (error) {
            console.warn('Copy failed:', error);
        }
    };

    const handleToggleFavorite = async (id: string) => {
        // Optimistic update - toggle UI immediately
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });

        // Call API in background
        try {
            await galleryApi.toggleFavorite(id);
        } catch (error) {
            console.warn('Toggle favorite API failed:', error);
            // Optionally revert on error
        }
    };

    // Display images (from API or fallback)
    const displayImages = images.length > 0 ? images : fallbackImages;

    // User credits display (fallback)
    const freeCredits = userCredits?.freeCredits ?? 1;
    const balance = userCredits?.balance ?? 12.00;

    return (
        <div className="min-h-screen flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Reusable Sidebar */}
            <Sidebar activeNav="gallery" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-full overflow-x-hidden lg:overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Reusable Header with dynamic breadcrumbs */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "My Gallery" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                />

                {/* Fixed Gallery Content - No Scroll */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto lg:overflow-hidden">
                    <div className="h-full flex flex-col gap-3">
                        {/* Page Heading & Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 shrink-0">
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">My Gallery</h1>
                                <p className="text-slate-500 dark:text-gray-400 text-xs">Manage and organize your AI generated artwork.</p>
                            </div>

                            {/* Toolbar */}
                            <div className="flex items-center gap-2">
                                {/* Search */}
                                <div className="relative group">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    {isLoading && (
                                        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
                                    )}
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-40 h-8 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-md pl-8 pr-8 text-xs text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                                        placeholder="Search..."
                                        type="text"
                                    />
                                </div>

                                {/* Filter Dropdown */}
                                <button className="h-8 px-2.5 flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-md text-xs font-medium text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-gray-600 transition-all">
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Filter</span>
                                </button>


                                {/* View Toggle */}
                                <div className="flex items-center bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-md p-0.5 h-8">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-1 rounded transition-all ${viewMode === "grid" ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300"}`}
                                    >
                                        <Grid className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-1 rounded transition-all ${viewMode === "list" ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300"}`}
                                    >
                                        <List className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Gallery Grid - Fixed, Square Cards */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4 min-h-0 content-start lg:content-center">
                            {displayImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="group relative aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-teal-500/50 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-teal-500/10"
                                >
                                    <div className="absolute inset-0">
                                        <img
                                            alt={image.alt}
                                            className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                                            src={image.src}
                                        />
                                    </div>

                                    {/* Upscaled Badge */}
                                    {image.upscaled && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <div className="bg-slate-800/80 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                Upscaled
                                            </div>
                                        </div>
                                    )}

                                    {/* Deleting Overlay */}
                                    {isDeleting === image.id && (
                                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-20">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                                        <p className="text-white text-[10px] line-clamp-2 mb-2 font-medium">
                                            {image.prompt}
                                        </p>
                                        <div className="flex items-center justify-between gap-1.5">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDownload(image.id, image.src, image.alt)}
                                                    className="size-6 rounded bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                                                    title="Download"
                                                >
                                                    <Download className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleCopyPrompt(image.id, image.prompt)}
                                                    className="size-6 rounded bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                                                    title="Copy Prompt"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleFavorite(image.id)}
                                                    className={`size-6 rounded backdrop-blur-sm flex items-center justify-center transition-colors ${favorites.has(image.id)
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                                        }`}
                                                    title={favorites.has(image.id) ? "Remove from Favorites" : "Add to Favorites"}
                                                >
                                                    <Heart className={`w-3 h-3 ${favorites.has(image.id) ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(image.id)}
                                                disabled={isDeleting === image.id}
                                                className="size-6 rounded text-white/60 hover:text-red-400 hover:bg-red-400/10 backdrop-blur-sm flex items-center justify-center transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
