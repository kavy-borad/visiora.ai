"use client";

import { useEffect, useState } from "react";

interface AILoaderProps {
    isLoading?: boolean;
    text?: string;
}

export default function AILoader({
    isLoading = true,
    text = "Loading...",
}: AILoaderProps) {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (!isLoading) return;

        const interval = setInterval(() => {
            setRotation(prev => (prev + 2) % 360);
        }, 16);

        return () => clearInterval(interval);
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]">
            {/* Loader Container */}
            <div className="flex flex-col items-center gap-6">
                {/* Spinning Ring with Star */}
                <div className="relative w-20 h-20">
                    {/* Spinning Gradient Ring - Teal Theme */}
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        <defs>
                            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                            stroke="#1a1a1a"
                            strokeWidth="6"
                        />
                        {/* Animated arc */}
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#ringGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="200 64"
                            style={{
                                filter: "drop-shadow(0 0 8px rgba(20, 184, 166, 0.5))"
                            }}
                        />
                    </svg>

                    {/* Center 4-pointed Star - Teal Theme */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="animate-pulse"
                        >
                            <path
                                d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
                                fill="url(#starGrad)"
                            />
                            <defs>
                                <linearGradient id="starGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#2dd4bf" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Optional Loading Text */}
                {text && (
                    <p className="text-white/60 text-sm font-medium tracking-wide">
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}
