"use client";

import { useState, useEffect } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    TrendingUp, TrendingDown, Users, FileText, Heart, MessageCircle,
    UserPlus, Eye, Activity, Loader2, BarChart3, PieChart as PieIcon,
    Calendar, RefreshCw, Wifi
} from "lucide-react";

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeChart, setActiveChart] = useState("logins");
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const res = await fetch("/api/admin/stats");
            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error("Erro ao buscar métricas:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Auto refresh a cada 60 segundos
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
    };

    const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-brand-primary" size={40} />
            </div>
        );
    }

    const { stats, trends } = data || { stats: {}, trends: {} };

    // Preparar dados para gráficos
    const loginChartData = (trends.dailyLogins || []).map(d => ({
        date: formatDate(d.date),
        value: d.count
    }));

    const postsChartData = (trends.dailyPosts || []).map(d => ({
        date: formatDate(d.date),
        value: d.count
    }));

    const newMembersChartData = (trends.dailyNewMembers || []).map(d => ({
        date: formatDate(d.date),
        value: d.count
    }));

    const monthlyGrowthData = (trends.monthlyGrowth || []).map(d => ({
        month: d.label || d.month,
        members: d.count
    }));

    const engagementData = (trends.engagement || []).map(d => ({
        date: formatDate(d.date),
        likes: d.likes,
        comments: d.comments,
        follows: d.follows
    }));

    const postsStatusData = [
        { name: "Approved", value: stats.approvedPosts || 0, color: "#10b981" },
        { name: "Pending", value: stats.pendingPosts || 0, color: "#f59e0b" },
        { name: "Rejected", value: stats.rejectedPosts || 0, color: "#ef4444" }
    ].filter(d => d.value > 0);

    const chartTabs = [
        { id: "logins", label: "Logins", icon: Activity, data: loginChartData, color: "#3b82f6" },
        { id: "posts", label: "Posts", icon: FileText, data: postsChartData, color: "#10b981" },
        { id: "members", label: "New Members", icon: UserPlus, data: newMembersChartData, color: "#8b5cf6" }
    ];

    const activeChartConfig = chartTabs.find(t => t.id === activeChart) || chartTabs[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-text-primary flex items-center gap-2">
                        <BarChart3 className="text-brand-primary" size={24} />
                        Analytics & Metrics
                    </h1>
                    <p className="text-text-muted text-xs mt-1">
                        Platform performance and engagement overview
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-card border border-border-subtle rounded-lg text-xs font-bold text-text-secondary hover:bg-surface-subtle transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-surface-card border border-border-subtle rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="text-blue-600" size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Members</span>
                    </div>
                    <p className="text-2xl font-black text-text-primary">{stats.members || 0}</p>
                </div>

                <div className="bg-surface-card border border-border-subtle rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Wifi className="text-green-600" size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Online</span>
                    </div>
                    <p className="text-2xl font-black text-green-600">{stats.online || 0}</p>
                    <p className="text-[10px] text-text-muted mt-1">in last 5 min</p>
                </div>

                <div className="bg-surface-card border border-border-subtle rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="text-purple-600" size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Posts</span>
                    </div>
                    <p className="text-2xl font-black text-text-primary">{stats.totalPosts || 0}</p>
                </div>

                <div className="bg-surface-card border border-border-subtle rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Calendar className="text-amber-600" size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-text-muted uppercase">Events</span>
                    </div>
                    <p className="text-2xl font-black text-text-primary">{stats.upcomingEvents || 0}</p>
                </div>
            </div>

            {/* Gráfico Principal com Tabs */}
            <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                    <h2 className="font-bold text-text-primary text-sm">Weekly Activity</h2>
                    <div className="flex bg-surface-subtle p-0.5 rounded-lg">
                        {chartTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveChart(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeChart === tab.id
                                    ? "bg-brand-primary text-white"
                                    : "text-text-muted hover:text-text-primary"
                                    }`}
                            >
                                <tab.icon size={12} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4">
                    {activeChartConfig.data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={activeChartConfig.data}>
                                <defs>
                                    <linearGradient id={`gradient-${activeChart}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={activeChartConfig.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={activeChartConfig.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                                    labelStyle={{ fontWeight: "bold" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={activeChartConfig.color}
                                    strokeWidth={2}
                                    fill={`url(#gradient-${activeChart})`}
                                    name={activeChartConfig.label}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[240px] text-text-muted">
                            <Activity size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">No data for this period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Grid de Gráficos Secundários */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Status de Postagens (Pizza) */}
                <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="font-bold text-text-primary text-sm flex items-center gap-2">
                            <PieIcon size={16} className="text-brand-primary" />
                            Posts Status
                        </h2>
                    </div>
                    <div className="p-4">
                        {postsStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={postsStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {postsStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-text-muted text-sm">
                                No posts yet
                            </div>
                        )}
                        <div className="flex justify-center gap-4 mt-2">
                            {postsStatusData.map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-bold text-text-muted">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Crescimento Mensal */}
                <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="font-bold text-text-primary text-sm flex items-center gap-2">
                            <TrendingUp size={16} className="text-brand-primary" />
                            Monthly Growth
                        </h2>
                    </div>
                    <div className="p-4">
                        {monthlyGrowthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthlyGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                    <Bar dataKey="members" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Members" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-text-muted text-sm">
                                Insufficient data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Engajamento */}
            {engagementData.length > 0 && (
                <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <h2 className="font-bold text-text-primary text-sm flex items-center gap-2">
                            <Heart size={16} className="text-brand-primary" />
                            Community Engagement
                        </h2>
                    </div>
                    <div className="p-4">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={engagementData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                                <Legend wrapperStyle={{ fontSize: 10 }} />
                                <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} name="Likes" />
                                <Line type="monotone" dataKey="comments" stroke="#3b82f6" strokeWidth={2} name="Comments" />
                                <Line type="monotone" dataKey="follows" stroke="#10b981" strokeWidth={2} name="Follows" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )
            }

            {/* Métricas Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <p className="text-xs font-bold opacity-80">Approved Posts</p>
                    <p className="text-2xl font-black">{stats.approvedPosts || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
                    <p className="text-xs font-bold opacity-80">Pending</p>
                    <p className="text-2xl font-black">{stats.pendingPosts || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <p className="text-xs font-bold opacity-80">Rejected</p>
                    <p className="text-2xl font-black">{stats.rejectedPosts || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <p className="text-xs font-bold opacity-80">Webinars</p>
                    <p className="text-2xl font-black">{stats.webinars || 0}</p>
                </div>
            </div>
        </div >
    );
}
