"use client";

import React, { createContext, useContext, useState, useRef } from 'react';
import { Sidebar, Header } from '@/components/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/lib/WalletContext';
import { Check } from 'lucide-react';

// --- Types ---
export type Step = 'UPLOAD' | 'GOALS' | 'EDITOR' | 'EXPORT';

export interface CreativeBuilderContextType {
    currentStep: Step;
    setCurrentStep: (step: Step) => void;
    uploadedImage: string | null;
    setUploadedImage: (img: string | null) => void;
    offer: string;
    setOffer: (val: string) => void;
    price: string;
    setPrice: (val: string) => void;
    offerPrice: string;
    setOfferPrice: (val: string) => void;
    selectedPlatform: string;
    setSelectedPlatform: (id: string) => void;
    showUploadError: boolean;
    setShowUploadError: (val: boolean) => void;
    demoState: {
        urlConnected: boolean;
        brandAssetsConnected: boolean;
        productNameAdded: boolean;
    };
    setDemoState: (val: any | ((prev: any) => any)) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    selectedConcept: any;
    setSelectedConcept: (concept: any) => void;
    showCaptionModal: boolean;
    setShowCaptionModal: (val: boolean) => void;
    balance: number;
    freeCredits: number;
}

// --- Context ---
const CreativeBuilderContext = createContext<CreativeBuilderContextType | null>(null);

export const useCreativeBuilder = () => {
    const context = useContext(CreativeBuilderContext);
    if (!context) {
        throw new Error('useCreativeBuilder must be used within CreativeBuilderLayout');
    }
    return context;
};

// --- Mock Data ---
const DEFAULT_CONCEPT = {
    id: 1,
    headline: 'Elevate Your Style',
    cta: 'Shop Now',
    score: 98,
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
};

// --- Layout Component ---
export default function CreativeBuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Derive current step from pathname
    const getCurrentStep = (): Step => {
        if (pathname?.includes('/goals')) return 'GOALS';
        if (pathname?.includes('/edit')) return 'EDITOR';
        if (pathname?.includes('/export')) return 'EXPORT';
        return 'UPLOAD';
    };

    const [currentStep, setCurrentStep] = useState<Step>(getCurrentStep());
    const [selectedPlatform, setSelectedPlatform] = useState('ig');
    const [offer, setOffer] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [selectedConcept, setSelectedConcept] = useState<any>(DEFAULT_CONCEPT);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use global wallet context - dynamic values from API
    const { freeCredits, balance } = useWallet();

    // Validation & Demo State
    const [showUploadError, setShowUploadError] = useState(false);
    const [demoState, setDemoState] = useState({
        urlConnected: false,
        brandAssetsConnected: false,
        productNameAdded: false,
    });

    // Caption Modal State
    const [showCaptionModal, setShowCaptionModal] = useState(false);

    // Sync step with pathname for correct headers/progress
    React.useEffect(() => {
        setCurrentStep(getCurrentStep());
    }, [pathname]);

    const contextValue: CreativeBuilderContextType = {
        currentStep,
        setCurrentStep, // Still exposed but primary updates via effect
        uploadedImage,
        setUploadedImage,
        offer,
        setOffer,
        price,
        setPrice,
        offerPrice,
        setOfferPrice,
        selectedPlatform,
        setSelectedPlatform,
        showUploadError,
        setShowUploadError,
        demoState,
        setDemoState,
        fileInputRef,
        selectedConcept,
        setSelectedConcept,
        showCaptionModal,
        setShowCaptionModal,
        balance,
        freeCredits,
    };

    const steps: { label: string; key: Step }[] = [
        { label: 'Upload', key: 'UPLOAD' },
        { label: 'Goals', key: 'GOALS' },
        { label: 'Edit', key: 'EDITOR' },
        // { label: 'Export', key: 'EXPORT' },
    ];

    const stepIndex = steps.findIndex(s => s.key === currentStep);

    return (
        <CreativeBuilderContext.Provider value={contextValue}>
            <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
                <Sidebar activeNav="creative-builder" />
                <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    <Header
                        breadcrumbs={[{ label: "Home", href: "/?view=landing" }, { label: "Ads Creative Builder" }]}
                        freeCredits={freeCredits}
                        balance={balance}
                    />

                    {/* Header & Progress Bar - Global */}
                    <div className="px-8 pt-6 pb-4 shrink-0 space-y-5">
                        <div className="max-w-5xl text-left space-y-1">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                Create <span className="text-teal-500">High-Performing</span> AI Ads
                            </h1>
                            <p className="text-slate-500 dark:text-gray-400 text-lg">
                                Upload your product image and let our AI generate market-ready creative concepts in seconds.
                            </p>
                        </div>

                        {/* Progress Bar - New Style */}
                        <div className="mb-3 sm:mb-4 shrink-0">
                            <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
                                {/* Background line */}
                                <div className="absolute top-5 left-[16.67%] right-[16.67%] h-[2px] bg-slate-200 dark:bg-gray-800"></div>
                                {/* Active line */}
                                <motion.div
                                    className="absolute top-5 left-[16.67%] h-[2px] bg-teal-500 transition-all duration-500"
                                    animate={{ width: `${stepIndex * 33.33}%` }}
                                />

                                <div className="grid grid-cols-3">
                                    {steps.map((step, i) => {
                                        const isActive = currentStep === step.key;
                                        const isCompleted = stepIndex > i;
                                        return (
                                            <div key={step.label} className="flex flex-col items-center cursor-pointer group relative">
                                                <div className={`z-10 size-10 rounded-full flex items-center justify-center font-bold transition-transform duration-300 ${isCompleted ? 'bg-teal-500 text-white' : isActive ? 'bg-teal-500 text-white ring-4 ring-teal-500/20' : 'bg-white dark:bg-gray-800 border-2 border-slate-300 dark:border-gray-600 text-slate-500 dark:text-gray-400'}`}>
                                                    {isCompleted ? <Check className="w-5 h-5" /> : (i + 1)}
                                                </div>
                                                <span className={`mt-2 text-[10px] font-black tracking-widest uppercase transition-colors duration-300 ${isCompleted || isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-gray-500'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className={`flex-1 flex flex-col overflow-x-hidden ${currentStep === 'UPLOAD' ? 'overflow-hidden p-4 sm:p-6' : 'overflow-y-auto px-6 pb-6 pt-0 sm:px-8 sm:pb-8 sm:pt-0'} scrollbar-hide`}>
                        <AnimatePresence mode="wait">
                            {children}
                        </AnimatePresence>
                    </div>
                </main>

                <style jsx global>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                        20%, 40%, 60%, 80% { transform: translateX(4px); }
                    }
                `}</style>
            </div>
        </CreativeBuilderContext.Provider>
    );
}
