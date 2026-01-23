"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme";

export default function Branding({ className = "" }: { className?: string }) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
            <img src="/logo.png" alt="Visiora Logo" className="h-12 w-auto" />
            <h2 className={`text-lg font-bold tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"
                }`}>Visiora</h2>
        </Link>
    );
}
