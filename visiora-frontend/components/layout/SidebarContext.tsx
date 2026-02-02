"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isOpen: boolean;
    isHovered: boolean;
    isPinned: boolean;
    togglePin: () => void;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // Default to pinned (expanded) on mount
    const [isPinned, setIsPinned] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Auto-collapse on mobile/tablet check could go here if needed
    // But CSS media queries handle most layout, logic here is for state

    const isOpen = isPinned || isHovered;

    const togglePin = () => setIsPinned(!isPinned);

    const handleMouseEnter = () => {
        // Only enable hover expand on desktop
        if (window.innerWidth >= 1024) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <SidebarContext.Provider
            value={{
                isOpen,
                isHovered,
                isPinned,
                togglePin,
                handleMouseEnter,
                handleMouseLeave,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
