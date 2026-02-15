"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

// Defined Pairs matching the reference style
const pairs = [
    {
        id: 5,
        raw: '/shirt-set-raw.jpg',
        ai: '/shirt-set-ai.jpg',
        title: 'Catalog Photography'
    },
    {
        id: 6,
        raw: '/poncho-raw.jpg',
        ai: '/poncho-ai.jpg',
        title: 'Studio Lighting'
    },
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
        id: 7,
        raw: '/raw_bottle.png',
        ai: '/ai_bottle.jpg',
        title: 'Product Commercial'
    },
    {
        id: 8,
        raw: '/raw_bag.png',
        ai: '/ai_bag.jpg',
        title: 'E-commerce Ad'
    },
    {
        id: 4,
        raw: '/user-plaid-raw.jpg',
        ai: '/plaid-after.jpg',
        title: 'Apparel Showcase'
    }
];

export default function MorphLoopVisuals({ direction = "left" }: { direction?: "left" | "right" }) {
    // Duplicate pairs to create enough length for seamless looping
    const extendedPairs = [...pairs, ...pairs, ...pairs];

    return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center select-none">
            <style jsx global>{`
                @keyframes aiFadeIn {
                    0%, 68% { opacity: 0; }
                    72%, 96% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .animate-ai-cycle {
                    animation: aiFadeIn 3s linear infinite;
                    will-change: opacity;
                    transform: translateZ(0);
                }
                @keyframes rawFadeOut {
                    0%, 68% { opacity: 1; }
                    72%, 96% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .animate-raw-cycle {
                    animation: rawFadeOut 3s linear infinite;
                    will-change: opacity;
                    transform: translateZ(0);
                }
            `}</style>

            {/* Rotated Grid Wrapper - The "Cross" Effect */}
            <motion.div
                className={`flex gap-6 items-center justify-center scale-110 opacity-80 transition-transform duration-1000 ${direction === "right" ? "rotate-12" : "-rotate-12"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {/* Column 1 - Slow Up */}
                <MarqueeColumn items={extendedPairs} duration={110} />

                {/* Column 2 - Medium Down (Reverse Direction) */}
                <MarqueeColumn items={[...extendedPairs].reverse()} duration={100} reverse={true} />

                {/* Column 3 - Slow Up */}
                <MarqueeColumn items={extendedPairs} duration={120} />
            </motion.div>

            {/* Bottom Gradient Only - To match user's preference */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />

        </div>
    );
}

function MarqueeColumn({ items, duration, reverse = false }: { items: typeof pairs, duration: number, reverse?: boolean }) {
    return (
        <div className="relative h-[200vh] overflow-hidden flex flex-col gap-6 will-change-transform transform-gpu">
            <motion.div
                className="flex flex-col gap-6"
                initial={{ y: reverse ? "-50%" : "0%" }}
                animate={{ y: reverse ? "0%" : "-50%" }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* Double the items for seamless loop */}
                {[...items, ...items].map((item, idx) => (
                    <MarqueeItem key={`${item.id}-${idx}`} item={item} index={idx} />
                ))}
            </motion.div>
        </div>
    );
}

function MarqueeItem({ item, index }: { item: any, index: number }) {
    return (
        <div className="w-48 sm:w-60 aspect-[3/4] shrink-0 relative rounded-xl overflow-hidden shadow-lg bg-white dark:bg-slate-800 group transform-gpu">
            {/* Raw Image (Base) */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={item.raw}
                    alt="Original"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 33vw, 20vw"
                />
            </div>

            {/* AI Image (Overlay) */}
            <div className="absolute inset-0 w-full h-full animate-ai-cycle">
                <Image
                    src={item.ai}
                    alt="AI Generated"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 33vw, 20vw"
                />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />

            {/* Label - Compact & Safe from clipping */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                {/* ORIGINAL Badge */}
                <div className="absolute transition-opacity duration-300 animate-raw-cycle">
                    <span className="text-[9px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md shadow-sm bg-black/60 text-white border border-white/20 whitespace-nowrap">
                        ORIGINAL
                    </span>
                </div>

                {/* AI GENERATED Badge */}
                <div className="absolute transition-opacity duration-300 animate-ai-cycle">
                    <span className="text-[9px] items-center gap-1 font-extrabold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md shadow-sm bg-emerald-600/90 text-white border border-emerald-400/30 flex shadow-emerald-900/20 whitespace-nowrap">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-100 shrink-0" />
                        AI GENERATED
                    </span>
                </div>
            </div>
        </div>
    );
}
