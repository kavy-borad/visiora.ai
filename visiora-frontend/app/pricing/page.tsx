"use client";

import Link from "@/components/Link";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { PublicNavbar } from "@/components/layout";

export default function PricingPage() {
    const plans = [
        {
            id: "free",
            name: "Free",
            price: "$0",
            period: "/mo",
            description: "Perfect for trying out",
            features: [
                "10 free credits/month",
                "Basic generation",
                "1024×1024 resolution",
                "Community support",
            ],
            cta: "Get Started",
            href: "/register",
            popular: false,
            icon: Zap,
            iconBg: "bg-slate-100",
            iconColor: "text-slate-600",
        },
        {
            id: "pro",
            name: "Pro",
            price: "$29",
            period: "/mo",
            description: "For professionals",
            features: [
                "500 credits/month",
                "Advanced AI models",
                "4K resolution",
                "Priority queue",
                "No watermarks",
            ],
            cta: "Start Trial",
            href: "/register?plan=pro",
            popular: true,
            icon: Sparkles,
            iconBg: "bg-teal-100",
            iconColor: "text-teal-600",
        },
        {
            id: "enterprise",
            name: "Enterprise",
            price: "Custom",
            period: "",
            description: "For large teams",
            features: [
                "Unlimited credits",
                "Custom AI training",
                "8K resolution",
                "Dedicated manager",
                "24/7 support",
            ],
            cta: "Contact Sales",
            href: "/contact",
            popular: false,
            icon: Crown,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
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

            <div className="min-h-screen lg:h-screen w-screen lg:overflow-hidden overflow-x-hidden bg-gradient-to-br from-teal-50/50 via-slate-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-slate-900 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
                {/* Reusable Public Navbar */}
                <PublicNavbar activePage="pricing" />

                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-start lg:justify-center overflow-y-auto lg:overflow-hidden px-4 sm:px-6 py-6 lg:py-4">
                    {/* Header Section */}
                    <div className="shrink-0 text-center max-w-3xl mx-auto mb-4 lg:mb-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-teal-100 dark:border-gray-700 mb-2 shadow-sm">
                            <Sparkles className="w-3 h-3 text-teal-500" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Pricing</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
                            Choose Your Plan
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                            Start free and scale as you grow. No hidden fees.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full lg:flex-1 lg:min-h-0">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`group relative flex flex-col p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all duration-300 cursor-pointer
                                    hover:shadow-xl hover:shadow-teal-500/15 hover:-translate-y-1 hover:border-teal-300 dark:hover:border-teal-600 hover:scale-[1.02]
                                    ${plan.popular
                                        ? "border-teal-300 dark:border-teal-600 shadow-lg shadow-teal-500/20 sm:col-span-2 lg:col-span-1"
                                        : "border-slate-200 dark:border-gray-700 shadow-sm"
                                    }`}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                        <span className="px-2.5 py-0.5 bg-teal-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                                            Popular
                                        </span>
                                    </div>
                                )}

                                {/* Icon & Plan Name Row */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`inline-flex size-9 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${plan.iconBg} dark:bg-opacity-30 ${plan.iconColor}`}>
                                        <plan.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-teal-600 dark:group-hover:text-teal-400">{plan.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">{plan.description}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-0.5 mb-3 pb-3 border-b border-slate-100 dark:border-gray-700">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                                    <span className="text-slate-400 dark:text-gray-500 text-xs">{plan.period}</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-1.5 mb-3 flex-1">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-1.5">
                                            <Check className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                            <span className="text-xs text-slate-600 dark:text-gray-400">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Link
                                    href={plan.href}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg font-bold text-xs transition-all ${plan.popular
                                        ? "bg-teal-500 text-white hover:bg-teal-600 shadow-sm"
                                        : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    {plan.cta}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="shrink-0 mt-4 lg:mt-3 text-center">
                        <p className="text-xs text-slate-400 dark:text-gray-500">
                            Questions?{" "}
                            <Link href="/contact" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                                Contact us
                            </Link>
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="shrink-0 border-t border-slate-200/60 dark:border-gray-700 bg-slate-50/80 dark:bg-gray-800/80 py-2 px-4 transition-colors duration-300">
                    <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
                        <p className="text-slate-400 dark:text-gray-500 text-[10px]">© 2024 Visiora Inc.</p>
                        <div className="flex gap-3">
                            <Link href="#" className="text-slate-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 text-[10px] transition-colors">Privacy</Link>
                            <Link href="#" className="text-slate-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 text-[10px] transition-colors">Terms</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
