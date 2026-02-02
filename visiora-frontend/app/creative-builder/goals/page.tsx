"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCreativeBuilder } from '../layout';
import {
    Zap,
    Globe,
    Facebook,
    Instagram,
    Monitor,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Tag
} from 'lucide-react';

// --- Animation Variants ---
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.1 } }
};

// --- Mock Data ---
const PLATFORMS = [
    {
        id: 'gg',
        title: 'Google Ads',
        icon: Globe,
        colorClass: 'text-blue-500',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        selectedClass: 'bg-blue-500 text-white shadow-blue-500/25',
        borderClass: 'border-blue-500 shadow-blue-500/15'
    },
    {
        id: 'ig',
        title: 'Instagram Ads',
        icon: Instagram,
        colorClass: 'text-pink-500',
        bgClass: 'bg-pink-50 dark:bg-pink-900/20',
        selectedClass: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white shadow-pink-500/25',
        borderClass: 'border-pink-500 shadow-pink-500/15'
    },
    {
        id: 'fb',
        title: 'Facebook Ads',
        icon: Facebook,
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        selectedClass: 'bg-blue-600 text-white shadow-blue-600/25',
        borderClass: 'border-blue-600 shadow-blue-600/15'
    },
    {
        id: 'sm',
        title: 'Social Media',
        icon: Monitor,
        colorClass: 'text-violet-500',
        bgClass: 'bg-violet-50 dark:bg-violet-900/20',
        selectedClass: 'bg-violet-500 text-white shadow-violet-500/25',
        borderClass: 'border-violet-500 shadow-violet-500/15'
    },
];

export default function GoalsPage() {
    const router = useRouter();
    const {
        offer,
        setOffer,
        price,
        setPrice,
        offerPrice,
        setOfferPrice,
        selectedPlatform,
        setSelectedPlatform
    } = useCreativeBuilder();

    const handleGoBack = () => {
        router.push('/creative-builder/upload');
    };

    const handleGoalSelection = () => {
        router.push('/creative-builder/edit');
    };

    return (
        <motion.div
            key="goals"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full h-full flex flex-col relative"
        >
            <div className="flex-1 flex flex-col justify-start pt-0 space-y-6 min-h-0 w-full">
                <div className="text-left space-y-2 mt-3 w-full max-w-5xl mx-auto">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Configure Your Ad Offer</h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Add details to tailor your creative concepts.</p>
                </div>
                <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-2xl space-y-5 flex flex-col h-full">
                            <div className="space-y-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Product Price</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-teal-500 transition-colors font-black text-base">$</div>
                                        <input type="text" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-teal-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600" />
                                    </div>
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Special Offer</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-teal-500 transition-colors"><Zap className="w-4 h-4" /></div>
                                        <input type="text" placeholder="e.g. 50% OFF" value={offer} onChange={(e) => setOffer(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-teal-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1 text-left">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">You Pay</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-teal-500 transition-colors"><Tag className="w-4 h-4" /></div>
                                    <input type="text" placeholder="$0.00" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-teal-500 focus:ring-0 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2 block text-left">Platform Template</label>
                        <div className="grid grid-cols-2 gap-4">
                            {PLATFORMS.map((p) => {
                                const isSelected = selectedPlatform === p.id;
                                return (
                                    <motion.div
                                        key={p.id}
                                        onClick={() => setSelectedPlatform(p.id)}
                                        className={`relative p-4 rounded-[1.5rem] border-2 cursor-pointer flex flex-col items-center gap-3 overflow-hidden ${isSelected ? 'shadow-xl' : 'hover:border-slate-300 dark:hover:border-slate-600'}`}
                                        initial={false}
                                        animate={{
                                            backgroundColor: isSelected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.4)',
                                            borderColor: isSelected ? (p.id === 'ig' ? '#EC4899' : p.id === 'fb' ? '#2563EB' : p.id === 'gg' ? '#3B82F6' : '#8B5CF6') : 'transparent',
                                        }}
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Icon Container */}
                                        <motion.div
                                            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center z-10 shadow-sm`}
                                            initial={false}
                                            animate={{
                                                backgroundColor: isSelected ? 'transparent' : (p.id === 'ig' ? '#FDF2F8' : p.id === 'fb' ? '#EFF6FF' : p.id === 'gg' ? '#EFF6FF' : '#F5F3FF'),
                                                color: isSelected ? '#FFFFFF' : (p.id === 'ig' ? '#EC4899' : p.id === 'fb' ? '#2563EB' : p.id === 'gg' ? '#3B82F6' : '#8B5CF6'),
                                            }}
                                        >
                                            {/* Selected Background Layer (Gradient for Insta, Solid for others) */}
                                            <motion.div
                                                className={`absolute inset-0 rounded-2xl ${p.id === 'ig' ? 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600' :
                                                    p.id === 'fb' ? 'bg-[#1877F2]' :
                                                        p.id === 'gg' ? 'bg-[#4285F4]' :
                                                            'bg-violet-500'
                                                    }`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: isSelected ? 1 : 0, scale: isSelected ? 1 : 0.8 }}
                                                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                                            />

                                            {/* Icon */}
                                            <p.icon className="w-6 h-6 z-10 relative" />
                                        </motion.div>

                                        {/* Label */}
                                        <div className="flex flex-col items-center z-10">
                                            <span className={`font-black text-[11px] uppercase tracking-wider transition-colors duration-300 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                                {p.title}
                                            </span>
                                        </div>

                                        {/* Selection Glow (Background) */}
                                        {isSelected && (
                                            <motion.div
                                                layoutId="glow"
                                                className={`absolute inset-0 -z-0 opacity-10 ${p.id === 'ig' ? 'bg-pink-500' :
                                                    p.id === 'fb' ? 'bg-blue-500' :
                                                        p.id === 'gg' ? 'bg-blue-500' :
                                                            'bg-violet-500'
                                                    }`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.1 }}
                                                exit={{ opacity: 0 }}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Footer Buttons - Bottom Corners */}
            <div className="fixed bottom-0 left-4 lg:left-72 right-0 z-40 px-8 py-2 flex items-center justify-between pointer-events-none">
                <button
                    onClick={handleGoBack}
                    className="pointer-events-auto py-3 px-8 flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                </button>
                <button
                    onClick={handleGoalSelection}
                    className="pointer-events-auto group px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>Next Step</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
