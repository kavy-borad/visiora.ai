"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import { usePageTransition } from "./TransitionProvider";

// Configure NProgress for fast, smooth transitions
NProgress.configure({
    showSpinner: false,
    speed: 200,        // Faster completion
    minimum: 0.2,      // Higher minimum for visible start
    easing: "ease-out",
    trickleSpeed: 100, // Faster trickle for perceived speed
});

/**
 * PageLoader component that shows NProgress bar during navigation.
 * Synced with TransitionProvider for consistent loading experience.
 */
export default function PageLoader() {
    const { isTransitioning } = usePageTransition();

    // Sync NProgress with TransitionProvider state
    useEffect(() => {
        if (isTransitioning) {
            NProgress.start();
        } else {
            NProgress.done();
        }
    }, [isTransitioning]);

    return null;
}

// Navigation helper to start loader (for programmatic navigation)
export function startPageLoader() {
    NProgress.start();
}

export function stopPageLoader() {
    NProgress.done();
}

