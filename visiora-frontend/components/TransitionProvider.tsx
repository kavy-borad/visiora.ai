"use client";

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface TransitionContextType {
    isTransitioning: boolean;
    startTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType>({
    isTransitioning: false,
    startTransition: () => { },
});

export const usePageTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [nextPath, setNextPath] = useState<string | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const previousPathRef = useRef<string | null>(null);

    // End transition when route changes - with minimum display time
    useEffect(() => {
        const currentPath = pathname + (searchParams?.toString() || '');

        // Only process if path actually changed
        if (previousPathRef.current !== currentPath) {
            previousPathRef.current = currentPath;

            // End transition after minimum display time for visibility
            if (isTransitioning) {
                // Minimum 500ms loader visibility to ensure new page is fully rendered
                // This prevents the "flash of old content" issue
                setTimeout(() => {
                    setIsTransitioning(false);
                    // Clear nextPath slightly after to ensure smooth fade out
                    setTimeout(() => setNextPath(null), 200);
                }, 500);
            }
        }
    }, [pathname, searchParams, isTransitioning]);

    // Clear transition after a max timeout to prevent stuck states
    useEffect(() => {
        if (isTransitioning) {
            // Safety timeout
            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
                setNextPath(null);
            }, 3000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isTransitioning]);

    const startTransition = useCallback(() => {
        setIsTransitioning(true);
    }, []);

    // Lightweight click listener for internal navigation
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href) return;

            // Skip non-navigation links
            const isExternalLink = href.startsWith("http") && !href.startsWith(window.location.origin);
            const isHashLink = href.startsWith("#");
            const isMailto = href.startsWith("mailto:");
            const isNewTab = anchor.target === "_blank";
            const isModifiedClick = e.ctrlKey || e.metaKey || e.shiftKey;
            const isDownload = anchor.hasAttribute("download");

            if (isExternalLink || isHashLink || isMailto || isNewTab || isModifiedClick || isDownload) {
                return;
            }

            // Check if navigating to a different route
            const currentPath = window.location.pathname + window.location.search;
            const targetPath = href.startsWith(window.location.origin)
                ? href.replace(window.location.origin, '')
                : href;

            if (currentPath !== targetPath) {
                setNextPath(targetPath);
                setIsTransitioning(true);
            }
        };

        // Handle browser back/forward navigation
        const handlePopState = () => {
            setNextPath(window.location.pathname + window.location.search);
            setIsTransitioning(true);
        };

        document.addEventListener("click", handleClick, { passive: true });
        window.addEventListener("popstate", handlePopState);

        return () => {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // Helper to determine skeleton type
    // NOTE: This global transition loader requires manual mapping of skeletons to page structures.
    // For "automatic" skeletons that update with page UI, the standard Next.js approach is using
    // `loading.tsx` files in each route directory. However, this global overlay provides a 
    // smoother, instant interaction feedback that `loading.tsx` sometimes misses on client nav.
    const getSkeletonContent = () => {
        const path = nextPath || pathname; // Fallback to current path if nextPath not set

        // 0. Disable Loader for Auth Pages
        // We want these pages to load instantly with their own internal animations
        if (path.includes('/login') || path.includes('/register') || path.includes('/signup') || path.includes('/features') || path.includes('/solutions')) {
            return null;
        }

        // 1. Dashboard Skeleton
        if (path === '/dashboard' || path.startsWith('/dashboard')) {
            return (
                <div className="w-full h-full flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                    {/* Sidebar Skeleton */}
                    <aside className="w-56 h-full hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 shrink-0">
                        {/* Logo Area */}
                        <div className="h-16 flex items-center px-6 shrink-0">
                            <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg animate-pulse" />
                            <div className="h-4 w-24 bg-slate-200 dark:bg-gray-700 rounded animate-pulse ml-3" />
                        </div>
                        {/* Nav Items */}
                        <div className="flex-1 py-4 px-3 space-y-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg animate-pulse">
                                    <div className="size-5 bg-slate-200 dark:bg-gray-700 rounded" />
                                    <div className="h-4 w-24 bg-slate-100 dark:bg-gray-700/50 rounded" />
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content Wrappers - Matches DashboardPage structure exactly */}
                    <main className="flex-1 flex flex-col min-w-0 h-full overflow-x-hidden lg:overflow-hidden">
                        {/* Header Skeleton */}
                        <div className="h-16 border-b border-slate-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur flex items-center justify-between px-4 sm:px-6 shrink-0">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            {/* Right Side */}
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-20 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                <div className="h-8 w-24 bg-teal-50 dark:bg-teal-900/20 rounded animate-pulse" />
                            </div>
                        </div>

                        {/* Content Scrollable Area */}
                        <div className="flex-1 p-3 sm:p-4 overflow-y-auto lg:overflow-hidden">
                            <div className="flex flex-col gap-3 sm:gap-4 lg:h-full">
                                {/* Page Header */}
                                <div className="flex flex-col gap-1 shrink-0">
                                    <div className="h-6 w-32 bg-slate-800 dark:bg-white rounded animate-pulse" />
                                    <div className="h-3 w-48 bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 shrink-0">
                                    {[
                                        { color: "bg-teal-500" },
                                        { color: "bg-blue-500" },
                                        { color: "bg-indigo-500" },
                                        { color: "bg-purple-500" }
                                    ].map((style, i) => (
                                        <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col gap-3 animate-pulse shadow-sm relative overflow-hidden">
                                            <div className={`absolute top-0 inset-x-0 h-1 ${style.color} opacity-50`} />
                                            <div className="flex justify-between items-center">
                                                <div className="h-3 w-20 bg-slate-200 dark:bg-gray-700 rounded" />
                                                <div className={`size-4 ${style.color} opacity-20 rounded`} />
                                            </div>
                                            <div className="h-7 w-16 bg-slate-800 dark:bg-white rounded" />
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full w-1/2 ${style.color} opacity-40`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Area - Matches dashboard/page.tsx exact DOM structure */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:flex-1 lg:min-h-0">
                                    {/* Left Chart (Area) skeleton */}
                                    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col h-[160px] sm:h-[180px] lg:h-auto animate-pulse">
                                        <div className="flex items-center justify-between mb-3 shrink-0">
                                            <div className="h-4 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
                                            <div className="h-5 w-20 bg-slate-100 dark:bg-gray-700 rounded border border-slate-200 dark:border-gray-600" />
                                        </div>
                                        <div className="flex-1 relative min-h-0">
                                            {/* Y-axis labels (Absolute) */}
                                            <div className="absolute left-0 top-0 bottom-4 w-6 flex flex-col justify-between pr-1">
                                                <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded" />
                                                <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded" />
                                                <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded" />
                                            </div>
                                            {/* Chart Content (Offset) */}
                                            <div className="ml-7 h-full flex flex-col">
                                                <div className="flex-1 relative border-l border-b border-slate-100 dark:border-gray-700/50">
                                                    {/* Grid lines */}
                                                    <div className="absolute inset-0 flex flex-col justify-between">
                                                        <div className="border-t border-slate-100 dark:border-gray-700/50 w-full" />
                                                        <div className="border-t border-slate-100 dark:border-gray-700/50 w-full" />
                                                        <div className="border-t border-slate-100 dark:border-gray-700/50 w-full" />
                                                    </div>
                                                    {/* Simulated Path (Empty/Starting state) */}
                                                    <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-teal-50/50 dark:from-teal-900/10 to-transparent clip-path-polygon-[0_100%,100%_100%,100%_0,0_0]" />
                                                </div>
                                                {/* X-axis labels */}
                                                <div className="flex justify-between pt-1 shrink-0 gap-1">
                                                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                                        <div key={i} className="h-2 w-4 bg-slate-100 dark:bg-gray-700/50 rounded" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Chart (Bar) skeleton */}
                                    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col h-[160px] sm:h-[180px] lg:h-auto animate-pulse">
                                        <div className="flex items-center justify-between mb-3 shrink-0">
                                            <div className="h-4 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
                                            <div className="flex gap-3">
                                                <div className="flex items-center gap-1">
                                                    <div className="size-2 rounded-full bg-teal-200 dark:bg-teal-800" />
                                                    <div className="h-2 w-8 bg-slate-200 dark:bg-gray-700 rounded" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="size-2 rounded-full bg-slate-200 dark:bg-gray-700" />
                                                    <div className="h-2 w-8 bg-slate-200 dark:bg-gray-700 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 relative min-h-0">
                                            {/* Y-axis labels (Absolute) */}
                                            <div className="absolute left-0 top-0 bottom-4 w-6 flex flex-col justify-between pr-1">
                                                <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded" />
                                                <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded" />
                                                <div className="h-2 w-full bg-slate-200 dark:bg-gray-700 rounded" />
                                            </div>
                                            {/* Chart Content (Offset) */}
                                            <div className="ml-7 h-full flex flex-col">
                                                <div className="flex-1 flex items-end justify-between gap-2 border-b border-slate-100 dark:border-gray-700/50">
                                                    {/* Bars - Starting small (not grown) */}
                                                    {[20, 30, 15, 40, 25, 35, 20].map((h, i) => (
                                                        <div key={i} className="flex-1 flex flex-col justify-end h-full">
                                                            <div className="w-full bg-slate-100 dark:bg-gray-700/50 rounded-t-[2px]" style={{ height: `${h * 0.5}%` }}>
                                                                <div className="w-full h-1/2 bg-teal-50 dark:bg-teal-900/20 rounded-t-[2px]" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* X-axis labels */}
                                                <div className="flex justify-between pt-1 shrink-0 gap-1">
                                                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                                        <div key={i} className="h-2 flex-1 bg-slate-100 dark:bg-gray-700/50 rounded" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Generations - Matches exact grid columns */}
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 animate-pulse shrink-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="h-4 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
                                        <div className="h-3 w-16 bg-teal-100 dark:bg-teal-900/30 rounded" />
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 2xl:grid-cols-10 gap-2 sm:gap-4">
                                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                            <div key={i} className="aspect-square bg-slate-100 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600" />
                                        ))}
                                        <div className="aspect-square bg-slate-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-slate-300 dark:border-gray-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }

        // 1. Landing Page Skeleton
        if (path === '/' || path.includes('view=landing')) {
            return (
                <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-900">
                    {/* Navbar Skeleton */}
                    <div className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-8">
                            <div className="h-8 w-24 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="flex gap-4 hidden md:flex">
                                <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-9 w-20 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-9 w-24 bg-teal-500/20 dark:bg-teal-900/20 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center p-6 lg:p-12">
                        {/* Left: Hero Text */}
                        <div className="flex flex-col items-center lg:items-start space-y-6">
                            <div className="h-6 w-32 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse" />
                            <div className="space-y-4 w-full">
                                <div className="h-12 w-3/4 mx-auto lg:mx-0 bg-slate-800 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-12 w-1/2 mx-auto lg:mx-0 bg-teal-500/30 dark:bg-teal-900/40 rounded-lg animate-pulse" />
                            </div>
                            <div className="h-20 w-full max-w-md bg-slate-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                            <div className="flex gap-4 pt-4">
                                <div className="h-12 w-40 bg-slate-800 dark:bg-gray-700 rounded-xl animate-pulse" />
                                <div className="h-12 w-40 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl animate-pulse" />
                            </div>
                        </div>

                        {/* Right: Stats Grid */}
                        <div className="hidden md:grid grid-cols-2 gap-4 opacity-50">
                            <div className="h-40 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 animate-pulse" />
                            <div className="h-40 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 animate-pulse mt-8" />
                            <div className="h-40 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 animate-pulse" />
                            <div className="h-40 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 animate-pulse mt-8" />
                        </div>
                    </div>
                </div>
            );
        }



        // 3. Solutions Skeleton


        // 4. Pricing Skeleton
        if (path.includes('/pricing')) {
            return (
                <div className="min-h-screen lg:h-screen w-screen lg:overflow-hidden overflow-x-hidden bg-gradient-to-br from-teal-50/50 via-slate-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
                    {/* Public Navbar */}
                    <div className="shrink-0 border-b border-slate-200/60 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 relative w-full">
                        <div className="px-4 sm:px-6 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-9 sm:h-10 w-9 sm:w-10 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="hidden lg:flex gap-8">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-20 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse" />)}
                            </div>
                            <div className="hidden lg:flex gap-3">
                                <div className="size-9 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-9 w-20 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-9 w-28 bg-teal-500/20 dark:bg-teal-900/20 rounded-lg animate-pulse" />
                            </div>
                            <div className="lg:hidden size-9 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    <main className="flex-1 flex flex-col items-center justify-start lg:justify-center overflow-y-auto lg:overflow-hidden px-4 sm:px-6 py-6 lg:py-4">
                        {/* Header */}
                        <div className="shrink-0 text-center max-w-3xl mx-auto mb-4 lg:mb-4 w-full">
                            <div className="inline-flex h-5 w-20 bg-white dark:bg-gray-800 border border-teal-100 dark:border-gray-700 rounded-full animate-pulse mb-2 shadow-sm mx-auto" />
                            <div className="h-8 w-48 bg-slate-900 dark:bg-white rounded-lg animate-pulse mx-auto mb-1" />
                            <div className="h-4 w-64 bg-slate-400 dark:bg-gray-500 rounded animate-pulse mx-auto" />
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full mx-auto lg:flex-1 lg:min-h-0">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`relative flex flex-col p-4 bg-white dark:bg-gray-800 rounded-xl border animate-pulse gap-4 
                                    ${i === 2 ? 'border-teal-300 dark:border-teal-600 shadow-lg sm:col-span-2 lg:col-span-1' : 'border-slate-200 dark:border-gray-700 shadow-sm'}`}>

                                    {/* Popular Badge Placeholder */}
                                    {i === 2 && (
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-16 bg-teal-500 rounded-full" />
                                    )}

                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`size-9 rounded-lg ${i === 2 ? 'bg-teal-100' : 'bg-slate-100'} dark:bg-gray-700`} />
                                        <div className="flex flex-col gap-1">
                                            <div className="h-5 w-20 bg-slate-800 dark:bg-white rounded" />
                                            <div className="h-3 w-28 bg-slate-300 dark:bg-gray-500 rounded" />
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="h-8 w-24 bg-slate-900 dark:bg-white rounded border-b border-slate-100 dark:border-gray-700 pb-3 mb-3" />

                                    {/* Feature List */}
                                    <div className="space-y-2 flex-1">
                                        {[1, 2, 3, 4].map(j => (
                                            <div key={j} className="flex gap-2 items-center">
                                                <div className="size-3 bg-teal-200 dark:bg-teal-800 rounded-full" />
                                                <div className="h-3 w-full bg-slate-100 dark:bg-gray-700/40 rounded" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`h-10 w-full rounded-lg ${i === 2 ? 'bg-teal-500' : 'bg-slate-100 dark:bg-gray-700'}`} />
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            );
        }

        // 5. Results Skeleton
        if (path.includes('/results')) {
            return (
                <div className="min-h-screen lg:h-screen w-screen lg:overflow-hidden overflow-x-hidden bg-gradient-to-br from-teal-50/50 via-slate-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
                    {/* Public Navbar Menu */}
                    <div className="shrink-0 border-b border-slate-200/60 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 relative w-full">
                        <div className="px-4 sm:px-6 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-9 sm:h-10 w-9 sm:w-10 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="hidden lg:flex gap-8">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-20 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse" />)}
                            </div>
                            <div className="hidden lg:flex gap-3">
                                <div className="size-9 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-9 w-20 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-9 w-28 bg-teal-500/20 dark:bg-teal-900/20 rounded-lg animate-pulse" />
                            </div>
                            <div className="lg:hidden size-9 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    <main className="flex-1 flex flex-col items-center overflow-y-auto lg:overflow-hidden">
                        {/* Hero Section */}
                        <div className="shrink-0 flex w-full flex-col items-center pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 md:px-10">
                            <div className="flex flex-col items-center gap-3 mb-6 w-full max-w-[960px] text-center">
                                <div className="h-6 sm:h-7 w-40 bg-white dark:bg-gray-800 border border-teal-100 dark:border-gray-700 rounded-full animate-pulse shadow-sm" />
                                <div className="h-8 sm:h-10 w-64 bg-slate-900 dark:bg-white rounded-lg animate-pulse mt-1" />
                                <div className="h-4 sm:h-5 w-full max-w-lg bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                            </div>
                        </div>

                        {/* Showcase Grid Container */}
                        <div className="flex-1 flex flex-col max-w-[1280px] w-full px-4 md:px-6 mx-auto lg:overflow-hidden lg:min-h-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:flex-1 lg:min-h-0">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-gray-700 animate-pulse flex flex-col gap-3 min-h-[200px] ${i === 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                                        {/* Before/After Badges */}
                                        <div className="shrink-0 flex justify-between items-center mb-2 sm:mb-3 px-1">
                                            <div className="h-4 w-12 bg-red-50 rounded-full" />
                                            <div className="size-3 bg-slate-200 rounded-full" />
                                            <div className="h-4 w-12 bg-emerald-50 rounded-full" />
                                        </div>

                                        {/* Split Images */}
                                        <div className="flex gap-2 flex-1 min-h-[120px] sm:min-h-[150px] lg:min-h-0">
                                            <div className="flex-1 bg-slate-100 dark:bg-gray-700 rounded-lg" />
                                            <div className="flex-1 bg-slate-100 dark:bg-gray-700 rounded-lg" />
                                        </div>

                                        {/* Text Info */}
                                        <div className="shrink-0 mt-2 sm:mt-3 px-1 space-y-2">
                                            <div className="h-4 w-32 bg-slate-800 dark:bg-white rounded" />
                                            <div className="h-3 w-48 bg-slate-400 dark:bg-gray-500 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            );
        }

        // 6. Get Started Skeleton
        if (path.includes('/get-started')) {
            return (
                <div className="min-h-screen lg:h-screen w-screen lg:overflow-hidden overflow-x-hidden bg-gradient-to-b from-cyan-50/50 via-teal-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
                    {/* Public Navbar */}
                    <div className="shrink-0 border-b border-slate-200/60 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50 relative w-full">
                        <div className="px-4 sm:px-6 md:px-10 py-3 max-w-[1440px] mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-9 sm:h-10 w-9 sm:w-10 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="hidden lg:flex gap-8">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 w-20 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse" />)}
                            </div>
                            <div className="hidden lg:flex gap-3">
                                <div className="size-9 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-9 w-20 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-9 w-28 bg-teal-500/20 dark:bg-teal-900/20 rounded-lg animate-pulse" />
                            </div>
                            <div className="lg:hidden size-9 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>

                    <main className="relative z-10 flex-1 flex flex-col justify-center py-6 sm:py-8 overflow-y-auto lg:overflow-hidden">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="relative mx-auto max-w-3xl">
                                <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-gray-700 px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16 animate-pulse flex flex-col items-center text-center gap-6 shadow-lg">
                                    {/* Decorative Top Gradient Line */}
                                    <div className="absolute top-0 inset-x-0 h-1 sm:h-1.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 opacity-50" />

                                    <div className="flex flex-col items-center gap-4 w-full max-w-xl">
                                        <div className="h-8 sm:h-12 w-3/4 bg-slate-900 dark:bg-white rounded-xl" />
                                        <div className="h-8 sm:h-12 w-1/2 bg-teal-500/20 dark:bg-teal-400/20 rounded-xl" />
                                    </div>

                                    <div className="h-4 sm:h-5 w-full max-w-lg bg-slate-400 dark:bg-gray-500 rounded mt-2" />
                                    <div className="h-4 sm:h-5 w-3/4 max-w-md bg-slate-400 dark:bg-gray-500 rounded" />

                                    <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 w-full sm:w-auto">
                                        <div className="h-11 sm:h-12 w-full sm:w-[180px] bg-teal-500 dark:bg-teal-600 rounded-xl shadow-sm" />
                                        <div className="h-11 sm:h-12 w-full sm:w-[140px] bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl" />
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="size-3.5 sm:size-4 bg-teal-400/40 rounded-full" />
                                                <div className="h-3 w-20 bg-slate-300 dark:bg-gray-600 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            );
        }

        // 7. Gallery Skeleton
        if (path.includes('/gallery')) {
            return (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header + Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 mb-4 p-1">
                        <div className="flex flex-col gap-1.5">
                            <div className="h-7 w-32 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-3 w-48 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-16 bg-slate-100 dark:bg-gray-700/50 rounded-md animate-pulse" />
                            <div className="h-8 w-32 bg-slate-100 dark:bg-gray-700/50 rounded-md animate-pulse" />
                            <div className="h-8 w-20 bg-slate-100 dark:bg-gray-700/50 rounded-md animate-pulse" />
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="flex-1 min-h-0">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 pb-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                <div key={i} className="aspect-square bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-200 dark:border-gray-700 animate-pulse relative overflow-hidden shadow-sm">
                                    <div className="absolute inset-0 bg-slate-100 dark:bg-gray-700/20" />
                                    <div className="absolute bottom-2 left-2 right-2 h-2 bg-slate-200 dark:bg-gray-700/50 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // 4a. Generate Details Skeleton (Specific)
        if (path.includes('/generate/details')) {
            return (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex flex-col gap-2 min-h-full md:min-h-0 md:flex-1">
                                {/* Page Header */}
                                <div className="mb-2 shrink-0">
                                    <div className="h-8 w-48 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1" />
                                    <div className="h-4 w-64 bg-slate-200 dark:bg-gray-700/60 rounded animate-pulse" />
                                </div>

                                {/* Progress Steps */}
                                <div className="mb-2 shrink-0">
                                    <div className="relative max-w-3xl mx-auto px-4 sm:px-0 h-16 flex items-center justify-center">
                                        <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700" />
                                        <div className="grid grid-cols-3 w-full relative z-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="size-10 rounded-full bg-slate-300 dark:bg-gray-600 animate-pulse" />
                                                <div className="h-3 w-10 bg-slate-200 dark:bg-gray-700 rounded" />
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="size-10 rounded-full bg-slate-300 dark:bg-gray-600 animate-pulse" />
                                                <div className="h-3 w-12 bg-slate-200 dark:bg-gray-700 rounded" />
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="size-10 rounded-full bg-slate-400 dark:bg-gray-500 ring-4 ring-slate-200 dark:ring-gray-700 animate-pulse" />
                                                <div className="h-3 w-12 bg-slate-300 dark:bg-gray-600 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:flex-1 flex flex-col">
                                    <div className="p-3 sm:p-5 md:p-6 flex flex-col gap-4 md:flex-1 h-full overflow-hidden">
                                        {/* Row 1: Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                                            <div className="flex flex-col gap-1">
                                                <div className="h-3 w-20 bg-slate-200 dark:bg-gray-700 rounded mb-1" />
                                                <div className="h-[52px] bg-slate-50 dark:bg-gray-700/30 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="h-3 w-20 bg-slate-200 dark:bg-gray-700 rounded mb-1" />
                                                <div className="h-[52px] bg-slate-50 dark:bg-gray-700/30 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="h-3 w-20 bg-slate-200 dark:bg-gray-700 rounded mb-1" />
                                                <div className="h-[52px] bg-slate-50 dark:bg-gray-700/30 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Model Selection Grid */}
                                        <div className="flex-1 flex flex-col min-h-0 gap-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="h-4 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
                                                <div className="flex gap-2">
                                                    <div className="h-7 w-24 bg-slate-100 dark:bg-gray-700/50 rounded-lg" />
                                                    <div className="h-7 w-24 bg-slate-100 dark:bg-gray-700/50 rounded-lg" />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-hidden grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 2xl:grid-cols-8 gap-3">
                                                {[...Array(14)].map((_, i) => (
                                                    <div key={i} className="flex flex-col gap-1">
                                                        <div className="aspect-[3/4] rounded-lg bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 animate-pulse" />
                                                        <div className="h-2 w-16 mx-auto bg-slate-100 dark:bg-gray-700 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="shrink-0 pt-4 flex justify-between items-center px-1">
                            <div className="h-9 w-20 bg-slate-100 dark:bg-gray-700/50 hover:bg-slate-200 rounded-lg animate-pulse" />
                            <div className="h-11 w-32 bg-slate-800 dark:bg-gray-700 rounded-xl shadow-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            );
        }

        // 5a. Email Support - Circular Loader
        if (path.includes('/settings/support')) {
            return (
                <div className="flex h-screen w-screen items-center justify-center bg-slate-100 dark:bg-gray-950">
                    <Loader2 className="h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />
                </div>
            );
        }

        // 5. Settings Skeleton - Content only (wrapped in AppShellSkeleton)
        if (path.includes('/settings') && !path.includes('/settings/support')) {
            return (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-8 pb-20">

                        {/* Page Title Skeleton */}
                        <div>
                            <div className="h-9 w-64 bg-slate-200 dark:bg-gray-700/80 rounded-lg animate-pulse mb-3" />
                            <div className="h-5 w-96 max-w-full bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                        </div>

                        {/* Tabs Navigation Skeleton */}
                        <div className="border-b border-slate-200 dark:border-gray-700">
                            <div className="flex items-center gap-1 pb-1 overflow-x-auto no-scrollbar">
                                {[
                                    { w: 'w-16', active: true },
                                    { w: 'w-20', active: false },
                                    { w: 'w-28', active: false },
                                    { w: 'w-24', active: false },
                                    { w: 'w-24', active: false }
                                ].map((tab, i) => (
                                    <div key={i} className="px-4 py-3 relative">
                                        <div className="flex items-center gap-2.5">
                                            <div className="size-4 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                            <div className={`h-4 ${tab.w} bg-slate-200 dark:bg-gray-700 rounded animate-pulse`} />
                                        </div>
                                        {tab.active && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-t-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Profile Card Skeleton */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-gray-700 animate-pulse shrink-0" />
                                <div className="space-y-2">
                                    <div className="h-6 w-32 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-4 w-20 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                </div>
                            </div>

                            {/* Input Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <div className="h-3 w-24 bg-slate-200 dark:bg-gray-700/80 rounded animate-pulse" />
                                    <div className="h-11 w-full bg-slate-100 dark:bg-gray-700/30 rounded-lg animate-pulse border border-slate-200 dark:border-gray-600" />
                                </div>
                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <div className="h-3 w-28 bg-slate-200 dark:bg-gray-700/80 rounded animate-pulse" />
                                    <div className="h-11 w-full bg-slate-100 dark:bg-gray-700/30 rounded-lg animate-pulse border border-slate-200 dark:border-gray-600" />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end pt-2">
                                <div className="h-10 w-32 bg-slate-800 dark:bg-gray-600 rounded-lg animate-pulse" />
                            </div>
                        </div>

                    </div>
                </div>
            );
        }

        // 4b. Upload Skeleton
        if (path.includes('/generate/upload')) {
            return (
                <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto w-full">
                    <div className="flex flex-col gap-2 shrink-0">
                        <div className="h-8 w-48 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        <div className="h-4 w-64 bg-slate-200 dark:bg-gray-700/60 rounded animate-pulse" />
                    </div>

                    <div className="mb-2 shrink-0">
                        <div className="relative max-w-3xl mx-auto px-4 sm:px-0 h-16 flex items-center justify-center">
                            <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700" />
                            <div className="grid grid-cols-3 w-full relative z-10">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="size-10 rounded-full bg-slate-300 dark:bg-gray-600 animate-pulse" />
                                    <div className="h-3 w-10 bg-slate-200 dark:bg-gray-700 rounded" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="size-10 rounded-full bg-slate-300 dark:bg-gray-600 animate-pulse" />
                                    <div className="h-3 w-12 bg-slate-200 dark:bg-gray-700 rounded" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="size-10 rounded-full bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                    <div className="h-3 w-12 bg-slate-200 dark:bg-gray-700 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-slate-300 dark:border-gray-700 flex items-center justify-center p-8 animate-pulse">
                        <div className="size-24 rounded-full bg-slate-100 dark:bg-gray-700 mb-4" />
                    </div>
                </div>
            );
        }

        // 4c. Generate Root Skeleton - EXACT 1:1 PIXEL PERFECT INNER CONTENT
        if (path === '/generate' || path === '/generate/') {
            return (
                <div className="flex flex-col min-h-full">
                    {/* Page Header - mb-6 */}
                    <div className="mb-6 shrink-0">
                        <div className="h-8 sm:h-9 w-48 sm:w-56 bg-slate-900 dark:bg-white rounded animate-pulse mb-1.5" />
                        <div className="h-4 sm:h-5 w-80 sm:w-[420px] max-w-full bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                    </div>

                    {/* Progress Steps - mb-6 sm:mb-8 */}
                    <div className="mb-6 sm:mb-8 shrink-0">
                        <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                            {/* Background line */}
                            <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700" />
                            {/* Active line (first segment) */}
                            <div className="absolute top-5 left-[16.67%] w-[33.33%] h-[2px] bg-teal-500" />

                            <div className="grid grid-cols-3">
                                {/* STEP 1 - Active */}
                                <div className="flex flex-col items-center">
                                    <div className="z-10 size-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold ring-4 ring-teal-500/20 animate-pulse" />
                                    <div className="mt-2 h-3 w-8 bg-teal-600 rounded animate-pulse" />
                                </div>
                                {/* STEP 2 */}
                                <div className="flex flex-col items-center">
                                    <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center animate-pulse" />
                                    <div className="mt-2 h-3 w-12 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                </div>
                                {/* STEP 3 */}
                                <div className="flex flex-col items-center">
                                    <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center animate-pulse" />
                                    <div className="mt-2 h-3 w-12 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Title - mb-4 */}
                    <div className="mb-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="h-5 sm:h-6 w-56 sm:w-64 bg-slate-800 dark:bg-white rounded animate-pulse" />
                            <div className="w-4 h-4 bg-slate-400 dark:bg-gray-500 rounded-full animate-pulse" />
                        </div>
                    </div>

                    {/* Type Selection Cards - grid cols-1 md:cols-2 gap-5 max-w-5xl mx-auto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 md:mb-0 md:flex-1 md:min-h-0 max-w-5xl mx-auto w-full">
                        {/* Single Image Card - SELECTED */}
                        <div className="h-full p-5 rounded-xl bg-white dark:bg-gray-800 border-2 border-teal-500 ring-4 ring-teal-500/10 shadow-xl flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shadow-sm">
                                    <div className="w-6 h-6 bg-purple-300 dark:bg-purple-600 rounded animate-pulse" />
                                </div>
                                <div className="size-5 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                                    <div className="w-3 h-3 bg-white rounded-sm" />
                                </div>
                            </div>
                            <div>
                                <div className="h-6 w-28 bg-slate-900 dark:bg-white rounded animate-pulse mb-1.5" />
                                <div className="space-y-1.5">
                                    <div className="h-3 w-full bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-3 w-[90%] bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* E-Commerce Bundle Card - DEFAULT */}
                        <div className="h-full p-5 rounded-xl bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-700 shadow-md flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shadow-sm">
                                    <div className="w-6 h-6 bg-blue-300 dark:bg-blue-600 rounded animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <div className="h-6 w-40 bg-slate-900 dark:bg-white rounded animate-pulse mb-1.5" />
                                <div className="space-y-1.5">
                                    <div className="h-3 w-full bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-3 w-[85%] bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Button - flex justify-end pt-5 mt-auto md:mt-5 */}
                    <div className="flex justify-end pt-5 mt-auto md:mt-5 shrink-0 pb-4 md:pb-0">
                        <div className="flex items-center gap-2.5 bg-gradient-to-b from-slate-800 to-slate-900 px-7 py-3 rounded-xl shadow-lg animate-pulse">
                            <div className="h-4 w-16 bg-white/40 rounded animate-pulse" />
                            <div className="w-4 h-4 bg-white/40 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            );
        }

        // 3. Wallet Skeleton (Exact Replica)
        if (path.includes('/wallet')) {
            return (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex flex-col gap-2 shrink-0 mb-3">
                        <div className="h-7 w-32 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        <div className="h-3 w-48 bg-slate-100 dark:bg-gray-700/60 rounded animate-pulse" />
                    </div>

                    {/* Split Layout */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
                        {/* LEFT COLUMN: Balance + Transactions */}
                        <div className="flex-1 flex flex-col gap-5 min-h-0">
                            {/* Balance Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 animate-pulse shrink-0 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-3">
                                        <div className="h-3 w-24 bg-slate-200 dark:bg-gray-700 rounded" />
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-48 bg-slate-300 dark:bg-gray-600 rounded-lg" />
                                            <div className="h-6 w-16 bg-slate-100 dark:bg-gray-700 rounded-md" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto">
                                        <div className="h-11 w-32 bg-slate-800 dark:bg-gray-700 rounded-xl" />
                                        <div className="size-11 bg-slate-100 dark:bg-gray-700/50 rounded-xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Transactions List */}
                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden flex flex-col shadow-sm">
                                <div className="h-16 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 bg-slate-100 dark:bg-gray-700/50 rounded-lg" />
                                        <div className="h-5 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
                                    </div>
                                    <div className="h-8 w-24 bg-slate-100 dark:bg-gray-700/30 rounded-lg" />
                                </div>
                                <div className="p-6 space-y-6 flex-1 overflow-hidden">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex justify-between items-center animate-pulse">
                                            <div className="flex gap-4">
                                                <div className="size-10 bg-slate-100 dark:bg-gray-700 rounded-full" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-40 bg-slate-200 dark:bg-gray-700/50 rounded" />
                                                    <div className="h-3 w-24 bg-slate-100 dark:bg-gray-700/30 rounded" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700/50 rounded" />
                                                <div className="h-4 w-16 bg-slate-100 dark:bg-gray-700/30 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Packages Sidebar */}
                        <div className="w-full lg:w-[320px] 2xl:w-[360px] shrink-0 flex flex-col gap-4 h-full">
                            <div className="flex items-center gap-2">
                                <div className="size-4 bg-slate-200 dark:bg-gray-700 rounded" />
                                <div className="h-4 w-24 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-5 animate-pulse flex flex-col gap-4 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="h-7 w-24 bg-slate-200 dark:bg-gray-700 rounded" />
                                                <div className="h-4 w-32 bg-slate-100 dark:bg-gray-700/50 rounded" />
                                            </div>
                                            <div className="h-8 w-20 bg-slate-100 dark:bg-gray-700/30 rounded-lg" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // 4a. Generate UPLOAD Page Skeleton - Pixel Perfect Match
        if (path.includes('/generate/upload')) {
            return (
                <div className="min-h-screen h-full w-full flex overflow-hidden bg-[#f8fafc] dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex w-56 h-full flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 z-30 shrink-0 shadow-sm">
                        <div className="h-16 flex items-center px-6 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg animate-pulse" />
                                <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                        <nav className="flex-1 py-4 px-3 space-y-1">
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                <div className="h-4 w-24 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-900/20 border-l-4 border-teal-500">
                                <div className="size-5 rounded bg-teal-200 dark:bg-teal-800 animate-pulse" />
                                <div className="h-4 w-32 bg-teal-100/50 dark:bg-teal-900/40 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                <div className="h-4 w-24 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                <div className="h-4 w-16 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-gray-700">
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                    <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                    <div className="h-4 w-20 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                </div>
                            </div>
                        </nav>
                        <div className="p-3 mt-auto">
                            <div className="h-9 w-full bg-teal-500/80 rounded-lg animate-pulse" />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                        {/* Header */}
                        <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-gray-800 rounded-lg">
                                    <div className="size-4 bg-teal-200 dark:bg-teal-700 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                                <div className="h-9 w-9 bg-teal-100 dark:bg-teal-900/30 rounded-xl animate-pulse" />
                            </div>
                        </div>

                        {/* Main Area */}
                        <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-gray-900">
                            <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col">
                                <div className="flex flex-col gap-2 min-h-full">
                                    {/* Page Header */}
                                    <div className="mb-2 shrink-0">
                                        <div className="h-9 w-56 bg-slate-900 dark:bg-white rounded-lg animate-pulse mb-1" />
                                        <div className="h-5 w-[420px] max-w-full bg-slate-400/60 dark:bg-gray-600 rounded animate-pulse" />
                                    </div>

                                    {/* Stepper - Step 2 Active */}
                                    <div className="mb-3 sm:mb-4 shrink-0">
                                        <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                            <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700"></div>
                                            <div className="absolute top-5 left-[16.67%] w-[66.66%] h-[2px] bg-teal-500"></div>
                                            <div className="grid grid-cols-3">
                                                {/* Step 1 - Completed */}
                                                <div className="flex flex-col items-center">
                                                    <div className="z-10 size-10 rounded-full bg-teal-500 flex items-center justify-center animate-pulse"></div>
                                                    <span className="mt-2 h-3 w-8 bg-teal-600/80 rounded animate-pulse"></span>
                                                </div>
                                                {/* Step 2 - Active */}
                                                <div className="flex flex-col items-center">
                                                    <div className="z-10 size-10 rounded-full bg-teal-500 ring-4 ring-teal-500/20 flex items-center justify-center animate-pulse"></div>
                                                    <span className="mt-2 h-3 w-14 bg-teal-600/80 rounded animate-pulse"></span>
                                                </div>
                                                {/* Step 3 - Pending */}
                                                <div className="flex flex-col items-center">
                                                    <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center animate-pulse"></div>
                                                    <span className="mt-2 h-3 w-14 bg-slate-300 dark:bg-gray-600 rounded animate-pulse"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="max-w-4xl mx-auto w-full">
                                            {/* Section Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                                                    <div className="h-5 w-44 bg-slate-800 dark:bg-white rounded animate-pulse" />
                                                </div>
                                                <div className="h-6 w-40 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse" />
                                            </div>

                                            {/* Upload Cards Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                                {/* Upload Area Card */}
                                                <div className="border-2 border-dashed border-teal-400 dark:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-white dark:bg-gray-800 min-h-[260px]">
                                                    <div className="w-16 h-16 bg-teal-500/20 dark:bg-teal-500/30 rounded-2xl flex items-center justify-center mb-4 animate-pulse"></div>
                                                    <div className="h-5 w-32 bg-slate-900 dark:bg-white rounded animate-pulse mb-1" />
                                                    <div className="h-4 w-48 bg-gray-400 dark:bg-gray-500 rounded animate-pulse mb-4" />
                                                    <div className="h-10 w-28 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl animate-pulse" />
                                                </div>

                                                {/* URL Import Card */}
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col min-h-[260px] border border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="h-5 w-32 bg-slate-900 dark:bg-white rounded animate-pulse" />
                                                            <div className="h-3 w-40 bg-gray-400 dark:bg-gray-500 rounded animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="h-12 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl animate-pulse mb-4" />
                                                    </div>
                                                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl">
                                                        <div className="flex gap-3">
                                                            <div className="w-5 h-5 bg-teal-500 rounded animate-pulse shrink-0"></div>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="h-4 w-16 bg-teal-700/50 dark:bg-teal-300/50 rounded animate-pulse" />
                                                                <div className="h-3 w-full bg-teal-600/30 dark:bg-teal-400/30 rounded animate-pulse" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Navigation */}
                            <div className="shrink-0 px-5 py-2 bg-[#f8fafc] dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                                    <div className="h-12 w-32 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            );
        }

        // 4b. Generate DETAILS Page Skeleton - Pixel Perfect Match
        if (path.includes('/generate/details')) {
            return (
                <div className="min-h-screen h-full w-full flex overflow-hidden bg-[#f8fafc] dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex w-56 h-full flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 z-30 shrink-0 shadow-sm">
                        <div className="h-16 flex items-center px-6 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg animate-pulse" />
                                <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                        <nav className="flex-1 py-4 px-3 space-y-1">
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                <div className="h-4 w-24 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-900/20 border-l-4 border-teal-500">
                                <div className="size-5 rounded bg-teal-200 dark:bg-teal-800 animate-pulse" />
                                <div className="h-4 w-32 bg-teal-100/50 dark:bg-teal-900/40 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                <div className="h-4 w-24 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                <div className="h-4 w-16 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-gray-700">
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                                    <div className="size-5 rounded bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                    <div className="h-4 w-20 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                </div>
                            </div>
                        </nav>
                        <div className="p-3 mt-auto">
                            <div className="h-9 w-full bg-teal-500/80 rounded-lg animate-pulse" />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                        {/* Header */}
                        <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-gray-800 rounded-lg">
                                    <div className="size-4 bg-teal-200 dark:bg-teal-700 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                                <div className="h-9 w-9 bg-teal-100 dark:bg-teal-900/30 rounded-xl animate-pulse" />
                            </div>
                        </div>

                        {/* Main Area */}
                        <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-gray-900">
                            <div className="flex-1 p-4 sm:p-5 overflow-y-auto md:overflow-hidden flex flex-col">
                                <div className="flex flex-col gap-2 min-h-full md:min-h-0 md:flex-1">
                                    {/* Page Header */}
                                    <div className="mb-2 shrink-0">
                                        <div className="h-9 w-56 bg-slate-900 dark:bg-white rounded-lg animate-pulse mb-1" />
                                        <div className="h-5 w-[420px] max-w-full bg-slate-400/60 dark:bg-gray-600 rounded animate-pulse" />
                                    </div>

                                    {/* Stepper - Step 3 Active (All Complete) */}
                                    <div className="mb-2 shrink-0">
                                        <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                            <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-teal-500"></div>
                                            <div className="grid grid-cols-3">
                                                {/* Step 1 - Completed */}
                                                <div className="flex flex-col items-center">
                                                    <div className="z-10 size-10 rounded-full bg-teal-500 flex items-center justify-center animate-pulse"></div>
                                                    <span className="mt-2 h-3 w-8 bg-teal-600/80 rounded animate-pulse"></span>
                                                </div>
                                                {/* Step 2 - Completed */}
                                                <div className="flex flex-col items-center">
                                                    <div className="z-10 size-10 rounded-full bg-teal-500 flex items-center justify-center animate-pulse"></div>
                                                    <span className="mt-2 h-3 w-14 bg-teal-600/80 rounded animate-pulse"></span>
                                                </div>
                                                {/* Step 3 - Active */}
                                                <div className="flex flex-col items-center">
                                                    <div className="z-10 size-10 rounded-full bg-teal-500 ring-4 ring-teal-500/20 flex items-center justify-center animate-pulse"></div>
                                                    <span className="mt-2 h-3 w-14 bg-teal-600/80 rounded animate-pulse"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Card */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:flex-1 flex flex-col">
                                        <div className="p-3 sm:p-5 md:p-6 flex flex-col gap-1 md:flex-1">
                                            {/* Row 1: 3 Inputs Side by Side */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
                                                {/* Image Type */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3.5 h-3.5 bg-gray-400 rounded animate-pulse" />
                                                        <div className="h-3 w-20 bg-slate-900 dark:bg-white rounded animate-pulse" />
                                                    </div>
                                                    <div className="h-[52px] px-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-500 flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg bg-white dark:bg-gray-800">
                                                            <div className="w-3.5 h-3.5 bg-teal-500 rounded animate-pulse" />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="h-3 w-20 bg-slate-900 dark:bg-white rounded animate-pulse" />
                                                            <div className="h-2 w-32 bg-gray-500 rounded animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Category */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3.5 h-3.5 bg-teal-500 rounded animate-pulse" />
                                                        <div className="h-3 w-16 bg-slate-900 dark:bg-white rounded animate-pulse" />
                                                    </div>
                                                    <div className="h-[52px] rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 animate-pulse" />
                                                </div>

                                                {/* Brand Name */}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3.5 h-3.5 bg-gray-400 rounded animate-pulse" />
                                                        <div className="h-3 w-24 bg-slate-900 dark:bg-white rounded animate-pulse" />
                                                    </div>
                                                    <div className="h-[52px] rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 animate-pulse" />
                                                </div>
                                            </div>

                                            {/* Additional Branding Info Section */}
                                            <div className="md:flex-1 md:min-h-0 flex flex-col mt-4">
                                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 md:flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-4 h-4 bg-gray-400 rounded animate-pulse" />
                                                        <div className="h-4 w-48 bg-slate-900 dark:bg-white rounded animate-pulse" />
                                                        <div className="h-5 w-16 bg-gray-100 dark:bg-gray-600 rounded-full animate-pulse" />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        {/* Logo Upload */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="h-2.5 w-20 bg-gray-600 dark:bg-gray-300 rounded animate-pulse" />
                                                            <div className="h-12 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2">
                                                                <div className="w-4 h-4 bg-gray-400 rounded animate-pulse" />
                                                                <div className="h-3 w-20 bg-gray-400 rounded animate-pulse" />
                                                            </div>
                                                        </div>
                                                        {/* Instagram */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="h-2.5 w-16 bg-gray-600 dark:bg-gray-300 rounded animate-pulse" />
                                                            <div className="h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 animate-pulse" />
                                                        </div>
                                                        {/* Website */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="h-2.5 w-20 bg-gray-600 dark:bg-gray-300 rounded animate-pulse" />
                                                            <div className="h-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Navigation */}
                            <div className="shrink-0 px-5 py-2 bg-[#f8fafc] dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                                    <div className="h-12 w-32 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            );
        }

        // 4e. Generate Root Skeleton - EXACT 1:1 PIXEL PERFECT REPLICA
        if (path === '/generate' || path === '/generate/') {
            return (
                <div className="w-full min-h-screen flex flex-col overflow-x-hidden bg-[#f8fafc] dark:bg-gray-900 antialiased transition-colors duration-300">
                    <div className="flex flex-1 min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden">
                        {/* Sidebar Skeleton - Matches Sidebar component */}
                        <aside className="hidden lg:flex w-56 h-screen flex-col bg-white dark:bg-gray-800 border-r border-slate-200/60 dark:border-gray-700 overflow-y-auto shrink-0">
                            {/* Logo */}
                            <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-gray-700 shrink-0">
                                <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg animate-pulse" />
                                <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse ml-2.5" />
                            </div>
                            {/* Nav Items */}
                            <nav className="flex-1 py-4 px-3 space-y-1">
                                {[
                                    { active: false, width: 'w-24' },
                                    { active: true, width: 'w-28' },  // Generate active
                                    { active: false, width: 'w-20' },
                                    { active: false, width: 'w-16' },
                                    { active: false, width: 'w-24' },
                                ].map((item, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${item.active ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                                        <div className={`size-5 rounded-lg ${item.active ? 'bg-teal-200 dark:bg-teal-700' : 'bg-slate-200 dark:bg-gray-700'} animate-pulse`} />
                                        <div className={`h-4 ${item.width} rounded ${item.active ? 'bg-teal-100 dark:bg-teal-800/50' : 'bg-slate-100 dark:bg-gray-700/50'} animate-pulse`} />
                                    </div>
                                ))}
                            </nav>
                            {/* Bottom Profile */}
                            <div className="p-3 mt-auto border-t border-slate-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 p-2">
                                    <div className="size-9 rounded-full bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                    <div className="flex-1">
                                        <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-28 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse mt-1" />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex flex-col flex-1 min-w-0 bg-[#f8fafc] dark:bg-gray-900 overflow-x-hidden lg:overflow-hidden transition-colors duration-300">
                            {/* Header Skeleton - Matches Header component */}
                            <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shrink-0">
                                {/* Breadcrumbs */}
                                <div className="flex items-center gap-2">
                                    <div className="lg:hidden size-8 bg-slate-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <div className="h-4 w-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                        <div className="h-4 w-24 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                        <div className="h-4 w-32 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                    </div>
                                </div>
                                {/* Right side: Credits & Generate */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-gray-800 rounded-lg">
                                        <div className="size-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                    <div className="h-9 w-24 bg-teal-100 dark:bg-teal-900/30 rounded-xl animate-pulse" />
                                </div>
                            </header>

                            {/* Main Content */}
                            <main className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-gray-900">
                                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                                    <div className="flex flex-col gap-2 flex-1">
                                        {/* Page Header */}
                                        <div className="mb-2 shrink-0">
                                            <div className="h-8 w-48 bg-slate-800 dark:bg-white rounded-lg animate-pulse mb-2" />
                                            <div className="h-4 w-80 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                        </div>

                                        {/* Progress Steps */}
                                        <div className="mb-2 shrink-0">
                                            <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                                {/* Lines */}
                                                <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700" />
                                                <div className="absolute top-5 left-[16.67%] w-[33.33%] h-[2px] bg-teal-500" />

                                                <div className="grid grid-cols-3">
                                                    {/* Step 1 - Complete */}
                                                    <div className="flex flex-col items-center">
                                                        <div className="z-10 size-10 rounded-full bg-teal-500 flex items-center justify-center animate-pulse">
                                                            <div className="size-5 bg-teal-200 rounded" />
                                                        </div>
                                                        <div className="mt-2 h-3 w-10 bg-teal-500 rounded animate-pulse" />
                                                    </div>
                                                    {/* Step 2 - Current */}
                                                    <div className="flex flex-col items-center">
                                                        <div className="z-10 size-10 rounded-full bg-teal-500 ring-4 ring-teal-500/20 flex items-center justify-center text-white font-bold animate-pulse">
                                                            2
                                                        </div>
                                                        <div className="mt-2 h-3 w-14 bg-teal-500 rounded animate-pulse" />
                                                    </div>
                                                    {/* Step 3 - Pending */}
                                                    <div className="flex flex-col items-center">
                                                        <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center text-slate-500 font-bold">
                                                            3
                                                        </div>
                                                        <div className="mt-2 h-3 w-14 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section Title - mb-4 */}
                                        <div className="mb-4 shrink-0">
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 sm:h-6 w-56 sm:w-64 bg-slate-800 dark:bg-white rounded animate-pulse" />
                                                <div className="w-4 h-4 bg-slate-400 dark:bg-gray-500 rounded-full animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Type Selection Cards - grid cols-1 md:cols-2 gap-5 max-w-5xl mx-auto */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 md:mb-0 md:flex-1 md:min-h-0 max-w-5xl mx-auto w-full">
                                            {/* Single Image Card - SELECTED */}
                                            <div className="h-full p-5 rounded-xl bg-white dark:bg-gray-800 border-2 border-teal-500 ring-4 ring-teal-500/10 shadow-xl flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="size-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shadow-sm">
                                                        <div className="w-6 h-6 bg-purple-300 dark:bg-purple-600 rounded animate-pulse" />
                                                    </div>
                                                    <div className="size-5 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                                                        <div className="w-3 h-3 bg-white rounded-sm" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="h-6 w-28 bg-slate-900 dark:bg-white rounded animate-pulse mb-1.5" />
                                                    <div className="space-y-1.5">
                                                        <div className="h-3 w-full bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="h-3 w-[90%] bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* E-Commerce Bundle Card - DEFAULT */}
                                            <div className="h-full p-5 rounded-xl bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-700 shadow-md flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shadow-sm">
                                                        <div className="w-6 h-6 bg-blue-300 dark:bg-blue-600 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="h-6 w-40 bg-slate-900 dark:bg-white rounded animate-pulse mb-1.5" />
                                                    <div className="space-y-1.5">
                                                        <div className="h-3 w-full bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="h-3 w-[85%] bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Next Button - flex justify-end pt-5 mt-auto md:mt-5 */}
                                        <div className="flex justify-end pt-5 mt-auto md:mt-5 shrink-0 pb-4 md:pb-0">
                                            <div className="flex items-center gap-2.5 bg-gradient-to-b from-slate-800 to-slate-900 px-7 py-3 rounded-xl shadow-lg animate-pulse">
                                                <div className="h-4 w-16 bg-white/40 rounded animate-pulse" />
                                                <div className="w-4 h-4 bg-white/40 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Navigation */}
                                <div className="shrink-0 px-3 py-2 bg-[#f8fafc] dark:bg-gray-900">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
                                            <div className="size-4 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                            <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-2.5 bg-gradient-to-b from-slate-800 to-slate-900 px-7 py-3 rounded-xl shadow-lg animate-pulse">
                                            <div className="h-4 w-16 bg-white/40 rounded animate-pulse" />
                                            <div className="w-4 h-4 bg-white/40 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            );
        }

        // 4d. E-commerce Options Skeleton - EXACT Match to page.tsx DOM structure
        if (path.includes('/generate/ecommerce-options')) {
            return (
                <div className="w-full min-h-screen flex flex-col overflow-x-hidden bg-[#f8fafc] dark:bg-gray-900 antialiased transition-colors duration-300">
                    <div className="flex flex-1 min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden">
                        {/* Sidebar Skeleton - Matches Sidebar component */}
                        <aside className="hidden lg:flex w-56 h-screen flex-col bg-white dark:bg-gray-800 border-r border-slate-200/60 dark:border-gray-700 overflow-y-auto shrink-0">
                            {/* Logo */}
                            <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-gray-700 shrink-0">
                                <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg animate-pulse" />
                                <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse ml-2.5" />
                            </div>
                            {/* Nav Items */}
                            <nav className="flex-1 py-4 px-3 space-y-1">
                                {[
                                    { active: false, width: 'w-24' },
                                    { active: true, width: 'w-28' },  // Generate active
                                    { active: false, width: 'w-20' },
                                    { active: false, width: 'w-16' },
                                    { active: false, width: 'w-24' },
                                ].map((item, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${item.active ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}>
                                        <div className={`size-5 rounded-lg ${item.active ? 'bg-teal-200 dark:bg-teal-700' : 'bg-slate-200 dark:bg-gray-700'} animate-pulse`} />
                                        <div className={`h-4 ${item.width} rounded ${item.active ? 'bg-teal-100 dark:bg-teal-800/50' : 'bg-slate-100 dark:bg-gray-700/50'} animate-pulse`} />
                                    </div>
                                ))}
                            </nav>
                            {/* Bottom Profile */}
                            <div className="p-3 mt-auto border-t border-slate-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 p-2">
                                    <div className="size-9 rounded-full bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                    <div className="flex-1">
                                        <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-3 w-28 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse mt-1" />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex flex-col flex-1 min-w-0 bg-[#f8fafc] dark:bg-gray-900 overflow-x-hidden lg:overflow-hidden transition-colors duration-300">
                            {/* Header Skeleton - Matches Header component */}
                            <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shrink-0">
                                {/* Breadcrumbs */}
                                <div className="flex items-center gap-2">
                                    <div className="lg:hidden size-8 bg-slate-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <div className="h-4 w-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                        <div className="h-4 w-24 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                        <div className="h-4 w-32 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                    </div>
                                </div>
                                {/* Right side: Credits & Generate */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-gray-800 rounded-lg">
                                        <div className="size-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </div>
                                    <div className="h-9 w-24 bg-teal-100 dark:bg-teal-900/30 rounded-xl animate-pulse" />
                                </div>
                            </header>

                            {/* Main Content */}
                            <main className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-gray-900">
                                <div className="flex-1 p-4 sm:p-5 flex flex-col">
                                    <div className="flex flex-col gap-2 flex-1">
                                        {/* Page Header */}
                                        <div className="mb-2 shrink-0">
                                            <div className="h-8 w-48 bg-slate-800 dark:bg-white rounded-lg animate-pulse mb-2" />
                                            <div className="h-4 w-80 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                        </div>

                                        {/* Progress Steps */}
                                        <div className="mb-2 shrink-0">
                                            <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                                {/* Lines */}
                                                <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-700" />
                                                <div className="absolute top-5 left-[16.67%] w-[33.33%] h-[2px] bg-teal-500" />

                                                <div className="grid grid-cols-3">
                                                    {/* Step 1 - Complete */}
                                                    <div className="flex flex-col items-center">
                                                        <div className="z-10 size-10 rounded-full bg-teal-500 flex items-center justify-center animate-pulse">
                                                            <div className="size-5 bg-teal-200 rounded" />
                                                        </div>
                                                        <div className="mt-2 h-3 w-10 bg-teal-500 rounded animate-pulse" />
                                                    </div>
                                                    {/* Step 2 - Current */}
                                                    <div className="flex flex-col items-center">
                                                        <div className="z-10 size-10 rounded-full bg-teal-500 ring-4 ring-teal-500/20 flex items-center justify-center text-white font-bold animate-pulse">
                                                            2
                                                        </div>
                                                        <div className="mt-2 h-3 w-14 bg-teal-500 rounded animate-pulse" />
                                                    </div>
                                                    {/* Step 3 - Pending */}
                                                    <div className="flex flex-col items-center">
                                                        <div className="z-10 size-10 rounded-full border-2 border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center text-slate-500 font-bold">
                                                            3
                                                        </div>
                                                        <div className="mt-2 h-3 w-14 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Content Card */}
                                        <div className="flex-1 min-h-0 max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/60 dark:border-gray-700 p-3 overflow-hidden">
                                            <div className="h-4 w-40 bg-slate-800 dark:bg-white rounded animate-pulse mb-2" />

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
                                                {/* Left Column */}
                                                <div className="space-y-1.5">
                                                    {/* Product Views */}
                                                    <div>
                                                        <div className="h-3 w-20 bg-slate-400 dark:bg-gray-500 rounded animate-pulse mb-0.5" />
                                                        <div className="h-9 w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse" />
                                                        <div className="h-2 w-36 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse mt-0.5" />
                                                    </div>
                                                    {/* Background */}
                                                    <div>
                                                        <div className="h-3 w-20 bg-slate-400 dark:bg-gray-500 rounded animate-pulse mb-0.5" />
                                                        <div className="h-9 w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse" />
                                                        <div className="h-2 w-24 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse mt-0.5" />
                                                        <div className="h-9 w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse mt-1" />
                                                    </div>
                                                    {/* Effects */}
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mb-2">
                                                            <div className="size-3 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                            <div className="h-3 w-12 bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="size-5 rounded-full bg-teal-500 animate-pulse" />
                                                                    <div className="h-3 w-24 bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                                                                </div>
                                                                <div className="w-10 h-5 bg-teal-500 rounded-full animate-pulse" />
                                                            </div>
                                                            <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-gray-700/50 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="size-5 rounded-full bg-slate-200 dark:bg-gray-600 animate-pulse" />
                                                                    <div className="h-3 w-20 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                                </div>
                                                                <div className="w-10 h-5 bg-slate-300 dark:bg-gray-600 rounded-full animate-pulse" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column */}
                                                <div className="space-y-1.5">
                                                    {/* Platform */}
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <div className="size-3 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                            <div className="h-3 w-28 bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                                                        </div>
                                                        <div className="h-9 w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse" />
                                                        <div className="h-2 w-40 bg-slate-200 dark:bg-gray-700/50 rounded animate-pulse mt-0.5" />
                                                    </div>
                                                    {/* Lighting */}
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <div className="size-3 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                            <div className="h-3 w-20 bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-3 p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                                                                <div className="size-5 rounded-full bg-teal-500 animate-pulse" />
                                                                <div className="h-3 w-32 bg-teal-300 dark:bg-teal-700 rounded animate-pulse" />
                                                            </div>
                                                            <div className="flex items-center gap-3 p-1.5 rounded-lg bg-slate-50 dark:bg-gray-700/50 border border-transparent">
                                                                <div className="size-5 rounded-full bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 animate-pulse" />
                                                                <div className="h-3 w-24 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Number of Images */}
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <div className="size-3 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                            <div className="h-3 w-28 bg-slate-400 dark:bg-gray-500 rounded animate-pulse" />
                                                        </div>
                                                        <div className="h-10 w-full bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Navigation */}
                                <div className="shrink-0 px-3 py-2 bg-[#f8fafc] dark:bg-gray-900">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg">
                                            <div className="size-4 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                            <div className="h-4 w-10 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                        </div>
                                        <div className="h-11 w-28 bg-gradient-to-b from-slate-800 to-slate-900 dark:from-gray-700 dark:to-gray-800 rounded-xl animate-pulse shadow-lg" />
                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </div>
            );
        }



        // 6. Default Dashboard Skeleton
        return (
            <div className="flex flex-col gap-6 h-full">
                {/* Page Title */}
                <div className="flex flex-col gap-2">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-slate-200 dark:bg-gray-700/60 rounded-md animate-pulse" />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 animate-pulse">
                            <div className="w-full h-full bg-slate-100 dark:bg-gray-700/30 rounded-lg" />
                        </div>
                    ))}
                </div>

                {/* Large Content Area */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 animate-pulse p-4">
                    <div className="w-full h-full bg-slate-100 dark:bg-gray-700/30 rounded-lg" />
                </div>
            </div>
        );
    };

    return (
        <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
            {children}

            {/* Optimized Page Transition Loader - Instant Show, Smooth Hide */}
            {/* Optimized Page Transition Loader - Instant Show, Smooth Hide */}
            {/* Exclude Auth pages from global transition loader to allow their native animations */}
            {!((nextPath || pathname)?.includes('/login') || (nextPath || pathname)?.includes('/register') || (nextPath || pathname)?.includes('/signup')) && (
                <div
                    className={`fixed inset-0 z-[9999] ${isTransitioning
                        ? 'opacity-100 visible pointer-events-auto'
                        : 'opacity-0 invisible pointer-events-none transition-opacity duration-200'
                        }`}
                    style={{ willChange: isTransitioning ? 'opacity' : 'auto' }}
                >
                    {/* Skeleton Loader Layout */}
                    <div className="absolute inset-0 bg-slate-50 dark:bg-gray-900 overflow-hidden">
                        {(() => {
                            const path = nextPath || pathname;

                            // Special case for Email Support - Simple Loader (Bypass all Layout Skeletons)
                            if (path.includes('/settings/support')) {
                                return (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-gray-950">
                                        <Loader2 className="h-10 w-10 animate-spin text-teal-600 dark:text-teal-400" />
                                    </div>
                                );
                            }
                            const isFullLayout = path === '/' ||
                                path.includes('view=landing') ||
                                path.includes('/features') ||
                                path.includes('/solutions') ||
                                path.includes('/pricing') ||
                                path.includes('/results') ||
                                path.includes('/get-started') ||
                                path.startsWith('/dashboard') ||
                                path.startsWith('/generate') ||
                                path.startsWith('/gallery') ||
                                path.startsWith('/wallet') ||
                                path.startsWith('/settings');

                            if (isFullLayout) {
                                // Helper for App Shell Skeleton (Sidebar + Header) - EXACT match to Gallery/Wallet structure
                                const AppShellSkeleton = ({ children }: { children: React.ReactNode }) => (
                                    <div className="w-full h-full flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                                        {/* Sidebar Skeleton - matches Sidebar component exactly */}
                                        <aside className="hidden lg:flex w-56 h-full flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 z-30 shrink-0 shadow-sm">
                                            {/* Logo */}
                                            <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-gray-700 shrink-0">
                                                <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg animate-pulse" />
                                                <div className="h-5 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse ml-2.5" />
                                            </div>
                                            {/* Nav Items */}
                                            <nav className="flex-1 py-4 px-3 space-y-1">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                                                        <div className="size-5 rounded-lg bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                                        <div className="h-4 w-24 rounded bg-slate-100 dark:bg-gray-700/50 animate-pulse" />
                                                    </div>
                                                ))}
                                            </nav>
                                            {/* Profile */}
                                            <div className="p-3 mt-auto border-t border-slate-100 dark:border-gray-700">
                                                <div className="flex items-center gap-3 p-2">
                                                    <div className="size-9 rounded-full bg-slate-200 dark:bg-gray-700 animate-pulse" />
                                                    <div className="flex-1">
                                                        <div className="h-4 w-20 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="h-3 w-28 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </aside>

                                        {/* Main Content Area - matches Gallery/Wallet main structure exactly */}
                                        <main className="flex-1 flex flex-col min-w-0 h-full overflow-x-hidden lg:overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                                            {/* Header Skeleton - matches Header component */}
                                            <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200/60 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="lg:hidden size-8 bg-slate-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                                                    <div className="hidden sm:flex items-center gap-1.5">
                                                        <div className="h-4 w-12 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="h-4 w-3 bg-slate-100 dark:bg-gray-700/50 rounded animate-pulse" />
                                                        <div className="h-4 w-24 bg-slate-300 dark:bg-gray-600 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="size-4 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="h-4 w-16 bg-slate-200 dark:bg-gray-700 rounded animate-pulse" />
                                                    </div>
                                                    <div className="h-9 w-24 bg-teal-100 dark:bg-teal-900/30 rounded-xl animate-pulse" />
                                                </div>
                                            </header>

                                            {/* Content Area - matches Gallery/Wallet content padding */}
                                            <div className="flex-1 p-3 sm:p-4 overflow-y-auto lg:overflow-hidden">
                                                {children}
                                            </div>
                                        </main>
                                    </div>
                                );

                                // Dashboard has its own complete skeleton (self-contained)
                                if (path.startsWith('/dashboard')) {
                                    return getSkeletonContent();
                                }

                                // Generate pages, Gallery, Wallet, and Settings have content-only skeletons, wrap them in AppShell
                                if (path.startsWith('/gallery') || path.startsWith('/wallet') || path.startsWith('/generate') || path.startsWith('/settings')) {
                                    return (
                                        <AppShellSkeleton>
                                            {getSkeletonContent()}
                                        </AppShellSkeleton>
                                    );
                                }

                                // For public pages, return simple wrapper
                                return (
                                    <div className="w-full h-full overflow-hidden bg-white dark:bg-gray-900">
                                        {getSkeletonContent()}
                                    </div>
                                );
                            }

                            return (
                                <div className="flex h-full w-full">
                                    {/* Sidebar Skeleton (hidden on mobile) */}
                                    <div className="hidden lg:flex w-56 flex-col border-r border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 gap-4 z-20 shrink-0">
                                        {/* Logo Area */}
                                        <div className="h-8 w-32 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6 flex items-center gap-2">
                                            <div className="size-6 bg-slate-300 dark:bg-gray-600 rounded-md" />
                                            <div className="h-4 flex-1 bg-slate-300 dark:bg-gray-600 rounded" />
                                        </div>

                                        {/* Nav Items */}
                                        <div className="flex flex-col gap-2">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="h-10 w-full bg-slate-100 dark:bg-gray-700/50 rounded-lg animate-pulse" />
                                            ))}
                                        </div>

                                        {/* Spacer */}
                                        <div className="flex-1" />

                                        {/* Bottom Profile Area */}
                                        <div className="h-14 w-full bg-slate-100 dark:bg-gray-700/50 rounded-xl animate-pulse" />
                                    </div>

                                    {/* Main Content Skeleton */}
                                    <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
                                        {/* Header Skeleton */}
                                        <div className="h-14 border-b border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4 flex items-center justify-between backdrop-blur-sm shrink-0">
                                            <div className="flex items-center gap-2">
                                                {/* Mobile Menu Button Placeholder */}
                                                <div className="lg:hidden size-8 bg-slate-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                                {/* Breadcrumb Placeholder */}
                                                <div className="h-5 w-32 bg-slate-200 dark:bg-gray-700 rounded-md animate-pulse hidden md:block" />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-24 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse hidden sm:block" />
                                                <div className="size-8 bg-slate-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                            </div>
                                        </div>

                                        {/* Dynamic Page Content Skeleton */}
                                        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
                                            {getSkeletonContent()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </TransitionContext.Provider >
    );
}

