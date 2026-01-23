"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";

// Standard pairs
const col1 = [
    {
        id: 1,
        raw: '/suit-before.jpg',
        ai: '/suit-after.jpg',
        aspect: 'aspect-[3/4]'
    },
    {
        id: 3,
        raw: '/red-top-before-v2.jpg',
        ai: '/red-top-after.jpg',
        aspect: 'aspect-[3/4]'
    }
];

const col2 = [
    {
        id: 2,
        raw: '/lehenga-before.jpg',
        ai: '/lehenga-after.jpg',
        aspect: 'aspect-[3/4]'
    },
    {
        id: 4,
        raw: '/plaid-before-v2.jpg',
        ai: '/plaid-after.jpg',
        aspect: 'aspect-[3/4]'
    }
];

export default function LandingVisuals() {
    return (
        <div className="w-full h-[600px] relative p-4 pt-16 flex gap-5 overflow-hidden masked-gradient">
            {/* Column 1 - Slow Move Up */}
            <motion.div
                className="w-1/2 flex flex-col gap-5"
                initial={{ y: 0 }}
                animate={{ y: -20 }}
                transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 8,
                    ease: "easeInOut"
                }}
            >
                {col1.map((item, idx) => (
                    <GridItem key={item.id} item={item} index={idx} />
                ))}
            </motion.div>

            {/* Column 2 - Offset Top + Slow Move Down */}
            <motion.div
                className="w-1/2 flex flex-col gap-5 pt-12"
                initial={{ y: 0 }}
                animate={{ y: 20 }}
                transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 10,
                    ease: "easeInOut"
                }}
            >
                {col2.map((item, idx) => (
                    <GridItem key={item.id} item={item} index={idx + 2} />
                ))}
            </motion.div>

            {/* Fade masks top/bottom for clear 'infinite' feel */}
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white dark:from-gray-900 to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10" />
        </div>
    );
}

function GridItem({ item, index }: { item: any, index: number }) {
    const [showAi, setShowAi] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowAi(prev => !prev);
        }, 4000 + (index * 1500)); // Staggered toggle timing

        return () => clearInterval(interval);
    }, [index]);

    return (
        <div className={`relative w-full ${item.aspect} rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-white/40 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-black/40 group`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={showAi ? "ai" : "raw"}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                    {/* Image Container with Cover to look premium */}
                    <div className="relative w-full h-full">
                        <Image
                            src={showAi ? item.ai : item.raw}
                            alt={showAi ? "AI" : "Raw"}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Subtle Overlay to unify contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
                    </div>

                    {/* Minimal Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <div className="flex flex-col">
                            {/* Caption could go here */}
                        </div>
                        {showAi ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-white/90 text-teal-700 backdrop-blur-md rounded-full shadow-sm">
                                <Sparkles className="w-2.5 h-2.5" /> GENERATED
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 text-[10px] font-bold bg-black/40 text-white backdrop-blur-md rounded-full border border-white/10">
                                ORIGINAL
                            </span>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
