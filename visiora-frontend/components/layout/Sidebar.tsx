"use client";

import Link from "@/components/Link";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    Zap,
    Pin,
    PinOff,
    Wand2,
    LogOut,
} from "lucide-react";
import { useThemeLogo } from "@/hooks/useThemeLogo";
import logo from "@/public/Gemini_Generated_Image_8r5e1l8r5e1l8r5e_1.png";
import { useSidebar } from "./SidebarContext";
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
    activeNav?: string;
}

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate" },
    { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
    { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
    { id: "creative-builder", label: "Ads Creative Builder", icon: Wand2, href: "/creative-builder" },
];

export default function Sidebar({ activeNav = "dashboard" }: SidebarProps) {
    const { isOpen, isPinned, togglePin, handleMouseEnter, handleMouseLeave } = useSidebar();
    const { theme } = useTheme();
    const themeLogoSrc = useThemeLogo(logo.src);

    return (
        <motion.aside
            className="h-full hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 z-30 shrink-0 shadow-sm relative overflow-hidden"
            initial={false}
            animate={{ width: isOpen ? 256 : 72 }} // 64px (w-16) + 8px padding/borders = ~72px, checking visual balance
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center shrink-0 pl-3.5 relative">
                <Link href="/?view=landing" className="flex items-center gap-3 overflow-hidden">
                    <img
                        src={themeLogoSrc}
                        alt="Visiora Logo"
                        className="h-10 w-10 shrink-0 object-contain"
                    />
                    <motion.span
                        initial={false}
                        animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 whitespace-nowrap absolute left-16"
                    >
                        ephotocart
                    </motion.span>
                </Link>
            </div>

            {/* Pin Toggle Button - Only visible when hovered/expanded */}
            {isOpen && (
                <button
                    onClick={togglePin}
                    className="absolute top-5 right-3 p-1 text-slate-400 hover:text-teal-500 transition-colors"
                    title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
                >
                    {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-hidden">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap overflow-hidden ${activeNav === item.id
                            ? "bg-teal-50/50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-l-4 border-teal-500 shadow-sm"
                            : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400"
                            }`}
                        title={!isOpen ? item.label : undefined}
                    >
                        <item.icon className={`w-5 h-5 shrink-0 ${activeNav === item.id ? "text-teal-600 dark:text-teal-400" : "group-hover:text-teal-600 dark:group-hover:text-teal-400"}`} />
                        <motion.span
                            className={`text-sm ${activeNav === item.id ? "font-semibold" : "font-medium"}`}
                            initial={false}
                            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isOpen && item.label}
                        </motion.span>
                    </Link>
                ))}

                {/* Separator */}
                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-gray-700">
                    <Link
                        href="/settings"
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 whitespace-nowrap overflow-hidden ${activeNav === "settings"
                            ? "bg-teal-50/50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-l-4 border-teal-500 shadow-sm"
                            : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400"
                            }`}
                        title={!isOpen ? "Settings" : undefined}
                    >
                        <Settings className={`w-5 h-5 shrink-0 ${activeNav === "settings" ? "text-teal-600 dark:text-teal-400" : "group-hover:text-teal-600 dark:group-hover:text-teal-400"}`} />
                        <motion.span
                            className={`text-sm ${activeNav === "settings" ? "font-semibold" : "font-medium"}`}
                            initial={false}
                            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isOpen && "Settings"}
                        </motion.span>
                    </Link>
                </div>
            </nav>

            {/* New Generation Button */}
            <div className={`mt-auto transition-all duration-300 ${isOpen ? 'px-5 py-4' : 'p-4'}`}>
                <Link
                    href="/generate"
                    className={`group relative w-full flex items-center justify-center rounded-xl h-10 text-white text-sm font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 overflow-hidden border-t border-white/20 ${isOpen ? 'gap-2 px-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600' : 'gap-0 px-0 aspect-square bg-teal-500'}`}
                    title={!isOpen ? "New Generation" : undefined}
                >
                    {/* Liquid Glass Shine */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

                    {/* Dynamic Reflection */}
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer" />

                    <Zap className={`w-4 h-4 shrink-0 fill-current text-white/90 ${isOpen ? 'mr-0.5' : ''}`} />
                    <motion.span
                        initial={false}
                        animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap relative z-10"
                    >
                        {isOpen && "New Generation"}
                    </motion.span>
                </Link>
            </div>
        </motion.aside>
    );
}
