"use client";

import Link from "@/components/Link";
import {
    LayoutDashboard,
    Sparkles,
    Image,
    Wallet,
    Settings,
    Zap,
} from "lucide-react";

interface SidebarProps {
    activeNav?: string;
}

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate" },
    { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
    { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
];

export default function Sidebar({ activeNav = "dashboard" }: SidebarProps) {
    return (
        <aside className="w-56 h-full hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 z-30 shrink-0 shadow-sm">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 shrink-0">
                <Link href="/?view=landing" className="flex items-center gap-2.5">
                    <img src="/logo.png" alt="Visiora Logo" className="h-11 w-auto" />
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">Visiora</h1>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-hidden">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeNav === item.id
                            ? "bg-teal-50/50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-l-4 border-teal-500 shadow-sm"
                            : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400"
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeNav === item.id ? "text-teal-600 dark:text-teal-400" : "group-hover:text-teal-600 dark:group-hover:text-teal-400"}`} />
                        <span className={`text-sm ${activeNav === item.id ? "font-semibold" : "font-medium"}`}>{item.label}</span>
                    </Link>
                ))}
                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-gray-700">
                    <Link
                        href="/settings"
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeNav === "settings"
                            ? "bg-teal-50/50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-l-4 border-teal-500 shadow-sm"
                            : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-teal-600 dark:hover:text-teal-400"
                            }`}
                    >
                        <Settings className={`w-5 h-5 ${activeNav === "settings" ? "text-teal-600 dark:text-teal-400" : "group-hover:text-teal-600 dark:group-hover:text-teal-400"}`} />
                        <span className={`text-sm ${activeNav === "settings" ? "font-semibold" : "font-medium"}`}>Settings</span>
                    </Link>
                </div>
            </nav>

            {/* New Generation Button */}
            <div className="p-3 border-t border-slate-200 dark:border-gray-700">
                <Link
                    href="/generate"
                    className="w-full flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold shadow-md shadow-teal-500/20 transition-all"
                >
                    <Zap className="w-4 h-4" />
                    <span>New Generation</span>
                </Link>
            </div>
        </aside>
    );
}
