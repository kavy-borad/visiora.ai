"use client";

import Link from "@/components/Link";
import { useState, useEffect } from "react";
import { landingApi, LandingStats } from "@/lib/landing";
import { PublicNavbar } from "@/components/layout";

export default function SolutionsPage() {
    const [stats, setStats] = useState<LandingStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch stats on component mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await landingApi.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.warn('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Default values for display
    const imagesGenerated = stats?.imagesGenerated ?? 50000;
    const avgGenerationTime = stats?.avgGenerationTime ?? 3;
    const activeUsers = stats?.activeUsers ?? 10000;

    return (
        <>
            {/* Google Fonts & Material Icons */}
            <link href="https://fonts.googleapis.com" rel="preconnect" />
            <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                }
                .dark .glass-card {
                    background: rgba(31, 41, 55, 0.6);
                    border: 1px solid rgba(55, 65, 81, 0.8);
                }
                .bg-visiora-gradient {
                    background: radial-gradient(circle at 10% 20%, #ccfbf1 0%, transparent 40%), 
                                radial-gradient(circle at 90% 80%, #e0f2fe 0%, transparent 40%),
                                linear-gradient(135deg, #f0fdfa 0%, #ffffff 50%, #f0fdfa 100%);
                }
                .dark .bg-visiora-gradient {
                    background: radial-gradient(circle at 10% 20%, rgba(20, 184, 166, 0.15) 0%, transparent 40%), 
                                radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 40%),
                                linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%);
                }
                .line-dashed-animated {
                    stroke-dasharray: 6;
                    animation: dash 30s linear infinite;
                }
                @keyframes dash {
                    to {
                        stroke-dashoffset: -1000;
                    }
                }
            `}</style>

            <div className="min-h-screen w-screen bg-visiora-gradient text-slate-800 dark:text-gray-100 font-sans antialiased overflow-x-hidden flex flex-col transition-colors duration-300">
                {/* Reusable Public Navbar */}
                <PublicNavbar activePage="solutions" />

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden">
                    <section className="relative flex-1 flex flex-col py-4 lg:py-6 overflow-hidden">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                            <div className="absolute top-10 left-10 w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] bg-teal-100/50 rounded-full blur-[80px] lg:blur-[100px] mix-blend-multiply opacity-70"></div>
                            <div className="absolute bottom-10 right-10 w-[350px] h-[350px] lg:w-[500px] lg:h-[500px] bg-emerald-100/50 rounded-full blur-[80px] lg:blur-[100px] mix-blend-multiply opacity-70"></div>
                        </div>

                        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
                            {/* Header Section */}
                            <div className="shrink-0 mx-auto max-w-3xl text-center mb-4 lg:mb-6">
                                <div className="inline-flex items-center justify-center px-3 py-0.5 mb-2 rounded-full border border-teal-200 dark:border-teal-800 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm">
                                    <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">Process</span>
                                </div>
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 lg:mb-2">
                                    How Visiora Works
                                </h2>
                                <p className="text-xs lg:text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-xl lg:max-w-2xl mx-auto">
                                    Transform your creative ideas into professional visual assets in three simple steps.
                                </p>
                            </div>

                            {/* Timeline Steps */}
                            <div className="relative max-w-5xl mx-auto flex-1 flex flex-col justify-center">
                                {/* Vertical Connector Line */}
                                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-0">
                                    <svg className="h-full w-2 -ml-1" overflow="visible">
                                        <line className="line-dashed-animated" stroke="#cbd5e1" strokeWidth="2" x1="4" x2="4" y1="0" y2="100%"></line>
                                    </svg>
                                </div>

                                <div className="space-y-4 lg:space-y-0">
                                    {/* Step 1 */}
                                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center group">
                                        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.15)] z-20 group-hover:scale-125 transition-transform duration-300"></div>
                                        <div className="hidden lg:block absolute left-1/2 top-1/2 w-8 lg:w-10 h-[2px] bg-teal-200 -ml-8 lg:-ml-10 -translate-y-1/2 origin-right transition-all duration-500 group-hover:w-12 lg:group-hover:w-14 group-hover:-ml-12 lg:group-hover:-ml-14 group-hover:bg-teal-400"></div>

                                        <div className="lg:text-right order-2 lg:order-1">
                                            <div className="glass-card rounded-xl p-4 lg:p-5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_0_rgba(20,184,166,0.15)] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] group-hover:border-white">
                                                <span className="absolute -right-4 -bottom-4 text-[5rem] lg:text-[6rem] leading-none font-bold text-slate-900/5 select-none transition-all duration-500 group-hover:text-teal-600/5">01</span>
                                                <div className="relative z-10 flex flex-col items-start lg:items-end">
                                                    <div className="mb-2 inline-flex p-2 rounded-lg bg-gradient-to-br from-white to-white/50 border border-white shadow-sm backdrop-blur-xl text-teal-600 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                                                        <span className="material-symbols-outlined text-xl lg:text-2xl">edit_note</span>
                                                    </div>
                                                    <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Describe your vision</h3>
                                                    <p className="text-slate-600 dark:text-gray-400 text-xs lg:text-sm leading-relaxed lg:pl-4">
                                                        Write a detailed prompt or upload a reference image.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden lg:block order-1 lg:order-2"></div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center group">
                                        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.15)] z-20 group-hover:scale-125 transition-transform duration-300"></div>
                                        <div className="hidden lg:block absolute left-1/2 top-1/2 w-8 lg:w-10 h-[2px] bg-teal-200 translate-x-0 -translate-y-1/2 origin-left transition-all duration-500 group-hover:w-12 lg:group-hover:w-14 group-hover:bg-teal-400"></div>

                                        <div className="hidden lg:block"></div>
                                        <div className="lg:text-left">
                                            <div className="glass-card rounded-xl p-4 lg:p-5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_0_rgba(20,184,166,0.15)] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] group-hover:border-white">
                                                <span className="absolute -left-4 -bottom-4 text-[5rem] lg:text-[6rem] leading-none font-bold text-slate-900/5 select-none transition-all duration-500 group-hover:text-teal-600/5">02</span>
                                                <div className="relative z-10 flex flex-col items-start">
                                                    <div className="mb-2 inline-flex p-2 rounded-lg bg-gradient-to-br from-white to-white/50 border border-white shadow-sm backdrop-blur-xl text-teal-600 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                                                        <span className="material-symbols-outlined text-xl lg:text-2xl">tune</span>
                                                    </div>
                                                    <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Configure settings</h3>
                                                    <p className="text-slate-600 dark:text-gray-400 text-xs lg:text-sm leading-relaxed lg:pr-4">
                                                        Choose style, aspect ratio, and resolution for your output.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center group">
                                        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.15)] z-20 group-hover:scale-125 transition-transform duration-300"></div>
                                        <div className="hidden lg:block absolute left-1/2 top-1/2 w-8 lg:w-10 h-[2px] bg-teal-200 -ml-8 lg:-ml-10 -translate-y-1/2 origin-right transition-all duration-500 group-hover:w-12 lg:group-hover:w-14 group-hover:-ml-12 lg:group-hover:-ml-14 group-hover:bg-teal-400"></div>

                                        <div className="lg:text-right order-2 lg:order-1">
                                            <div className="glass-card rounded-xl p-4 lg:p-5 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_0_rgba(20,184,166,0.15)] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] group-hover:border-white">
                                                <span className="absolute -right-4 -bottom-4 text-[5rem] lg:text-[6rem] leading-none font-bold text-slate-900/5 select-none transition-all duration-500 group-hover:text-teal-600/5">03</span>
                                                <div className="relative z-10 flex flex-col items-start lg:items-end">
                                                    <div className="mb-2 inline-flex p-2 rounded-lg bg-gradient-to-br from-white to-white/50 border border-white shadow-sm backdrop-blur-xl text-teal-600 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                                                        <span className="material-symbols-outlined text-xl lg:text-2xl">cloud_download</span>
                                                    </div>
                                                    <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Generate & export</h3>
                                                    <p className="text-slate-600 dark:text-gray-400 text-xs lg:text-sm leading-relaxed lg:pl-4">
                                                        Instantly generate high-quality visuals and download.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden lg:block order-1 lg:order-2"></div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="shrink-0 mt-3 text-center">
                                <Link
                                    href="/generate"
                                    className="relative inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-3 lg:px-4 py-1.5 text-xs font-bold text-white shadow-xl shadow-teal-500/20 transition-all hover:bg-teal-500 hover:scale-105 hover:shadow-teal-500/40"
                                >
                                    <span className="text-xs">Start creating now</span>
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    <div className="absolute -inset-1 -z-10 rounded-full bg-teal-400 opacity-20 blur-lg transition-opacity duration-300 group-hover:opacity-50"></div>
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
