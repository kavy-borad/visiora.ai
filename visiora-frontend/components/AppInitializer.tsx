"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import AILoader from "./AILoader";
import { authApi } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/generate", "/wallet", "/gallery", "/settings", "/results"];

export default function AppInitializer({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [showLoader, setShowLoader] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Only run once on initial mount
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initializeApp = async () => {
            // Fast auth check (from localStorage - synchronous)
            const isAuthenticated = authApi.isAuthenticated();

            // Minimum loader time reduced to 1 second for faster perceived load
            const minLoaderTime = new Promise(resolve => setTimeout(resolve, 1000));

            // Handle routing based on auth status
            let needsRedirect = false;

            if (isAuthenticated) {
                // If user is authenticated and on landing page, redirect to dashboard
                if (pathname === "/") {
                    needsRedirect = true;
                    router.replace("/dashboard");
                }
            } else {
                // If user is not authenticated and on protected route, redirect to login
                const isProtectedRoute = PROTECTED_ROUTES.some(route =>
                    pathname?.startsWith(route)
                );
                if (isProtectedRoute) {
                    needsRedirect = true;
                    router.replace("/login");
                }
            }

            // Wait for minimum loader time
            await minLoaderTime;

            // If redirecting, add small buffer for navigation
            if (needsRedirect) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Mark as ready and start fade out
            setIsReady(true);

            // Hide loader after fade animation
            setTimeout(() => {
                setShowLoader(false);
            }, 200);
        };

        initializeApp();
    }, [pathname, router]);

    // Pre-render children alongside loader for instant content reveal
    if (showLoader) {
        return (
            <>
                {/* Loader overlay that fades out */}
                <div
                    className="fixed inset-0 z-[10000]"
                    style={{
                        opacity: isReady ? 0 : 1,
                        transition: "opacity 0.2s ease-out",
                        pointerEvents: isReady ? "none" : "auto",
                    }}
                >
                    <AILoader isLoading={true} text="Initializing Visiora..." />
                </div>
                {/* Pre-render children behind loader */}
                <div
                    style={{
                        opacity: isReady ? 1 : 0,
                        transition: "opacity 0.2s ease-out",
                    }}
                >
                    {children}
                </div>
            </>
        );
    }

    return <>{children}</>;
}
