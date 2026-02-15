"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme";

export default function Branding({ className = "" }: { className?: string }) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
            <img src={isDarkMode ? "/logo-dark.svg" : "/logo-new.svg"} alt="ephotocart Logo" className="h-12 w-auto" />

        </Link>
    );
}
