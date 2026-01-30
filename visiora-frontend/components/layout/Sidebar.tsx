"use client";

import Link from "@/components/Link";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    Zap,
    PanelLeftClose,
    PanelLeftOpen,
    Wand2,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
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
            <div className={`h-16 flex items-center shrink-0 transition-all duration-300 ${isOpen ? 'px-6' : 'px-0 justify-center'}`}>
                <Link href="/?view=landing" className="flex items-center gap-2.5 overflow-hidden">
                    <img src="/logo.png" alt="Visiora Logo" className="h-10 w-auto shrink-0" />
                    <motion.div
                        className="flex flex-col whitespace-nowrap"
                        initial={false}
                        animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen && (
                            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none ml-1">Visiora</h1>
                        )}
                    </motion.div>
                </Link>
            </div>

            {/* Pin Toggle Button - Only visible when hovered/expanded */}
            {isOpen && (
                <button
                    onClick={togglePin}
                    className="absolute top-5 right-3 p-1 text-slate-400 hover:text-teal-500 transition-colors opacity-0 hover:opacity-100 lg:group-hover:opacity-100"
                    title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
                >
                    {isPinned ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
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
            <div className="p-3">
                <Link
                    href="/generate"
                    className={`w-full flex items-center justify-center gap-2 rounded-lg h-9 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold shadow-md shadow-teal-500/20 transition-all overflow-hidden ${isOpen ? 'px-4' : 'px-0 aspect-square'}`}
                    title={!isOpen ? "New Generation" : undefined}
                >
                    <Zap className="w-4 h-4 shrink-0" />
                    <motion.span
                        initial={false}
                        animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                    >
                        {isOpen && "New Generation"}
                    </motion.span>
                </Link>
            </div>
        </motion.aside>
    );
}
