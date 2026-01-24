"use client";

import Link from "@/components/Link";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { PublicNavbar } from "@/components/layout";
import { motion } from "framer-motion";

export default function PricingPage() {
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
    const [selectedPlan, setSelectedPlan] = useState("visionary");
    const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

    const plans = [
        {
            id: "creator",
            name: "Creator",
            tokenTag: "16k +",
            price: 19,
            prevPrice: 29,
            desc: "For newcomers exploring limited features.",
            features: [
                { text: "900 Film tokens", included: true },
                { text: "Unlock PRO templates", included: true },
                { text: "Faster queue", included: false },
                { text: "Priority queue", included: false },
                { text: "720p resolution", included: false },
            ]
        },
        {
            id: "innovator",
            name: "Innovator",
            tokenTag: "100k +",
            price: 99,
            prevPrice: 150,
            desc: "Seamless Android & Web, expanded capability.",
            features: [
                { text: "10K Film tokens", included: true },
                { text: "Unlock PRO templates", included: true },
                { text: "Faster queue", included: true },
                { text: "4K resolution", included: true },
                { text: "More benefits soon", included: true },
            ]
        },
        {
            id: "visionary",
            name: "Visionary",
            tokenTag: "400k +",
            price: 199,
            prevPrice: 270,
            desc: "Max power and priority for professionals.",
            features: [
                { text: "23K Film tokens", included: true },
                { text: "Unlock PRO templates", included: true },
                { text: "Priority support", included: true },
                { text: "4K resolution", included: true },
                { text: "More benefits soon", included: true },
            ]
        },
    ];

    return (
        <div className="h-screen w-full bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white overflow-hidden flex flex-col transition-colors duration-300">
            <PublicNavbar activePage="pricing" />

            {/* Background Effects (Subtle Project Theme) */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full dark:bg-teal-900/10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full dark:bg-emerald-900/10" />
            </div>

            <main className="relative z-10 container mx-auto px-4 flex-1 flex flex-col items-center pt-10 md:pt-16">
                {/* Header - Compact */}
                <div className="text-center mb-6 space-y-3 shrink-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        Our Flexible Plans
                    </h1>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="bg-slate-200 dark:bg-gray-800 p-1.5 rounded-full flex items-center relative">
                            <button
                                onClick={() => setBilling("monthly")}
                                className={`relative px-6 py-2 rounded-full text-xs font-medium transition-colors z-10 ${billing === "monthly" ? "text-white" : "text-slate-500 dark:text-gray-400"}`}
                            >
                                {billing === "monthly" && (
                                    <motion.div
                                        layoutId="billing-pill"
                                        className="absolute inset-0 bg-teal-500 rounded-full shadow-sm -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                Monthly
                            </button>
                            <button
                                onClick={() => setBilling("yearly")}
                                className={`relative px-6 py-2 rounded-full text-xs font-medium transition-colors z-10 flex items-center gap-2 ${billing === "yearly" ? "text-white" : "text-slate-500 dark:text-gray-400"}`}
                            >
                                {billing === "yearly" && (
                                    <motion.div
                                        layoutId="billing-pill"
                                        className="absolute inset-0 bg-teal-500 rounded-full shadow-sm -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                Yearly <span className={`text-[10px] font-bold ${billing === "yearly" ? "text-teal-100" : "text-emerald-600 dark:text-emerald-400"}`}>-40%</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cards Grid - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl w-full h-auto">
                    {plans.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        const isHovered = hoveredPlan === plan.id;
                        // Animation only on Hover as requested
                        const showBorder = isHovered;
                        const isActive = isSelected || isHovered;

                        return (
                            <motion.div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                onMouseEnter={() => setHoveredPlan(plan.id)}
                                onMouseLeave={() => setHoveredPlan(null)}
                                className={`relative group cursor-pointer rounded-[22px] transition-all duration-300 transform 
                                    ${isActive ? "bg-white dark:bg-gray-900 scale-[1.02]" : "bg-transparent border border-slate-200 dark:border-gray-800 hover:shadow-lg"}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Animated Border SVG (Hovered Only) */}
                                <div className={`absolute inset-0 rounded-[22px] pointer-events-none overflow-visible z-20 transition-opacity duration-300 ${showBorder ? "opacity-100" : "opacity-0"}`}>
                                    <svg className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id={`grad-${plan.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#2dd4bf" /> {/* teal-400 */}
                                                <stop offset="100%" stopColor="#10b981" /> {/* emerald-500 */}
                                            </linearGradient>
                                        </defs>
                                        <motion.rect
                                            x="0" y="0" width="100%" height="100%"
                                            rx="22" ry="22"
                                            fill="transparent"
                                            stroke={`url(#grad-${plan.id})`}
                                            strokeWidth="3"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: showBorder ? 1 : 0 }}
                                            transition={{ duration: 0.6, ease: "easeInOut" }}
                                        />
                                    </svg>
                                </div>

                                {/* Card Content */}
                                <div className={`relative h-full rounded-[20px] p-5 lg:p-6 flex flex-col overflow-hidden z-10 
                                    ${isActive ? "bg-white dark:bg-gray-900" : ""}`}>
                                    {/* Top Tag */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                        <span className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 text-xs font-mono py-1 px-3 rounded-full border border-slate-200 dark:border-gray-700">
                                            {plan.tokenTag}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-5 min-h-[40px] leading-relaxed">
                                        {plan.desc}
                                    </p>

                                    {/* Price */}
                                    <div className="mb-5">
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">${plan.price}</span>
                                            <span className="text-slate-400 dark:text-gray-500 line-through text-xs mb-1.5">${plan.prevPrice}</span>
                                            <span className="text-slate-400 dark:text-gray-500 mb-1.5 text-[10px]">/mo</span>
                                        </div>
                                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
                                            <span className="bg-slate-100 dark:bg-gray-800 text-teal-600 dark:text-teal-400 px-2 py-1 rounded">Bill yearly</span>
                                            <span className="bg-slate-100 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">30% off</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button className={`w-full py-3 rounded-full font-bold text-sm mb-5 transition-all duration-300 
                                        ${isSelected
                                            ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25"
                                            : "bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700"}`}
                                    >
                                        Subscribe
                                    </button>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-slate-100 dark:bg-gray-800 mb-5" />

                                    {/* Features */}
                                    <ul className="space-y-2.5 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2.5 text-sm">
                                                {feature.included ? (
                                                    <Check className="w-4 h-4 text-teal-500 shrink-0" />
                                                ) : (
                                                    <X className="w-4 h-4 text-slate-300 dark:text-gray-600 shrink-0" />
                                                )}
                                                <span className={feature.included ? "text-slate-700 dark:text-gray-300" : "text-slate-400 dark:text-gray-600"}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
