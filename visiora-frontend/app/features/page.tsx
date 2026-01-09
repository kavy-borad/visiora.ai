"use client";

import Link from "@/components/Link";
import { PublicNavbar } from "@/components/layout";

export default function FeaturesPage() {
    const features = [
        {
            id: 1,
            title: "Text-to-Image",
            description: "Generate photorealistic assets from simple text prompts using our state-of-the-art diffusion models.",
            icon: "auto_fix_high",
            iconBg: "bg-teal-50",
            iconColor: "text-teal-600",
            hoverColor: "group-hover:text-teal-600",
        },
        {
            id: 2,
            title: "In-Painting",
            description: "Edit specific areas of an image intelligently without affecting the composition of the rest of the scene.",
            icon: "brush",
            iconBg: "bg-sky-50",
            iconColor: "text-sky-500",
            hoverColor: "group-hover:text-sky-500",
        },
        {
            id: 3,
            title: "Style Transfer",
            description: "Apply your brand's unique artistic style, color palette, and mood to any generated asset instantly.",
            icon: "palette",
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-500",
            hoverColor: "group-hover:text-indigo-500",
        },
        {
            id: 4,
            title: "Batch Processing",
            description: "Create hundreds of high-quality variations in a single click to test different angles and concepts.",
            icon: "library_add",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            hoverColor: "group-hover:text-emerald-600",
        },
        {
            id: 5,
            title: "Resolution Upscale",
            description: "Enhance images to 4K clarity without losing detail, using our proprietary upscaling algorithms.",
            icon: "high_quality",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            hoverColor: "group-hover:text-violet-600",
        },
        {
            id: 6,
            title: "Background Removal",
            description: "Instantly isolate subjects with pixel-perfect precision, ready for e-commerce listings or marketing materials.",
            icon: "content_cut",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
            hoverColor: "group-hover:text-orange-500",
        },
    ];

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

            <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-teal-50/50 via-sky-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-slate-900 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
                {/* Reusable Public Navbar */}
                <PublicNavbar activePage="features" />

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center overflow-y-auto lg:overflow-hidden relative">
                    {/* Background Effects */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(20,184,166,0.05)_0%,_transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_20%,_rgba(20,184,166,0.1)_0%,_transparent_40%)] pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(14,165,233,0.05)_0%,_transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_80%,_rgba(14,165,233,0.1)_0%,_transparent_40%)] pointer-events-none"></div>

                    <section className="w-full max-w-[1440px] 2xl:max-w-[1600px] px-4 sm:px-6 md:px-8 2xl:px-12 py-4 relative z-10 flex flex-col flex-1 overflow-y-auto lg:overflow-hidden">
                        {/* Header Section */}
                        <div className="shrink-0 flex flex-col items-center text-center gap-2 mb-4 max-w-3xl mx-auto">
                            <div className="inline-flex h-6 items-center justify-center px-2.5 rounded-full bg-white dark:bg-gray-800 border border-teal-200/50 dark:border-gray-700 shadow-sm">
                                <span className="text-teal-600 dark:text-teal-400 text-[10px] font-bold tracking-widest uppercase">Features</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                    Powerful Capabilities
                                </h2>
                                <p className="text-slate-500 dark:text-gray-400 text-sm font-normal leading-relaxed max-w-xl mx-auto">
                                    Everything you need to create stunning product images with enterprise-grade precision.
                                </p>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 auto-rows-fr pb-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.id}
                                    className="group relative flex flex-col p-5 bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl transition-all duration-300 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_-12px_rgba(13,148,136,0.25)] hover:border-teal-200 dark:hover:border-teal-700 hover:-translate-y-1"
                                >
                                    <div className={`mb-2 inline-flex size-10 items-center justify-center rounded-lg ${feature.iconBg} dark:bg-opacity-20 ${feature.iconColor} group-hover:scale-105 transition-transform duration-300`}>
                                        <span className="material-symbols-outlined text-xl">{feature.icon}</span>
                                    </div>
                                    <h3 className={`text-base font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight ${feature.hoverColor} transition-colors`}>{feature.title}</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="shrink-0 border-t border-slate-200/60 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 py-2 px-4 transition-colors duration-300">
                    <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
                        <p className="text-slate-500 dark:text-gray-400 text-xs">© 2024 Visiora Inc. All rights reserved.</p>
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
