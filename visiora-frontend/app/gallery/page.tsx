"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search,
    Filter,
    Download,
    Copy,
    Trash2,
    Loader2,
    Heart,
    X,
    ChevronDown,
    Image as ImageIcon,
} from "lucide-react";
import { galleryApi, GalleryImage, GalleryFilters, GalleryPagination, GalleryStats } from "@/lib/gallery";
import { Sidebar, Header } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryPage() {

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
    const [filterType, setFilterType] = useState<'all' | 'generated' | 'uploaded'>('all');

    // API state
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [pagination, setPagination] = useState<GalleryPagination | null>(null);
    const [stats, setStats] = useState<GalleryStats | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Image details modal state
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [loadingImageId, setLoadingImageId] = useState<string | null>(null);

    // Multi-select for bulk delete
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [selectMode, setSelectMode] = useState(false);

    // Custom Dropdown State for Filters
    const [activeDropdown, setActiveDropdown] = useState<'type' | 'sort' | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const typeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'generated', label: 'Generated' },
        { value: 'uploaded', label: 'Uploaded' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'name', label: 'By Name' }
    ];

    const isSearchMounted = useRef(false);

    // Ref to track if initial fetch has been done (within component lifecycle)
    const hasFetched = useRef(false);

    // Fetch images and stats on mount
    useEffect(() => {
        // Use ref to prevent double fetch in Strict Mode
        if (hasFetched.current) {
            console.log('⏭️ Gallery: Already fetched this mount cycle, skipping');
            return;
        }

        hasFetched.current = true;
        console.log('🚀 Gallery: Initial fetch starting...');

        // Fetch both images and stats
        fetchGalleryImages();
        fetchGalleryStats();

        // No cleanup needed - ref resets naturally on unmount
    }, []);

    // Debounce search input - skip first render
    useEffect(() => {
        // Skip first run (component mount)
        if (!isSearchMounted.current) {
            isSearchMounted.current = true;
            return;
        }

        // Debounce the search
        const timer = setTimeout(() => {
            console.log('🔍 Gallery: Search triggered:', searchQuery);
            fetchGalleryImages();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle filter changes
    const isFilterMounted = useRef(false);
    useEffect(() => {
        if (!isFilterMounted.current) {
            isFilterMounted.current = true;
            return;
        }
        console.log('🔍 Gallery: Filters changed, fetching...');
        fetchGalleryImages(1);
    }, [sortOrder, filterType]);

    const fetchGalleryImages = async (page: number = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const filters: GalleryFilters = {
                search: searchQuery || undefined,
                sort: sortOrder,
                type: filterType,
            };

            console.log('📸 Fetching gallery with filters:', { page, filters });

            const response = await galleryApi.getImages(page, 20, filters);

            if (response.success && response.data) {
                setImages(response.data.images);
                setPagination(response.data.pagination);
                console.log('✅ Gallery loaded:', response.data.images.length, 'images');
            } else {
                setError(response.error || 'Failed to load gallery');
                console.error('❌ Gallery load failed:', response.error);
            }
        } catch (err: any) {
            console.error('❌ Gallery fetch error:', err);
            setError(err.message || 'Failed to load gallery');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch gallery stats
    const fetchGalleryStats = async () => {
        try {
            const response = await galleryApi.getStats();

            if (response.success && response.data) {
                setStats(response.data);
                console.log('✅ Gallery stats loaded:', response.data);
            } else {
                console.warn('⚠️ Gallery stats failed:', response.error);
            }
        } catch (err: any) {
            console.error('❌ Gallery stats error:', err);
        }
    };

    // Reset filters
    const handleResetFilters = () => {
        setSortOrder('newest');
        setFilterType('all');
        setActiveDropdown(null);
    };

    // Delete image - calls DELETE /api/gallery/{id}
    const handleDelete = async (id: string) => {
        // Prevent duplicate calls
        if (isDeleting === id) return;

        // Confirm before deleting
        if (!confirm('Are you sure you want to delete this image?')) return;

        setIsDeleting(id);
        try {
            const response = await galleryApi.deleteImage(id);

            if (response.success) {
                console.log('✅ Image deleted:', response.data);
                // Remove from local state (optimistic update)
                setImages(prev => prev.filter(img => img.id !== id));
                // Update stats if available
                if (stats) {
                    setStats(prev => prev ? {
                        ...prev,
                        total_images: Math.max(0, (prev.total_images || 0) - 1),
                        totalImages: Math.max(0, (prev.totalImages || 0) - 1)
                    } : null);
                }
            } else {
                console.error('❌ Delete failed:', response.error);
                alert('Failed to delete: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('Failed to delete image. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleDownload = async (id: string, src: string, alt: string) => {
        if (!src) {
            console.error('No image source provided');
            return;
        }

        const filename = `${(alt || 'ephotocart_image').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${id}.jpg`;
        console.log('⬇️ Download requested:', { id, src, filename });

        // Handle Base64 images directly
        if (src.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = src;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        try {
            // Use the proxy directly for reliable downloads on all devices (mobile/desktop)
            // This avoids client-side fetch CORS issues and memory limits
            const proxyUrl = `/api/download?url=${encodeURIComponent(src)}&filename=${encodeURIComponent(filename)}`;

            const link = document.createElement('a');
            link.href = proxyUrl;
            link.download = filename; // Hint to browser
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('✅ Download initiated via Proxy Link');
        } catch (error) {
            console.error('❌ Download error:', error);
            // Fallback (unlikely to be reached for link click)
            window.location.href = src;
        }
    };

    const handleCopyPrompt = async (id: string, prompt: string) => {
        try {
            await navigator.clipboard.writeText(prompt);
        } catch (error) {
            console.warn('Copy failed:', error);
        }
    };

    // Toggle image selection for bulk delete
    const toggleImageSelection = (id: string) => {
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Select all images
    const selectAllImages = () => {
        setSelectedImages(new Set(images.map(img => img.id)));
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedImages(new Set());
        setSelectMode(false);
    };

    // Bulk delete - calls POST /api/gallery/bulk-delete
    const handleBulkDelete = async () => {
        if (selectedImages.size === 0) return;
        if (isBulkDeleting) return; // Prevent duplicate calls

        const count = selectedImages.size;
        if (!confirm(`Are you sure you want to delete ${count} image${count > 1 ? 's' : ''}?`)) return;

        setIsBulkDeleting(true);
        try {
            const imageIds = Array.from(selectedImages);
            const response = await galleryApi.bulkDelete(imageIds);

            if (response.success && response.data) {
                const { deleted, failed, not_found } = response.data;
                console.log('✅ Bulk delete result:', { deleted: deleted.length, failed: failed.length, not_found: not_found.length });

                // Remove deleted images from local state
                const deletedIds = new Set(deleted.map(d => d.id));
                setImages(prev => prev.filter(img => !deletedIds.has(img.id)));

                // Update stats
                if (stats) {
                    setStats(prev => prev ? {
                        ...prev,
                        total_images: Math.max(0, (prev.total_images || 0) - deleted.length),
                        totalImages: Math.max(0, (prev.totalImages || 0) - deleted.length)
                    } : null);
                }

                // Clear selection
                clearSelection();

                // Show result message
                if (failed.length > 0 || not_found.length > 0) {
                    alert(`Deleted ${deleted.length} images. Failed: ${failed.length}, Not found: ${not_found.length}`);
                }
            } else {
                console.error('❌ Bulk delete failed:', response.error);
                alert('Failed to delete: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Bulk delete error:', error);
            alert('Failed to delete images. Please try again.');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    // Toggle favorite - calls POST /api/gallery/{id}/favorite
    const [togglingFavoriteId, setTogglingFavoriteId] = useState<string | null>(null);

    const handleToggleFavorite = async (id: string) => {
        // Prevent duplicate calls
        if (togglingFavoriteId === id) return;

        // Optimistic UI update first
        const wasInFavorites = favorites.has(id);
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });

        setTogglingFavoriteId(id);
        try {
            const response = await galleryApi.toggleFavorite(id);

            if (response.success && response.data) {
                console.log('✅ Favorite toggled:', response.data);
                // Sync with server response if needed
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    if (response.data!.isFavorite) {
                        newFavorites.add(id);
                    } else {
                        newFavorites.delete(id);
                    }
                    return newFavorites;
                });
            } else {
                // Rollback on failure
                console.error('❌ Toggle favorite failed:', response.error);
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    if (wasInFavorites) {
                        newFavorites.add(id);
                    } else {
                        newFavorites.delete(id);
                    }
                    return newFavorites;
                });
            }
        } catch (error) {
            console.error('❌ Toggle favorite error:', error);
            // Rollback on error
            setFavorites(prev => {
                const newFavorites = new Set(prev);
                if (wasInFavorites) {
                    newFavorites.add(id);
                } else {
                    newFavorites.delete(id);
                }
                return newFavorites;
            });
        } finally {
            setTogglingFavoriteId(null);
        }
    };

    // View image details - opens modal with full image
    const handleViewImage = (id: string) => {
        console.log('👁️ Opening image:', id);

        // Find image in local state
        const image = images.find(img => img.id === id);

        if (image) {
            setSelectedImage(image);
            setShowImageModal(true);
            console.log('✅ Modal opened for image:', image.filename);
        } else {
            console.error('❌ Image not found:', id);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
            {/* Reusable Sidebar */}
            <Sidebar activeNav="gallery" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-100 dark:bg-gray-900 transition-colors duration-300">
                {/* Reusable Header with dynamic breadcrumbs */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "My Gallery" }
                    ]}
                />

                {/* Fixed Gallery Content */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
                    <div className="h-full flex flex-col gap-3">
                        {/* Page Heading & Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 shrink-0">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">My <span className="text-teal-500">Gallery</span></h1>
                                <p className="text-slate-500 dark:text-gray-400 text-xs">
                                    Manage and organize your AI generated artwork.
                                    <span className="ml-2 text-teal-600 dark:text-teal-400">
                                        ({(stats?.totalImages || stats?.total_images || 0)} total • {(stats?.totalGenerated || stats?.total_generated || 0)} generated • {(stats?.totalUploaded || stats?.total_uploaded || 0)} uploaded)
                                    </span>
                                </p>
                            </div>

                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Bulk Delete Controls */}
                                {selectMode ? (
                                    <div className="flex items-center gap-2 mr-2">
                                        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium px-2">
                                            {selectedImages.size} selected
                                        </span>
                                        <button
                                            onClick={selectAllImages}
                                            className="px-3 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-xl transition-all border border-teal-200/50 dark:border-teal-800/50"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            disabled={selectedImages.size === 0 || isBulkDeleting}
                                            className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200/50 dark:border-red-800/50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                        >
                                            {isBulkDeleting ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                            Delete
                                        </button>
                                        <button
                                            onClick={clearSelection}
                                            className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100/50 dark:bg-gray-800/50 hover:bg-slate-200/50 dark:hover:bg-gray-700/50 border border-slate-200 dark:border-gray-700 rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSelectMode(true)}
                                        className="pl-3 pr-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500"
                                    >
                                        <div className="w-4 h-4 rounded border-2 border-slate-400/60 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-[1px] bg-slate-400/40" />
                                        </div>
                                        Select
                                    </button>
                                )}

                                {/* Search */}
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    {isLoading && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                                    )}
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-48 py-2.5 bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border border-slate-200/60 dark:border-gray-700/60 rounded-xl pl-9 pr-9 text-xs font-semibold text-slate-700 dark:text-gray-200 placeholder-slate-400/80 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 transition-all shadow-sm hover:bg-white/60 dark:hover:bg-gray-700/60"
                                        placeholder="Search filename..."
                                        type="text"
                                    />
                                </div>

                                {/* Filters Row */}
                                <div className="flex items-center gap-2" ref={dropdownRef}>
                                    {/* Type Filter - Hidden requested by user
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                                            className={`pl-3 pr-8 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-sm transition-all
                                                ${activeDropdown === 'type'
                                                    ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-teal-700 dark:text-teal-400'
                                                    : 'bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                        >
                                            <Filter className={`w-3.5 h-3.5 transition-colors ${activeDropdown === 'type' ? 'text-teal-500' : 'text-slate-500 dark:text-gray-400'}`} />
                                            <span>{typeOptions.find(o => o.value === filterType)?.label}</span>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'type' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                            </div>
                                        </button>

                                        {activeDropdown === 'type' && (
                                            <div className="absolute top-full left-0 mt-2 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-teal-100 dark:border-teal-900/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                <div className="p-1.5 flex flex-col gap-0.5">
                                                    {typeOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => {
                                                                setFilterType(option.value as any);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between
                                                                ${filterType === option.value
                                                                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                                                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    */}

                                    {/* Sort Filter */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                                            className={`pl-3 pr-8 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-sm transition-all
                                                ${activeDropdown === 'sort'
                                                    ? 'bg-white dark:bg-gray-800 border-teal-500 ring-2 ring-teal-500/10 text-teal-700 dark:text-teal-400'
                                                    : 'bg-slate-50/50 dark:bg-gray-800/50 backdrop-blur-md border-slate-200/60 dark:border-gray-700/60 text-slate-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:border-slate-300 dark:hover:border-gray-500'}`}
                                        >
                                            <span className="text-slate-400 dark:text-gray-500 font-normal">Sort:</span>
                                            <span>{sortOptions.find(o => o.value === sortOrder)?.label}</span>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'sort' ? 'rotate-180 text-teal-500' : 'text-slate-400'}`} />
                                            </div>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeDropdown === 'sort' && (
                                            <div className="absolute top-full left-0 mt-2 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-teal-100 dark:border-teal-900/30 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                <div className="p-1.5 flex flex-col gap-0.5">
                                                    {sortOptions.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => {
                                                                setSortOrder(option.value as any);
                                                                setActiveDropdown(null);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between
                                                                ${sortOrder === option.value
                                                                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                                                                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-white'
                                                                }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-400 text-xs">
                                {error}
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && images.length === 0 && (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                    <p className="text-sm text-slate-500 dark:text-gray-400">Loading gallery...</p>
                                </div>
                            </div>
                        )}

                        {/* Gallery Grid or Empty State */}
                        {!isLoading && (
                            <div className="flex-1 min-h-0 overflow-hidden">
                                {images.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                            <ImageIcon className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No images found</h3>
                                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xs">
                                            {searchQuery
                                                ? `No images matching "${searchQuery}"`
                                                : "You haven't generated any images yet. Start creating to see your artwork here."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-full overflow-y-auto p-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                            {images.map((image, index) => (
                                                <motion.div
                                                    key={image.id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: "-50px" }}
                                                    transition={{
                                                        duration: 0.4,
                                                        delay: (index % 4) * 0.1,
                                                        ease: "easeOut"
                                                    }}
                                                    className={`group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-700 border-2 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 ${selectedImages.has(image.id)
                                                        ? 'border-teal-500 ring-2 ring-teal-500/30'
                                                        : 'border-slate-200 dark:border-gray-600 hover:border-teal-500 hover:shadow-teal-500/20'
                                                        }`}
                                                >
                                                    {/* Clickable Image */}
                                                    <div
                                                        className="absolute inset-0 cursor-pointer flex items-center justify-center bg-slate-100 dark:bg-gray-700"
                                                        onClick={() => {
                                                            if (selectMode) {
                                                                toggleImageSelection(image.id);
                                                            } else {
                                                                handleViewImage(image.id);
                                                            }
                                                        }}
                                                    >
                                                        <img
                                                            alt={image.filename || image.alt || 'Gallery Image'}
                                                            className="w-full h-full object-cover"
                                                            src={image.url || image.src}
                                                        />
                                                        {/* Loading overlay when fetching details */}
                                                        {loadingImageId === image.id && (
                                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Selection Checkbox (visible in select mode) */}
                                                    {selectMode && (
                                                        <div className="absolute top-2 right-2 z-20">
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleImageSelection(image.id);
                                                                }}
                                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${selectedImages.has(image.id)
                                                                    ? 'bg-teal-500 border-teal-500'
                                                                    : 'bg-white/80 border-slate-300 hover:border-teal-500'
                                                                    }`}
                                                            >
                                                                {selectedImages.has(image.id) && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Type Badge */}
                                                    <div className={`absolute top-2 left-2 transition-opacity z-10 ${selectMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                        <div className={`backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${image.type === 'generated'
                                                            ? 'bg-teal-600/80'
                                                            : 'bg-purple-600/80'
                                                            }`}>
                                                            {image.type}
                                                        </div>
                                                    </div>

                                                    {/* Deleting Overlay */}
                                                    {isDeleting === image.id && (
                                                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-20">
                                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                        </div>
                                                    )}

                                                    {/* Hover Overlay - click also opens image */}
                                                    <div
                                                        className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5 cursor-pointer"
                                                        onClick={() => {
                                                            if (!selectMode) {
                                                                handleViewImage(image.id);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between gap-1.5">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(image.id, image.url || image.src || '', image.filename || image.alt || '');
                                                                    }}
                                                                    className="size-6 rounded bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                                                                    title="Download"
                                                                >
                                                                    <Download className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopyPrompt(image.id, image.filename || '');
                                                                    }}
                                                                    className="size-6 rounded bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
                                                                    title="Copy Filename"
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleFavorite(image.id);
                                                                    }}
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(image.id);
                                                                }}
                                                                disabled={isDeleting === image.id}
                                                                className="size-6 rounded text-white/60 hover:text-red-400 hover:bg-red-400/10 backdrop-blur-sm flex items-center justify-center transition-colors disabled:opacity-50"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Pagination Info */}
                                        {pagination && pagination.total_pages > 1 && (
                                            <div className="mt-4 text-center text-xs text-slate-500 dark:text-gray-400">
                                                Page {pagination.current_page} of {pagination.total_pages}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main >

            {/* Image Details Modal */}
            <AnimatePresence>
                {showImageModal && selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowImageModal(false)}></div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between shrink-0">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Image Details</h3>
                                <button
                                    onClick={() => setShowImageModal(false)}
                                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Image - Larger and more prominent */}
                                    <div className="lg:w-3/4">
                                        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-800 dark:to-gray-900 border border-slate-200 dark:border-gray-600 flex items-center justify-center shadow-inner">
                                            <img
                                                src={selectedImage.url || selectedImage.src}
                                                alt={selectedImage.filename || selectedImage.alt}
                                                className="w-full h-auto max-h-[70vh] object-contain"
                                            />
                                        </div>
                                    </div>

                                    {/* Minimal Details Panel */}
                                    <div className="lg:w-1/4 flex flex-col gap-4">
                                        {/* Image Info Card */}
                                        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-700/50 rounded-2xl p-5 border border-slate-100 dark:border-gray-600 shadow-sm space-y-4">
                                            {/* Type Badge */}
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedImage.type === 'generated'
                                                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
                                                    : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                                    }`}>
                                                    <ImageIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-gray-400">Type</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{selectedImage.type}</p>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-slate-100 dark:border-gray-600"></div>

                                            {/* Created Date */}
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">Created</p>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                                    {new Date(selectedImage.created_at || selectedImage.createdAt || '').toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                                    {new Date(selectedImage.created_at || selectedImage.createdAt || '').toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Download Button */}
                                        <button
                                            onClick={() => handleDownload(selectedImage.id, selectedImage.url || selectedImage.src || '', selectedImage.filename || 'image')}
                                            className="w-full py-2.5 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 hover:from-teal-500 hover:via-teal-400 hover:to-emerald-400 rounded-xl text-sm font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
