"use client";

import Link from "@/components/Link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { PublicNavbar } from "@/components/layout";

export default function GetStartedPage() {
    return (
        <div className="min-h-screen lg:h-screen w-screen lg:overflow-hidden overflow-x-hidden bg-gradient-to-b from-cyan-50/50 via-teal-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-slate-800 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
            {/* Background Effect */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(224,250,255,0.8)_0%,_rgba(240,253,250,0.5)_50%,_transparent_100%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,_rgba(20,184,166,0.15)_0%,_rgba(6,78,59,0.1)_50%,_transparent_100%)] pointer-events-none"></div>

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

            {/* Reusable Public Navbar */}
            <PublicNavbar activePage="get-started" />

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col justify-center py-6 sm:py-8 overflow-y-auto lg:overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Card with decorative elements */}
                    <div className="relative mx-auto max-w-3xl">
                        {/* Decorative gradient border glow - hidden on mobile */}
                        <div className="hidden sm:block absolute -inset-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 rounded-[28px] opacity-20 blur-lg"></div>

                        {/* Decorative corner accents - smaller on mobile */}
                        <div className="hidden sm:block absolute -top-2 -left-2 w-12 sm:w-16 h-12 sm:h-16 border-t-4 border-l-4 border-teal-400 rounded-tl-3xl"></div>
                        <div className="hidden sm:block absolute -bottom-2 -right-2 w-12 sm:w-16 h-12 sm:h-16 border-b-4 border-r-4 border-teal-400 rounded-br-3xl"></div>

                        {/* Main Card */}
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.4)] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)]">
                            {/* Top gradient stripe */}
                            <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500"></div>

                            <div className="relative px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16 text-center">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/50 dark:from-teal-900/20 via-white dark:via-gray-800 to-white dark:to-gray-800"></div>

                                {/* Decorative floating dots - hidden on mobile */}
                                <div className="hidden sm:block absolute top-8 left-8 w-2 h-2 rounded-full bg-teal-400/40"></div>
                                <div className="hidden sm:block absolute top-12 left-16 w-1.5 h-1.5 rounded-full bg-cyan-400/40"></div>
                                <div className="hidden sm:block absolute bottom-8 right-8 w-2 h-2 rounded-full bg-teal-400/40"></div>
                                <div className="hidden sm:block absolute bottom-12 right-16 w-1.5 h-1.5 rounded-full bg-cyan-400/40"></div>

                                <div className="mx-auto max-w-xl">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        Ready to Transform Your <br className="hidden sm:block" />
                                        <span className="bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">Product Images?</span>
                                    </h1>

                                    <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-500 dark:text-gray-400">
                                        Join thousands of creators generating professional assets in seconds. High-quality AI rendering without the complexity.
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Link
                                            href="/register"
                                            className="flex h-11 sm:h-12 w-full sm:w-auto min-w-[160px] sm:min-w-[180px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 sm:px-6 text-sm sm:text-base font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] hover:shadow-xl"
                                        >
                                            <span>Get Started Free</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href="/login"
                                            className="flex h-11 sm:h-12 w-full sm:w-auto min-w-[120px] sm:min-w-[140px] cursor-pointer items-center justify-center rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 sm:px-6 text-sm sm:text-base font-semibold text-slate-600 dark:text-gray-300 shadow-sm transition-all hover:border-slate-300 dark:hover:border-gray-500 hover:bg-slate-50 dark:hover:bg-gray-600 hover:text-slate-900 dark:hover:text-white"
                                        >
                                            Sign In
                                        </Link>
                                    </div>

                                    {/* Features */}
                                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500" />
                                            <span>No credit card required</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500" />
                                            <span>Free credits included</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500" />
                                            <span>Cancel anytime</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="shrink-0 relative z-10 border-t border-slate-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 py-3 sm:py-4 backdrop-blur-sm transition-colors duration-300">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-[10px] sm:text-xs md:text-sm font-medium text-slate-500 dark:text-gray-400">
                        <a className="transition-colors hover:text-teal-600 dark:hover:text-teal-400" href="mailto:contact@ephotocart.com">contact@ephotocart.com</a>
                        <span className="hidden sm:block h-1 w-1 rounded-full bg-slate-300 dark:bg-gray-600"></span>
                        <a className="transition-colors hover:text-teal-600 dark:hover:text-teal-400" href="tel:+15551234567">+1 (555) 123-4567</a>
                        <span className="hidden md:block h-1 w-1 rounded-full bg-slate-300 dark:bg-gray-600"></span>
                        <span className="hidden md:inline text-slate-400 dark:text-gray-500">123 AI Street, Tech City</span>
                    </div>
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-400 dark:text-gray-500">
                        <p>© 2026 ephotocart. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
