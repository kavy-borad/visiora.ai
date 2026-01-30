"use client";

import React, { useState } from 'react';
import { Sidebar, Header } from '@/components/layout';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Upload } from 'lucide-react';

export default function CreativeBuilderPage() {
    // Hardcoded states matching typical app shell requirements
    const [balance, setBalance] = useState(0);
    const [freeCredits, setFreeCredits] = useState(0);

    return (
        <div className="h-full flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <Sidebar activeNav="creative-builder" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50 dark:bg-gray-900">
                {/* Header */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Ads Creative Builder" }
                    ]}
                    freeCredits={freeCredits}
                    balance={balance}
                />

                {/* Content Area */}
                <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 sm:p-16 border border-dashed border-slate-300 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-teal-500/50 dark:hover:border-teal-500/30 group">

                            {/** Icon Circle **/}
                            <div className="w-20 h-20 bg-slate-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                            </div>

                            {/** Main Title **/}
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Upload an image to start creating your ad
                            </h2>

                            {/** Subtitle **/}
                            <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-sm">
                                Drag and drop your image here, or click to browse
                            </p>

                            {/** Upload Button **/}
                            <button className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                                <Upload className="w-5 h-5" />
                                <span>Upload Image</span>
                            </button>

                            {/** Footer Text **/}
                            <p className="mt-6 text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wide">
                                Supports PNG, JPG, WEBP up to 10MB
                            </p>

                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
