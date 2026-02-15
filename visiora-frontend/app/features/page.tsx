"use client";

import Link from "@/components/Link";
import { PublicNavbar } from "@/components/layout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeaturesPage() {
    const [isExpanded, setIsExpanded] = useState(false);

    const features = [
        {
            id: 1,
            title: "AI Headshots",
            description: "Generate professional profile pictures and avatars from a single uploaded photo. Perfect for LinkedIn and social media.",
            icon: "face",
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
            hoverColor: "group-hover:text-purple-600",
        },
        {
            id: 2,
            title: "Product Photography",
            description: "Transform amateur product photos into studio-quality marketing assets with professional lighting and backgrounds.",
            icon: "shopping_bag",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            hoverColor: "group-hover:text-blue-600",
        },
        {
            id: 3,
            title: "Batch Processing",
            description: "Create multiple variations and angles in a single click. Ideal for e-commerce listings and catalogs.",
            icon: "library_add",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            hoverColor: "group-hover:text-emerald-600",
        },
        {
            id: 4,
            title: "Studio Lighting",
            description: "Automatically enhance your images with professional studio lighting setups for a crisp, high-end look.",
            icon: "light_mode",
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-600",
            hoverColor: "group-hover:text-yellow-600",
        },
        {
            id: 5,
            title: "Background Removal",
            description: "Instantly remove backgrounds to create transparent PNGs or place your product in new environments.",
            icon: "content_cut",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
            hoverColor: "group-hover:text-orange-500",
        },
        {
            id: 6,
            title: "Resolution Upscale",
            description: "Enhance image clarity and resolution, ensuring your generated assets are print-ready and sharp.",
            icon: "high_quality",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            hoverColor: "group-hover:text-violet-600",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring" as const, stiffness: 100, damping: 15 }
        }
    };

    return (
        <>
            {/* Google Material Icons */}
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>

            <div className="min-h-screen w-screen overflow-x-hidden bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
                {/* Reusable Public Navbar */}
                <PublicNavbar activePage="features" />

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center overflow-y-auto lg:overflow-hidden relative">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(20,184,166,0.05)_0%,_transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,_rgba(20,184,166,0.1)_0%,_transparent_40%)] pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(14,165,233,0.05)_0%,_transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_80%,_rgba(14,165,233,0.1)_0%,_transparent_40%)] pointer-events-none"></div>

                    <section className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 2xl:px-12 pt-28 sm:pt-16 pb-12 relative z-10 flex flex-col flex-1 overflow-y-auto lg:overflow-hidden">
                        {/* Header Section */}
                        <div className="shrink-0 w-full flex flex-col items-center text-center gap-2 mb-10 sm:mb-4 max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col gap-1"
                            >
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                    Powerful Capabilities
                                </h2>
                                <p className="text-slate-500 dark:text-gray-400 text-sm font-normal leading-relaxed max-w-xl mx-auto">
                                    Everything you need to create stunning product images with enterprise-grade precision.
                                </p>
                            </motion.div>
                        </div>

                        {/* Features Grid */}
                        <motion.div
                            layout
                            className={isExpanded
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 auto-rows-fr pb-4"
                                : "relative h-[450px] sm:h-[400px] w-full flex items-center justify-center cursor-pointer"}
                            onClick={() => !isExpanded && setIsExpanded(true)}
                        >
                            <AnimatePresence>
                                {features.map((feature, index) => (
                                    <motion.div
                                        layout
                                        key={feature.id}
                                        variants={{
                                            stacked: {
                                                scale: 1 - index * 0.05,
                                                x: "-50%",
                                                y: `calc(-50% + ${index * 12}px)`,
                                                rotate: index % 2 === 0 ? index * 2 : index * -2, // Reduced rotation for mobile safety
                                                zIndex: 6 - index,
                                                opacity: 1
                                            },
                                            expanded: {
                                                scale: 1,
                                                x: 0,
                                                y: 0,
                                                rotate: 0,
                                                zIndex: 1,
                                                opacity: 1
                                            }
                                        }}
                                        initial={isExpanded ? "expanded" : "stacked"}
                                        animate={isExpanded ? "expanded" : "stacked"}
                                        transition={{
                                            type: "spring",
                                            stiffness: 120,
                                            damping: 20,
                                            delay: isExpanded ? index * 0.1 : 0
                                        }}
                                        whileHover={isExpanded ? { scale: 1.02, translateY: -5 } : { scale: 1.05 }}
                                        className={`group flex flex-col p-5 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl transition-shadow duration-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_-12px_rgba(13,148,136,0.25)] hover:border-teal-200 dark:hover:border-teal-700 ${!isExpanded ? 'absolute w-[80%] max-w-[300px] sm:w-full sm:max-w-md h-[280px] top-1/2 left-1/2 cursor-pointer' : 'relative w-full h-full'}`}
                                    >
                                        <div className={`mb-2 inline-flex size-10 items-center justify-center rounded-lg ${feature.iconBg} dark:bg-opacity-20 ${feature.iconColor} group-hover:scale-105 transition-transform duration-300`}>
                                            <span className="material-symbols-outlined text-xl">{feature.icon}</span>
                                        </div>
                                        <h3 className={`text-base font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight ${feature.hoverColor} transition-colors`}>{feature.title}</h3>
                                        <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                                            {feature.description}
                                        </p>

                                        {!isExpanded && index === 0 && (
                                            <div className="absolute inset-x-0 bottom-3 text-center">
                                                <span className="text-[10px] sm:text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full animate-pulse">Click to Expand</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="shrink-0 border-t border-slate-200/60 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 py-2 px-4 transition-colors duration-300">
                    <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                        <p className="text-slate-500 dark:text-gray-400 text-xs">© 2026 ephotocart. All rights reserved.</p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 text-xs transition-colors">Privacy Policy</Link>
                            <Link href="#" className="text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 text-xs transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
