"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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
        <div className="w-full h-full relative bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center select-none">

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

            {/* The "Blend" Overlay - Vignette around the edges */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,theme(colors.white)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_45%,theme(colors.slate.900)_100%)]" />

            {/* Extra linear gradients for borders blending - Reduced size */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white dark:from-slate-900 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none" />

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
    const [showAi, setShowAi] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowAi((prev) => !prev);
        }, 5500 + (index * 500)); // Staggered toggle timing

        return () => clearInterval(interval);
    }, [index]);

    return (
        <div className="w-48 sm:w-60 aspect-[3/4] shrink-0 relative rounded-xl overflow-hidden border border-slate-200/20 dark:border-slate-800/20 shadow-lg bg-white dark:bg-slate-800 group">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={showAi ? "ai" : "raw"}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Image
                        src={showAi ? item.ai : item.raw}
                        alt={showAi ? "AI Generated" : "Original"}
                        fill
                        className="object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />

            {/* Label */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm transition-colors duration-300 ${showAi
                    ? "bg-emerald-500/90 text-white"
                    : "bg-white/20 text-white border border-white/20"
                    }`}>
                    {showAi ? "AI GENERATED" : "ORIGINAL"}
                </span>
            </div>
        </div>
    );
}
