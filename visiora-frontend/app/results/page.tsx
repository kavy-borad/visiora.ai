"use client";

import Link from "@/components/Link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { PublicNavbar } from "@/components/layout";

export default function ResultsPage() {
    const showcaseItems = [
        {
            id: 1,
            title: "Summer Collection",
            description: "Ghost mannequin to outdoor lifestyle",
            beforeImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBH5kRBNJ9JQZOLV5XEwykZeZnZ9g5h80W6twul-flcUTC7ditzGbp3UoCuCZjTbxLD-QVXVzycNeHq3YkApKBbO6fSs6IV35Fxe3-p77b5ACHeZc46isl_FcxjdDm4mxWjjDYoQch2FZ2q-jv6ocDAUmYVFVfGW1gYeQ8dVm1H_Jh7n7QSsQN4_pNE06i-imVcMiJOIZ_jT2DyH8yfTJAEU79I9Mz5-zwXVVHBLofO6L3wgg3POG7SGBxjuLR2OTtL5YOFby4GmPce",
            afterImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7KXB3UusSvLJLJgrHL4LwijzmhcjIJCWWFuy4g87ZkvQyvV6Cp6MyuHp25drIzyYBE4bC85St5xG0VJq8HlGUi_VwiF5ctCsBfgM_2l71xyS699_bBJrpbjxabnrDyLvv1D2I4hm5YE_lypYTpDECfUDwgylnH2m9OoSQa-UkrSpRsqvAVHwGzj8joUwdWie2VdGP4Gm0trEvVPdvt1-Vjzn50yWWwgj76yYjK_gXQD9FvKwfTMt_xuDUrFrmGFwIXDrRuSHvnu5E",
        },
        {
            id: 2,
            title: "Streetwear Line",
            description: "Flat-lay to urban model",
            beforeImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV_5ABGQgoI3JQSQxEgW_S0P3FAcvxW6Juk0roHVFaPoyoHR1y7WEvF3Eo-N10CMlqxuN_t-BRMIdSHxEhPp9DIXnXMeV5qUcXaPDtMCMzaVvfwPou5U2L2Oi1gS_0dcmY20TqfTKMj-CEGcMzHfvWaqiqUMM_ALs7b6eBNdJOktPLyAzvAy_XGxKn6K73QZuRpHK6fKFCk4FJ_jabvZR1ic9NRUNBKrifUnmseZk0e-ZOERycIDhc8gy4aYey3E-C4ATfVcp0fegD",
            afterImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKer10SZ7ysg6bIvUq28vvvqCajSoaQ7bpENZWrP92HYkilECdPPgZT-3V9kpH2Aa5iCmZ9WTrle6Pl8cXcZwbGQqmhKBSCeNBVhBIdOQ0awvA2pvpn-IxD1ZEa1lCtGKWNbiAdfWAIbwyPEdUXSo57bg4Ehz7udxueL9-dS6woSS9GDkpY_3Jrhjsot-XDEZ9IlrSnukHbeeAvXTYdAVDTby7ovxIbSGlvcVxgjUIt7anMLNkeOS3l6cvN1fCqX2m7HQ7dSLLmTxo",
        },
        {
            id: 3,
            title: "Formal Wear",
            description: "Mannequin to studio professional",
            beforeImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLD1EzTzFNhOwbH3x2nbhoF5LxK_aXvcqFTVOtz5mNaGi3DXUV83Ad41S075p4GppFLaJalmxN7zs1Lq7B534CxXvfs0iC_VtsosKI14yypR5db2z3_q5-p4qe1vtGy_0aXVIXOAMsBtGxAUVhKb8DxgLaN9vZc_oK9cYSrZfiQ8zpj5v8IPSdX6K4dPAm_YXF6gbafJnQZG69xtimr32qOzS-OmHBaTQhc6sWVGftMLZqpumtwzCGqhHEgU1pE4E8WmJVQH6aFgjq",
            afterImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1x5Whkfd1wJ7Z3W4x87W-I61sxMAEIGLZ2CRdOiP5dmd0tJMWdpk9LEXaGZOQKG4r1oTAD0enfYnT-E1UUYA8T7Gi_KwiqFZPoWqlbWi5i-xqqRaJD33G3iaXlLeh7JkZLC5PPqGYXeNGJLB4532ZD_7qDFahQpQ_VgfTinE7C2sSUsdrh__F4pUiO5NWFftFO2O6CMVTtx5XcxEy7RtKX2zQsp-CoFtEEeXq0eRHb168Z57OoZ1k7Z3TrUqnM0mxvazKl1KxS6ai",
        },
    ];

    return (
        <div className="min-h-screen lg:h-screen w-screen lg:overflow-hidden overflow-x-hidden bg-gradient-to-br from-teal-50/50 via-slate-50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-slate-900 dark:text-gray-100 antialiased flex flex-col transition-colors duration-300">
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
            <PublicNavbar activePage="results" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center overflow-y-auto lg:overflow-hidden">
                {/* Hero Section */}
                <div className="shrink-0 flex w-full flex-col items-center pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 md:px-10">
                    <div className="flex flex-col items-center max-w-[960px] text-center gap-2">
                        {/* Badge */}
                        <div className="flex items-center justify-center">
                            <div className="flex h-6 sm:h-7 shrink-0 items-center justify-center gap-x-1.5 sm:gap-x-2 rounded-full bg-white dark:bg-gray-800 border border-teal-100 dark:border-gray-700 px-2.5 sm:pl-3 sm:pr-3 shadow-sm">
                                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-500" />
                                <p className="text-slate-500 dark:text-gray-400 text-[9px] sm:text-[10px] font-bold tracking-wider leading-normal uppercase">See The Transformation</p>
                            </div>
                        </div>

                        {/* Headline */}
                        <div className="relative">
                            <h1 className="text-slate-900 dark:text-white tracking-tight text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.1]">
                                Actual Results
                            </h1>
                            <div className="h-0.5 w-12 sm:w-16 bg-teal-500 mx-auto rounded-full opacity-60 mt-1"></div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-xl">
                            Transform raw flat-lays and ghost mannequins into high-conversion lifestyle imagery.
                        </p>
                    </div>
                </div>

                {/* Showcase Cards Grid */}
                <div className="flex-1 flex flex-col max-w-[1280px] w-full px-4 md:px-6 lg:overflow-hidden lg:min-h-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:flex-1 lg:min-h-0">
                        {showcaseItems.map((item) => (
                            <div
                                key={item.id}
                                className={`group bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg border border-slate-100 dark:border-gray-700 transition-all duration-300 flex flex-col ${item.id === 1 ? "sm:col-span-2 lg:col-span-1" : ""
                                    }`}
                                style={{ minHeight: "200px" }}
                            >
                                {/* Before/After Labels */}
                                <div className="shrink-0 flex justify-between items-center mb-2 sm:mb-3 px-1">
                                    <div className="bg-red-50 text-red-700 text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full tracking-wide">BEFORE</div>
                                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                    <div className="bg-emerald-50 text-emerald-700 text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full tracking-wide">AFTER</div>
                                </div>

                                {/* Image Comparison */}
                                <div className="flex gap-2 flex-1 min-h-[120px] sm:min-h-[150px] lg:min-h-0">
                                    {/* Before Image */}
                                    <div className="flex-1 relative overflow-hidden rounded-lg bg-slate-50 dark:bg-gray-700">
                                        <div
                                            className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url('${item.beforeImage}')` }}
                                        />
                                    </div>

                                    {/* After Image */}
                                    <div className="flex-1 relative overflow-hidden rounded-lg bg-slate-50 dark:bg-gray-700">
                                        <div
                                            className="absolute inset-0 bg-center bg-cover transition-transform duration-700 group-hover:scale-105"
                                            style={{ backgroundImage: `url('${item.afterImage}')` }}
                                        />
                                        <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-white/90 backdrop-blur-sm p-0.5 sm:p-1 rounded-full shadow-sm">
                                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Info */}
                                <div className="shrink-0 mt-2 sm:mt-3 px-1">
                                    <h3 className="text-slate-900 dark:text-white text-xs sm:text-sm font-semibold">{item.title}</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="shrink-0 py-3 sm:py-4 flex justify-center">
                        <Link
                            href="/generate"
                            className="flex items-center gap-2 text-slate-800 dark:text-gray-200 font-bold text-xs bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all shadow-sm group"
                        >
                            <span>Try with your own photos</span>
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
