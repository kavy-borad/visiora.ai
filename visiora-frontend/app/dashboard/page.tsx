"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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

// Module-level flag to prevent duplicate API calls
let dashboardInitialFetchDone = false;

export default function DashboardPage() {
    const router = useRouter();
    const [activeNav, setActiveNav] = useState("dashboard");

    // Loading and error states (blocking - show loading state until data loads)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data states
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentImages, setRecentImages] = useState<RecentImage[]>([]);
    const [imageChartData, setImageChartData] = useState<ChartDataPoint[]>([]);
    const [spendingChartData, setSpendingChartData] = useState<ChartDataPoint[]>([]);
    const [styleAnalytics, setStyleAnalytics] = useState<any>(null); // State for style analytics
    const [typeAnalytics, setTypeAnalytics] = useState<any>(null); // State for type analytics

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { id: "generate", label: "Generate Image", icon: Sparkles, href: "/generate" },
        { id: "gallery", label: "My Gallery", icon: Image, href: "/gallery" },
        { id: "wallet", label: "Wallet", icon: Wallet, href: "/wallet" },
    ];

    // Load cached data from localStorage immediately on mount
    useEffect(() => {
        // Try to load cached dashboard data for instant display
        try {
            const cachedStats = localStorage.getItem('dashboard_stats_cache');
            const cachedProfile = localStorage.getItem('dashboard_profile_cache');
            const cachedCharts = localStorage.getItem('dashboard_charts_cache');
            const cachedRecent = localStorage.getItem('dashboard_recent_cache');

            if (cachedStats) {
                const parsed = JSON.parse(cachedStats);
                setStats(parsed);
            }
            if (cachedProfile) {
                setUserProfile(JSON.parse(cachedProfile));
            }
            if (cachedCharts) {
                const charts = JSON.parse(cachedCharts);
                if (charts.imageChartData) setImageChartData(charts.imageChartData);
                if (charts.spendingChartData) setSpendingChartData(charts.spendingChartData);
            }
            if (cachedRecent) {
                setRecentImages(JSON.parse(cachedRecent));
            }
        } catch (e) {
            console.warn('Failed to load cached dashboard data:', e);
        }
    }, []);

    // Fetch dashboard data on mount (optional - uses fallback data if fails)
    useEffect(() => {
        // Skip if already fetched (module-level check)
        if (dashboardInitialFetchDone) {
            console.log('⏭️ Dashboard: Already fetched, skipping');
            setIsLoading(false);
            return;
        }

        dashboardInitialFetchDone = true;
        console.log('🚀 Dashboard: Initial fetch starting...');

        // First, get user from localStorage (stored during login)
        const storedUser = authApi.getCurrentUser();
        if (storedUser) {
            const profile = {
                id: storedUser.id,
                fullName: storedUser.fullName,
                email: storedUser.email,
                balance: 0,
                freeCredits: 0,
            };
            setUserProfile(profile);
            // Cache profile
            localStorage.setItem('dashboard_profile_cache', JSON.stringify(profile));
        }

        // Then try to fetch dashboard data in background (non-blocking)
        fetchDashboardData();

        // Reset on unmount (for page navigation scenarios)
        return () => {
            setTimeout(() => {
                dashboardInitialFetchDone = false;
            }, 100);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Call ALL dashboard endpoints for complete integration
            const [
                dashboardRes,
                recentRes,
                activityRes,
                chartsRes,
                styleRes,
                typeRes,
                overviewRes,             // NEW: Explicit call
                dailyGenRes,             // NEW: Explicit call
                dailySpendRes            // NEW: Explicit call
            ] = await Promise.all([
                dashboardApi.getDashboardData(),           // /dashboard
                dashboardApi.getRecent(),                   // /dashboard/recent
                dashboardApi.getActivity(),                 // /dashboard/activity
                dashboardApi.getCharts(),                   // /dashboard/charts
                dashboardApi.getStyleAnalytics(),           // /dashboard/analytics/by-style
                dashboardApi.getTypeAnalytics(),            // /dashboard/analytics/by-type
                dashboardApi.getOverview(),                 // /dashboard/overview
                dashboardApi.getDailyGenerationChart(),     // /dashboard/charts/daily-generation
                dashboardApi.getDailySpendingChart()        // /dashboard/charts/daily-spending
            ]);

            console.log('📊 All dashboard endpoints called');

            // Main dashboard data
            if (dashboardRes.success && dashboardRes.data) {
                if (dashboardRes.data.stats) {
                    setStats(dashboardRes.data.stats);
                    // Cache stats for instant display on next visit
                    localStorage.setItem('dashboard_stats_cache', JSON.stringify(dashboardRes.data.stats));
                }

                // FORCE DYNAMIC BEHAVIOR: If total images is 0, charts MUST be flat 0.
                // This overrides any potential "sample data" from backend.
                if (dashboardRes.data.stats?.totalImages === 0) {
                    console.log('📉 Total images is 0, forcing charts to empty state');
                    setImageChartData([]); // This triggers the "fill(0)" fallback
                    setSpendingChartData([]);
                } else {
                    if (dashboardRes.data.recentImages) setRecentImages(dashboardRes.data.recentImages);
                    if (dashboardRes.data.imageGenerationChart) setImageChartData(dashboardRes.data.imageGenerationChart);
                    if (dashboardRes.data.spendingChart) setSpendingChartData(dashboardRes.data.spendingChart);
                }
            }

            // Explicitly log success of required endpoints
            if (overviewRes.success) console.log('✅ /dashboard/overview called');

            if (dailyGenRes.success) {
                console.log('✅ /dashboard/charts/daily-generation called');
                // You can use this data if you want a specifically daily view
            }

            if (dailySpendRes.success) {
                console.log('✅ /dashboard/charts/daily-spending called');
                // You can use this data if you want a specifically daily view
            }

            // Recent images (fallback/override from dedicated endpoint)
            if (recentRes.success && recentRes.data && Array.isArray(recentRes.data)) {
                console.log('✅ /dashboard/recent:', recentRes.data.length, 'images');
                setRecentImages(recentRes.data);
                // Cache recent images
                localStorage.setItem('dashboard_recent_cache', JSON.stringify(recentRes.data));
            }

            // Activity data
            if (activityRes.success && activityRes.data) {
                console.log('✅ /dashboard/activity:', activityRes.data);
            }

            // Charts data (override if available)
            // Charts data - always load if available (removed totalImages check to allow proper updates)
            if (chartsRes.success && chartsRes.data) {
                console.log('✅ /dashboard/charts loaded');
                const chartDataToCache: any = {};

                if (chartsRes.data.imageGeneration) {
                    setImageChartData(chartsRes.data.imageGeneration);
                    chartDataToCache.imageChartData = chartsRes.data.imageGeneration;
                }
                if (chartsRes.data.spending) {
                    setSpendingChartData(chartsRes.data.spending);
                    chartDataToCache.spendingChartData = chartsRes.data.spending;
                }

                // Cache charts data
                localStorage.setItem('dashboard_charts_cache', JSON.stringify(chartDataToCache));
            }

            // Analytics
            if (styleRes.success && styleRes.data) {
                console.log('✅ /dashboard/analytics/by-style:', styleRes.data);
                setStyleAnalytics(styleRes.data);
            }
            if (typeRes.success && typeRes.data) {
                console.log('✅ /dashboard/analytics/by-type:', typeRes.data);
                setTypeAnalytics(typeRes.data);
            }

        } catch (err) {
            console.warn('Dashboard API fetch failed:', err);
        } finally {
            // Always set loading to false when done
            setIsLoading(false);
        }
    };

    // Determine favorite style from analytics or stats
    let favStyle = "N/A";
    let favStyleUsage = 0;

    if (styleAnalytics) {
        // Handle array response: [{style: 'Realistic', count: 10}, ...]
        if (Array.isArray(styleAnalytics) && styleAnalytics.length > 0) {
            favStyle = styleAnalytics[0].style || styleAnalytics[0].name || "N/A";
            // Calculate usage percentage if total is available, otherwise show count
            favStyleUsage = styleAnalytics[0].percentage || styleAnalytics[0].count || 0;
        }
        // Handle object response: { topStyle: 'Realistic', usage: 50 }
        else if (styleAnalytics.topStyle) {
            favStyle = styleAnalytics.topStyle;
            favStyleUsage = styleAnalytics.usage || 0;
        }
    } else if (stats) {
        favStyle = stats.favoriteStyle;
        favStyleUsage = stats.favoriteStyleUsage;
    }

    // Determine top generation type
    let favType = "N/A";
    let favTypeUsage = 0;

    if (typeAnalytics) {
        // Handle array response: [{type: 'single_image', count: 10}, ...]
        if (Array.isArray(typeAnalytics) && typeAnalytics.length > 0) {
            let rawType = typeAnalytics[0].type || typeAnalytics[0].name || "N/A";
            // Check if usage is percentage or simple count
            favTypeUsage = typeAnalytics[0].percentage || 0;

            // Format type name
            if (rawType.includes('single')) favType = "Single Image";
            else if (rawType.includes('batch')) favType = "E-Com Bundle";
            else favType = rawType;

        } else if (typeAnalytics.topType) {
            favType = typeAnalytics.topType;
            favTypeUsage = typeAnalytics.usage || 0;
        }
    }

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
            value: favStyle || "N/A",
            subText: favStyleUsage ? `Used ${favStyleUsage}% of time` : undefined,
            icon: Sparkles
        },
    ] : [
        { label: "Total Images", value: isLoading ? "..." : "0", trend: "+0%", trendUp: true, progress: 0, color: "bg-teal-500" },
        {
            label: "Free Credits",
            value: userProfile?.freeCredits !== undefined ? userProfile.freeCredits.toString() : (isLoading ? "..." : "0"),
            subValue: "/ 1",
            icon: Zap,
            progress: userProfile?.freeCredits ? Math.min((userProfile.freeCredits / 1) * 100, 100) : 0,
            color: "bg-blue-500"
        },
        { label: "Total Spent", value: isLoading ? "$..." : "$0", trend: "+0%", trendUp: true, progress: 0, color: "bg-indigo-500" },
        { label: "Favorite Style", value: isLoading ? "..." : "N/A", subText: isLoading ? "Loading..." : undefined, icon: Sparkles },
    ];

    // Chart data from API or fallback
    // Chart data from API or zero fallback
    const chartData = spendingChartData.length > 0
        ? spendingChartData.map(d => d.value)
        : Array(7).fill(0);
    const chartDays = spendingChartData.length > 0
        ? spendingChartData.map(d => d.day)
        : ["M", "T", "W", "T", "F", "S", "S"];

    // Line chart data from API or zero fallback
    const lineChartPoints = imageChartData.length > 0
        ? imageChartData.map(d => d.value)
        : Array(7).fill(0);
    const lineChartDays = imageChartData.length > 0
        ? imageChartData.map(d => d.day)
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Recent images from API or empty
    const displayImages = recentImages.length > 0
        ? recentImages.map(img => img.url)
        : [];

    // User info from API or fallback
    const userName = userProfile?.fullName?.split(' ')[0] || 'Jane';
    const userInitial = userName.charAt(0).toUpperCase();
    const userBalance = userProfile?.balance ?? 0;
    // Use dynamic stats if available, otherwise fallback to profile (or 0)
    const userFreeCredits = stats?.freeCredits ?? userProfile?.freeCredits ?? 0;

    return (
        <div className="h-full flex overflow-x-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Reusable Sidebar */}
            <Sidebar activeNav="dashboard" />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-x-hidden lg:overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
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
                        {/* Page Header with Animation */}


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
                            {/* Area Chart - Fixed Y-axis scale 0-100 */}
                            <div className="opacity-0 animate-fade-in bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col h-[200px] sm:h-[220px] lg:h-auto hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daily Image Generation</h3>
                                    <select className="text-[10px] border border-slate-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-teal-500">
                                        <option>Last 7 Days</option>
                                    </select>
                                </div>
                                <div className="flex-1 relative min-h-0">
                                    {/* Y-axis labels - Fixed scale: 0, 20, 40, 60, 80, 100 */}
                                    <div className="absolute left-0 top-0 bottom-4 w-8 flex flex-col justify-between text-[9px] text-slate-400 pr-1">
                                        <span>100</span>
                                        <span>80</span>
                                        <span>60</span>
                                        <span>40</span>
                                        <span>20</span>
                                        <span>0</span>
                                    </div>
                                    {/* Chart area */}
                                    <div className="ml-9 h-full flex flex-col">
                                        <div className="flex-1 relative">
                                            {/* Grid lines for fixed scale */}
                                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className="border-t border-slate-100 dark:border-gray-700/50 w-full" />
                                                ))}
                                            </div>
                                            {/* SVG Area Chart - Fixed 100 max scale */}
                                            {(() => {
                                                const FIXED_MAX = 100; // Fixed scale max

                                                const points = lineChartPoints.map((val, i) => {
                                                    const x = (i / (lineChartPoints.length - 1)) * 100;
                                                    const normalizedVal = Math.min((val / FIXED_MAX) * 100, 100); // Cap at 100%
                                                    const y = 100 - normalizedVal;
                                                    return `${x},${y}`;
                                                });

                                                const pathD = points.length > 0
                                                    ? `M ${points[0]} ${points.slice(1).map(p => `L ${p}`).join(' ')}`
                                                    : 'M 0,100 L 100,100';

                                                const areaD = `${pathD} L 100,100 L 0,100 Z`;

                                                return (
                                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                        <defs>
                                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                                                                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d={areaD} fill="url(#areaGradient)" className="opacity-0 animate-fade-in-delay" style={{ transition: 'd 0.5s ease' }} />
                                                        <path d={pathD} fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="animate-draw-line" style={{ transition: 'd 0.5s ease' }} />
                                                    </svg>
                                                );
                                            })()}
                                            {/* Data points with hover tooltip */}
                                            {(() => {
                                                const FIXED_MAX = 100;

                                                return (
                                                    <div className="absolute inset-0">
                                                        {lineChartPoints.map((p, i) => {
                                                            const normalizedPercent = Math.min((p / FIXED_MAX) * 100, 100);
                                                            const xPercent = lineChartPoints.length > 1 ? (i / (lineChartPoints.length - 1)) * 100 : 50;
                                                            // Get date for tooltip
                                                            const dayLabel = lineChartDays[i] || '';
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="absolute group"
                                                                    style={{
                                                                        left: `${xPercent}%`,
                                                                        top: `${100 - normalizedPercent}%`,
                                                                        transform: 'translate(-50%, -50%)'
                                                                    }}
                                                                >
                                                                    <div className="w-3 h-3 rounded-full bg-white border-2 border-teal-500 shadow-sm cursor-pointer transition-all group-hover:scale-150 group-hover:shadow-md" />
                                                                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-800 text-white text-[10px] font-medium px-2 py-1.5 rounded shadow-lg whitespace-nowrap">
                                                                        <div className="font-semibold">{dayLabel}</div>
                                                                        <div>Generated Images: {p}</div>
                                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}

                                        </div>
                                        {/* X-axis labels - Day + Date format */}
                                        <div className="flex justify-between text-[9px] text-slate-400 pt-1 shrink-0">
                                            {lineChartDays.map((day, i) => (
                                                <span key={i} className="text-center">{day}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bar Chart - Fixed Y-axis scale 0-100 */}
                            <div className="opacity-0 animate-fade-in-delay bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-gray-700 flex flex-col h-[200px] sm:h-[220px] lg:h-auto hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-center justify-between mb-3 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Daily Spending</h3>
                                    <div className="flex items-center gap-3 text-[9px]">
                                        <div className="flex items-center gap-1">
                                            <div className="size-2 rounded-full bg-gradient-to-t from-teal-600 to-teal-400" />
                                            <span className="text-slate-500 dark:text-gray-400">Paid</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="size-2 rounded-full bg-gradient-to-t from-emerald-200 to-emerald-100" />
                                            <span className="text-slate-500 dark:text-gray-400">Free</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 relative min-h-0">
                                    {/* Y-axis labels - Fixed scale: $0, $20, $40, $60, $80, $100 */}
                                    <div className="absolute left-0 top-0 bottom-4 w-8 flex flex-col justify-between text-[9px] text-slate-400 pr-1">
                                        <span>$100</span>
                                        <span>$80</span>
                                        <span>$60</span>
                                        <span>$40</span>
                                        <span>$20</span>
                                        <span>$0</span>
                                    </div>
                                    {/* Chart area */}
                                    <div className="ml-9 h-full flex flex-col">
                                        <div className="flex-1 flex items-end justify-between gap-2 relative">
                                            {/* Grid lines for fixed scale */}
                                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className="border-t border-slate-100 dark:border-gray-700/50 w-full" />
                                                ))}
                                            </div>
                                            {(() => {
                                                const FIXED_MAX = 100; // Fixed scale max

                                                return chartData.map((height, i) => {
                                                    // Get detailed split from real data if available
                                                    const dataPoint = spendingChartData[i];
                                                    const paidHeight = dataPoint ? (dataPoint.paid ?? 0) : 0;
                                                    const freeHeight = dataPoint ? (dataPoint.free ?? 0) : 0;
                                                    const dayLabel = chartDays[i] || '';

                                                    // Normalize height to percentage of FIXED_MAX (cap at 100%)
                                                    const normalizedHeight = Math.min((height / FIXED_MAX) * 100, 100);

                                                    return (
                                                        <div key={i} className="flex-1 flex flex-col justify-end h-full group cursor-pointer relative z-10 animate-grow-up origin-bottom" style={{ animationDelay: `${i * 0.1}s` }}>
                                                            {/* Stacked bar container */}
                                                            <div className="w-full flex flex-col justify-end" style={{ height: `${normalizedHeight}%` }}>
                                                                {/* Free segment (top) */}
                                                                <div
                                                                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-200 to-emerald-100 group-hover:from-emerald-300 group-hover:to-emerald-200 transition-all"
                                                                    style={{ height: `${height > 0 ? (freeHeight / height) * 100 : 0}%`, minHeight: freeHeight > 0 ? '2px' : 0 }}
                                                                />
                                                                {/* Paid segment (bottom) */}
                                                                {paidHeight > 0 && (
                                                                    <div
                                                                        className="w-full bg-gradient-to-t from-teal-600 to-teal-500 group-hover:from-teal-700 group-hover:to-teal-500 transition-all shadow-sm"
                                                                        style={{ height: `${height > 0 ? (paidHeight / height) * 100 : 0}%` }}
                                                                    />
                                                                )}
                                                            </div>
                                                            {/* Hover tooltip */}
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-slate-800 text-white text-[10px] font-medium px-2 py-1.5 rounded shadow-lg whitespace-nowrap">
                                                                <div className="font-semibold">{dayLabel}</div>
                                                                <div>Total: ${height}</div>
                                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                        {/* X-axis labels - Day + Date format */}
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
