"use client";

import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
                // Minimum 300ms loader visibility for smooth UX
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 300);
            }
        }
    }, [pathname, searchParams, isTransitioning]);

    // Clear transition after a max timeout to prevent stuck states
    useEffect(() => {
        if (isTransitioning) {
            // Safety timeout - never show loader for more than 3 seconds
            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
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
                setIsTransitioning(true);
            }
        };

        // Handle browser back/forward navigation
        const handlePopState = () => {
            setIsTransitioning(true);
        };

        document.addEventListener("click", handleClick, { passive: true });
        window.addEventListener("popstate", handlePopState);

        return () => {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    return (
        <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
            {children}

            {/* Optimized Page Transition Loader - Instant Show, Smooth Hide */}
            <div
                className={`fixed inset-0 z-[9999] flex items-center justify-center ${isTransitioning
                    ? 'opacity-100 visible pointer-events-auto'
                    : 'opacity-0 invisible pointer-events-none transition-opacity duration-200'
                    }`}
                style={{ willChange: isTransitioning ? 'opacity' : 'auto' }}
            >
                {/* Backdrop - Fully opaque to hide current page */}
                <div className="absolute inset-0 bg-white dark:bg-gray-900" />

                {/* Loader Content */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    {/* Spinning Ring with Star */}
                    <div className="relative w-16 h-16">
                        {/* Spinning Gradient Ring */}
                        <svg
                            className="w-full h-full animate-spin"
                            style={{ animationDuration: '1.2s' }}
                            viewBox="0 0 100 100"
                        >
                            <defs>
                                <linearGradient id="transitionRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="50%" stopColor="#0d9488" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                            {/* Background track */}
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="6"
                                className="dark:stroke-gray-700"
                            />
                            {/* Animated arc */}
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="url(#transitionRingGradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="200 64"
                                style={{
                                    filter: "drop-shadow(0 0 6px rgba(20, 184, 166, 0.4))"
                                }}
                            />
                        </svg>

                        {/* Center 4-pointed Star */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="animate-pulse"
                            >
                                <path
                                    d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
                                    fill="url(#transitionStarGrad)"
                                />
                                <defs>
                                    <linearGradient id="transitionStarGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#2dd4bf" />
                                        <stop offset="100%" stopColor="#14b8a6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </TransitionContext.Provider>
    );
}

