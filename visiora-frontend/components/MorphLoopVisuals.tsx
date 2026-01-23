"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Defined Pairs matching the reference style
const pairs = [
    {
        id: 1,
        raw: '/user-suit-raw.jpg',
        ai: '/suit-after.jpg',
        title: 'Professional Headshots'
    },
    {
        id: 2,
        raw: '/user-lehenga-raw.jpg',
        ai: '/lehenga-after.jpg',
        title: 'Traditional Wear'
    },
    {
        id: 3,
        raw: '/user-red-raw.jpg',
        ai: '/red-top-after.jpg',
        title: 'Fashion Modeling'
    },
    {
        id: 4,
        raw: '/user-plaid-raw.jpg',
        ai: '/plaid-after.jpg',
        title: 'Apparel Showcase'
    }
];

export default function MorphLoopVisuals() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % pairs.length);
        }, 6000); // 6 seconds per slide

        return () => clearInterval(timer);
    }, []);

    const currentPair = pairs[index];

    return (
        <div className="w-full h-full relative bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col justify-center items-center pointer-events-none select-none">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-slate-50/50 to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 opacity-70" />

            {/* Animated Card Container */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentPair.id}
                    className="relative w-[90%] aspect-[4/3] bg-white dark:bg-slate-800 shadow-2xl shadow-slate-300 dark:shadow-black/50 overflow-hidden border border-slate-200 dark:border-slate-700"

                    // The "Dhime Dhime" (Slowly) Animation
                    // Enter from Left (-120%) with a slight rotation for style
                    // Exit to Right (120%) fading out
                    initial={{ x: "-120%", opacity: 0, scale: 0.9, rotate: -2 }}
                    animate={{ x: "0%", opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ x: "120%", opacity: 0, scale: 0.9, rotate: 2 }}

                    transition={{
                        duration: 1.5, // Slow, smooth entry
                        ease: [0.16, 1, 0.3, 1] // Custom "Expo Out" style ease for premium feel
                    }}
                >
                    {/* Inner Grid: 50/50 Split */}
                    <div className="flex h-full w-full relative">

                        {/* LEFT: RAW UPLOAD */}
                        <div className="w-1/2 h-full relative border-r-2 border-white/30 dark:border-slate-700/30">
                            <Image
                                src={currentPair.raw}
                                alt="Raw Upload"
                                fill
                                className="object-cover"
                            />
                            {/* Label: Grey Pill (Bottom Left) */}
                            <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
                                <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white bg-slate-700/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-lg">
                                    Raw Upload
                                </span>
                            </div>
                        </div>

                        {/* RIGHT: AI RESULT */}
                        <div className="w-1/2 h-full relative">
                            <Image
                                src={currentPair.ai}
                                alt="AI Result"
                                fill
                                className="object-cover"
                            />
                            {/* Label: Green Pill (Bottom Left) */}
                            <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
                                <span className="inline-flex items-center justify-center px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white bg-emerald-500/90 backdrop-blur-sm rounded-full shadow-lg shadow-emerald-500/20">
                                    AI Result
                                </span>
                            </div>
                        </div>

                        {/* CENTER: Arrow Indicator */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-transform duration-700 hover:scale-110">
                                <ArrowRight className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                            </div>
                        </div>

                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Caption below the card */}
            <div className="absolute bottom-16 text-center z-10 w-full px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPair.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-1"
                    >
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                            {currentPair.title}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">
                            AI Transformation
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
