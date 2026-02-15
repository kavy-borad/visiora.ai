"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import ComparisonSlider from "./ComparisonSlider";

// Standard pairs
const col1 = [
    {
        id: 7,
        raw: '/raw_bottle.png',
        ai: '/ai_bottle.jpg',
        aspect: 'aspect-[2/3]'
    },
    {
        id: 5,
        raw: '/shirt-set-raw.jpg',
        ai: '/shirt-set-ai.jpg',
        aspect: 'aspect-[2/3]'
    },
    {
        id: 1,
        raw: '/suit-before.jpg',
        ai: '/suit-after.jpg',
        aspect: 'aspect-[2/3]'
    },
    {
        id: 6,
        raw: '/poncho-raw.jpg',
        ai: '/poncho-ai.jpg',
        aspect: 'aspect-[2/3]'
    }
];

const col2 = [
    {
        id: 8,
        raw: '/raw_bag.png',
        ai: '/ai_bag.jpg',
        aspect: 'aspect-[2/3]'
    },
    {
        id: 3,
        raw: '/red-top-before-v2.jpg',
        ai: '/red-top-after.jpg',
        aspect: 'aspect-[2/3]'
    },
    {
        id: 2,
        raw: '/lehenga-before.jpg',
        ai: '/lehenga-after.jpg',
        aspect: 'aspect-[2/3]'
    },
    {
        id: 4,
        raw: '/plaid-before-v2.jpg',
        ai: '/plaid-after.jpg',
        aspect: 'aspect-[2/3]'
    }
];

// Combine all items effectively for marquee usage
const allItems = [...col1, ...col2];

export default function LandingVisuals() {
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Duplicate pairs to create enough length for seamless looping
    const extendedItems1 = [...col1, ...col1, ...col1, ...col1];
    const extendedItems2 = [...col2, ...col2, ...col2, ...col2];

    return (
        <>
            <div className="w-full h-full relative flex justify-center overflow-hidden"
                style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                    WebkitMaskComposite: 'destination-in',
                    maskComposite: 'intersect',
                }}
            >
                <style jsx global>{`
                    @keyframes aiFadeIn {
                        0%, 45% { opacity: 0; }
                        55%, 90% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    @keyframes rawFadeOut {
                        0%, 45% { opacity: 1; }
                        55%, 90% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                    .animate-ai-cycle {
                        animation: aiFadeIn 4s ease-in-out infinite;
                        will-change: opacity;
                        transform: translate3d(0,0,0);
                        backface-visibility: hidden;
                    }
                    .animate-raw-cycle {
                        animation: rawFadeOut 4s ease-in-out infinite;
                        will-change: opacity;
                        transform: translate3d(0,0,0);
                        backface-visibility: hidden;
                    }
                `}</style>

                {/* Straight columns - no rotation */}
                <div className="w-full h-full flex justify-center gap-3 sm:gap-5 p-4">
                    {/* Column 1 - Marquee Up */}
                    <MarqueeColumn items={extendedItems1} duration={40} reverse={false} onItemClick={setSelectedItem} />

                    {/* Column 2 - Marquee Down */}
                    <MarqueeColumn items={extendedItems2} duration={50} reverse={true} onItemClick={setSelectedItem} />
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-lg bg-transparent rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors border border-white/20"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Comparison Slider */}
                            <div className="w-full aspect-[3/4] sm:aspect-[4/5] max-h-[85vh]">
                                <ComparisonSlider
                                    slides={[{ before: selectedItem.raw, after: selectedItem.ai }]}
                                    aspectRatio="auto"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function MarqueeColumn({ items, duration, reverse = false, onItemClick }: { items: any[], duration: number, reverse?: boolean, onItemClick: (item: any) => void }) {
    return (
        <div className="relative w-1/2 h-full overflow-hidden flex flex-col gap-6 transform-gpu">
            <motion.div
                className="flex flex-col gap-5"
                initial={{ y: reverse ? "-50%" : "0%" }}
                animate={{ y: reverse ? "0%" : "-50%" }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {items.map((item, idx) => (
                    <GridItem key={`mq-${item.id}-${idx}`} item={item} onClick={() => onItemClick(item)} />
                ))}
            </motion.div>
        </div>
    );
}

// Optimized GridItem using CSS animations
function GridItem({ item, onClick }: { item: any, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`relative w-full aspect-[4/5] min-h-[280px] rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 group transform-gpu cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all active:scale-95`}
        >
            {/* Background Pattern - Static */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

            {/* Images Container */}
            <div className="absolute inset-0 w-full h-full">
                {/* Raw Image (Base) */}
                <Image
                    src={item.raw}
                    alt="Original"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                    loading="lazy"
                />

                {/* AI Image (Overlay) */}
                <div className="absolute inset-0 w-full h-full animate-ai-cycle">
                    <Image
                        src={item.ai}
                        alt="AI Generated"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Static Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />

            {/* Animated Badge - Ultra Compact & Premium */}
            <div className="absolute bottom-2 right-2 z-20 pointer-events-none">
                {/* ORIGINAL Badge */}
                <div className="absolute bottom-0 right-0 transition-opacity duration-500 animate-raw-cycle flex items-center justify-end">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
                        <div className="w-1 h-1 rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                        <span className="text-[9px] font-semibold tracking-wide text-white/90 uppercase">
                            Original
                        </span>
                    </div>
                </div>

                {/* AI GENERATED Badge */}
                <div className="absolute bottom-0 right-0 transition-opacity duration-500 animate-ai-cycle flex items-center justify-end">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-black/80 to-slate-900/80 backdrop-blur-xl rounded-full border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400/20" />
                        <span className="text-[9px] font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 uppercase">
                            AI Generated
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
