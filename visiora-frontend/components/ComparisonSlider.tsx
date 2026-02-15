"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, animate, AnimatePresence } from "framer-motion";
import { MoveHorizontal } from "lucide-react";

interface SlidePair {
    before: string;
    after: string;
}

interface ComparisonSliderProps {
    slides: SlidePair[];
    aspectRatio?: string;
    slideDuration?: number; // Time in ms per slide
    className?: string;
}

export default function ComparisonSlider({
    slides,
    aspectRatio = "3/4",
    slideDuration = 4000,
    className = "",
}: ComparisonSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasAnimatedRef = useRef(false);

    // Play "Filter Transition" Animation when slide changes
    useEffect(() => {
        if (isDragging) return;

        // Start with Full Before (at 0 position, Before is fully visible because we clip from 0)
        setSliderPosition(0);

        // Animate to Full After (at 100 position, Before is fully hidden/clipped)
        const controls = animate(0, 100, {
            duration: 2.5,
            ease: "easeInOut",
            delay: 0.5, // Reduced delay for faster response
            onUpdate: (value) => {
                if (!isDragging) setSliderPosition(value);
            },
        });

        return () => controls.stop();
    }, [currentIndex, isDragging]);

    // Auto-Slide Logic (Switch Slides)
    useEffect(() => {
        if (slides.length <= 1 || isDragging) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, slideDuration);

        return () => clearInterval(interval);
    }, [slides.length, slideDuration, isDragging]);

    const handleMove = useCallback(
        (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            let clientX;

            if ("touches" in event) {
                clientX = event.touches[0].clientX;
            } else {
                clientX = (event as MouseEvent).clientX;
            }

            // Calculate position relative to container
            let pos = ((clientX - containerRect.left) / containerRect.width) * 100;

            // Clamp between 0 and 100
            pos = Math.max(0, Math.min(100, pos));

            setSliderPosition(pos);
        },
        [isDragging]
    );

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    // Add global event listeners for drag
    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleMove);
            window.addEventListener("touchend", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleMouseUp);
        };
    }, [isDragging, handleMove]);

    // Current active images
    const currentSlide = slides[currentIndex];

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden rounded-2xl select-none cursor-ew-resize group shadow-2xl shadow-emerald-900/10 bg-white dark:bg-slate-900 ${className}`}
            style={{ aspectRatio }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* After Image (Background - Full Width) */}
                    <div className="absolute inset-0 w-full h-full p-6">
                        <Image
                            src={currentSlide.after}
                            alt="After"
                            fill
                            className="object-contain object-center"
                            priority
                        />
                        {/* Before Image (Foreground - Clipped) */}
                        <div
                            className="absolute inset-0 w-full h-full"
                            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                        >
                            <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 p-6">
                                <Image
                                    src={currentSlide.before}
                                    alt="Before"
                                    fill
                                    className="object-contain object-center"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Comparison Badge - Dynamic Single Label */}
                        <div className="absolute top-4 right-4 z-30 pointer-events-none">
                            <div className="bg-black/60 backdrop-blur-md text-white/90 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border border-white/10 shadow-lg transition-all duration-300">
                                {sliderPosition < 50 ? "Original" : "AI Generated"}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform">
                    <MoveHorizontal className="w-4 h-4 text-emerald-600" />
                </div>
            </div>

            {/* Interaction Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-full pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}
            >
                Drag to compare
            </motion.div>
        </div>
    );
}
