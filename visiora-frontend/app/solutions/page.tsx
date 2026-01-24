"use client";

import Link from "@/components/Link";
import { useState, useEffect } from "react";
import { PublicNavbar } from "@/components/layout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Sparkles, MousePointer2, Info, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function SolutionsPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setStep((prev) => (prev === 3 ? 1 : prev + 1));
        }, 3000);
        return () => clearInterval(timer);
    }, [isPaused]);

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full min-h-screen pt-16 pb-12 px-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col"
        >
            <PublicNavbar activePage="solutions" />

            {/* Background Effects (Matches Pricing) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full dark:bg-teal-900/10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full dark:bg-emerald-900/10" />
            </div>

            {/* Main Content Area - Slider Container */}
            <div className="max-w-6xl mx-auto relative z-10 flex-1 flex flex-col justify-center">

                {/* Header (Static) */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Only <span className="text-teal-500">three steps</span> to magic
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Transform your raw product photos into professional model shoots instantly. No expensive studios required.
                    </p>
                </div>

                {/* Steps Slider */}
                <div
                    className="relative min-h-[500px] overflow-hidden"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence mode="wait">

                        {/* STEP 1 */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20"
                            >
                                {/* Text Left */}
                                <div className="w-full md:w-1/2 relative space-y-6">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wider uppercase mb-2">
                                        Step 1
                                    </span>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                        Select Generate Type
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8">
                                        Choose your desired generation type from our diverse collection of professional styles and themes.
                                    </p>

                                    {/* Action Button */}
                                    <button
                                        onClick={nextStep}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-teal-500/20 border-t border-white/20 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group"
                                    >
                                        Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>

                                {/* Visual Right - Split Card */}
                                <div className="w-full md:w-1/2 relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-purple-500/20 blur-3xl rounded-full opacity-60 scale-90" />
                                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-white/40 dark:border-white/10 bg-slate-50 dark:bg-slate-900 mx-auto max-w-md transform transition-transform hover:scale-[1.02] duration-500">
                                        <div className="flex h-full w-full">
                                            {/* Single */}
                                            <div className="w-1/2 h-full relative border-r border-white/10 group cursor-pointer hover:w-[55%] transition-all duration-500">
                                                <Image src="/shirt-set-ai.jpg" alt="Single" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-semibold">Single</span>
                                                </div>
                                            </div>
                                            {/* Bundle */}
                                            <div className="w-1/2 h-full relative group cursor-pointer hover:w-[55%] transition-all duration-500">
                                                <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-2 bg-slate-900">
                                                    <div className="relative rounded-lg overflow-hidden"><Image src="/shirt-set-ai.jpg" alt="Front" fill className="object-cover object-top" /></div>
                                                    <div className="relative rounded-lg overflow-hidden"><Image src="/shirt-set-ai.jpg" alt="Side" fill className="object-cover object-top scale-x-[-1]" /></div>
                                                    <div className="relative rounded-lg overflow-hidden"><Image src="/shirt-set-ai.jpg" alt="Back" fill className="object-cover object-center scale-150" /></div>
                                                    <div className="relative rounded-lg overflow-hidden"><Image src="/shirt-set-ai.jpg" alt="Detail" fill className="object-cover object-[50%_30%] scale-125" /></div>
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors pointer-events-none" />
                                                <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                                                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-semibold">Bundle</span>
                                                </div>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-110 transition-transform">
                                                    <MousePointer2 className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20"
                            >
                                {/* Text Left */}
                                <div className="w-full md:w-1/2 relative space-y-8">
                                    <div>
                                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wider uppercase mb-4">
                                            Step 2
                                        </span>
                                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                            Upload Your Photo
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                                            Upload a clear photo of your product to begin the magic. We support JPG and PNG formats up to 10MB.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 items-start">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">Pro Tip</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Use a plain background for higher accuracy.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            Back
                                        </button>
                                        <button onClick={nextStep} className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-teal-500/20 border-t border-white/20 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group">
                                            Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>

                                {/* Visual Right */}
                                <div className="w-full md:w-1/2 relative">
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 max-w-md mx-auto relative overflow-hidden">
                                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
                                            <Image src="/shirt-set-raw.jpg" alt="Uploaded File" fill className="object-cover" />
                                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-xs font-medium text-white">Upload Complete</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20"
                            >
                                {/* Text Left */}
                                <div className="w-full md:w-1/2 relative space-y-6">
                                    <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wider uppercase mb-2">
                                        Step 3
                                    </span>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                        Generate Picture
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-8">
                                        Watch as our AI instantly generates high-quality, professional model shots ready for your brand.
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            Back
                                        </button>
                                        <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-purple-500/20 border-t border-white/20 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group">
                                            Get Started <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Visual Right */}
                                <div className="w-full md:w-1/2 relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-purple-500/20 blur-3xl rounded-full opacity-60 scale-90" />
                                    <div className="relative aspect-[2/2] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-white/40 dark:border-white/10 bg-slate-900 mx-auto max-w-md transform transition-transform hover:scale-[1.02] duration-500">
                                        <Image src="/shirt-set-ai.jpg" alt="Final Result" fill className="object-cover" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </motion.section>
    );
}
