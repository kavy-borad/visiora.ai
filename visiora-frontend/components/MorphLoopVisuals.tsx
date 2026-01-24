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
        <div className="w-full h-full relative bg-slate-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center select-none">

            {/* Rotated Grid Wrapper - The "Cross" Effect */}
            <motion.div
                className={`flex gap-6 items-center justify-center scale-110 opacity-80 transition-transform duration-1000 ${direction === "right" ? "rotate-12" : "-rotate-12"}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {/* Column 1 - Slow */}
                <MarqueeColumn items={extendedPairs} duration={80} />

                {/* Column 2 - Medium (Reverse Order for variety) */}
                <MarqueeColumn items={[...extendedPairs].reverse()} duration={100} />

                {/* Column 3 - Slow */}
                <MarqueeColumn items={extendedPairs} duration={90} />
            </motion.div>

            {/* The "Blend" Overlay - Vignette around the edges */}
            {/* The "Blend" Overlay - Vignette (Reduced Fade) */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,theme(colors.slate.50)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_45%,theme(colors.slate.900)_100%)]" />

            {/* Extra linear gradients for borders blending - Reduced size */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />

        </div>
    );
}

function MarqueeColumn({ items, duration }: { items: typeof pairs, duration: number }) {
    return (
        <div className="relative h-[200vh] overflow-hidden flex flex-col gap-6">
            <motion.div
                className="flex flex-col gap-6"
                animate={{ y: "-50%" }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* Double the items for seamless loop */}
                {[...items, ...items].map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="w-48 sm:w-60 aspect-[3/4] shrink-0 relative rounded-xl overflow-hidden border border-slate-200/20 dark:border-slate-800/20 shadow-lg bg-white dark:bg-slate-800">
                        <div className="flex h-full w-full">
                            {/* RAW Left */}
                            <div className="w-1/2 h-full relative border-r border-white/20">
                                <Image src={item.raw} alt="" fill className="object-cover" />
                            </div>
                            {/* AI Right */}
                            <div className="w-1/2 h-full relative">
                                <Image src={item.ai} alt="" fill className="object-cover" />
                            </div>
                        </div>

                        {/* Center Badge */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90 rounded-full p-1.5 shadow-sm">
                            <ArrowRight className="w-3 h-3 text-emerald-500" />
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
