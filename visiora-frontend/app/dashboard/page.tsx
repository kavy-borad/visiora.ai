"use client";

import { useState, useEffect } from "react";
import Link from "@/components/Link";
import { useRouter } from "@/components/useRouter";
import {
    LayoutDashboard,
    Image,
    Wallet,
    Settings,
    Bell,
    ChevronRight,
    ChevronDown,
    TrendingUp,
    TrendingDown,
    Zap,
    Sparkles,
    Plus,
    Eye,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { dashboardApi, DashboardStats, RecentImage, ChartDataPoint, UserProfile } from "@/lib/dashboard";
import { authApi } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout";

export default function DashboardPage() {
    const router = useRouter();
    const [activeNav, setActiveNav] = useState("dashboard");

    // Loading and error states (not blocking - show fallback data)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Data states
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentImages, setRecentImages] = useState<RecentImage[]>([]);
    const [imageChartData, setImageChartData] = useState<ChartDataPoint[]>([]);
    const [spendingChartData, setSpendingChartData] = useState<ChartDataPoint[]>([]);

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate" },
        { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
        { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
    ];

    // Fetch dashboard data on mount (optional - uses fallback data if fails)
    useEffect(() => {
        // First, get user from localStorage (stored during login)
        const storedUser = authApi.getCurrentUser();
        if (storedUser) {
            setUserProfile({
                id: storedUser.id,
                fullName: storedUser.fullName,
                email: storedUser.email,
                balance: 0,
                freeCredits: 1,
            });
        }

        // Then try to fetch dashboard data in background (non-blocking)
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // First try dashboard overview endpoint
            let dashboardRes = await dashboardApi.getOverview();  // GET /api/dashboard/overview

            // If overview fails, try main dashboard endpoint
            if (!dashboardRes.success) {
                dashboardRes = await dashboardApi.getDashboardData();  // GET /api/dashboard
            }

            if (dashboardRes.success && dashboardRes.data) {
                // If dashboard API returns all data, use it
                if (dashboardRes.data.stats) setStats(dashboardRes.data.stats);
                if (dashboardRes.data.recentImages) setRecentImages(dashboardRes.data.recentImages);
                if (dashboardRes.data.imageGenerationChart) setImageChartData(dashboardRes.data.imageGenerationChart);
                if (dashboardRes.data.spendingChart) setSpendingChartData(dashboardRes.data.spendingChart);
            } else {
                // Try to get all charts at once first
                const chartsRes = await dashboardApi.getCharts();  // GET /api/dashboard/charts

                if (chartsRes.success && chartsRes.data) {
                    if (chartsRes.data.imageGeneration) setImageChartData(chartsRes.data.imageGeneration);
                    if (chartsRes.data.spending) setSpendingChartData(chartsRes.data.spending);
                }

                // Fetch remaining data in parallel
                const [profileRes, statsRes] = await Promise.all([
                    dashboardApi.getUserProfile(),
                    dashboardApi.getStats(),
                ]);

                if (profileRes.success && profileRes.data) {
                    setUserProfile(profileRes.data);
                }
                if (statsRes.success && statsRes.data) {
                    setStats(statsRes.data);
                }

                // Try getRecent first, fallback to getRecentImages
                const recentRes = await dashboardApi.getRecent();  // GET /api/dashboard/recent
                if (recentRes.success && recentRes.data) {
                    setRecentImages(recentRes.data);
                } else {
                    const imagesRes = await dashboardApi.getRecentImages(5);
                    if (imagesRes.success && imagesRes.data) {
                        setRecentImages(imagesRes.data);
                    }
                }

                // If charts weren't loaded, try individual endpoints
                if (!chartsRes.success) {
                    // Try daily generation chart first, then fallback to image-generation
                    const dailyGenRes = await dashboardApi.getDailyGenerationChart();  // GET /api/dashboard/charts/daily-generation

                    if (dailyGenRes.success && dailyGenRes.data) {
                        setImageChartData(dailyGenRes.data);
                    } else {
                        const imageChartRes = await dashboardApi.getImageGenerationChart(7);
                        if (imageChartRes.success && imageChartRes.data) {
                            setImageChartData(imageChartRes.data);
                        }
                    }

                    // Try daily spending chart first, then fallback to spending
                    const dailySpendingRes = await dashboardApi.getDailySpendingChart();  // GET /api/dashboard/charts/daily-spending

                    if (dailySpendingRes.success && dailySpendingRes.data) {
                        setSpendingChartData(dailySpendingRes.data);
                    } else {
                        const spendingChartRes = await dashboardApi.getSpendingChart(7);
                        if (spendingChartRes.success && spendingChartRes.data) {
                            setSpendingChartData(spendingChartRes.data);
                        }
                    }
                }
            }
        } catch (err) {
            // Silently fail - dashboard will show with fallback data
            console.warn('Dashboard API fetch failed, using fallback data:', err);
        }
    };

    // Build stats cards from API data or fallback
    const statsCards = stats ? [
        {
            label: "Total Images",
            value: stats.totalImages.toLocaleString(),
            trend: stats.imageTrend >= 0 ? `+${stats.imageTrend}%` : `${stats.imageTrend}%`,
            trendUp: stats.imageTrend >= 0,
            progress: Math.min((stats.totalImages / 2000) * 100, 100),
            color: "bg-teal-500"
        },
        {
            label: "Free Credits",
            value: stats.freeCredits.toString(),
            subValue: `/ ${stats.maxFreeCredits}`,
            icon: Zap,
            progress: (stats.freeCredits / stats.maxFreeCredits) * 100,
            color: "bg-blue-500"
        },
        {
            label: "Total Spent",
            value: `$${stats.totalSpent}`,
            trend: stats.spendingTrend >= 0 ? `+${stats.spendingTrend}%` : `${stats.spendingTrend}%`,
            trendUp: stats.spendingTrend < 0, // Down spending is good
            progress: Math.min((stats.totalSpent / 1000) * 100, 100),
            color: "bg-indigo-500"
        },
        {
            label: "Favorite Style",
            value: stats.favoriteStyle || "N/A",
            subText: stats.favoriteStyleUsage ? `Used ${stats.favoriteStyleUsage}% of time` : undefined,
            icon: Sparkles
        },
    ] : [
        { label: "Total Images", value: "---", trend: "---", trendUp: true, progress: 0, color: "bg-teal-500" },
        { label: "Free Credits", value: "---", subValue: "/ --", icon: Zap, progress: 0, color: "bg-blue-500" },
        { label: "Total Spent", value: "$---", trend: "---", trendUp: false, progress: 0, color: "bg-indigo-500" },
        { label: "Favorite Style", value: "---", subText: "Loading...", icon: Sparkles },
    ];

    // Chart data from API or fallback
    const chartData = spendingChartData.length > 0
        ? spendingChartData.map(d => d.value)
        : [40, 65, 30, 85, 55, 20, 15];
    const chartDays = spendingChartData.length > 0
        ? spendingChartData.map(d => d.day.charAt(0).toUpperCase())
        : ["M", "T", "W", "T", "F", "S", "S"];

    // Line chart data from API or fallback
    const lineChartPoints = imageChartData.length > 0
        ? imageChartData.map(d => d.value)
        : [20, 40, 25, 70, 45, 80, 55];
    const lineChartDays = imageChartData.length > 0
        ? imageChartData.map(d => d.day)
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Recent images from API or fallback
    const displayImages = recentImages.length > 0
        ? recentImages.map(img => img.url)
        : [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1634017839464-5c339bbe3c35?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?w=200&h=200&fit=crop",
            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200&h=200&fit=crop",
        ];

    // User info from API or fallback
    const userName = userProfile?.fullName?.split(' ')[0] || 'Jane';
    const userInitial = userName.charAt(0).toUpperCase();
    const userBalance = userProfile?.balance ?? 12.00;
    const userFreeCredits = userProfile?.freeCredits ?? 1;

    return (
        <div className="min-h-screen flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Reusable Sidebar */}
            <Sidebar activeNav="dashboard" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-full overflow-x-hidden lg:overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Reusable Header with dynamic breadcrumbs */}
                <Header
                    breadcrumbs={[
                        { label: "Home", href: "/?view=landing" },
                        { label: "Dashboard" }
                    ]}
                    freeCredits={userFreeCredits}
                    balance={userBalance}
                />

                {/* Content - Scrollable on mobile/tablet, fixed on desktop */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto lg:overflow-hidden">
                    <div className="flex flex-col gap-3 sm:gap-4 lg:h-full">
                        {/* Page Header */}
                        <div className="flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Overview</h2>
                                <p className="text-slate-500 dark:text-gray-400 text-xs">Welcome back, {userName}. Here's what's happening today.</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 shrink-0">
                            {statsCards.map((card, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col gap-2 hover:border-slate-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-slate-500 dark:text-gray-400">{card.label}</span>
                                        {card.trend && (
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${card.trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                                                {card.trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                                {card.trend}
                                            </span>
                                        )}
                                        {card.icon && <card.icon className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-slate-800 dark:text-white">{card.value}</span>
                                        {card.subValue && <span className="text-xs text-slate-500 dark:text-gray-400">{card.subValue}</span>}
                                    </div>
                                    {card.subText && <span className="text-[10px] text-slate-500 dark:text-gray-400">{card.subText}</span>}
                                    {card.progress && (
                                        <div className="w-full bg-slate-100 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                                            <div className={`${card.color} h-full rounded-full`} style={{ width: `${card.progress}%` }} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:flex-1 lg:min-h-0">
                            {/* Area Chart */}
                            <div className="opacity-0 animate-fade-in bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col h-[160px] sm:h-[180px] lg:h-auto hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daily Image Generation</h3>
                                    <select className="text-[10px] border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-teal-500">
                                        <option>Last 7 Days</option>
                                    </select>
                                </div>
                                <div className="flex-1 relative min-h-0">
                                    {/* Y-axis labels */}
                                    <div className="absolute left-0 top-0 bottom-4 w-6 flex flex-col justify-between text-[9px] text-slate-400 pr-1">
                                        <span>100</span>
                                        <span>50</span>
                                        <span>0</span>
                                    </div>
                                    {/* Chart area */}
                                    <div className="ml-7 h-full flex flex-col">
                                        <div className="flex-1 relative">
                                            {/* Minimal grid lines */}
                                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                                {[0, 1, 2].map((i) => (
                                                    <div key={i} className="border-t border-slate-100/80 w-full" />
                                                ))}
                                            </div>
                                            {/* SVG Area Chart with smooth curves */}
                                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                                                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Area fill with smooth curve */}
                                                <path
                                                    d="M0,80 C8,70 12,62 16.67,60 C22,57 28,72 33.33,75 C40,78 45,35 50,30 C55,25 60,50 66.67,55 C72,58 78,22 83.33,20 C90,17 95,40 100,45 L100,100 L0,100 Z"
                                                    fill="url(#areaGradient)"
                                                    className="opacity-0 animate-fade-in-delay"
                                                />
                                                {/* Smooth line */}
                                                <path
                                                    d="M0,80 C8,70 12,62 16.67,60 C22,57 28,72 33.33,75 C40,78 45,35 50,30 C55,25 60,50 66.67,55 C72,58 78,22 83.33,20 C90,17 95,40 100,45"
                                                    fill="none"
                                                    stroke="#14b8a6"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    vectorEffect="non-scaling-stroke"
                                                    strokeDasharray="1000"
                                                    className="animate-draw-line"
                                                />
                                            </svg>
                                            {/* Data points with hover effect */}
                                            <div className="absolute inset-0 flex justify-between items-stretch">
                                                {lineChartPoints.map((p, i) => (
                                                    <div key={i} className="flex-1 relative group">
                                                        <div
                                                            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-teal-500 shadow-sm group-hover:scale-125 group-hover:shadow-md transition-all cursor-pointer"
                                                            style={{ top: `${100 - p}%` }}
                                                        />
                                                        {/* Tooltip on hover */}
                                                        <div
                                                            className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-800 text-white text-[9px] font-medium px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap"
                                                            style={{ top: `${100 - p - 12}%` }}
                                                        >
                                                            {p} images
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* X-axis labels */}
                                        <div className="flex justify-between text-[9px] text-slate-400 pt-1 shrink-0">
                                            {lineChartDays.map((day, i) => (
                                                <span key={i}>{day}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bar Chart - Enhanced */}
                            <div className="opacity-0 animate-fade-in-delay bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col h-[160px] sm:h-[180px] lg:h-auto hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daily Spending</h3>
                                    <div className="flex items-center gap-3 text-[9px]">
                                        <div className="flex items-center gap-1">
                                            <div className="size-2 rounded-full bg-gradient-to-t from-teal-600 to-teal-400" />
                                            <span className="text-slate-500 dark:text-gray-400">Paid</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="size-2 rounded-full bg-gradient-to-t from-slate-300 to-slate-200" />
                                            <span className="text-slate-500 dark:text-gray-400">Free</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative min-h-0">
                                    {/* Y-axis labels */}
                                    <div className="absolute left-0 top-0 bottom-4 w-6 flex flex-col justify-between text-[9px] text-slate-400 pr-1">
                                        <span>$50</span>
                                        <span>$25</span>
                                        <span>$0</span>
                                    </div>
                                    {/* Chart area */}
                                    <div className="ml-7 h-full flex flex-col">
                                        <div className="flex-1 flex items-end justify-between gap-2">
                                            {chartData.map((height, i) => {
                                                const paidHeight = i >= 5 ? 0 : height * 0.7;
                                                const freeHeight = i >= 5 ? height : height * 0.3;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col justify-end h-full group cursor-pointer relative animate-grow-up origin-bottom" style={{ animationDelay: `${i * 0.1}s` }}>
                                                        {/* Stacked bar container */}
                                                        <div className="w-full flex flex-col justify-end" style={{ height: `${height}%` }}>
                                                            {/* Free segment (top) */}
                                                            <div
                                                                className="w-full rounded-t-md bg-gradient-to-t from-slate-300 to-slate-200 group-hover:from-slate-400 group-hover:to-slate-300 transition-all"
                                                                style={{ height: `${(freeHeight / height) * 100}%`, minHeight: freeHeight > 0 ? '2px' : 0 }}
                                                            />
                                                            {/* Paid segment (bottom) */}
                                                            {paidHeight > 0 && (
                                                                <div
                                                                    className="w-full bg-gradient-to-t from-teal-600 to-teal-400 group-hover:from-teal-700 group-hover:to-teal-500 transition-all shadow-sm"
                                                                    style={{ height: `${(paidHeight / height) * 100}%` }}
                                                                />
                                                            )}
                                                        </div>
                                                        {/* Hover tooltip */}
                                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-800 text-white text-[9px] font-medium px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap">
                                                            ${Math.round(height * 0.5)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* X-axis labels */}
                                        <div className="flex justify-between text-[9px] text-slate-400 pt-1 shrink-0">
                                            {chartDays.map((day, i) => (
                                                <span key={i} className="flex-1 text-center">{day}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Generations - Compact */}
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-slate-200 dark:border-gray-700 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Generations</h3>
                                <Link href="/gallery" className="text-[10px] text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold flex items-center gap-0.5 uppercase">
                                    View All <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 2xl:grid-cols-10 gap-2 sm:gap-4">
                                {displayImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded bg-cover bg-center border border-slate-200 hover:border-teal-500 transition-all cursor-pointer group relative overflow-hidden"
                                        style={{ backgroundImage: `url('${img}')` }}
                                    >
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                ))}
                                <div className="aspect-square rounded bg-slate-50 dark:bg-gray-700 border border-dashed border-slate-300 dark:border-gray-600 flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-500 hover:bg-white dark:hover:bg-gray-600 transition-all cursor-pointer">
                                    <Plus className="w-4 h-4" />
                                    <span className="text-[8px] font-bold uppercase">New</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
