"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { useTheme } from "@/lib/theme";

export default function InitialSplashLoader({ onComplete }: { onComplete?: () => void }) {
    const [progress, setProgress] = useState(0);
    const { theme } = useTheme();

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 10; // Slightly slower for better impact
                if (next >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return next;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress === 100 && onComplete) {
            const timeout = setTimeout(onComplete, 800); // 800ms delay at 100%
            return () => clearTimeout(timeout);
        }
    }, [progress, onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0f172a] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                transition: { duration: 0.8, ease: "easeInOut" }
            }}
        >
            {/* Background Abstract Effects - Neural Network Nodes */}
            <div className="absolute inset-0 overflow-hidden opacity-20 dark:opacity-40">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-xl"
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                            scale: Math.random() * 0.5 + 0.5,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, Math.random() * 100 - 50 + "%"],
                            opacity: [0, 0.4, 0]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut"
                        }}
                        style={{
                            width: Math.random() * 200 + 50 + "px",
                            height: Math.random() * 200 + 50 + "px",
                        }}
                    />
                ))}
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center">

                {/* Logo Animation Container */}
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">

                    {/* Ring 1 - Outer Pulsing */}
                    <motion.div
                        className="absolute inset-0 rounded-full border border-teal-500/20"
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Ring 2 - Inner Spinning Arc */}
                    <motion.div
                        className="absolute inset-4 rounded-full border-t-2 border-r-2 border-teal-500"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Ring 3 - Counter Spinning Arc */}
                    <motion.div
                        className="absolute inset-8 rounded-full border-b-2 border-l-2 border-emerald-500/50"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* The Logo Image */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                        className="relative z-20 w-60 h-auto"
                    >
                        <img
                            src={theme === 'dark' ? "/logo-dark.svg" : "/logo-new.svg"}
                            alt="ephotocart Logo"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>
                </div>

                {/* Text Animation */}
                <motion.div
                    className="text-center space-y-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >

                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase">
                        Initializing Creative Engine
                    </p>
                </motion.div>

                {/* Progress Bar Container */}
                <div className="w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-10 overflow-hidden relative shadow-inner">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 shimmer-bar"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    />
                </div>

                {/* Percentage Text */}
                <motion.div
                    className="mt-3 text-[10px] font-black text-teal-600 dark:text-teal-400 tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {Math.round(progress)}%
                </motion.div>
            </div>

            <style jsx>{`
                .shimmer-bar {
                    background-size: 200% 100%;
                    animation: shimmer 1.5s linear infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }
            `}</style>
        </motion.div>
    );
}
