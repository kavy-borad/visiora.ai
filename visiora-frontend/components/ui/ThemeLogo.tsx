import React from 'react';

interface ThemeLogoProps {
    className?: string;
}

export default function ThemeLogo({ className = "w-10 h-10" }: ThemeLogoProps) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Left Segment - Dark Slate (was Dark Blue) */}
            <path d="M50 50 L10 50 A40 40 0 0 1 30 15 L50 50" fill="#1e293b" />
            <path d="M10 50 A40 40 0 0 0 30 85 L50 50" fill="#1e293b" />

            {/* Right Top Segment - Primary Teal (was Green) */}
            <path d="M50 50 L30 15 A40 40 0 0 1 85 30 L50 50" fill="#14b8a6" />

            {/* Right Bottom Segment - Light Teal (was Light Blue) */}
            <path d="M50 50 L85 30 A40 40 0 0 1 70 85 L50 50" fill="#5eead4" />
            <path d="M50 50 L70 85 A40 40 0 0 1 30 85 L50 50" fill="#5eead4" />

            {/* Flying Pixels - Mixed Teal/Slate */}
            <rect x="75" y="10" width="8" height="8" rx="1" fill="#14b8a6" fillOpacity="0.8" />
            <rect x="85" y="20" width="6" height="6" rx="1" fill="#1e293b" fillOpacity="0.6" />
            <rect x="65" y="5" width="5" height="5" rx="1" fill="#5eead4" fillOpacity="0.9" />

            {/* Center negative space is implied by the convergence */}
        </svg>
    );
}
