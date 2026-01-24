"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { UploadCloud, Sparkles, MousePointer2 } from "lucide-react";

export default function HowItWorks() {
    return (
        <section className="relative w-full py-24 px-4 overflow-hidden bg-white dark:bg-slate-950">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                            Only <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">two steps</span> to magic
                        </h2>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Transform your raw product photos into professional model shoots instantly. No expensive studios required.
                        </p>
                    </motion.div>
                </div>

                <div className="flex flex-col gap-24 md:gap-32">

                    {/* Step 1: Upload */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20"
                    >
                        {/* Text Left */}
                        <div className="w-full md:w-1/2 relative space-y-6">
                            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wider uppercase mb-2">
                                Step 1
                            </span>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Upload your raw photo
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                Start by uploading a clear photo of your apparel. We support hanger shots, flat lays, or basic mannequin photos. Our AI understands the garment structure perfectly.
                            </p>
                        </div>

                        {/* Visual Right */}
                        <div className="w-full md:w-1/2 relative">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-purple-500/20 blur-3xl rounded-full opacity-60 scale-90" />

                            {/* Card */}
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-white/40 dark:border-white/10 bg-slate-50 dark:bg-slate-900 mx-auto max-w-md transform transition-transform hover:scale-[1.02] duration-500">
                                <Image
                                    src="/shirt-set-raw.jpg"
                                    alt="Upload Process"
                                    fill
                                    className="object-cover"
                                />
                                {/* Overlay UI */}
                                <div className="absolute inset-0 bg-black/20" />

                                {/* Upload Button Simulation */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-3 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
                                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                                            <UploadCloud className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">Uploading...</span>
                                            <span className="text-[10px] text-slate-500">shirt-set.jpg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 2: Auto Generate (Reversed) */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col md:flex-row-reverse items-center justify-between gap-12 md:gap-20"
                    >
                        {/* Text Right */}
                        <div className="w-full md:w-1/2 relative space-y-6">
                            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 text-xs font-bold tracking-wider uppercase mb-2">
                                Step 2
                            </span>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                Instant Model Generation
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                                Our advanced AI instantly maps your garment onto a professional model. Select from various poses, backgrounds, and ethnicities to match your brand identity perfectly.
                            </p>
                        </div>

                        {/* Visual Left */}
                        <div className="w-full md:w-1/2 relative">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 to-teal-500/20 blur-3xl rounded-full opacity-60 scale-90" />

                            {/* Card */}
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-black/50 border border-white/40 dark:border-white/10 bg-slate-50 dark:bg-slate-900 mx-auto max-w-md transform transition-transform hover:scale-[1.02] duration-500">
                                <Image
                                    src="/shirt-set-ai.jpg"
                                    alt="Result"
                                    fill
                                    className="object-cover"
                                />

                                {/* Magic Cursor Effect */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

                                {/* Floating Badge */}
                                <div className="absolute top-6 right-6">
                                    <div className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-400 transition-colors flex items-center justify-center text-white shadow-xl shadow-purple-500/30 cursor-pointer animate-pulse">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div className="absolute -bottom-8 right-0 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Generated!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
