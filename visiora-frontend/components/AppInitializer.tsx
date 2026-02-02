"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import InitialSplashLoader from "./InitialSplashLoader";
import { authApi } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/generate", "/wallet", "/gallery", "/settings", "/results"];

export default function AppInitializer({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [showSplash, setShowSplash] = useState(true);
    const [appReady, setAppReady] = useState(false);
    const [splashFinished, setSplashFinished] = useState(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Only run once on initial mount
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initializeApp = async () => {
            const isAuthenticated = authApi.isAuthenticated();

            let needsRedirect = false;

            if (isAuthenticated) {
                if (pathname === "/") {
                    // router.replace("/dashboard");
                }
            } else {
                const isProtectedRoute = PROTECTED_ROUTES.some(route =>
                    pathname?.startsWith(route)
                );
                if (isProtectedRoute) {
                    needsRedirect = true;
                    router.replace("/login");
                }
            }

            if (needsRedirect) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            setAppReady(true);
        };

        initializeApp();
    }, [pathname, router]);

    const handleSplashComplete = () => {
        setSplashFinished(true);
    };

    useEffect(() => {
        if (appReady && splashFinished) {
            setShowSplash(false);
        }
    }, [appReady, splashFinished]);

    return (
        <>
            <AnimatePresence>
                {showSplash && (
                    <InitialSplashLoader key="splash" onComplete={handleSplashComplete} />
                )}
            </AnimatePresence>

            <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
                {children}
            </div>
        </>
    );
}
